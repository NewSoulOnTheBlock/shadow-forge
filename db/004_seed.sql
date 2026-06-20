-- =============================================================================
-- SHADOW FORGE — REFERENCE SEED (daily rewards + campaign nodes)
-- Idempotent: guarded by NOT EXISTS so re-running is safe.
-- Run AFTER 003_cards.sql (reward_card_id links to cards.code).
-- =============================================================================

-- ---- 7-day daily reward cycle ----------------------------------------------
insert into daily_rewards (day_number, reward_type, reward_amount, reward_card_id)
select v.day, v.rtype, v.amt,
       case when v.code is not null then (select id from cards where code = v.code) end
from (values
  (1, 'gold',     100, null),
  (2, 'gold',     150, null),
  (3, 'gems',      20, null),
  (4, 'pack',       1, null),
  (5, 'gold',     250, null),
  (6, 'gems',      40, null),
  (7, 'card',       1, 'str_titan')
) as v(day, rtype, amt, code)
where not exists (select 1 from daily_rewards d where d.day_number = v.day);

-- ---- single-player campaign nodes ------------------------------------------
insert into campaign_nodes (chapter, name, enemy_name, clan, reward_card_id, reward_xp, reward_currency)
select v.chapter, v.name, v.enemy, v.clan,
       (select id from cards where code = v.code), v.xp, v.cur
from (values
  -- Chapter 1 — Beginner
  (1, 'The Training Grounds', 'Sensei Kuro',     'Oni',        'str_recruit',  50,  100),
  (1, 'Bamboo Ambush',        'Foot Captain',    'Shadow',     'agi_tempest',  60,  120),
  (1, 'Shrine Gates',         'Acolyte Yumi',    'Shrine',     'hrt_phoenix',  60,  120),
  -- Chapter 2 — Intermediate
  (2, 'Hall of Scrolls',      'Elder Sage',      'Sage',       'wis_nova',     90,  180),
  (2, 'Clockwork Foundry',    'The Tinkerer',    'Trapmaster', 'int_siege',    90,  180),
  (2, 'Crimson Dojo',         'Blade Master Rin','Oni',        'str_demon',   110,  220),
  -- Chapter 3 — Expert
  (3, 'Whispering Forest',    'Shadow Oyabun',   'Shadow',     'agi_master',  150,  300),
  (3, 'Celestial Temple',     'High Priestess',  'Shrine',     'hrt_angel',   150,  300),
  -- Chapter 4 — Boss
  (4, 'The Forge of Shadows', 'Dragon Warlord',  'Oni',        'str_avatar',  300,  600)
) as v(chapter, name, enemy, clan, code, xp, cur)
where not exists (select 1 from campaign_nodes c where c.name = v.name);
