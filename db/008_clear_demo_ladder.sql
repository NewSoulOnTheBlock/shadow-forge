-- 008_clear_demo_ladder.sql
-- Clear the seeded demo ladder so the leaderboard tracks only real players.
-- Removes the 10 fixed-UUID demo accounts from db/006_demo_seed.sql; the delete
-- cascades to their profiles, player_ranks, collections, decks, match_history
-- and any demo-hosted lobbies. Run manually against the live DB (migrations are
-- applied by hand in this project — see package.json has no migrate runner).

delete from users
where id in (
  '00000000-0000-0000-0000-0000000000aa',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000009'
);
