'use client';

import Icon from '@/components/Icon';
// QueueModal — matchmaking overlay for Ranked / Casual.
// PLUG-IN POINT: replace the simulated timer + "match found" with a real
// matchmaking service (WebSocket queue). On match, the server returns a matchId.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { PRISM_META, CLAN_COLOR } from '@/lib/ui';
import RankBadge from './RankBadge';

export default function QueueModal({
  mode,
  onClose,
}: {
  mode: 'ranked' | 'casual';
  onClose: () => void;
}) {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const decks = useAppStore((s) => s.decks);
  const activeDeckId = useAppStore((s) => s.activeDeckId);
  const deck = decks.find((d) => d.id === activeDeckId) ?? decks[0];

  const [seconds, setSeconds] = useState(0);
  const [found, setFound] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    // Simulate a found match after a short search.
    const found = setTimeout(() => setFound(true), 4500);
    return () => {
      clearInterval(t);
      clearTimeout(found);
    };
  }, []);

  const accept = () => {
    const id = `mm_${Math.random().toString(36).slice(2, 8)}`;
    router.push(`/match/${id}?mode=${mode}`);
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60,
  ).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="panel w-full max-w-md p-7 text-center"
          initial={{ scale: 0.92, y: 14 }}
          animate={{ scale: 1, y: 0 }}
        >
          <div className="stat-label">{mode} matchmaking</div>

          {!found ? (
            <>
              <div className="relative mx-auto my-6 grid h-28 w-28 place-items-center">
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-[var(--color-neon)]/40"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <motion.span
                  className="absolute inset-2 rounded-full border-2 border-[var(--color-neon-2)]/50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <span className="text-4xl">{profile.avatar}</span>
              </div>
              <h3 className="text-xl font-black">Searching for opponent…</h3>
              <div className="mt-1 text-3xl font-black tabular-nums neon-text">{mmss}</div>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Estimated wait: ~30s
              </p>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="my-6"
            >
              <div className="text-5xl"><Icon icon="game-icons:crossed-swords" size={56} /></div>
              <h3 className="mt-2 text-2xl font-black neon-text">Match Found!</h3>
              <p className="text-sm text-[var(--color-muted)]">A worthy rival approaches.</p>
            </motion.div>
          )}

          {/* requirements / context */}
          <div className="mt-4 space-y-2 rounded-xl border border-[var(--color-line)] p-3 text-left text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-muted)]">Deck</span>
              <span className="flex items-center gap-1.5 font-semibold">
                {deck?.coverArt} {deck?.name}
                {deck?.prisms.map((p) => (
                  <span key={p} style={{ color: CLAN_COLOR[p] }}>
                    <Icon icon={PRISM_META[p].iconify} size={14} />
                  </span>
                ))}
              </span>
            </div>
            {mode === 'ranked' && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted)]">Your rank</span>
                <RankBadge rank={profile.rank} size="sm" />
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-2">
            {found ? (
              <button className="btn btn-primary flex-1" onClick={accept}>
                Enter Battle
              </button>
            ) : (
              <button className="btn flex-1" onClick={onClose}>
                Cancel Queue
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
