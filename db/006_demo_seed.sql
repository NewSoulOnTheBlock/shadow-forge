-- =============================================================================
-- SHADOW FORGE — DEMO ACCOUNT SEED
-- Populates a playable demo account ("shadowfox") + ladder opponents so the
-- frontend renders real DB-backed data before auth is wired.
-- Fixed UUIDs + ON CONFLICT make this fully re-runnable.
-- Run AFTER 001..005. Card ownership/decks join cards by their stable `code`.
-- =============================================================================

begin;

-- ---- identities: demo + 9 ladder opponents ---------------------------------
insert into users (id, email, display_name) values
  ('00000000-0000-0000-0000-0000000000aa','shadowfox@shadowforge.gg','ShadowFox'),
  ('00000000-0000-0000-0000-000000000001',null,'RyuStorm'),
  ('00000000-0000-0000-0000-000000000002',null,'KageNoOu'),
  ('00000000-0000-0000-0000-000000000003',null,'YukiBlade'),
  ('00000000-0000-0000-0000-000000000004',null,'ToraFang'),
  ('00000000-0000-0000-0000-000000000005',null,'HanaPetal'),
  ('00000000-0000-0000-0000-000000000006',null,'JinSpark'),
  ('00000000-0000-0000-0000-000000000007',null,'MizuFlow'),
  ('00000000-0000-0000-0000-000000000008',null,'KuroMaru'),
  ('00000000-0000-0000-0000-000000000009',null,'AkaOni')
on conflict (id) do nothing;

insert into profiles (id, username, avatar_url, level, xp, xp_to_next, currency_soft, title, badges) values
  ('00000000-0000-0000-0000-0000000000aa','shadowfox','🦊',27,6450,9000,4250,'Of the Silent Step','{founder,season1,flawless}'),
  ('00000000-0000-0000-0000-000000000001','ryustorm','🐉',60,0,1000,0,null,'{}'),
  ('00000000-0000-0000-0000-000000000002','kagenoou','👤',58,0,1000,0,null,'{}'),
  ('00000000-0000-0000-0000-000000000003','yukiblade','❄️',57,0,1000,0,null,'{}'),
  ('00000000-0000-0000-0000-000000000004','torafang','🐯',54,0,1000,0,null,'{}'),
  ('00000000-0000-0000-0000-000000000005','hanapetal','🌸',53,0,1000,0,null,'{}'),
  ('00000000-0000-0000-0000-000000000006','jinspark','⚡',52,0,1000,0,null,'{}'),
  ('00000000-0000-0000-0000-000000000007','mizuflow','🌊',48,0,1000,0,null,'{}'),
  ('00000000-0000-0000-0000-000000000008','kuromaru','🐺',44,0,1000,0,null,'{}'),
  ('00000000-0000-0000-0000-000000000009','akaoni','👹',43,0,1000,0,null,'{}')
on conflict (id) do update set
  avatar_url = excluded.avatar_url, level = excluded.level, xp = excluded.xp,
  xp_to_next = excluded.xp_to_next, currency_soft = excluded.currency_soft,
  title = excluded.title, badges = excluded.badges;

insert into player_ranks (user_id, rank_name, division, lp, wins, losses) values
  ('00000000-0000-0000-0000-0000000000aa','Platinum',2,1840,312,188),
  ('00000000-0000-0000-0000-000000000001','Mythic',1,3120,901,420),
  ('00000000-0000-0000-0000-000000000002','Mythic',1,3005,845,390),
  ('00000000-0000-0000-0000-000000000003','Mythic',1,2980,812,377),
  ('00000000-0000-0000-0000-000000000004','Diamond',1,2740,760,401),
  ('00000000-0000-0000-0000-000000000005','Diamond',2,2690,741,388),
  ('00000000-0000-0000-0000-000000000006','Diamond',3,2610,702,360),
  ('00000000-0000-0000-0000-000000000007','Platinum',1,2400,688,372),
  ('00000000-0000-0000-0000-000000000008','Gold',1,1620,401,355),
  ('00000000-0000-0000-0000-000000000009','Gold',2,1555,388,349)
