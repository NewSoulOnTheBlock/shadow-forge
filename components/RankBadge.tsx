// RankBadge — shows a player's ladder rank with tier color.
import type { Rank, RankTier } from '@/lib/types';
import { cx } from '@/lib/ui';

const TIER: Record<RankTier, { color: string; glyph: string }> = {
  Bronze: { color: '#cd7f32', glyph: '🥉' },
  Silver: { color: '#c0c7d4', glyph: '🥈' },
  Gold: { color: '#ffce5c', glyph: '🥇' },
  Platinum: { color: '#5ce1e6', glyph: '💎' },
  Diamond: { color: '#7aa7ff', glyph: '🔷' },
  Mythic: { color: '#c061ff', glyph: '👑' },
};

export const tierColor = (t: RankTier) => TIER[t].color;

export default function RankBadge({
  rank,
  size = 'md',
}: {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
}) {
  const t = TIER[rank.tier];
  const big = size === 'lg';
  return (
    <div
      className={cx(
        'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5',
        big && 'px-4 py-2.5',
      )}
      style={{
        borderColor: `color-mix(in srgb, ${t.color} 55%, transparent)`,
        background: `color-mix(in srgb, ${t.color} 12%, transparent)`,
      }}
    >
      <span className={big ? 'text-2xl' : 'text-lg'}>{t.glyph}</span>
      <div className="leading-tight">
        <div
          className={cx('font-black', big ? 'text-lg' : 'text-sm')}
          style={{ color: t.color }}
        >
          {rank.tier} {rank.division}
        </div>
        {size !== 'sm' && (
          <div className="text-[11px] text-[var(--color-muted)]">{rank.points} LP</div>
        )}
      </div>
    </div>
  );
}
