-- =============================================================================
-- SHADOW FORGE — DEMO EXTRA SEED
-- A few public lobbies + the demo player's daily-reward claim state so the
-- /lobby and /profile screens render real DB-backed data. Idempotent.
-- Run AFTER 006.
-- =============================================================================

begin;

-- ---- public lobbies (host = ladder opponents) -------------------------------
insert into lobbies (id, host_id, lobby_code, status, max_players) values
  ('1b000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000005','KZ7QP','open',2),
  ('1b000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000006','M4XR9','open',2),
  ('1b000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000008','BB2HT','open',2)
on conflict (id) do update set status = excluded.status;

-- ---- demo daily-reward streak: days 1-2 already claimed ----------------------
delete from player_daily_rewards where user_id = '00000000-0000-0000-0000-0000000000aa';
insert into player_daily_rewards (user_id, reward_day, last_claimed_at, streak) values
  ('00000000-0000-0000-0000-0000000000aa', 2, now() - interval '20 hours', 2);

commit;
