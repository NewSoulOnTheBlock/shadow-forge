'use client';

import Icon from '@/components/Icon';
// UnitToken — a single unit on the battlefield.
import { motion } from 'framer-motion';
import { getCard } from '@/lib/game/cards';
import { KEYWORD_META, CLAN_COLOR, cx } from '@/lib/ui';
import type { BoardUnit } from '@/store/gameStore';
import { useHoverZoom } from '@/components/CardZoom';

export default function UnitToken({
  unit,
  ready,
  selected,
  targetable,
  onClick,
}: {
  unit: BoardUnit;
  ready?: boolean; // can attack this turn
  selected?: boolean; // is the chosen attacker
  targetable?: boolean; // can be attacked / targeted
  onClick?: () => void;
}) {
  const def = getCard(unit.cardId);
  const clan = CLAN_COLOR[def.prism];
  const { bind, portal } = useHoverZoom(def);
  return (
    <motion.button
      ref={bind.ref}
      onMouseEnter={bind.onMouseEnter}
      onMouseLeave={bind.onMouseLeave}
      layout
      initial={{ scale: 0.6, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.5, opacity: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={{ ['--clan' as string]: clan }}
      className={cx(
        'relative grid h-24 w-[72px] shrink-0 place-items-center rounded-xl border-2 text-3xl transition',
        selected && 'glow-ring -translate-y-1 border-[var(--color-neon)]',
        targetable && 'cursor-crosshair border-[var(--color-oni)] animate-pulse-glow',
        ready && !selected && 'border-[var(--color-shadow)]',
        !ready && !targetable && !selected && 'border-[var(--color-line)]',
      )}
    >
      <div
        className="absolute inset-0 rounded-[10px] opacity-25"
        style={{ background: `radial-gradient(circle at 50% 25%, ${clan}, transparent 70%)` }}
      />
      <span className="relative drop-shadow">{unit.art}</span>

      {/* keywords */}
      {unit.keywords.length > 0 && (
        <div className="absolute left-0.5 top-0.5 flex flex-col gap-0.5">
          {unit.keywords.slice(0, 3).map((k) => (
            <span key={k} className="text-[10px]" title={KEYWORD_META[k].label}>
              <Icon icon={KEYWORD_META[k].iconify} size={11} />
            </span>
          ))}
        </div>
      )}

      {/* attack / health */}
      <span className="absolute -bottom-1.5 -left-1.5 grid h-6 w-6 place-items-center rounded-full bg-[var(--color-oni)] text-xs font-black text-black">
        {unit.attack}
      </span>
      <span
        className={cx(
          'absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full text-xs font-black text-black',
          unit.health < unit.maxHealth ? 'bg-[var(--color-oni)]' : 'bg-[var(--color-shadow)]',
        )}
      >
        {unit.health}
      </span>

      {ready && !selected && (
        <Icon icon="ph:lightning-fill" size={13} className="absolute -top-1.5 right-0" />
      )}

      {/* large readable card on hover */}
      {portal}
    </motion.button>
  );
}
