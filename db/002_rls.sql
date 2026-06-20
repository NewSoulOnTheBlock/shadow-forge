-- =============================================================================
-- SHADOW FORGE — ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
-- Plain-Postgres adaptation of Supabase's auth.uid() RLS model.
--
-- The app identifies the current user per request via a GUC:
--     SET app.user_id = '<uuid>';     -- (or: select set_config('app.user_id', $1, true))
-- and app.current_user_id() reads it back. Policies key off that value.
--
-- IMPORTANT: RLS is NOT forced. The `shadowforge` role owns these tables and
-- therefore BYPASSES RLS — so the app keeps full access today with zero wiring.
-- RLS only takes effect once you connect as a *non-owner* restricted role
-- (recommended for production). To harden later:
--     create role shadowforge_app login password '...';
--     grant usage on schema public, app to shadowforge_app;
--     grant select, insert, update, delete on all tables in schema public to shadowforge_app;
--     -- then connect the app as shadowforge_app and SET app.user_id each request.
-- =============================================================================

create schema if not exists app;

create or replace function app.current_user_id() returns uuid
  language sql stable
as $$ select nullif(current_setting('app.user_id', true), '')::uuid $$;

-- ---- public reference data: readable by everyone, writable by owner only ----
do $$
declare t text;
begin
  foreach t in array array['cards','daily_rewards','campaign_nodes'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists %I_read on %I;', t, t);
    execute format('create policy %I_read on %I for select using (true);', t, t);
  end loop;
end $$;

-- ---- public profile/rank reads (leaderboards), self-only writes -------------
alter table profiles enable row level security;
drop policy if exists profiles_read  on profiles;
drop policy if exists profiles_write on profiles;
create policy profiles_read  on profiles for select using (true);
create policy profiles_write on profiles for all
  using (id = app.current_user_id()) with check (id = app.current_user_id());

alter table player_ranks enable row level security;
drop policy if exists player_ranks_read  on player_ranks;
drop policy if exists player_ranks_write on player_ranks;
create policy player_ranks_read  on player_ranks for select using (true);
create policy player_ranks_write on player_ranks for all
  using (user_id = app.current_user_id()) with check (user_id = app.current_user_id());

-- ---- strictly private, owned-by-user tables --------------------------------
do $$
declare t text;
begin
  foreach t in array array['player_cards','decks','player_daily_rewards','player_campaign_progress'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists %I_self on %I;', t, t);
    execute format($f$create policy %I_self on %I for all
      using (user_id = app.current_user_id())
      with check (user_id = app.current_user_id());$f$, t, t);
  end loop;
end $$;

-- ---- deck_cards: scoped through the parent deck's owner ---------------------
alter table deck_cards enable row level security;
drop policy if exists deck_cards_self on deck_cards;
create policy deck_cards_self on deck_cards for all
  using (deck_id in (select id from decks where user_id = app.current_user_id()))
  with check (deck_id in (select id from decks where user_id = app.current_user_id()));

-- ---- matches: visible to participants only ---------------------------------
alter table matches enable row level security;
drop policy if exists matches_participant on matches;
create policy matches_participant on matches for all
  using (player_one = app.current_user_id() or player_two = app.current_user_id())
  with check (player_one = app.current_user_id() or player_two = app.current_user_id());

-- ---- lobbies: open lobbies are discoverable; only the host can mutate -------
alter table lobbies enable row level security;
drop policy if exists lobbies_browse on lobbies;
drop policy if exists lobbies_host   on lobbies;
create policy lobbies_browse on lobbies for select
  using (status = 'open' or host_id = app.current_user_id());
create policy lobbies_host on lobbies for all
  using (host_id = app.current_user_id()) with check (host_id = app.current_user_id());
