-- =============================================================================
-- SHADOW FORGE — CORE SCHEMA (plain PostgreSQL 16, Render "shadowforge" DB)
-- -----------------------------------------------------------------------------
-- Adapted from the canonical design. The original referenced Supabase's
-- auth.users(id); on plain Postgres there is no `auth` schema, so we introduce
-- a standalone `users` table that owns identity, and `profiles.id` references it.
-- Re-runnable: every object uses IF NOT EXISTS.
-- =============================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid() (core in PG13+, kept for safety)

-- IDENTITY (replaces Supabase auth.users) ------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique,
  password_hash text,                 -- nullable until real auth is wired
  display_name  text,
  created_at    timestamptz default now()
);

-- USERS / PROFILE ------------------------------------------------------------
create table if not exists profiles (
  id               uuid primary key references users(id) on delete cascade,
  username         text unique not null,
  avatar_url       text,
  level            int default 1,
  xp               int default 0,
  currency_soft    int default 0,
  currency_premium int default 0,
  created_at       timestamptz default now()
);

-- RANKS ----------------------------------------------------------------------
create table if not exists player_ranks (
  user_id   uuid primary key references profiles(id) on delete cascade,
  rank_name text default 'Bronze 1',
  lp        int default 0,
  wins      int default 0,
  losses    int default 0,
  win_rate  numeric generated always as (
    case when wins + losses = 0 then 0
         else round((wins::numeric / (wins + losses)) * 100, 2)
    end
  ) stored
);

-- CARDS ----------------------------------------------------------------------
create table if not exists cards (
  id         uuid primary key default gen_random_uuid(),
  code       text unique,            -- stable slug from the game engine (e.g. 'str_recruit')
  name       text not null,
  clan       text not null,
  card_type  text not null,          -- unit, spell, relic, dojo
  rarity     text not null,          -- common, rare, epic, legendary
  cost       int default 0,
  attack     int,
  health     int,
  rules_text text,
  image_url  text,
  created_at timestamptz default now()
);

-- PLAYER COLLECTION ----------------------------------------------------------
create table if not exists player_cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  card_id       uuid references cards(id) on delete cascade,
  quantity      int default 1,
  foil_quantity int default 0,
  unique (user_id, card_id)
);

-- DECKS ----------------------------------------------------------------------
create table if not exists decks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  name       text not null,
  clan       text,
  is_active  boolean default false,
  created_at timestamptz default now()
);

create table if not exists deck_cards (
  id       uuid primary key default gen_random_uuid(),
  deck_id  uuid references decks(id) on delete cascade,
  card_id  uuid references cards(id) on delete cascade,
  quantity int not null check (quantity > 0)
);

-- MATCHES --------------------------------------------------------------------
create table if not exists matches (
  id         uuid primary key default gen_random_uuid(),
  mode       text not null,          -- ranked, casual, campaign, lobby
  status     text default 'waiting', -- waiting, active, finished
  player_one uuid references profiles(id),
  player_two uuid references profiles(id),
  winner     uuid references profiles(id),
  started_at timestamptz,
  ended_at   timestamptz,
  created_at timestamptz default now()
);

-- CUSTOM LOBBIES -------------------------------------------------------------
create table if not exists lobbies (
  id          uuid primary key default gen_random_uuid(),
  host_id     uuid references profiles(id) on delete cascade,
  lobby_code  text unique not null,
  status      text default 'open',
  max_players int default 2,
  created_at  timestamptz default now()
);

-- DAILY REWARDS --------------------------------------------------------------
create table if not exists daily_rewards (
  id             uuid primary key default gen_random_uuid(),
  day_number     int not null,
  reward_type    text not null,      -- gold, gems, pack, card, cosmetic
  reward_amount  int default 1,
  reward_card_id uuid references cards(id)
);

create table if not exists player_daily_rewards (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  reward_day      int default 1,
  last_claimed_at timestamptz,
  streak          int default 0
);

-- CAMPAIGN -------------------------------------------------------------------
create table if not exists campaign_nodes (
  id               uuid primary key default gen_random_uuid(),
  chapter          int not null,
  name             text not null,
  enemy_name       text,
  clan             text,
  reward_card_id   uuid references cards(id),
  reward_xp        int default 0,
  reward_currency  int default 0
);

create table if not exists player_campaign_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  node_id      uuid references campaign_nodes(id) on delete cascade,
  completed    boolean default false,
  completed_at timestamptz,
  unique (user_id, node_id)
);

-- helpful indexes ------------------------------------------------------------
create index if not exists idx_player_cards_user on player_cards(user_id);
create index if not exists idx_decks_user        on decks(user_id);
create index if not exists idx_deck_cards_deck    on deck_cards(deck_id);
create index if not exists idx_matches_players    on matches(player_one, player_two);
create index if not exists idx_campaign_progress_user on player_campaign_progress(user_id);
