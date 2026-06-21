'use client';

import Icon from '@/components/Icon';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import CardPreviewModal from '@/components/CardPreviewModal';
import CardTile from '@/components/CardTile';
import { db } from '@/lib/mock-data';
import type { Card, CollectionItem, VariantStyle } from '@/lib/types';
import { RARITY_LABEL, cx } from '@/lib/ui';
import { useAppStore } from '@/store/appStore';

export type CollectionSort = 'cost' | 'name' | 'rarity' | 'recent';

interface Props {
  catalog: Card[];
  cards: Card[];
  collectionMap: Record<string, CollectionItem>;
  sort: CollectionSort;
  showMissing: boolean;
  favoritesOnly: boolean;
}

const VARIANT_LABEL: Record<VariantStyle, string> = {
  standard: 'Standard',
  foil: 'Foil',
  prismatic: 'Prismatic',
  gold: 'Gold',
};

function cardQuantity(collectionMap: Record<string, CollectionItem>, cardId: string) {
  return collectionMap[cardId]?.quantity ?? 0;
}

export default function CollectionGrid({
  catalog,
  cards,
  collectionMap,
  sort,
  showMissing,
  favoritesOnly,
}: Props) {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [selected, setSelected] = useState<Card | null>(null);

  const recentCards = useMemo(() => {
    return Object.values(collectionMap)
      .filter((item) => item.quantity > 0)
      .sort((a, b) => Date.parse(b.acquiredAt) - Date.parse(a.acquiredAt))
      .slice(0, 6)
      .map((item) => catalog.find((card) => card.id === item.cardId))
      .filter((card): card is Card => Boolean(card));
  }, [catalog, collectionMap]);

  const sortedCards = useMemo(() => {
    const visible = cards.filter((card) => {
      const owned = cardQuantity(collectionMap, card.id) > 0;
      if (!showMissing && !owned) return false;
      if (favoritesOnly && !favorites.has(card.id)) return false;
      return true;
    });

    return [...visible].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'rarity') {
        return (
          db.rarityOrder.indexOf(db.cardRarity(a)) - db.rarityOrder.indexOf(db.cardRarity(b)) ||
          a.name.localeCompare(b.name)
        );
      }
      if (sort === 'recent') {
        const aTime = Date.parse(collectionMap[a.id]?.acquiredAt ?? '1970-01-01T00:00:00.000Z');
        const bTime = Date.parse(collectionMap[b.id]?.acquiredAt ?? '1970-01-01T00:00:00.000Z');
        return bTime - aTime || a.name.localeCompare(b.name);
      }
      return a.cost - b.cost || a.name.localeCompare(b.name);
    });
  }, [cards, collectionMap, favorites, favoritesOnly, showMissing, sort]);

  const selectedItem = selected ? collectionMap[selected.id] : undefined;
  const selectedVariants = selectedItem?.variants ?? [];

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="stat-label">Recently Acquired</p>
            <h2 className="text-lg font-black">Fresh from the forge</h2>
          </div>
          <span className="chip">{recentCards.length} latest</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {recentCards.map((card, index) => {
            const item = collectionMap[card.id];
            const foil = item?.variants.includes('foil') || item?.variants.includes('prismatic');
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <CardTile
                  card={card}
                  size="sm"
                  owned
                  quantity={item?.quantity}
                  foil={foil}
                  favorite={favorites.has(card.id)}
                  onClick={() => setSelected(card)}
                />
              </motion.div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="stat-label">Vault</p>
            <h2 className="text-xl font-black">{sortedCards.length} cards shown</h2>
          </div>
          {favoritesOnly && <span className="chip border-[var(--color-gold)] text-[var(--color-gold)]"><Icon icon="ph:star-fill" size={16} /> Favorites</span>}
        </div>

        {sortedCards.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(124px,1fr))] gap-4">
            {sortedCards.map((card, index) => {
              const item = collectionMap[card.id];
              const quantity = item?.quantity ?? 0;
              const owned = quantity > 0;
              const foil = item?.variants.includes('foil') || item?.variants.includes('prismatic');
              return (
                <motion.div
                  key={card.id}
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.015, 0.18) }}
                >
                  <CardTile
                    card={card}
                    size="sm"
                    owned={owned}
                    quantity={quantity > 1 ? quantity : undefined}
                    foil={foil}
                    favorite={favorites.has(card.id)}
                    onClick={() => setSelected(card)}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="panel grid min-h-[260px] place-items-center p-8 text-center">
            <div>
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-panel-2)] text-2xl">
                <Icon icon="game-icons:ninja-head" size={26} />
              </div>
              <h3 className="text-lg font-black">No cards match this stance</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Clear filters, include missing cards, or turn off favorites.
              </p>
            </div>
          </div>
        )}
      </section>

      <CardPreviewModal
        card={selected}
        onClose={() => setSelected(null)}
        footer={
          selected && (
            <div className="flex w-full flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button className="btn-gold" onClick={() => toggleFavorite(selected.id)}>
                  <><Icon icon="ph:star-fill" size={16} /> {favorites.has(selected.id) ? 'Unfavorite' : 'Favorite'}</>
                </button>
                <span className="chip">{RARITY_LABEL[db.cardRarity(selected)]}</span>
              </div>

              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-2)] p-3">
                <div className="stat-label mb-2">Cosmetic skins</div>
                <div className="flex flex-wrap gap-2">
                  {(selectedVariants.length ? selectedVariants : ['standard' as VariantStyle]).map((variant) => (
                    <span
                      key={variant}
                      className={cx(
                        'chip',
                        variant === 'foil' && 'border-[var(--color-neon)] text-[var(--color-neon)]',
                        variant === 'prismatic' && 'border-[var(--color-neon-2)] text-[var(--color-neon-2)]',
                        variant === 'gold' && 'border-[var(--color-gold)] text-[var(--color-gold)]',
                      )}
                    >
                      {VARIANT_LABEL[variant]}
                    </span>
                  ))}
                  {/* PLUG-IN POINT: connect marketplace/crafting skins when backend cosmetics are live. */}
                  <button className="chip opacity-50" disabled>
                    More skins (coming soon)
                  </button>
                </div>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}
