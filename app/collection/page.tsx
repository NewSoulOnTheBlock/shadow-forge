'use client';

import { useMemo, useState } from 'react';
import { CardFilters, useCardFilter } from '@/components/CardFilters';
import CollectionGrid, { type CollectionSort } from '@/components/collection/CollectionGrid';
import { db } from '@/lib/mock-data';
import { cx } from '@/lib/ui';
import { useAppStore } from '@/store/appStore';

const SORT_LABELS: Record<CollectionSort, string> = {
  cost: 'Cost (asc)',
  name: 'Name (A-Z)',
  rarity: 'Rarity',
  recent: 'Recently acquired',
};

export default function CollectionPage() {
  // PLUG-IN POINT: replace mock db reads with user-scoped collection/catalog queries.
  const catalog = db.getCatalog();
  const collection = db.getCollection();
  const collectionMap = db.collectionById;
  const stats = db.collectionStats();
  const ownedIds = useMemo(
    () => new Set(collection.filter((item) => item.quantity > 0).map((item) => item.cardId)),
    [collection],
  );
  const { filter, setFilter, filtered } = useCardFilter(catalog, ownedIds);
  const favorites = useAppStore((s) => s.favorites);
  const [sort, setSort] = useState<CollectionSort>('cost');
  const [showMissing, setShowMissing] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const completion = stats.total ? Math.round((stats.owned / stats.total) * 100) : 0;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[linear-gradient(135deg,rgba(0,229,255,0.10),rgba(179,136,255,0.06),rgba(255,202,87,0.07))] p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="stat-label">Shadow Forge Arsenal</p>
            <h1 className="neon-text mt-1 text-4xl font-black tracking-tight sm:text-5xl">Collection</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
              Track every clan technique, finish the vault, and mark tournament favorites.
            </p>
          </div>

          <div className="panel min-w-[280px] p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="stat-label">Completion</span>
              <span className="text-sm font-black text-[var(--color-ink)]">
                {stats.owned}/{stats.total} · {completion}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-black/40 ring-1 ring-[var(--color-line)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-neon),var(--color-gold))] shadow-[0_0_18px_rgba(0,229,255,0.45)]"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="panel h-fit p-4 lg:sticky lg:top-6">
          <div className="mb-4">
            <p className="stat-label">Filters</p>
            <h2 className="text-lg font-black">Refine the vault</h2>
          </div>
          <CardFilters filter={filter} setFilter={setFilter} showOwned />
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="panel flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="stat-label">Collection Controls</p>
              <p className="text-sm text-[var(--color-muted)]">
                Showing filtered catalog with unowned cards {showMissing ? 'dimmed' : 'hidden'}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className={cx('chip transition hover:border-[var(--color-gold)]', favoritesOnly && 'border-[var(--color-gold)] text-[var(--color-gold)]')}
                onClick={() => setFavoritesOnly((value) => !value)}
              >
                ⭐ Favorites {favorites.size ? `(${favorites.size})` : ''}
              </button>

              <label className="chip flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showMissing}
                  onChange={(event) => setShowMissing(event.target.checked)}
                />
                Show missing cards
              </label>

              <label className="flex items-center gap-2 text-sm">
                <span className="stat-label">Sort</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as CollectionSort)}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm font-bold outline-none transition focus:border-[var(--color-neon)]"
                >
                  {(Object.keys(SORT_LABELS) as CollectionSort[]).map((option) => (
                    <option key={option} value={option}>
                      {SORT_LABELS[option]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <CollectionGrid
            catalog={catalog}
            cards={filtered}
            collectionMap={collectionMap}
            sort={sort}
            showMissing={showMissing}
            favoritesOnly={favoritesOnly}
          />
        </section>
      </div>
    </main>
  );
}