on conflict (user_id) do update set
  rank_name = excluded.rank_name, division = excluded.division,
  lp = excluded.lp, wins = excluded.wins, losses = excluded.losses;

-- ---- demo collection: deterministic ownership over the 150-card catalog ------
-- r in 0..99 from a stable hash of the card code; mirrors the old mock logic.
insert into player_cards (user_id, card_id, quantity, variants, favorite, acquired_at)
select '00000000-0000-0000-0000-0000000000aa', c.id,
       case when r > 60 then 2 else 1 end,
       ('{standard}'::text[])
         || case when r > 78 then '{foil}'::text[] else '{}'::text[] end
         || case when r > 93 then '{prismatic}'::text[] else '{}'::text[] end,
       r > 85,
       now() - ((r % 60) || ' days')::interval
from (
  select id, (abs(hashtext(code)) % 100) as r from cards
) c
where c.r > 12   -- ~12% of the catalog stays unowned (missing)
on conflict (user_id, card_id) do update set
  quantity = excluded.quantity, variants = excluded.variants,
  favorite = excluded.favorite, acquired_at = excluded.acquired_at;

-- ---- demo decks (3 starter decks) -------------------------------------------
insert into decks (id, user_id, name, clan, is_active, cover_art) values
  ('d0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000aa','Shadow Blade Clan','Oni',true,'🥷'),
  ('d0000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000aa','Scroll & Trap Clan','Sage',false,'📜'),
  ('d0000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-0000000000aa','Shrine Warrior Clan','Shrine',false,'⛩️')
on conflict (id) do update set name = excluded.name, cover_art = excluded.cover_art;

-- rebuild deck contents deterministically
delete from deck_cards where deck_id in (
  'd0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003');

insert into deck_cards (deck_id, card_id, quantity)
select v.deck_id::uuid, c.id, 1
from (values
  -- Shadow Blade Clan
  ('d0000000-0000-0000-0000-000000000001','str_recruit'),('d0000000-0000-0000-0000-000000000001','str_berserker'),
  ('d0000000-0000-0000-0000-000000000001','str_wolf'),('d0000000-0000-0000-0000-000000000001','str_warlord'),
  ('d0000000-0000-0000-0000-000000000001','str_champion'),('d0000000-0000-0000-0000-000000000001','str_ogre'),
  ('d0000000-0000-0000-0000-000000000001','str_smash'),('d0000000-0000-0000-0000-000000000001','str_rage'),
  ('d0000000-0000-0000-0000-000000000001','agi_scout'),('d0000000-0000-0000-0000-000000000001','agi_rogue'),
  ('d0000000-0000-0000-0000-000000000001','agi_duelist'),('d0000000-0000-0000-0000-000000000001','agi_falcon'),
  ('d0000000-0000-0000-0000-000000000001','agi_assassin'),('d0000000-0000-0000-0000-000000000001','agi_windblade'),
  ('d0000000-0000-0000-0000-000000000001','agi_dash'),('d0000000-0000-0000-0000-000000000001','agi_ambush'),
  -- Scroll & Trap Clan
  ('d0000000-0000-0000-0000-000000000002','wis_scholar'),('d0000000-0000-0000-0000-000000000002','wis_sage'),
  ('d0000000-0000-0000-0000-000000000002','wis_oracle'),('d0000000-0000-0000-0000-000000000002','wis_mirror'),
  ('d0000000-0000-0000-0000-000000000002','wis_archmage'),('d0000000-0000-0000-0000-000000000002','wis_bolt'),
  ('d0000000-0000-0000-0000-000000000002','wis_insight'),('d0000000-0000-0000-0000-000000000002','wis_meteor'),
  ('d0000000-0000-0000-0000-000000000002','int_turret'),('d0000000-0000-0000-0000-000000000002','int_tinkerer'),
  ('d0000000-0000-0000-0000-000000000002','int_saboteur'),('d0000000-0000-0000-0000-000000000002','int_construct'),
  ('d0000000-0000-0000-0000-000000000002','int_summoner'),('d0000000-0000-0000-0000-000000000002','int_disrupt'),
  ('d0000000-0000-0000-0000-000000000002','int_overload'),('d0000000-0000-0000-0000-000000000002','int_hex'),
  -- Shrine Warrior Clan
  ('d0000000-0000-0000-0000-000000000003','hrt_medic'),('d0000000-0000-0000-0000-000000000003','hrt_cleric'),
  ('d0000000-0000-0000-0000-000000000003','hrt_guardian'),('d0000000-0000-0000-0000-000000000003','hrt_lifebloom'),
  ('d0000000-0000-0000-0000-000000000003','hrt_treant'),('d0000000-0000-0000-0000-000000000003','hrt_phoenix'),
  ('d0000000-0000-0000-0000-000000000003','hrt_angel'),('d0000000-0000-0000-0000-000000000003','hrt_blessing'),
  ('d0000000-0000-0000-0000-000000000003','str_recruit'),('d0000000-0000-0000-0000-000000000003','str_berserker'),
  ('d0000000-0000-0000-0000-000000000003','str_warlord'),('d0000000-0000-0000-0000-000000000003','str_champion'),
  ('d0000000-0000-0000-0000-000000000003','str_ogre'),('d0000000-0000-0000-0000-000000000003','str_titan'),
  ('d0000000-0000-0000-0000-000000000003','str_smash'),('d0000000-0000-0000-0000-000000000003','str_warcry')
) as v(deck_id, code)
join cards c on c.code = v.code;

