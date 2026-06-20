// Mock collection — the player owns most of the catalog, some as foils, a few missing.
// PLUG-IN POINT: replace with a `collection_items` table joined to `cards`.
import { CATALOG } from './cards';
import type { CollectionItem, VariantStyle } from '@/lib/types';

// Deterministic pseudo-random so the collection is stable across renders.
function seeded(i: number) {
  return (Math.sin(i * 99.13) + 1) / 2;
}

export const MOCK_COLLECTION: CollectionItem[] = CATALOG.map((card, i) => {
  const r = seeded(i);
  const owned = r > 0.12; // ~12% of cards are still missing
  const variants: VariantStyle[] = ['standard'];
  if (owned && r > 0.78) variants.push('foil');
  if (owned && r > 0.93) variants.push('prismatic');
  return {
    cardId: card.id,
    quantity: owned ? (r > 0.6 ? 2 : 1) : 0,
    variants: owned ? variants : [],
    favorite: r > 0.85,
    acquiredAt: new Date(Date.now() - Math.floor(r * 60) * 86400000).toISOString(),
  };
});

export const COLLECTION_BY_ID: Record<string, CollectionItem> = Object.fromEntries(
  MOCK_COLLECTION.map((c) => [c.cardId, c]),
);

export const collectionStats = () => {
  const owned = MOCK_COLLECTION.filter((c) => c.quantity > 0).length;
  return { owned, total: MOCK_COLLECTION.length };
};
