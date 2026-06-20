// Mock decks — derived from the ninja STARTER_DECKS plus an extra custom deck.
// PLUG-IN POINT: replace with `decks` + `deck_cards` tables scoped to the user.
import { STARTER_DECKS } from '@/lib/game/decks';
import type { Deck } from '@/lib/types';

const COVERS = ['🥷', '📜', '⛩️', '👹', '🪤'];
const SLUGS = ['deck_shadow_blade', 'deck_scroll_trap', 'deck_shrine_warrior'];

export const MOCK_DECKS: Deck[] = STARTER_DECKS.map((preset, i) => ({
  id: SLUGS[i] ?? `deck_${i}`,
  name: preset.name,
  ownerId: 'u_self',
  prisms: [...preset.prisms],
  cards: preset.cards.map((cardId) => ({ cardId, count: 1 })),
  active: i === 0,
  updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  coverArt: COVERS[i] ?? '🎴',
}));

export const ACTIVE_DECK_ID = MOCK_DECKS.find((d) => d.active)?.id ?? MOCK_DECKS[0].id;