update profiles set favorite_deck_id = 'd0000000-0000-0000-0000-000000000001'
where id = '00000000-0000-0000-0000-0000000000aa';

-- ---- demo match history -----------------------------------------------------
delete from match_history where user_id = '00000000-0000-0000-0000-0000000000aa';
insert into match_history (user_id, mode, result, opponent, opponent_avatar, deck_name, rank_delta, duration_sec, played_at) values
  ('00000000-0000-0000-0000-0000000000aa','ranked','win', 'KageNoOu','👤','Shadow Blade Clan', 18,412, now() - interval '1 hour'),
  ('00000000-0000-0000-0000-0000000000aa','ranked','loss','YukiBlade','❄️','Shadow Blade Clan',-15,540, now() - interval '2 hours'),
  ('00000000-0000-0000-0000-0000000000aa','casual','win', 'HanaPetal','🌸','Shrine Warrior Clan',0,380, now() - interval '1 day'),
  ('00000000-0000-0000-0000-0000000000aa','ranked','win', 'JinSpark','⚡','Scroll & Trap Clan', 16,295, now() - interval '25 hours'),
  ('00000000-0000-0000-0000-0000000000aa','single','win', 'Sensei Saru','🐒','Shadow Blade Clan',0,210, now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000000aa','ranked','loss','ToraFang','🐯','Shadow Blade Clan',-14,631, now() - interval '50 hours');

-- ---- achievements catalog + demo progress -----------------------------------
insert into achievements (code, name, description, icon, goal, sort) values
  ('first_blood','First Blood','Win your first match.','🩸',1,1),
  ('clan_master','Clan Master','Win 100 ranked matches.','🎌',100,2),
  ('collector','Collector','Own 30 unique cards.','🎴',30,3),
  ('flawless','Flawless','Win a match without losing health.','✨',1,4),
  ('shadow_walker','Shadow Walker','Win 50 matches with stealth units.','🥷',50,5),
  ('ascendant','Ascendant','Reach Mythic rank.','👑',1,6)
on conflict (code) do update set
  name = excluded.name, description = excluded.description, icon = excluded.icon, goal = excluded.goal, sort = excluded.sort;

insert into player_achievements (user_id, achievement_id, progress, unlocked)
select '00000000-0000-0000-0000-0000000000aa', a.id, v.progress, v.progress >= a.goal
from (values
  ('first_blood',1),('clan_master',312),('collector',38),
  ('flawless',1),('shadow_walker',31),('ascendant',0)
) as v(code, progress)
join achievements a on a.code = v.code
on conflict (user_id, achievement_id) do update set
  progress = excluded.progress, unlocked = excluded.unlocked;

commit;
