'use client';

import { motion } from 'framer-motion';
import PlayerAvatar from '@/components/PlayerAvatar';
import { tierColor } from '@/components/RankBadge';
import { cx } from '@/lib/ui';
import { useAppStore } from '@/store/appStore';

export default function LeaderboardPage() {
  // DB-backed ranked ladder; self is detected via the current profile's id,
  // not a hardcoded string (it's a real user uuid once auth lands).
  const leaderboard = useAppStore((s) => s.leaderboard);
  const selfId = useAppStore((s) => s.selfUserId);
  const topThree = leaderboard.slice(0, 3);
  const self = leaderboard.find((entry) => entry.userId === selfId);

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="panel overflow-hidden p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="stat-label">Season 1 · Clan Wars</p>
            <h1 className="neon-text mt-1 text-4xl font-black tracking-tight sm:text-5xl">
              Leaderboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
              Ascend the ranked ladder, challenge clan champions, and etch your name into the forge.
            </p>
          </div>
          <div className="panel px-5 py-4">
            <p className="stat-label">Time Remaining</p>
            <p className="mt-1 text-2xl font-black text-[var(--color-gold)]">18d 04h</p>
          </div>
        </div>
      </section>

      <section className="grid items-end gap-4 md:grid-cols-3">
        {topThree.map((entry, index) => {
          const color = tierColor(entry.rankTier);
          const order = index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3';
          const height = index === 0 ? 'md:min-h-[260px]' : 'md:min-h-[220px]';
          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={cx('panel panel-hover p-5 text-center', order, height)}
              style={{
                borderColor: `color-mix(in srgb, ${color} 55%, var(--color-line))`,
                boxShadow: index === 0 ? `0 0 44px -24px ${color}` : undefined,
              }}
            >
              <p className="text-4xl">{entry.position === 1 ? '🥇' : entry.position === 2 ? '🥈' : '🥉'}</p>
              <div className="mt-4 flex justify-center">
                <PlayerAvatar avatar={entry.avatar} size={index === 0 ? 'xl' : 'lg'} active={index === 0} />
              </div>
              <h2 className="mt-4 text-xl font-black">{entry.displayName}</h2>
              <p className="mt-1 text-sm font-bold" style={{ color }}>
                {entry.rankTier}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-[var(--color-line)] bg-black/20 p-3">
                  <p className="stat-label">Points</p>
                  <p className="font-black">{entry.points}</p>
                </div>
                <div className="rounded-xl border border-[var(--color-line)] bg-black/20 p-3">
                  <p className="stat-label">Wins</p>
                  <p className="font-black">{entry.wins}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {self && (
        <section className="panel sticky top-3 z-20 border-[var(--color-neon)] p-4 shadow-[0_0_30px_-18px_var(--color-neon)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="chip border-[var(--color-neon)] text-[var(--color-neon)]">Your Rank</span>
              <PlayerAvatar avatar={self.avatar} name={self.displayName} size="sm" active />
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-bold">
              <span>#{self.position}</span>
              <span style={{ color: tierColor(self.rankTier) }}>{self.rankTier}</span>
              <span>{self.points} LP</span>
              <span>{self.wins} Wins</span>
            </div>
          </div>
        </section>
      )}

      <section className="panel overflow-hidden">
        <div className="grid grid-cols-[72px_1.5fr_110px_100px_90px] gap-4 border-b border-[var(--color-line)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
          <span>Rank</span>
          <span>Player</span>
          <span>Tier</span>
          <span>Points</span>
          <span>Wins</span>
        </div>
        <div className="divide-y divide-[var(--color-line)]">
          {leaderboard.map((entry) => {
            const isSelf = entry.userId === selfId;
            const color = tierColor(entry.rankTier);
            return (
              <div
                key={entry.userId}
                className={cx(
                  'grid grid-cols-[72px_1.5fr_110px_100px_90px] items-center gap-4 px-4 py-3 transition hover:bg-white/[0.03]',
                  isSelf && 'm-2 rounded-2xl border border-[var(--color-neon)] bg-[rgba(0,229,255,0.06)]',
                )}
              >
                <span className="font-black">#{entry.position}</span>
                <div className="flex items-center gap-3">
                  <PlayerAvatar avatar={entry.avatar} name={entry.displayName} size="sm" active={isSelf} />
                  {isSelf && <span className="chip text-[var(--color-neon)]">You</span>}
                </div>
                <span className="font-black" style={{ color }}>
                  {entry.rankTier}
                </span>
                <span className="font-bold">{entry.points}</span>
                <span className="font-bold">{entry.wins}</span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
