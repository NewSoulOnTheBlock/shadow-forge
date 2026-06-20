'use client';

// RewardPanel — daily login reward track (placeholder claim logic).
import { useState } from 'react';
import type { Reward } from '@/lib/types';
import { cx } from '@/lib/ui';

export default function RewardPanel({ rewards }: { rewards: Reward[] }) {
  const [claimed, setClaimed] = useState<Set<string>>(
    new Set(rewards.filter((r) => r.claimed).map((r) => r.id)),
  );
  // Next claimable = first unclaimed in sequence.
  const nextId = rewards.find((r) => !claimed.has(r.id))?.id;

  // PLUG-IN POINT: persist claim to backend + grant the reward server-side.
  const claim = (id: string) => setClaimed((s) => new Set(s).add(id));

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-black">Daily Rewards</h3>
        <span className="chip text-[var(--color-gold)]">Resets in 6h 12m</span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {rewards.map((r) => {
          const isClaimed = claimed.has(r.id);
          const isNext = r.id === nextId;
          return (
            <button
              key={r.id}
              disabled={!isNext}
              onClick={() => claim(r.id)}
              className={cx(
                'flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition',
                isClaimed && 'border-[var(--color-line)] opacity-40',
                isNext && 'border-[var(--color-gold)] animate-pulse-glow',
                !isClaimed && !isNext && 'border-[var(--color-line)]',
              )}
            >
              <span className="text-2xl">{r.icon}</span>
              <span className="text-[10px] font-bold">{r.label}</span>
              {r.amount && (
                <span className="text-[9px] text-[var(--color-muted)]">+{r.amount}</span>
              )}
              {isClaimed && <span className="text-[9px] text-[var(--color-shadow)]">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
