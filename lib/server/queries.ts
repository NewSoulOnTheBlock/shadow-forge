// =============================================================================
// Server-only data access layer — maps Postgres rows -> UI model shapes.
// -----------------------------------------------------------------------------
// Every function here returns the EXACT shapes from `@/lib/types` so the client
// (store + pages) consumes DB data with zero shape changes from the old mock
// layer. `import 'server-only'` keeps credentials off the client.
//
// Card identity bridge: the UI keys cards by the engine `code` (e.g. "agi_rogue")
// while the DB uses uuid PKs + a stable `cards.code` column. Joins below always
// project `cards.code` AS the cardId the UI expects.
// =============================================================================
import 'server-only';
import { query, queryOne } from './pool';
import { getSessionUserId } from './session';
import type {
  User,
  PlayerProfile,
  Rank,
  RankTier,
  Deck,
  CollectionItem,
  VariantStyle,
  LeaderboardEntry,
  MatchHistory,
  MatchMode,
  Achievement,
  Reward,
  RewardType,
  Lobby,
  LobbyVisibility,
} from '@/lib/types';
import type { Prism } from '@/lib/game/types';

// DB stores clans as display names; the engine/UI keys decks by prism.
const CLAN_TO_PRISM: Record<string, Prism> = {
  Oni: 'strength',
  Sage: 'wisdom',
  Shadow: 'agility',
  Shrine: 'heart',
  Trapmaster: 'intellect',
};

const RANK_TIERS: RankTier[] = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Mythic',
];

function toTier(rankName: string | null): RankTier {
  const head = (rankName ?? 'Bronze').split(' ')[0];
  return (RANK_TIERS.find((t) => t === head) ?? 'Bronze') as RankTier;
}

/** Raised when no authenticated session is present; routes map this to HTTP 401. */
export class UnauthenticatedError extends Error {
  constructor() {
    super('unauthenticated');
    this.name = 'UnauthenticatedError';
  }
}

/** Resolve the active user's id from the session cookie. */
export async function getCurrentUserId(): Promise<string> {
  const uid = await getSessionUserId();
  if (!uid) throw new UnauthenticatedError();
  return uid;
}

