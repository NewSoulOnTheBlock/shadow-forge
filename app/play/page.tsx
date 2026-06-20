'use client';

// Home / Play hub — the premium landing screen (spec sections 2 & 3).
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { db } from '@/lib/mock-data';
import RankBadge from '@/components/RankBadge';
import PlayerAvatar from '@/components/PlayerAvatar';
import ModeCard from '@/components/ModeCard';
import DeckSelector from '@/components/DeckSelector';
import RewardPanel from '@/components/RewardPanel';
import QueueModal from '@/components/QueueModal';

export default function PlayPage() {
  const profile = useAppStore((s) => s.profile);
  const [queue, setQueue] = useState<'ranked' | 'casual' | null>(null);

  const xpPct = Math.round((profile.xp / profile.xpToNext) * 100);
  const winRate = Math.round((profile.wins / (profile.wins + profile.losses)) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* HERO */}
      <section className="panel relative mb-6 overflow-hidden p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[var(--color-neon-2)] opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[var(--color-neon)] opacity-10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="chip text-[var(--color-neon)]">⚡ Season 1 · Clan Wars</span>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
              Master the <span className="neon-text">Shadows</span>.
              <br />
              Forge your <span className="neon-text">Legend</span>.
            </h1>
            <p className="mt-3 max-w-md text-[var(--color-muted)]">
              Assemble a clan of ninja, sages, and oni. Outwit rivals in fast,
              skill-driven duels. Climb the ranked ladder to Mythic.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary px-6 py-3 text-base"
                onClick={() => setQueue('ranked')}
              >
                ⚔️ Play Ranked
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn px-6 py-3 text-base"
                onClick={() => setQueue('casual')}
              >
                🎴 Play Casual
              </motion.button>
            </div>
          </div>

          {/* Player status panel */}
          <div className="panel w-full max-w-xs p-5">
            <div className="flex items-center gap-3">
              <PlayerAvatar avatar={profile.avatar} level={profile.level} size="lg" />
              <div>
                <div className="text-lg font-black">{profile.displayName}</div>
                <div className="text-xs text-[var(--color-muted)]">{profile.title}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-[var(--color-muted)]">
                <span>Level {profile.level}</span>
                <span>
                  {profile.xp}/{profile.xpToNext} XP
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-panel-2)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-neon)] to-[var(--color-neon-2)]"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <RankBadge rank={profile.rank} />
              <div className="text-right">
                <div className="text-lg font-black text-[var(--color-shadow)]">{winRate}%</div>
                <div className="stat-label">Win rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Featured modes */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-black">Game Modes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ModeCard
              featured
              title="Ranked Ladder"
              subtitle="Compete for LP and climb to Mythic. Your active deck, your skill."
              icon="🏆"
              accent="var(--color-gold)"
              badge="LP +18"
              onClick={() => setQueue('ranked')}
            />
            <ModeCard
              featured
              title="Casual Duel"
              subtitle="Quick matches, no rank at stake. Test new decks freely."
              icon="🎴"
              accent="var(--color-neon)"
              onClick={() => setQueue('casual')}
            />
            <ModeCard
              title="Single Player"
              subtitle="Campaign, practice & tutorials vs AI."
              icon="🗺️"
              accent="var(--color-shadow)"
              href="/single-player"
            />
            <ModeCard
              title="Custom Lobby"
              subtitle="Create or join a private room."
              icon="🏯"
              accent="var(--color-shrine)"
              href="/lobby"
            />
          </div>

          {/* Quick buttons */}
          <h2 className="mb-3 mt-6 text-lg font-black">Quick Access</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { href: '/deck-builder', icon: '🛠️', label: 'Deck Builder' },
              { href: '/collection', icon: '🎴', label: 'Collection' },
              { href: '/profile', icon: '👤', label: 'Profile' },
              { href: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
              { href: '/lobby', icon: '🏯', label: 'Lobby' },
              { href: '/settings', icon: '⚙️', label: 'Settings' },
            ].map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="panel panel-hover flex items-center gap-3 p-3.5"
              >
                <span className="text-2xl">{q.icon}</span>
                <span className="font-semibold">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-5">
          <DeckSelector />
          <RewardPanel rewards={db.getDailyRewards()} />
          <div className="panel p-4">
            <h3 className="mb-2 font-black">Your Rank</h3>
            <div className="flex items-center justify-between">
              <RankBadge rank={profile.rank} size="lg" />
              <Link href="/leaderboard" className="text-sm font-semibold text-[var(--color-neon)]">
                Ladder →
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-[var(--color-line)] p-2">
                <div className="text-xl font-black text-[var(--color-shadow)]">{profile.wins}</div>
                <div className="stat-label">Wins</div>
              </div>
              <div className="rounded-lg border border-[var(--color-line)] p-2">
                <div className="text-xl font-black text-[var(--color-oni)]">{profile.losses}</div>
                <div className="stat-label">Losses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {queue && <QueueModal mode={queue} onClose={() => setQueue(null)} />}
    </div>
  );
}
