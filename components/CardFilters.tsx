'use client';

import Icon from '@/components/Icon';
// Shared card filtering: a hook + a sidebar UI. Used by the deck builder and
// the collection page so both share identical filter semantics.
import { useMemo, useState } from 'react';
import type { Card, Prism, Rarity } from '@/lib/types';
import { PRISMS, ALL_KEYWORDS } from '@/lib/game/types';
import { PRISM_META, KEYWORD_META, CLAN_COLOR, RARITY_COLOR, cx } from '@/lib/ui';

export interface CardFilterState {
  search: string;
  prisms: Set<Prism>;
  rarities: Set<Rarity>;
  types: Set<'unit' | 'spell'>;
  keyword: string | null;
  cost: number | null; // exact cost, 7 == "7+"
  ownedOnly: boolean;
}

export const emptyFilter = (): CardFilterState => ({
  search: '',
  prisms: new Set(),
  rarities: new Set(),
  types: new Set(),
  keyword: null,
  cost: null,
  ownedOnly: false,
});

export function useCardFilter(cards: Card[], ownedIds?: Set<string>) {
  const [filter, setFilter] = useState<CardFilterState>(emptyFilter());

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (filter.search && !c.name.toLowerCase().includes(filter.search.toLowerCase()))
        return false;
      if (filter.prisms.size && !filter.prisms.has(c.prism)) return false;
      if (filter.rarities.size && !filter.rarities.has((c.rarity ?? 'common') as Rarity))
        return false;
      if (filter.types.size && !filter.types.has(c.type)) return false;
      if (filter.keyword && !(c.keywords ?? []).includes(filter.keyword as never)) return false;
      if (filter.cost != null) {
        if (filter.cost >= 7 ? c.cost < 7 : c.cost !== filter.cost) return false;
      }
      if (filter.ownedOnly && ownedIds && !ownedIds.has(c.id)) return false;
      return true;
    });
  }, [cards, filter, ownedIds]);

  return { filter, setFilter, filtered };
}

// --- sidebar UI --------------------------------------------------------------

function toggle<T>(set: Set<T>, v: T): Set<T> {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

export function CardFilters({
  filter,
  setFilter,
  showOwned = false,
  allowedPrisms,
}: {
  filter: CardFilterState;
  setFilter: (f: CardFilterState) => void;
  showOwned?: boolean;
  allowedPrisms?: Prism[]; // restrict clan choices (deck builder)
}) {
  const prisms = allowedPrisms ?? PRISMS;
  return (
    <div className="space-y-4">
      <div className="relative">
        <Icon icon="ph:magnifying-glass-bold" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          placeholder="Search cards…"
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] py-2 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-neon)]"
        />
      </div>

      <div>
        <div className="stat-label mb-1.5">Clan</div>
        <div className="flex flex-wrap gap-1.5">
          {prisms.map((p) => (
            <button
              key={p}
              onClick={() => setFilter({ ...filter, prisms: toggle(filter.prisms, p) })}
              className={cx('chip', filter.prisms.has(p) && 'border-current')}
              style={{ color: filter.prisms.has(p) ? CLAN_COLOR[p] : undefined }}
            >
              <Icon icon={PRISM_META[p].iconify} size={14} /> {PRISM_META[p].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="stat-label mb-1.5">Cost</div>
        <div className="flex flex-wrap gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              onClick={() =>
                setFilter({ ...filter, cost: filter.cost === n ? null : n })
              }
              className={cx(
                'h-7 w-7 rounded-md border text-xs font-bold transition',
                filter.cost === n
                  ? 'border-[var(--color-neon)] text-[var(--color-neon)]'
                  : 'border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)]',
              )}
            >
              {n === 7 ? '7+' : n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="stat-label mb-1.5">Type</div>
        <div className="flex gap-1.5">
          {(['unit', 'spell'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter({ ...filter, types: toggle(filter.types, t) })}
              className={cx('chip capitalize', filter.types.has(t) && 'border-[var(--color-neon)] text-[var(--color-neon)]')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="stat-label mb-1.5">Rarity</div>
        <div className="flex flex-wrap gap-1.5">
          {RARITIES.map((r) => (
            <button
              key={r}
              onClick={() => setFilter({ ...filter, rarities: toggle(filter.rarities, r) })}
              className={cx('chip capitalize', filter.rarities.has(r) && 'border-current')}
              style={{ color: filter.rarities.has(r) ? RARITY_COLOR[r] : undefined }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="stat-label mb-1.5">Keyword</div>
        <select
          value={filter.keyword ?? ''}
          onChange={(e) => setFilter({ ...filter, keyword: e.target.value || null })}
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-1.5 text-sm outline-none focus:border-[var(--color-neon)]"
        >
          <option value="">Any keyword</option>
          {ALL_KEYWORDS.map((k) => (
            <option key={k} value={k}>
              {KEYWORD_META[k].label}
            </option>
          ))}
        </select>
      </div>

      {showOwned && (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filter.ownedOnly}
            onChange={(e) => setFilter({ ...filter, ownedOnly: e.target.checked })}
          />
          Owned only
        </label>
      )}

      <button className="btn w-full text-sm" onClick={() => setFilter(emptyFilter())}>
        Clear filters
      </button>
    </div>
  );
}
