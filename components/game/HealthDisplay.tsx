'use client';

// HealthDisplay — hero HP pill.
import { cx } from '@/lib/ui';

export default function HealthDisplay({
  hp,
  maxHp,
  size = 'md',
}: {
  hp: number;
  maxHp: number;
  size?: 'sm' | 'md';
}) {
  const low = hp <= 10;
  return (
    <div
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2 font-black tabular-nums',
        size === 'md' ? 'py-1 text-lg' : 'py-0.5 text-sm',
        low ? 'border-[var(--color-oni)] text-[var(--color-oni)]' : 'border-[var(--color-line)] text-[var(--color-ink)]',
      )}
      style={{ background: low ? 'rgba(255,90,77,0.12)' : 'rgba(0,0,0,0.35)' }}
    >
      <span>❤</span>
      <span>{Math.max(0, hp)}</span>
      <span className="text-[10px] font-normal text-[var(--color-muted)]">/{maxHp}</span>
    </div>
  );
}
