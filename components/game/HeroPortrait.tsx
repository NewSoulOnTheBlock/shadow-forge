'use client';

import Icon from '@/components/Icon';
// HeroPortrait — a hero avatar with HP, mana, deck count. Can be a target.
import { motion } from 'framer-motion';
import { cx } from '@/lib/ui';
import type { PlayerSide } from '@/store/gameStore';
import HealthDisplay from './HealthDisplay';
import ResourceDisplay from './ResourceDisplay';

export default function HeroPortrait({
  side,
  isOpponent,
  targetable,
  active,
  onClick,
}: {
  side: PlayerSide;
  isOpponent?: boolean;
  targetable?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={onClick}
        disabled={!targetable}
        whileHover={targetable ? { scale: 1.06 } : undefined}
        className={cx(
          'relative grid h-20 w-20 place-items-center rounded-full border-2 text-4xl transition',
          active ? 'border-[var(--color-neon)] glow-ring' : 'border-[var(--color-line)]',
          targetable && 'cursor-crosshair border-[var(--color-oni)] animate-pulse-glow',
        )}
        style={{ background: 'radial-gradient(circle at 50% 30%, #1c1f33, #0b0c16)' }}
      >
        {side.avatar}
        {targetable && (
          <Icon icon="ph:target-duotone" size={18} className="absolute -right-1 -top-1" />
        )}
      </motion.button>

      <div className={cx('flex flex-col gap-1', isOpponent && 'items-start')}>
        <span className="text-sm font-bold">{side.name}</span>
        <HealthDisplay hp={side.hp} maxHp={side.maxHp} />
        <ResourceDisplay mana={side.mana} maxMana={side.maxMana} />
        <span className="text-[11px] text-[var(--color-muted)]">
          <Icon icon="ph:cards-duotone" size={13} /> {side.deckCount} · <Icon icon="ph:hand-duotone" size={13} /> {side.hand.length} · <Icon icon="game-icons:tombstone" size={13} /> {side.graveyard.length}
        </span>
      </div>
    </div>
  );
}
