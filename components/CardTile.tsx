'use client';

// CardTile — the canonical card renderer used in the collection, deck builder,
// and match hand. Presentational; interaction is via props.
//   Hover anywhere in the app to pop a large, fully-readable zoom of the card
//   (rendered through a portal so it is never clipped by scroll containers or
//   the match board's overflow). Pass `hoverPreview={false}` to disable — used
//   when a CardTile is itself rendered inside a zoom/modal to avoid recursion.
import type { Card } from '@/lib/types';
import {
  CLAN_COLOR,
  RARITY_COLOR,
  PRISM_META,
  KEYWORD_META,
  cx,
} from '@/lib/ui';
import { useHoverZoom } from './CardZoom';

export type CardSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZES: Record<CardSize, { w: string; art: string; name: string; pad: string }> = {
  xs: { w: 'w-[84px]', art: 'text-2xl', name: 'text-[9px]', pad: 'p-1' },
  sm: { w: 'w-[124px]', art: 'text-4xl', name: 'text-[11px]', pad: 'p-1.5' },
  md: { w: 'w-[164px]', art: 'text-6xl', name: 'text-[13px]', pad: 'p-2' },
  lg: { w: 'w-[230px]', art: 'text-8xl', name: 'text-base', pad: 'p-3' },
};

interface Props {
  card: Card;
  size?: CardSize;
  owned?: boolean; // dim if false
  quantity?: number;
  foil?: boolean;
  favorite?: boolean;
  selected?: boolean;
  disabled?: boolean;
  hoverPreview?: boolean; // large zoom on hover (default true)
  onClick?: () => void;
  className?: string;
}

export default function CardTile({
  card,
  size = 'md',
  owned = true,
  quantity,
  foil,
  favorite,
  selected,
  disabled,
  hoverPreview = true,
  onClick,
  className,
}: Props) {
  const s = SIZES[size];
  const clan = CLAN_COLOR[card.prism];
  const rarity = (card.rarity ?? 'common') as keyof typeof RARITY_COLOR;
  const rarityColor = RARITY_COLOR[rarity];
  const showText = size === 'md' || size === 'lg';

  const { bind, portal } = useHoverZoom(card, hoverPreview);

  return (
    <button
      ref={bind.ref}
      type="button"
      onClick={onClick}
      onMouseEnter={bind.onMouseEnter}
      onMouseLeave={bind.onMouseLeave}
      disabled={disabled}
      style={{ ['--clan' as string]: clan, ['--rar' as string]: rarityColor }}
      className={cx(
        s.w,
        'group relative shrink-0 select-none rounded-xl border text-left transition',
        'aspect-[3/4.2]',
        owned ? 'opacity-100' : 'opacity-40 grayscale',
        selected ? 'glow-ring -translate-y-1' : 'border-[var(--color-line)]',
        onClick && !disabled ? 'cursor-pointer hover:-translate-y-1 hover:border-[var(--clan)]' : '',
        disabled ? 'cursor-not-allowed' : '',
        className,
      )}
    >
      {/* frame */}
      <div
        className={cx('flex h-full flex-col overflow-hidden rounded-xl', s.pad)}
        style={{
          background:
            'linear-gradient(180deg, rgba(20,22,36,0.95), rgba(10,11,20,0.98))',
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${clan} 40%, transparent)`,
        }}
      >
        {/* top row: cost + rarity gem */}
        <div className="flex items-center justify-between">
          <span
            className="grid h-6 w-6 place-items-center rounded-full text-xs font-black text-black"
            style={{ background: 'linear-gradient(135deg,#7fe9ff,#4d8bff)' }}
          >
            {card.cost}
          </span>
          <span
            className="h-2.5 w-2.5 rotate-45 rounded-[2px]"
            style={{ background: rarityColor, boxShadow: `0 0 8px ${rarityColor}` }}
            title={rarity}
          />
        </div>

        {/* art */}
        <div className="relative flex flex-1 items-center justify-center">
          <div
            className={cx(s.art, foil ? 'drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]' : '')}
            style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))' }}
          >
            {card.art}
          </div>
          {foil && (
            <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
          )}
          {favorite && <span className="absolute right-0 top-0 text-xs">⭐</span>}
        </div>

        {/* name */}
        <div
          className={cx(s.name, 'truncate rounded px-1 py-0.5 text-center font-bold')}
          style={{ background: `color-mix(in srgb, ${clan} 22%, transparent)` }}
        >
          {card.name}
        </div>

        {/* stats / type */}
        <div className="mt-1 flex items-center justify-between text-[11px] font-black">
          <span className="text-[var(--color-muted)]" title={PRISM_META[card.prism].label}>
            {PRISM_META[card.prism].glyph}
          </span>
          {card.type === 'unit' ? (
            <span className="flex items-center gap-1">
              <span className="text-[var(--color-oni)]">{card.attack ?? 0}⚔</span>
              <span className="text-[var(--color-shadow)]">{card.health ?? 0}❤</span>
            </span>
          ) : (
            <span className="text-[var(--color-sage)]">✦ Spell</span>
          )}
        </div>

        {showText && (
          <p className="mt-1 line-clamp-3 text-[10px] leading-tight text-[var(--color-muted)]">
            {card.text || (card.keywords?.map((k) => KEYWORD_META[k].label).join(', ') ?? '')}
          </p>
        )}
      </div>

      {typeof quantity === 'number' && quantity > 0 && (
        <span className="absolute -bottom-1.5 -right-1.5 grid h-6 min-w-6 place-items-center rounded-full border border-[var(--color-line)] bg-black px-1 text-xs font-bold">
          ×{quantity}
        </span>
      )}

      {/* floating hover zoom — readable, never clipped (portal to <body>) */}
      {portal}
    </button>
  );
}