export async function getUser(userId: string): Promise<User> {
  const row = await queryOne<{
    id: string;
    username: string;
    email: string | null;
    wallet_address: string | null;
    created_at: Date;
  }>(
    `select p.id, p.username, u.email, u.wallet_address, p.created_at
       from profiles p left join users u on u.id = p.id
      where p.id = $1`,
    [userId],
  );
  if (!row) throw new Error('User not found');
  return {
    id: row.id,
    username: row.username,
    email: row.email ?? undefined,
    walletAddress: row.wallet_address ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getProfile(userId: string): Promise<PlayerProfile> {
  const row = await queryOne<{
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
    xp: number;
    xp_to_next: number;
    currency_soft: number;
    title: string | null;
    badges: string[] | null;
    favorite_deck_id: string | null;
    selected_hero: string | null;
    display_name: string | null;
    rank_name: string | null;
    division: number | null;
    lp: number | null;
    wins: number | null;
    losses: number | null;
  }>(
    `select p.id, p.username, p.avatar_url, p.level, p.xp, p.xp_to_next,
            p.currency_soft, p.title, p.badges, p.favorite_deck_id, p.selected_hero,
            u.display_name,
            r.rank_name, r.division, r.lp, r.wins, r.losses
       from profiles p
       left join users u on u.id = p.id
       left join player_ranks r on r.user_id = p.id
      where p.id = $1`,
    [userId],
  );
  if (!row) throw new Error('Profile not found');
  const rank: Rank = {
    tier: toTier(row.rank_name),
    division: row.division ?? 1,
    points: row.lp ?? 0,
  };
  return {
    userId: row.id,
    displayName: row.display_name ?? row.username,
    avatar: row.avatar_url ?? '🥷',
    level: row.level,
    xp: row.xp,
    xpToNext: row.xp_to_next,
    rank,
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    favoriteDeckId: row.favorite_deck_id ?? undefined,
    badges: row.badges ?? [],
    title: row.title ?? undefined,
    currency: row.currency_soft,
    selectedHero: row.selected_hero ?? undefined,
  };
}

export async function getDecks(userId: string): Promise<Deck[]> {
  const decks = await query<{
    id: string;
    name: string;
    user_id: string;
    is_active: boolean;
    cover_art: string | null;
    updated_at: Date | null;
    created_at: Date;
  }>(
    `select id, name, user_id, is_active, cover_art, created_at,
            coalesce(updated_at, created_at) as updated_at
       from decks where user_id = $1 order by created_at asc`,
    [userId],
  );
  if (decks.length === 0) return [];

  const ids = decks.map((d) => d.id);
  const cards = await query<{
    deck_id: string;
    code: string;
    clan: string;
    quantity: number;
  }>(
    `select dc.deck_id, c.code, c.clan, dc.quantity
       from deck_cards dc join cards c on c.id = dc.card_id
      where dc.deck_id = any($1::uuid[])`,
    [ids],
  );

  const byDeck = new Map<string, { code: string; clan: string; quantity: number }[]>();
  for (const row of cards) {
    const list = byDeck.get(row.deck_id) ?? [];
    list.push(row);
    byDeck.set(row.deck_id, list);
  }

  return decks.map((d) => {
    const list = byDeck.get(d.id) ?? [];
    const prisms = [...new Set(list.map((c) => CLAN_TO_PRISM[c.clan]).filter(Boolean))];
    return {
      id: d.id,
      name: d.name,
      ownerId: d.user_id,
      prisms,
      cards: list.map((c) => ({ cardId: c.code, count: c.quantity })),
      active: d.is_active,
      updatedAt: (d.updated_at ?? d.created_at).toISOString(),
      coverArt: d.cover_art ?? '🎴',
    };
  });
}

export async function getCollection(userId: string): Promise<CollectionItem[]> {
  const rows = await query<{
    code: string;
    quantity: number;
    variants: string[] | null;
    favorite: boolean;
    acquired_at: Date | null;
  }>(
    `select c.code, pc.quantity, pc.variants, pc.favorite, pc.acquired_at
       from player_cards pc join cards c on c.id = pc.card_id
      where pc.user_id = $1`,
    [userId],
  );
  return rows.map((r) => ({
    cardId: r.code,
    quantity: r.quantity,
    variants: (r.variants ?? ['standard']) as VariantStyle[],
    favorite: r.favorite,
    acquiredAt: (r.acquired_at ?? new Date()).toISOString(),
  }));
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const rows = await query<{
    id: string;
    username: string;
    avatar_url: string | null;
    display_name: string | null;
    rank_name: string | null;
    lp: number;
    wins: number;
  }>(
    `select p.id, p.username, p.avatar_url, u.display_name,
            r.rank_name, r.lp, r.wins
       from player_ranks r
       join profiles p on p.id = r.user_id
       left join users u on u.id = p.id
      order by r.lp desc
      limit $1`,
    [limit],
  );
  return rows.map((r, i) => ({
    position: i + 1,
    userId: r.id,
    displayName: r.display_name ?? r.username,
    avatar: r.avatar_url ?? '🥷',
    rankTier: toTier(r.rank_name),
    points: r.lp,
    wins: r.wins,
  }));
}

export async function getMatchHistory(userId: string): Promise<MatchHistory[]> {
  const rows = await query<{
    id: string;
    mode: string;
    result: string;
    opponent: string;
    opponent_avatar: string | null;
    deck_name: string | null;
    rank_delta: number;
    duration_sec: number;
    played_at: Date;
  }>(
    `select id, mode, result, opponent, opponent_avatar, deck_name,
            rank_delta, duration_sec, played_at
       from match_history where user_id = $1 order by played_at desc`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    mode: r.mode as MatchMode,
    result: r.result as MatchHistory['result'],
    opponent: r.opponent,
    opponentAvatar: r.opponent_avatar ?? '🥷',
    deckName: r.deck_name ?? '',
    rankDelta: r.rank_delta,
    durationSec: r.duration_sec,
    playedAt: r.played_at.toISOString(),
  }));
}

