'use client';

import Icon from '@/components/Icon';
// DeckSelector — shows the active deck and lets the player switch decks.
import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/appStore';
import { PRISM_META, CLAN_COLOR, cx } from '@/lib/ui';

export default function DeckSelector() {
  const decks = useAppStore((s) => s.decks);
  const activeDeckId = useAppStore((s) => s.activeDeckId);
  const setActiveDeck = useAppStore((s) => s.setActiveDeck);
  const [open, setOpen] = useState(false);

  const active = decks.find((d) => d.id === activeDeckId) ?? decks[0];

  return (
    <div className="relative">
      <div className="stat-label mb-1.5">Active Deck</div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="panel panel-hover flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--color-panel-2)] text-2xl">
          {active?.coverArt ?? '🎴'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{active?.name ?? 'No deck'}</div>
          <div className="mt-0.5 flex items-center gap-1.5">
            {active?.prisms.map((p) => (
              <span key={p} className="text-sm" style={{ color: CLAN_COLOR[p] }}>
                <Icon icon={PRISM_META[p].iconify} size={14} />
              </span>
            ))}
            <span className="text-xs text-[var(--color-muted)]">
              {active?.cards.length ?? 0} cards
            </span>
          </div>
        </div>
        <span className="text-[var(--color-muted)]">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl">
          {decks.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setActiveDeck(d.id);
                setOpen(false);
              }}
              className={cx(
                'flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/5',
                d.id === activeDeckId && 'bg-white/5',
              )}
            >
              <span className="text-xl">{d.coverArt}</span>
              <span className="flex-1 truncate text-sm font-semibold">{d.name}</span>
              <span className="flex gap-1">
                {d.prisms.map((p) => (
                  <span key={p} style={{ color: CLAN_COLOR[p] }}>
                    <Icon icon={PRISM_META[p].iconify} size={14} />
                  </span>
                ))}
              </span>
            </button>
          ))}
          <Link
            href="/deck-builder"
            className="block border-t border-[var(--color-line)] px-3 py-2.5 text-center text-sm font-semibold text-[var(--color-neon)] hover:bg-white/5"
          >
            + Build a new deck
          </Link>
        </div>
      )}
    </div>
  );
}
