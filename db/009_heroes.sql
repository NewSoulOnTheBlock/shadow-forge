-- =============================================================================
-- SHADOW FORGE — HERO SELECTION & PROGRESSION (Phase 1)
-- Adds the player's chosen starting hero plus the hero/campaign reference tables
-- and per-user hero ownership. Idempotent / re-runnable.
-- Note: account level == profiles.level, gold == currency_soft, gems == currency_premium.
-- =============================================================================

-- Player's permanent starting hero (null until the Path Selection Ceremony).
alter table profiles add column if not exists selected_hero text;

-- HEROES (reference) ---------------------------------------------------------
create table if not exists heroes (
  id                  text primary key,
  name                text not null,
  title               text not null,
  prism               text not null,
  ability_name        text not null,
  ability_description text not null,
  difficulty          text not null,
  campaign_id         text
);

-- CAMPAIGNS (reference) ------------------------------------------------------
create table if not exists campaigns (
  id            text primary key,
  hero_id       text references heroes(id) on delete cascade,
  chapter_count int default 5
);

-- USER ↔ HERO ownership ------------------------------------------------------
create table if not exists user_heroes (
  user_id      uuid references profiles(id) on delete cascade,
  hero_id      text references heroes(id)   on delete cascade,
  unlocked     boolean default false,
  mastery_level int    default 0,
  unlocked_at  timestamptz default now(),
  primary key (user_id, hero_id)
);

-- Seed the five Legendary Heroes + their campaigns. ---------------------------
insert into heroes (id, name, title, prism, ability_name, ability_description, difficulty, campaign_id) values
  ('skyweaver',    'Skyweaver',    'Master of the Winds',          'agility',  'Wind Shift',      'Once per turn, return one friendly unit to your hand and reduce its cost by 1.', 'Medium', 'camp_skyweaver'),
  ('oni_warlord',  'Oni Warlord',  'Breaker of Gates',             'strength', 'Blood Fury',      'Once per turn, a friendly unit gains +2 Attack and Haste.',                      'Easy',   'camp_oni_warlord'),
  ('sage',         'Sage',         'Keeper of Wisdom',             'wisdom',   'Ancient Insight', 'Draw a card, then discard a card.',                                              'Hard',   'camp_sage'),
  ('shadow_ninja', 'Shadow Ninja', 'The Silent Blade',             'agility',  'Shadow Step',     'A friendly unit gains Stealth until your next turn.',                            'Medium', 'camp_shadow_ninja'),
  ('dragon_monk',  'Dragon Monk',  'Voice of the Eternal Flame',   'heart',    'Dragon Spirit',   'Restore 2 Health to your Hero.',                                                 'Easy',   'camp_dragon_monk')
on conflict (id) do update set
  name = excluded.name, title = excluded.title, prism = excluded.prism,
  ability_name = excluded.ability_name, ability_description = excluded.ability_description,
  difficulty = excluded.difficulty, campaign_id = excluded.campaign_id;

insert into campaigns (id, hero_id, chapter_count) values
  ('camp_skyweaver',    'skyweaver',    5),
  ('camp_oni_warlord',  'oni_warlord',  5),
  ('camp_sage',         'sage',         5),
  ('camp_shadow_ninja', 'shadow_ninja', 5),
  ('camp_dragon_monk',  'dragon_monk',  5)
on conflict (id) do nothing;
