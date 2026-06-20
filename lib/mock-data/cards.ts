// Card catalog — sourced from the ninja game pool (`/lib/game/cards.ts`).
// PLUG-IN POINT: in production these come from a `cards` table; the shape is identical.

import { ALL_CARDS, CARD_BY_ID, COLLECTION, getCard } from '@/lib/game/cards';
import type { Card, Rarity } from '@/lib/types';

export { ALL_CARDS, CARD_BY_ID, COLLECTION, getCard };

/** Every collectible (non-token) card. */
export const CATALOG: Card[] = COLLECTION;

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

export function cardRarity(c: Card): Rarity {
  return (c.rarity ?? 'common') as Rarity;
}
