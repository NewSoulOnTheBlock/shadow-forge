// =============================================================================
// Server-only wallet auth: ed25519 signature verification + account upsert.
// -----------------------------------------------------------------------------
// A Solana wallet proves ownership by signing our sign-in message. We verify the
// detached signature against the wallet's public key (the base58 address), then
// look up or create the matching account. New wallets get a fresh profile seeded
// with a starter collection + decks via the sf_seed_player() SQL function.
// =============================================================================
import 'server-only';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { query, queryOne, pool } from './pool';
import { HERO_BY_ID } from '@/lib/game/heroes';

/** Verify that `signatureB64` is a valid ed25519 signature of `message` by `address`. */
export function verifyWalletSignature(address: string, message: string, signatureB64: string): boolean {
  try {
    const pubkey = bs58.decode(address);
    if (pubkey.length !== 32) return false;
    const signature = Buffer.from(signatureB64, 'base64');
    if (signature.length !== 64) return false;
    const msgBytes = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(msgBytes, new Uint8Array(signature), pubkey);
  } catch {
    return false;
  }
}

export interface WalletAccount {
  userId: string;
  isNew: boolean;
  onboarded: boolean;
}

/**
 * Resolve the account for a wallet address, creating a fresh user + un-onboarded
 * profile (and seeding starter content) on first sign-in. Runs in a transaction.
 */
export async function upsertWalletAccount(address: string): Promise<WalletAccount> {
  const existing = await queryOne<{ id: string; onboarded: boolean }>(
    `select u.id, coalesce(p.onboarded, true) as onboarded
       from users u left join profiles p on p.id = u.id
      where u.wallet_address = $1`,
    [address],
  );
  if (existing) {
    return { userId: existing.id, isNew: false, onboarded: existing.onboarded };
  }

  const client = await pool.connect();
  try {
    await client.query('begin');
    // Provisional unique username from the wallet; the user renames at onboarding.
    const tempUsername = `ninja_${address.slice(0, 6).toLowerCase()}_${Date.now().toString(36)}`;
    const userRow = await client.query<{ id: string }>(
      `insert into users (wallet_address, display_name) values ($1, $2) returning id`,
      [address, null],
    );
    const userId = userRow.rows[0].id;
    await client.query(
      `insert into profiles (id, username, avatar_url, level, xp, xp_to_next, currency_soft, onboarded)
       values ($1, $2, '🥷', 1, 0, 1000, 500, false)`,
      [userId, tempUsername],
    );
    await client.query('select sf_seed_player($1)', [userId]);
    await client.query('commit');
    return { userId, isNew: true, onboarded: false };
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

/** Update the player's chosen display name + avatar and mark onboarding complete. */
export async function saveProfileBasics(
  userId: string,
  displayName: string,
  avatar: string,
): Promise<void> {
  const name = displayName.trim().slice(0, 24) || 'Shadow Ninja';
  const glyph = avatar.trim().slice(0, 8) || '🥷';
  // username must stay unique; derive a slug and disambiguate on collision.
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 18) || 'ninja';
  let username = base;
  for (let i = 0; i < 5; i++) {
    const clash = await queryOne<{ id: string }>(
      'select id from profiles where username = $1 and id <> $2',
      [username, userId],
    );
    if (!clash) break;
    username = `${base}_${Math.random().toString(36).slice(2, 6)}`;
  }
  await query('update users set display_name = $2 where id = $1', [userId, name]);
  await query(
    'update profiles set username = $2, avatar_url = $3, onboarded = true where id = $1',
    [userId, username, glyph],
  );
}

/**
 * Commit the player's permanent starting hero (Path Selection Ceremony):
 *   - records `profiles.selected_hero` + sets the hero portrait as the avatar
 *   - unlocks the hero in `user_heroes`
 *   - activates the hero's themed starter deck (already seeded by sf_seed_player)
 * Throws on an unknown hero id.
 */
export async function selectHero(userId: string, heroId: string): Promise<void> {
  const hero = HERO_BY_ID[heroId];
  if (!hero) throw new Error(`unknown_hero:${heroId}`);

  await query(
    'update profiles set selected_hero = $2, avatar_url = $3, onboarded = true where id = $1',
    [userId, hero.id, hero.avatar],
  );

  await query(
    `insert into user_heroes (user_id, hero_id, unlocked, mastery_level)
       values ($1, $2, true, 0)
     on conflict (user_id, hero_id) do update set unlocked = true`,
    [userId, hero.id],
  );

  // Make the hero's themed deck the active one (decks are seeded per new player).
  await query(
    'update decks set is_active = (name = $2) where user_id = $1',
    [userId, hero.starterDeckName],
  );
  await query(
    `update profiles set favorite_deck_id = (
        select id from decks where user_id = $1 and name = $2 limit 1
     ) where id = $1`,
    [userId, hero.starterDeckName],
  );
}
