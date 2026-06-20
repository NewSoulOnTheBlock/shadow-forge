-- =============================================================================
-- SHADOW FORGE — WALLET AUTH SUPPORT
-- Adds Solana wallet identity + an onboarding flag, and a reusable function that
-- seeds a brand-new player with a starter rank, collection, and 3 starter decks
-- (mirrors the demo seed in 006). Idempotent / re-runnable.
-- =============================================================================

-- Wallet identity on the users table (one wallet == one account).
alter table users    add column if not exists wallet_address text unique;

-- New wallet sign-ups start un-onboarded until they pick a display name + avatar.
-- Existing accounts (demo + ladder) are already named, so default true.
alter table profiles add column if not exists onboarded boolean default true;

-- Seed a fresh player: rank + ~88% of the catalog + 3 starter decks. ----------
create or replace function sf_seed_player(p_user uuid) returns void
language plpgsql as $$
declare
  d1 uuid := gen_random_uuid();
  d2 uuid := gen_random_uuid();
  d3 uuid := gen_random_uuid();
begin
  insert into player_ranks (user_id, rank_name, division, lp, wins, losses)
    values (p_user, 'Bronze', 4, 0, 0, 0)
    on conflict (user_id) do nothing;

  -- deterministic starter collection over the live catalog (skip ~12% as "missing")
  insert into player_cards (user_id, card_id, quantity, variants, favorite, acquired_at)
  select p_user, c.id, 1, '{standard}'::text[], false, now()
  from (select id, (abs(hashtext(code)) % 100) as r from cards) c
  where c.r > 12
  on conflict (user_id, card_id) do nothing;

  insert into decks (id, user_id, name, clan, is_active, cover_art) values
    (d1, p_user, 'Shadow Blade Clan', 'Oni',    true,  '🥷'),
    (d2, p_user, 'Scroll & Trap Clan','Sage',   false, '📜'),
    (d3, p_user, 'Shrine Warrior Clan','Shrine',false, '⛩️');

  insert into deck_cards (deck_id, card_id, quantity)
  select d1, c.id, 1 from cards c where c.code in (
    'str_recruit','str_berserker','str_wolf','str_warlord','str_champion','str_ogre',
    'str_smash','str_rage','agi_scout','agi_rogue','agi_duelist','agi_falcon',
    'agi_assassin','agi_windblade','agi_dash','agi_ambush');

  insert into deck_cards (deck_id, card_id, quantity)
  select d2, c.id, 1 from cards c where c.code in (
    'wis_scholar','wis_sage','wis_oracle','wis_mirror','wis_archmage','wis_bolt',
    'wis_insight','wis_meteor','int_turret','int_tinkerer','int_saboteur','int_construct',
    'int_summoner','int_disrupt','int_overload','int_hex');

  insert into deck_cards (deck_id, card_id, quantity)
  select d3, c.id, 1 from cards c where c.code in (
    'hrt_medic','hrt_cleric','hrt_guardian','hrt_lifebloom','hrt_treant','hrt_phoenix',
    'hrt_angel','hrt_blessing','str_recruit','str_berserker','str_warlord','str_champion',
    'str_ogre','str_titan','str_smash','str_warcry');

  update profiles set favorite_deck_id = d1 where id = p_user;
end $$;
