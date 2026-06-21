'use client';

import Icon from '@/components/Icon';
// Shared hover-zoom used across the app so any card-like element pops a large,
// fully-readable preview when hovered. Rendered through a portal to <body> so it
// is never clipped by scroll containers or the match board's overflow.
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Card } from '@/lib/types';
import {
  CLAN_COLOR,
  RARITY_COLOR,
  RARITY_LABEL,
  PRISM_META,
  KEYWORD_META,
} from '@/lib/ui';

const PW = 300; // preview width
const PH = 440; // approx preview height
const GAP = 14;

// Hook: attach `bind` to the hoverable element and render `portal` inside it.
export function useHoverZoom(card: Card, enabled = true) {
  const ref = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  function onMouseEnter() {
    const el = ref.current;
    if (!enabled || !el) return;
    const r = el.getBoundingClientRect();
    let left = r.right + GAP; // prefer right of the card
    if (left + PW > window.innerWidth - 8) left = r.left - GAP - PW; // flip left
    if (left < 8) left = Math.min(Math.max(8, r.left), window.innerWidth - PW - 8);
    let top = r.top + r.height / 2 - PH / 2; // centre vertically, clamp
    top = Math.max(8, Math.min(top, window.innerHeight - PH - 8));
    setPos({ left, top });
  }
  function onMouseLeave() {
    setPos(null);
  }

  const portal =
    enabled && pos && typeof document !== 'undefined'
      ? createPortal(<CardZoom card={card} left={pos.left} top={pos.top} />, document.body)
      : null;

  // Callback ref so `bind` can attach to a <button>, <div>, etc. without type friction.
  const setRef = (el: HTMLElement | null) => {
    ref.current = el;
  };
  return { bind: { ref: setRef, onMouseEnter, onMouseLeave }, portal };
}

// Large, fully-readable card popover. Pointer-events disabled so it never
// interferes with the element underneath.
export function CardZoom({ card, left, top }: { card: Card; left: number; top: number }) {
  const clan = CLAN_COLOR[card.prism];
  const rarity = (card.rarity ?? 'common') as keyof typeof RARITY_COLOR;
  return (
    <div
      className="pointer-events-none fixed z-[100] w-[300px] animate-pop"
      style={{ left, top }}
    >
      <div
        className="rounded-2xl border p-4 shadow-2xl backdrop-blur-sm"
        style={{
          background: 'linear-gradient(180deg, rgba(18,20,34,0.98), rgba(8,9,18,0.99))',
          borderColor: `color-mix(in srgb, ${clan} 55%, transparent)`,
          boxShadow: `0 18px 50px rgba(0,0,0,0.65), 0 0 0 1px color-mix(in srgb, ${clan} 30%, transparent)`,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-black leading-tight">{card.name}</h3>
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black text-black"
            style={{ background: 'linear-gradient(135deg,#7fe9ff,#4d8bff)' }}
          >
            {card.cost}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="chip" style={{ color: clan }}>
            <Icon icon={PRISM_META[card.prism].iconify} size={14} /> {PRISM_META[card.prism].label}
          </span>
          <span className="chip" style={{ color: RARITY_COLOR[rarity] }}>
            {RARITY_LABEL[rarity]}
          </span>
          <span className="chip capitalize">{card.type}</span>
        </div>

        <div
          className="mt-3 grid h-40 place-items-center rounded-xl"
          style={{
            background: `radial-gradient(circle at 50% 35%, color-mix(in srgb, ${clan} 30%, transparent), transparent 70%)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${clan} 35%, transparent)`,
          }}
        >
          <span
            className="text-7xl"
            style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.55))' }}
          >
            {card.art}
          </span>
        </div>

        {card.type === 'unit' && (
          <div className="mt-3 flex justify-center gap-6 text-xl font-black">
            <span className="inline-flex items-center gap-1 text-[var(--color-oni)]">{card.attack ?? 0} <Icon icon="game-icons:broadsword" size={20} /></span>
            <span className="inline-flex items-center gap-1 text-[var(--color-shadow)]">{card.health ?? 0} <Icon icon="ph:heart-fill" size={20} /></span>
          </div>
        )}

        {card.text && (
          <p className="mt-3 text-sm leading-snug text-[var(--color-ink)]">{card.text}</p>
        )}

        {!!card.keywords?.length && (
          <div className="mt-3 space-y-1.5 border-t border-white/10 pt-2">
            {card.keywords.map((k) => (
              <div key={k} className="text-[11px] leading-tight">
                <span className="font-bold">
                  <Icon icon={KEYWORD_META[k].iconify} size={14} /> {KEYWORD_META[k].label}
                </span>
                <span className="text-[var(--color-muted)]"> — {KEYWORD_META[k].tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