export interface MatchResultInput {
  result: 'win' | 'loss' | 'draw';
  mode: MatchMode;
  opponent: string;
  opponentAvatar: string;
  deckName: string;
  durationSec: number;
}

export interface MatchResultOutcome {
  rank: Rank;
  wins: number;
  losses: number;
  leaderboard: LeaderboardEntry[];
  matchHistoryItem: MatchHistory;
}

/**
 * Persist a finished match: bump wins/losses, apply a ladder-point delta for
 * ranked play, recompute the rank tier from the new lp, and append a
 * match_history row. Returns the fresh values the UI needs.
 */
export async function recordMatchResult(
  userId: string,
  input: MatchResultInput,
): Promise<MatchResultOutcome> {
  const result: 'win' | 'loss' | 'draw' =
    input.result === 'win' || input.result === 'loss' ? input.result : 'draw';
  const ranked = input.mode === 'ranked';
  const lpDelta = !ranked ? 0 : result === 'win' ? 25 : result === 'loss' ? -20 : 0;
  const winInc = result === 'win' ? 1 : 0;
  const lossInc = result === 'loss' ? 1 : 0;

  // Ensure a rank row exists (real users get one on signup, but be defensive).
  await query(
    `insert into player_ranks (user_id, rank_name, division, lp, wins, losses)
     values ($1, 'Bronze', 4, 0, 0, 0)
     on conflict (user_id) do nothing`,
    [userId],
  );

  const updated = await queryOne<{
    rank_name: string;
    division: number | null;
    lp: number;
    wins: number;
    losses: number;
  }>(
    `update player_ranks
        set wins = wins + $2,
            losses = losses + $3,
            lp = greatest(0, lp + $4),
            rank_name = case
              when greatest(0, lp + $4) >= 2600 then 'Mythic'
              when greatest(0, lp + $4) >= 1800 then 'Diamond'
              when greatest(0, lp + $4) >= 1200 then 'Platinum'
              when greatest(0, lp + $4) >= 800  then 'Gold'
              when greatest(0, lp + $4) >= 400  then 'Silver'
              else 'Bronze'
            end
      where user_id = $1
      returning rank_name, division, lp, wins, losses`,
    [userId, winInc, lossInc, lpDelta],
  );
  if (!updated) throw new Error('Failed to update player_ranks');

  const historyRow = await queryOne<{
    id: string;
    mode: string;
    result: string;
    opponent: string;
    opponent_avatar: string | null;
    deck_name: string | null;
    rank_delta: number;
    duration_sec: number;
    played_at: Date;
  }>(
    `insert into match_history
       (user_id, mode, result, opponent, opponent_avatar, deck_name, rank_delta, duration_sec)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id, mode, result, opponent, opponent_avatar, deck_name,
               rank_delta, duration_sec, played_at`,
    [
      userId,
      input.mode,
      result,
      input.opponent,
      input.opponentAvatar,
      input.deckName,
      lpDelta,
      Math.max(0, Math.round(input.durationSec)),
    ],
  );
  if (!historyRow) throw new Error('Failed to insert match_history');

  const rank: Rank = {
    tier: toTier(updated.rank_name),
    division: updated.division ?? 1,
    points: updated.lp,
  };

  return {
    rank,
    wins: updated.wins,
    losses: updated.losses,
    leaderboard: await getLeaderboard(),
    matchHistoryItem: {
      id: historyRow.id,
      mode: historyRow.mode as MatchMode,
      result: historyRow.result as MatchHistory['result'],
      opponent: historyRow.opponent,
      opponentAvatar: historyRow.opponent_avatar ?? '🥷',
      deckName: historyRow.deck_name ?? '',
      rankDelta: historyRow.rank_delta,
      durationSec: historyRow.duration_sec,
      playedAt: historyRow.played_at.toISOString(),
    },
  };
}

