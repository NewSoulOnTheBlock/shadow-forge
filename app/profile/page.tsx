'use client';

import { motion } from 'framer-motion';
import PlayerAvatar from '@/components/PlayerAvatar';
import RankBadge from '@/components/RankBadge';
import RewardPanel from '@/components/RewardPanel';
import MatchHistoryList from '@/components/profile/MatchHistoryList';
import ProfileStats from '@/components/profile/ProfileStats';
import { db } from '@/lib/mock-data';
import { CLAN_COLOR, PRISM_META, cx } from '@/lib/ui';
import { useAppStore } from '@/store/appStore';

function percent(value: number, total: number) {
  return total ? Math.min(100, Math.round((value / total) * 100)) : 0;
}

function memberSince(createdAt: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(
    new Date(createdAt),
  );
}

export default function ProfilePage() {
  // PLUG-IN POINT: hydrate these selectors from the authenticated backend profile.
  const profile = useAppStore((s) => s.profile);
  const user = useAppStore((s) => s.user);
  const decks = useAppStore((s) => s.decks);

  const collection = db.collectionStats();
  const achievements = db.getAchievements();
  const favoriteDeck = decks.find((deck) => deck.id === profile.favoriteDeckId);
  const totalMatches = profile.wins + profile.losses;
  const winRate = totalMatches ? Math.round((profile.wins / totalMatches) * 100) : 0;
  const xpPercent = percent(profile.xp, profile.xpToNext);
  const collectionPercent = percent(collection.owned, collection.total);

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel overflow-hidden p-6"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <PlayerAvatar
              avatar={profile.avatar}
              level={profile.level}
              size="xl"
              active
              className="justify-center sm:justify-start"
            />
            <div>
              <p className="stat-label">Forged Identity</p>
              <h1 className="neon-text mt-1 text-4xl font-black tracking-tight sm:text-5xl">
                {profile.displayName}
              </h1>
              <p className="mt-2 text-sm font-semibold text-[var(--color-gold)]">
                {profile.title ?? 'Unequipped Shinobi'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.badges.map((badge) => (
                  <span key={badge} className="chip border-[var(--color-neon)] text-[var(--color-neon)]">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-[280px] space-y-4">
            <RankBadge rank={profile.rank} size="lg" />
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="stat-label">Level XP</span>
                <span className="font-bold">
                  {profile.xp}/{profile.xpToNext}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-black/40 ring-1 ring-[var(--color-line)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-neon),var(--color-neon-2),var(--color-gold))] shadow-[0_0_20px_rgba(0,229,255,0.55)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <ProfileStats
        items={[
          { label: 'Wins', value: profile.wins, accent: 'var(--color-shadow)', icon: '🏆' },
          { label: 'Losses', value: profile.losses, accent: 'var(--color-oni)', icon: '⚔️' },
          { label: 'Win Rate', value: `${winRate}%`, accent: 'var(--color-gold)', icon: '📈' },
          { label: 'Level', value: profile.level, accent: 'var(--color-neon)', icon: '🥷' },
          { label: 'Rank Points', value: profile.rank.points, accent: 'var(--color-neon-2)', icon: '👑' },
          { label: 'Collection', value: `${collectionPercent}%`, accent: 'var(--color-shrine)', icon: '🎴' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="panel p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="stat-label">Signature Arsenal</p>
                <h2 className="text-xl font-black">Favorite Deck</h2>
              </div>
              <span className="text-4xl">{favoriteDeck?.coverArt ?? '🎴'}</span>
            </div>
            {favoriteDeck ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-2xl font-black">{favoriteDeck.name}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {favoriteDeck.prisms.map((prism) => (
                      <span
                        key={prism}
                        className="chip"
                        style={{
                          color: CLAN_COLOR[prism],
                          borderColor: `color-mix(in srgb, ${CLAN_COLOR[prism]} 50%, transparent)`,
                        }}
                      >
                        {PRISM_META[prism].glyph} {PRISM_META[prism].label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="stat-label">Cards</p>
                  <p className="text-3xl font-black text-[var(--color-gold)]">
                    {favoriteDeck.cards.reduce((sum, card) => sum + card.count, 0)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No favorite deck equipped.</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement, index) => {
              const achievementPercent = percent(achievement.progress, achievement.goal);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cx(
                    'panel p-4',
                    achievement.unlocked
                      ? 'border-[var(--color-gold)] shadow-[0_0_28px_-18px_var(--color-gold)]'
                      : 'opacity-65',
                  )}
                >
                  <div className="flex gap-3">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black">{achievement.name}</h3>
                        {achievement.unlocked && (
                          <span className="chip text-[var(--color-gold)]">Unlocked</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {achievement.description}
                      </p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40 ring-1 ring-[var(--color-line)]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-neon),var(--color-gold))]"
                          style={{ width: `${achievementPercent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-[var(--color-muted)]">
                        {achievement.progress}/{achievement.goal}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <MatchHistoryList matches={db.getMatchHistory()} />
        </section>

        <aside className="space-y-6">
          <RewardPanel rewards={db.getDailyRewards()} />

          <div className="panel p-5">
            <p className="stat-label">Cosmetics</p>
            <h2 className="mt-1 text-xl font-black">Badge Vault</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {['🌙 Moonlit', '🔥 Ember', '💎 Prismatic', '🩸 Duelist', '⚡ Blitz'].map((badge) => (
                <span key={badge} className="chip">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <p className="stat-label">Account Stats</p>
            <h2 className="mt-1 text-xl font-black">Operator Record</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-muted)]">Username</dt>
                <dd className="font-bold">@{user.username}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-muted)]">Member since</dt>
                <dd className="font-bold">{memberSince(user.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-muted)]">Shards</dt>
                <dd className="font-bold text-[var(--color-gold)]">{profile.currency}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
}
