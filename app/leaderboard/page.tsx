'use client';

// =============================================================================
// Leaderboard (spec section: ranked ladder).
// Full-frame overlay: `public/leaderboard-bg.png` paints the chrome (top nav,
// "LEADERBOARD" title, three podium boxes, the self bar, and the table frame).
// Real data from the DB-backed store is overlaid onto the painted regions via a
// percent-coordinate Region helper (same technique as home/campaign/deck-builder).
// =============================================================================
import Link from 'next/link';
import { motion } from 'framer-motion';
import { tierColor } from '@/components/RankBadge';
import { cx } from '@/lib/ui';
import { useAppStore } from '@/store/appStore';

// Painted top-nav icons -> routes (x% = icon center in the 1537px-wide frame).
const NAV: { c: number; href: string; label: string }[] = [
  { c: 4.5, href: '/play', label: 'Home' },
  { c: 13.2, href: '/play', label: 'Play' },
  { c: 19.4, href: '/single-player', label: 'Campaign' },
  { c: 25.5, href: '/profile', label: 'Profile' },
  { c: 31.8, href: '/lobby', label: 'Lobby' },
  { c: 37.8, href: '/deck-builder', label: 'Decks' },
  { c: 43.6, href: '/collection', label: 'Collection' },
  { c: 95.0, href: '/settings', label: 'Settings' },
];

export default function LeaderboardPage() {
  const leaderboard = useAppStore((s) => s.leaderboard);
  const selfId = useAppStore((s) => s.selfUserId);
  const currency = useAppStore((s) => s.profile.currency);
  const topThree = leaderboard.slice(0, 3);
  const self = leaderboard.find((e) => e.userId === selfId);

  // image order: silver(#2) left, gold(#1) center, bronze(#3) right.
  const podiums = [
    { box: { l: 36.9, t: 24.6, w: 25.2, h: 23.9 }, entry: topThree[0], big: true }, // center #1
    { box: { l: 10.9, t: 26.5, w: 25.1, h: 21.3 }, entry: topThree[1], big: false }, // left #2
    { box: { l: 63.0, t: 26.5, w: 25.6, h: 21.3 }, entry: topThree[2], big: false }, // right #3
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/leaderboard-bg.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
        }}
      />

      {/* ---- Top nav: clickable overlays on the painted icons ---- */}
      {NAV.map((n) => (
        <Link
          key={n.label + n.c}
          href={n.href}
          aria-label={n.label}
          className="absolute z-20 rounded-lg transition hover:bg-white/10"
          style={{ left: `${n.c - 2}%`, top: '2%', width: '4%', height: '6.5%' }}
        />
      ))}

      {/* Soft currency readout over the painted gem pill */}
      <div
        className="absolute z-20 flex items-center justify-center text-sm font-black text-[var(--color-gold)]"
        style={{ left: '78%', top: '3.2%', width: '8%', height: '4.5%' }}
      >
        {currency.toLocaleString()}
      </div>

      {/* ---- Podiums ---- */}
      {podiums.map((p, i) =>
        p.entry ? (
          <motion.div
            key={p.entry.userId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="absolute z-10"
            style={{ left: `${p.box.l}%`, top: `${p.box.t}%`, width: `${p.box.w}%`, height: `${p.box.h}%` }}
          >
            {/* avatar over the painted circle */}
            <div
              className="absolute left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              style={{ top: '41%', fontSize: p.big ? '2.6rem' : '2.1rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))' }}
            >
              {p.entry.avatar}
            </div>
            {/* name */}
            <div
              className="absolute left-1/2 w-[90%] -translate-x-1/2 -translate-y-1/2 truncate text-center font-black"
              style={{ top: '63%', fontSize: p.big ? '1.05rem' : '0.95rem' }}
            >
              {p.entry.displayName}
            </div>
            {/* tier */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-bold"
              style={{ top: '71.5%', color: tierColor(p.entry.rankTier) }}
            >
              {p.entry.rankTier}
            </div>
            {/* two painted stat sub-boxes: points (left), wins (right) */}
            <Stat value={`💎 ${p.entry.points}`} style={{ left: '29%', top: '84%' }} />
            <Stat value={`🏆 ${p.entry.wins}`} style={{ left: '72%', top: '84%' }} />
          </motion.div>
        ) : null,
      )}

      {/* ---- Self bar ---- */}
      {self && (
        <div
          className="absolute z-10 flex items-center gap-4 px-4"
          style={{ left: '10.8%', top: '50%', width: '78.4%', height: '5.4%' }}
        >
          <span className="chip border-[var(--color-neon)] text-xs text-[var(--color-neon)]">Your Rank</span>
          <span className="text-2xl">{self.avatar}</span>
          <span className="font-black">{self.displayName}</span>
          <span className="ml-auto flex items-center gap-5 text-sm font-bold">
            <span>#{self.position}</span>
            <span style={{ color: tierColor(self.rankTier) }}>{self.rankTier}</span>
            <span className="text-[var(--color-gold)]">💎 {self.points}</span>
            <span>🏆 {self.wins}</span>
          </span>
        </div>
      )}

      {/* ---- Table ---- */}
      <div
        className="absolute z-10 overflow-hidden"
        style={{ left: '10.8%', top: '57%', width: '78.5%', height: '36.5%' }}
      >
        <div className="h-full overflow-y-auto pr-1">
          {leaderboard.map((entry) => {
            const isSelf = entry.userId === selfId;
            return (
              <div
                key={entry.userId}
                className={cx(
                  'grid h-[40px] items-center px-3 text-sm transition hover:bg-white/[0.04]',
                  isSelf && 'rounded-lg border border-[var(--color-neon)] bg-[rgba(0,229,255,0.07)]',
                )}
                style={{ gridTemplateColumns: '52px 1fr 18% 14%' }}
              >
                <span className="font-black text-[var(--color-muted)]">#{entry.position}</span>
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="text-lg">{entry.avatar}</span>
                  <span className="truncate font-bold">{entry.displayName}</span>
                  {isSelf && <span className="chip text-[10px] text-[var(--color-neon)]">You</span>}
                  <span className="truncate text-xs" style={{ color: tierColor(entry.rankTier) }}>
                    · {entry.rankTier}
                  </span>
                </span>
                <span className="text-center font-bold text-[var(--color-gold)]">{entry.points}</span>
                <span className="text-center font-bold">{entry.wins}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, style }: { value: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-xs font-black"
      style={style}
    >
      {value}
    </div>
  );
}
