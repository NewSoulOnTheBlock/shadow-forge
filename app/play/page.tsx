'use client';

// Home / Play hub — full-screen frame layout.
//   The art frame `public/home-bg.png` is stretched to fill the whole viewport
//   (background-size: 100% 100%, so it never leaves empty space) and every piece
//   of live UI is absolutely positioned to land inside one of the frame's boxes.
//   Box rectangles below were measured from the frame image (percent coords).
import { useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { getCard } from '@/lib/game/cards';
import QueueModal from '@/components/QueueModal';

// Absolutely-positioned box, coordinates in % of the viewport (match the frame art).
function Region({
  l,
  t,
  w,
  h,
  className = '',
  style,
  children,
}: {
  l: number;
  t: number;
  w: number;
  h: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%`, ...style }}
    >
      {children}
    </div>
  );
}

const MODE_CARDS = [
  { l: 3.6, key: 'ranked', title: 'Ranked Ladder', tag: 'Climb to Mythic', accent: '#c061ff' },
  { l: 19.7, key: 'casual', title: 'Casual Duel', tag: 'No rank at stake', accent: '#7aa7ff' },
  { l: 35.7, key: 'campaign', title: 'Single Player', tag: 'Campaign vs AI', accent: '#4ade80' },
  { l: 51.7, key: 'lobby', title: 'Custom Lobby', tag: 'Play with friends', accent: '#ff5c5c' },
] as const;

const CARD_W = [15.3, 15.1, 14.4, 15.1];

const QUICK = [
  { l: 3.6, href: '/deck-builder', label: 'Decks' },
  { l: 14.13, href: '/collection', label: 'Collection' },
  { l: 24.66, href: '/profile', label: 'Profile' },
  { l: 35.2, href: '/leaderboard', label: 'Ranks' },
  { l: 45.73, href: '/lobby', label: 'Lobby' },
  { l: 56.26, href: '/settings', label: 'Settings' },
];

// 7 deck-slot centres measured from the frame (right column).
const SLOT_CENTERS = [71.5, 74.6, 78, 81.5, 85, 88.6, 92.3];

export default function PlayPage() {
  const profile = useAppStore((s) => s.profile);
  const decks = useAppStore((s) => s.decks);
  const activeDeckId = useAppStore((s) => s.activeDeckId);
  const [queue, setQueue] = useState<'ranked' | 'casual' | null>(null);

  const xpPct = Math.round((profile.xp / profile.xpToNext) * 100);
  const total = profile.wins + profile.losses;
  const winRate = total ? Math.round((profile.wins / total) * 100) : 0;

  const activeDeck = decks.find((d) => d.id === activeDeckId) ?? decks[0];
  const slotArts = (activeDeck?.cards ?? [])
    .slice(0, 7)
    .map((c) => getCard(c.cardId)?.art ?? '🎴');

  const tier = profile.rank.tier;

  return (
    <div
      className="relative h-[100dvh] w-full select-none overflow-hidden bg-[#06070d] text-[var(--color-ink)]"
      style={{
        backgroundImage: 'url(/home-bg.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ============================ HERO (top-left art panel) ============================ */}
      <Region l={5} t={9} w={37} h={28} className="flex flex-col justify-center">
        <span
          className="mb-2 w-fit rounded-full border border-[var(--color-neon)] px-2.5 py-1 font-bold text-[var(--color-neon)]"
          style={{ fontSize: 'clamp(8px,0.78vw,13px)' }}
        >
          ⚡ Season 1 · Clan Wars
        </span>
        <h1
          className="font-black leading-[1.05] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
          style={{ fontSize: 'clamp(18px,2.5vw,44px)' }}
        >
          Master the <span className="neon-text">Shadows</span>.
          <br />
          Forge your <span className="neon-text">Legend</span>.
        </h1>
        <p
          className="mt-2 max-w-[80%] text-[var(--color-muted)] drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]"
          style={{ fontSize: 'clamp(9px,0.95vw,15px)' }}
        >
          Assemble a clan of ninja, sages, and oni. Outwit rivals in fast,
          skill-driven duels and climb the ranked ladder to Mythic.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn btn-primary"
            style={{ fontSize: 'clamp(9px,0.9vw,14px)', padding: '0.5em 1em' }}
            onClick={() => setQueue('ranked')}
          >
            ⚔️ Play Ranked
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn"
            style={{ fontSize: 'clamp(9px,0.9vw,14px)', padding: '0.5em 1em' }}
            onClick={() => setQueue('casual')}
          >
            🎴 Play Casual
          </motion.button>
        </div>
      </Region>

      {/* ============================ MODE CARDS (row of 4) ============================ */}
      {MODE_CARDS.map((m, i) => {
        const content = (
          <div className="relative h-full w-full">
            {/* Title drops into the empty label bar beneath each card's art. */}
            <div
              className="absolute inset-x-[5%] bottom-[2.5%] rounded-md border bg-black/65 px-1 py-[2.5%] text-center backdrop-blur-sm"
              style={{ borderColor: `${m.accent}66` }}
            >
              <div
                className="font-black tracking-wide"
                style={{ color: m.accent, fontSize: 'clamp(9px,0.92vw,15px)' }}
              >
                {m.title}
              </div>
              <div
                className="text-[var(--color-muted)]"
                style={{ fontSize: 'clamp(7px,0.66vw,11px)' }}
              >
                {m.tag}
              </div>
            </div>
          </div>
        );
        const className =
          'group block h-full w-full transition-transform duration-150 hover:-translate-y-1';
        return (
          <Region key={m.key} l={m.l} t={48.4} w={CARD_W[i]} h={31}>
            {m.key === 'ranked' || m.key === 'casual' ? (
              <button
                type="button"
                className={className}
                onClick={() => setQueue(m.key as 'ranked' | 'casual')}
              >
                {content}
              </button>
            ) : (
              <Link
                href={m.key === 'campaign' ? '/single-player' : '/lobby'}
                className={className}
              >
                {content}
              </Link>
            )}
          </Region>
        );
      })}

      {/* ============================ QUICK NAV (bottom icon bar) ============================ */}
      {QUICK.map((q) => (
        <Region key={q.href} l={q.l} t={83.2} w={10.53} h={10}>
          <Link
            href={q.href}
            title={q.label}
            className="group flex h-full w-full items-end justify-center pb-[6%]"
          >
            <span
              className="rounded bg-black/40 px-1.5 py-0.5 font-semibold text-[var(--color-muted)] opacity-80 transition group-hover:text-[var(--color-neon)] group-hover:opacity-100"
              style={{ fontSize: 'clamp(7px,0.62vw,11px)' }}
            >
              {q.label}
            </span>
          </Link>
        </Region>
      ))}

      {/* ============================ AVATAR PANEL (top-right) ============================ */}
      {/* Avatar circle */}
      <Region l={71.6} t={6.5} w={8} h={15} className="grid place-items-center">
        <div
          className="grid h-full w-full place-items-center rounded-full"
          style={{ fontSize: 'clamp(20px,3vw,52px)' }}
        >
          {profile.avatar}
        </div>
      </Region>
      {/* Level + XP between circle and name bar */}
      <Region l={70.5} t={24} w={23.5} h={5} className="flex flex-col justify-center px-1">
        <div
          className="mb-0.5 flex justify-between text-[var(--color-muted)]"
          style={{ fontSize: 'clamp(7px,0.66vw,11px)' }}
        >
          <span>Level {profile.level}</span>
          <span>
            {profile.xp}/{profile.xpToNext} XP
          </span>
        </div>
        <div className="h-[6px] overflow-hidden rounded-full bg-black/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-neon)] to-[var(--color-neon-2)]"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </Region>
      {/* Name bar */}
      <Region l={70.5} t={30} w={23.5} h={7} className="flex flex-col justify-center px-2">
        <div className="font-black leading-tight" style={{ fontSize: 'clamp(11px,1.15vw,20px)' }}>
          {profile.displayName}
        </div>
        <div className="text-[var(--color-muted)]" style={{ fontSize: 'clamp(7px,0.7vw,12px)' }}>
          {profile.title ?? 'Shadow Initiate'}
        </div>
      </Region>

      {/* ============================ RANK BAR (right, 2nd row) ============================ */}
      <Region l={76} t={41.7} w={18} h={7} className="flex items-center justify-between px-1">
        <div className="leading-tight">
          <div
            className="font-black text-[var(--color-gold)]"
            style={{ fontSize: 'clamp(10px,1.05vw,18px)' }}
          >
            {tier} {profile.rank.division}
          </div>
          <div className="text-[var(--color-muted)]" style={{ fontSize: 'clamp(7px,0.66vw,11px)' }}>
            {profile.rank.points} LP
          </div>
        </div>
        <div className="text-right leading-tight">
          <div
            className="font-black text-[var(--color-shadow)]"
            style={{ fontSize: 'clamp(10px,1.05vw,18px)' }}
          >
            {winRate}%
          </div>
          <div className="text-[var(--color-muted)]" style={{ fontSize: 'clamp(7px,0.62vw,10px)' }}>
            {profile.wins}W · {profile.losses}L
          </div>
        </div>
      </Region>

      {/* ============================ ACTIVE DECK (right, slots row) ============================ */}
      <Region l={70.5} t={53.6} w={23.5} h={4} className="flex items-center justify-between px-1">
        <span className="font-black" style={{ fontSize: 'clamp(9px,0.92vw,15px)' }}>
          {activeDeck?.name ?? 'No deck'}
        </span>
        <Link
          href="/deck-builder"
          className="font-semibold text-[var(--color-neon)]"
          style={{ fontSize: 'clamp(7px,0.66vw,11px)' }}
        >
          Edit →
        </Link>
      </Region>
      {SLOT_CENTERS.map((center, i) => (
        <Region key={i} l={center - 1.4} t={58.5} w={2.8} h={8.5} className="grid place-items-center">
          <span style={{ fontSize: 'clamp(12px,1.3vw,24px)' }}>{slotArts[i] ?? ''}</span>
        </Region>
      ))}

      {/* ============================ DAILY REWARD (bottom-right shield) ============================ */}
      <Region l={76} t={71.5} w={18.5} h={8} className="flex items-center justify-between px-1">
        <div className="leading-tight">
          <div className="font-black" style={{ fontSize: 'clamp(9px,0.95vw,16px)' }}>
            Daily Reward
          </div>
          <div className="text-[var(--color-muted)]" style={{ fontSize: 'clamp(7px,0.66vw,11px)' }}>
            💠 +120 Shards ready
          </div>
        </div>
        <button
          type="button"
          className="btn btn-gold"
          style={{ fontSize: 'clamp(8px,0.8vw,13px)', padding: '0.4em 0.9em' }}
        >
          Claim
        </button>
      </Region>

      {queue && <QueueModal mode={queue} onClose={() => setQueue(null)} />}
    </div>
  );
}
