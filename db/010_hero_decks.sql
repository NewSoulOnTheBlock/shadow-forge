-- =============================================================================
-- SHADOW FORGE — FIVE HERO STARTER DECKS
-- Replaces the old 3-deck seed with one themed starter deck per Legendary Hero.
-- Each new player now receives all five hero decks; the Path Selection Ceremony
-- (selectHero) activates the chosen hero's deck by name. Idempotent: re-running
-- never duplicates a deck or its cards. Also backfills every existing player.
-- =============================================================================

-- Helper: create one hero deck (if absent) + its cards for a player. Returns deck id.
create or replace function sf_seed_hero_deck(
  p_user  uuid,
  p_name  text,
  p_clan  text,
  p_cover text,
  p_codes text[]
) returns uuid
language plpgsql as $$
declare
  d_id uuid;
begin
  select id into d_id from decks where user_id = p_user and name = p_name limit 1;
  if d_id is null then
    insert into decks (user_id, name, clan, is_active, cover_art)
      values (p_user, p_name, p_clan, false, p_cover)
      returning id into d_id;
    insert into deck_cards (deck_id, card_id, quantity)
      select d_id, c.id, 1 from cards c where c.code = any(p_codes);
  end if;
  return d_id;
end $$;

-- Re-seed: rank + starter collection + the five hero decks. --------------------
create or replace function sf_seed_player(p_user uuid) returns void
language plpgsql as $$
declare
  d_first uuid;
  has_active boolean;
begin
  insert into player_ranks (user_id, rank_name, division, lp, wins, losses)
    values (p_user, 'Bronze', 4, 0, 0, 0)
    on conflict (user_id) do nothing;

  insert into player_cards (user_id, card_id, quantity, variants, favorite, acquired_at)
  select p_user, c.id, 1, '{standard}'::text[], false, now()
  from (select id, (abs(hashtext(code)) % 100) as r from cards) c
  where c.r > 12
  on conflict (user_id, card_id) do nothing;

  d_first := sf_seed_hero_deck(p_user, 'Stormwind Flight',  'Skyweaver',    E'\U0001F32C', array[
    'agi_scout','agi_genin','agi_kunoichi','agi_falcon','agi_falconer','agi_windblade',
    'agi_swiftstrike','agi_tempest','agi_master','agi_dash','agi_flurry',
    'wis_acolyte','wis_diviner','wis_oracle','wis_stormcaller','wis_insight','wis_scry','wis_squall']);

  perform sf_seed_hero_deck(p_user, 'Gatebreaker Horde', 'Oni Warlord', E'\U0001F479', array[
    'str_recruit','str_initiate','str_berserker','str_brawler','str_warhound','str_oniblade',
    'str_ronin','str_breaker','str_warlord','str_ogre','str_champion',
    'str_rage','str_smash','str_cleave','str_warcry','str_onislam','agi_scout','agi_rogue']);

  perform sf_seed_hero_deck(p_user, 'Eternal Archive', 'Sage', E'\U0001F4DC', array[
    'wis_scholar','wis_acolyte','wis_familiar','wis_sage','wis_oracle','wis_mirror',
    'wis_archmage','wis_elder','wis_celestial','wis_insight','wis_scry','wis_meteor','wis_nova',
    'int_drone','int_turret','int_construct','int_summoner','int_hex']);

  perform sf_seed_hero_deck(p_user, 'Silent Ambush', 'Shadow Ninja', E'\U0001F977', array[
    'agi_genin','agi_scout','agi_rogue','agi_kunoichi','agi_assassin','agi_shadowstep',
    'agi_venomdart','agi_nightblade','agi_phantom','agi_reaper','agi_smoke','agi_ambush',
    'agi_backstab','agi_decapitate','int_saboteur','int_spider','int_snare','int_hex']);

  perform sf_seed_hero_deck(p_user, 'Celestial Flame', 'Dragon Monk', E'\U0001F409', array[
    'hrt_novice','hrt_medic','hrt_cleric','hrt_guardian','hrt_lifebloom','hrt_treant',
    'hrt_phoenix','hrt_kirin','hrt_angel','hrt_avatar','hrt_mend','hrt_blessing',
    'hrt_renewal','hrt_revive','str_recruit','str_warlord','str_champion','str_titan']);

  -- Only auto-activate a deck if the player has none active yet.
  select exists(select 1 from decks where user_id = p_user and is_active) into has_active;
  if not has_active then
    update decks set is_active = (id = d_first) where user_id = p_user;
    update profiles set favorite_deck_id = d_first where id = p_user;
  end if;
end $$;

-- Backfill every existing player with the five hero decks.
select sf_seed_player(id) from profiles;