export async function getAchievements(userId: string): Promise<Achievement[]> {
  const rows = await query<{
    id: string;
    name: string;
    description: string;
    icon: string | null;
    goal: number;
    progress: number | null;
    unlocked: boolean | null;
  }>(
    `select a.id, a.name, a.description, a.icon, a.goal,
            pa.progress, pa.unlocked
       from achievements a
       left join player_achievements pa
         on pa.achievement_id = a.id and pa.user_id = $1
      order by a.sort asc`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    icon: r.icon ?? '🏅',
    progress: r.progress ?? 0,
    goal: r.goal,
    unlocked: r.unlocked ?? false,
  }));
}

const REWARD_ICON: Record<string, string> = {
  gold: '💠',
  gems: '💎',
  pack: '📦',
  card: '🎴',
  cosmetic: '🎏',
  currency: '💠',
};

function rewardType(dbType: string): RewardType {
  if (dbType === 'card') return 'card';
  if (dbType === 'pack') return 'pack';
  if (dbType === 'cosmetic') return 'cosmetic';
  return 'currency';
}

export async function getDailyRewards(userId: string): Promise<Reward[]> {
  const claim = await queryOne<{ reward_day: number }>(
    'select reward_day from player_daily_rewards where user_id = $1',
    [userId],
  );
  const claimedThrough = claim?.reward_day ?? 0;
  const rows = await query<{
    id: string;
    day_number: number;
    reward_type: string;
    reward_amount: number;
  }>(
    'select id, day_number, reward_type, reward_amount from daily_rewards order by day_number asc',
  );
  return rows.map((r) => ({
    id: r.id,
    type: rewardType(r.reward_type),
    label: `Day ${r.day_number}`,
    amount: r.reward_type === 'card' || r.reward_type === 'pack' ? undefined : r.reward_amount,
    icon: REWARD_ICON[r.reward_type] ?? '🎁',
    claimed: r.day_number <= claimedThrough,
  }));
}

// --- Lobbies -----------------------------------------------------------------
// The DB `lobbies` table is intentionally sparse (realtime player/spectator
// sync is future work over WebSockets). We map each row to the richer UI `Lobby`
// shape, synthesizing the host as the sole seated player.

export async function getLobbies(): Promise<Lobby[]> {
  const rows = await query<{
    id: string;
    lobby_code: string;
    status: string;
    max_players: number;
    created_at: Date;
    host_id: string;
    host_name: string | null;
    host_username: string;
    host_avatar: string | null;
  }>(
    `select l.id, l.lobby_code, l.status, l.max_players, l.created_at,
            l.host_id, u.display_name as host_name,
            p.username as host_username, p.avatar_url as host_avatar
       from lobbies l
       join profiles p on p.id = l.host_id
       left join users u on u.id = l.host_id
      where l.status = 'open'
      order by l.created_at desc`,
  );
  return rows.map((r) => mapLobby(r));
}

interface LobbyRow {
  id: string;
  lobby_code: string;
  status: string;
  max_players: number;
  created_at: Date;
  host_id: string;
  host_name: string | null;
  host_username: string;
  host_avatar: string | null;
}

function mapLobby(r: LobbyRow): Lobby {
  return {
    id: r.id,
    code: r.lobby_code,
    name: `${r.host_name ?? r.host_username}'s Dojo`,
    visibility: 'public',
    hostId: r.host_id,
    players: [
      {
        userId: r.host_id,
        displayName: r.host_name ?? r.host_username,
        avatar: r.host_avatar ?? '🥷',
        ready: false,
        isHost: true,
        slot: 0,
      },
    ],
    spectators: [],
    maxPlayers: r.max_players,
    rules: { mode: 'casual', format: 'Singleton · 15–25', timerSec: 90 },
    createdAt: r.created_at.toISOString(),
  };
}

