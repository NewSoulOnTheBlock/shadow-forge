-- =============================================================================
-- SHADOW FORGE — APP SUPPORT TABLES + COLUMN EXTENSIONS
-- Backs the profile/match-history/achievements UI that the base schema didn't
-- cover. Idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- =============================================================================

-- profile cosmetics + progression the UI renders ------------------------------
alter table profiles add column if not exists xp_to_next      int  default 1000;
alter table profiles add column if not exists title           text;
alter table profiles add column if not exists badges          text[] default '{}';
alter table profiles add column if not exists favorite_deck_id uuid references decks(id) on delete set null;

-- rank division within a tier (UI shows "Platinum 2") -------------------------
alter table player_ranks add column if not exists division int default 4;

-- collection cosmetic finishes the player owns per card -----------------------
alter table player_cards add column if not exists variants  text[] default '{standard}';
alter table player_cards add column if not exists favorite  boolean default false;
alter table player_cards add column if not exists acquired_at timestamptz default now();

-- deck cover art glyph --------------------------------------------------------
alter table decks add column if not exists cover_art text default '🎴';
alter table decks add column if not exists updated_at timestamptz default now();

-- one daily-reward streak row per player (needed for upsert-on-claim) ----------
alter table player_daily_rewards drop constraint if exists player_daily_rewards_user_unique;
alter table player_daily_rewards add constraint player_daily_rewards_user_unique unique (user_id);

-- RICH MATCH HISTORY (display-oriented; complements the raw `matches` table) ---
create table if not exists match_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade,
  mode          text not null,           -- ranked, casual, single, custom
  result        text not null,           -- win, loss, draw
  opponent      text not null,
  opponent_avatar text,
  deck_name     text,
  rank_delta    int default 0,
  duration_sec  int default 0,
  played_at     timestamptz default now()
);
create index if not exists idx_match_history_user on match_history(user_id, played_at desc);

-- ACHIEVEMENTS catalog + per-player progress ----------------------------------
create table if not exists achievements (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  name        text not null,
  description text not null,
  icon        text,
  goal        int not null default 1,
  sort        int default 0
);

create table if not exists player_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references profiles(id) on delete cascade,
  achievement_id uuid references achievements(id) on delete cascade,
  progress       int default 0,
  unlocked       boolean default false,
  unlocked_at    timestamptz,
  unique (user_id, achievement_id)
);