export async function createLobby(opts: {
  hostId: string;
  visibility: LobbyVisibility;
}): Promise<Lobby> {
  const code = makeLobbyCode();
  const row = await queryOne<LobbyRow>(
    `with ins as (
        insert into lobbies (host_id, lobby_code, status, max_players)
        values ($1, $2, 'open', 2) returning *
     )
     select ins.id, ins.lobby_code, ins.status, ins.max_players, ins.created_at,
            ins.host_id, u.display_name as host_name,
            p.username as host_username, p.avatar_url as host_avatar
       from ins
       join profiles p on p.id = ins.host_id
       left join users u on u.id = ins.host_id`,
    [opts.hostId, code],
  );
  if (!row) throw new Error('Failed to create lobby');
  const lobby = mapLobby(row);
  lobby.visibility = opts.visibility;
  return lobby;
}

function makeLobbyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length: 5 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

// --- Deck mutations ----------------------------------------------------------

export async function setActiveDeck(userId: string, deckId: string): Promise<void> {
  await query(
    `update decks set is_active = (id = $2) where user_id = $1`,
    [userId, deckId],
  );
}

export async function renameDeck(
  userId: string,
  deckId: string,
  name: string,
): Promise<void> {
  await query(`update decks set name = $3 where id = $2 and user_id = $1`, [
    userId,
    deckId,
    name,
  ]);
}

export async function deleteDeck(userId: string, deckId: string): Promise<void> {
  await query(`delete from decks where id = $2 and user_id = $1`, [userId, deckId]);
}

const PRISM_TO_CLAN: Record<Prism, string> = {
  strength: 'Oni',
  wisdom: 'Sage',
  agility: 'Shadow',
  heart: 'Shrine',
  intellect: 'Trapmaster',
};

/** Insert or update a deck and replace its card list. Returns the saved deck. */
export async function saveDeck(
  userId: string,
  deck: {
    id?: string;
    name: string;
    prisms: Prism[];
    coverArt: string;
    cards: { cardId: string; count: number }[];
  },
): Promise<Deck> {
  const clan = deck.prisms[0] ? PRISM_TO_CLAN[deck.prisms[0]] : null;
  let deckId = deck.id;

  if (deckId) {
    const updated = await queryOne<{ id: string }>(
      `update decks set name = $3, clan = $4, cover_art = $5, updated_at = now()
        where id = $2 and user_id = $1 returning id`,
      [userId, deckId, deck.name, clan, deck.coverArt],
    );
    if (!updated) deckId = undefined; // not found / not owned -> insert fresh
  }
  if (!deckId) {
    const inserted = await queryOne<{ id: string }>(
      `insert into decks (user_id, name, clan, cover_art)
       values ($1, $2, $3, $4) returning id`,
      [userId, deck.name, clan, deck.coverArt],
    );
    deckId = inserted!.id;
  }

  await query('delete from deck_cards where deck_id = $1', [deckId]);
  if (deck.cards.length > 0) {
    const codes = deck.cards.map((c) => c.cardId);
    const counts = deck.cards.map((c) => c.count);
    await query(
      `insert into deck_cards (deck_id, card_id, quantity)
       select $1, c.id, v.count
         from unnest($2::text[], $3::int[]) as v(code, count)
         join cards c on c.code = v.code`,
      [deckId, codes, counts],
    );
  }

  const all = await getDecks(userId);
  const saved = all.find((d) => d.id === deckId);
  if (!saved) throw new Error('Deck save failed');
  return saved;
}

export async function setFavoriteCard(
  userId: string,
  cardCode: string,
  favorite: boolean,
): Promise<void> {
  // Only owned cards can be favorited; favoriting an unowned card is a no-op.
  await query(
    `update player_cards set favorite = $3
       where user_id = $1
         and card_id = (select id from cards where code = $2)`,
    [userId, cardCode, favorite],
  );
}

export async function claimDailyReward(userId: string): Promise<number> {
  const row = await queryOne<{ reward_day: number }>(
    `insert into player_daily_rewards (user_id, reward_day, last_claimed_at, streak)
     values ($1, 1, now(), 1)
     on conflict (user_id) do update set
       reward_day = least(player_daily_rewards.reward_day + 1, 7),
       streak = player_daily_rewards.streak + 1,
       last_claimed_at = now()
     returning reward_day`,
    [userId],
  );
  return row?.reward_day ?? 1;
}
