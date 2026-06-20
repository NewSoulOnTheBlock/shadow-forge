// =============================================================================
// App store (Zustand) — session-level UI state outside an active match.
// -----------------------------------------------------------------------------
// Holds the signed-in profile, the player's decks, the active deck, collection
// favorites, and matchmaking/queue UI state.
//
//   PLUG-IN POINT (auth): `profile`/`user` come from the mock db today; wire to
//   a real auth/session provider. The store API stays the same.
//   PLUG-IN POINT (persistence): deck edits + favorites should persist to the
//   backend — the mutators below are where those writes go.
// =============================================================================
'use client';

import { create } from 'zustand';
import { db } from '@/lib/mock-data';
import type { Deck, PlayerProfile, User } from '@/lib/types';

export type QueueMode = 'ranked' | 'casual' | null;

interface AppState {
  user: User;
  profile: PlayerProfile;
  decks: Deck[];
  activeDeckId: string;
  favorites: Set<string>; // favorited card ids
  // matchmaking
  queueMode: QueueMode;
  queueSeconds: number;

  setActiveDeck: (deckId: string) => void;
  upsertDeck: (deck: Deck) => void;
  deleteDeck: (deckId: string) => void;
  duplicateDeck: (deckId: string) => Deck | null;
  renameDeck: (deckId: string, name: string) => void;
  toggleFavorite: (cardId: string) => void;
  startQueue: (mode: QueueMode) => void;
  tickQueue: () => void;
  cancelQueue: () => void;
}

const initialFavorites = new Set(
  db.getCollection().filter((c) => c.favorite).map((c) => c.cardId),
);

export const useAppStore = create<AppState>((set, get) => ({
  user: db.getUser(),
  profile: db.getProfile(),
  decks: db.getDecks(),
  activeDeckId: db.activeDeckId,
  favorites: initialFavorites,
  queueMode: null,
  queueSeconds: 0,

  setActiveDeck: (deckId) =>
    set((s) => ({
      activeDeckId: deckId,
      decks: s.decks.map((d) => ({ ...d, active: d.id === deckId })),
    })),

  upsertDeck: (deck) =>
    set((s) => {
      const exists = s.decks.some((d) => d.id === deck.id);
      return {
        decks: exists
          ? s.decks.map((d) => (d.id === deck.id ? deck : d))
          : [...s.decks, deck],
      };
    }),

  deleteDeck: (deckId) =>
    set((s) => {
      const remaining = s.decks.filter((d) => d.id !== deckId);
      const nextActive =
        s.activeDeckId === deckId && remaining[0] ? remaining[0].id : s.activeDeckId;
      return {
        decks: remaining.map((d) => ({ ...d, active: d.id === nextActive })),
        activeDeckId: nextActive,
      };
    }),

  duplicateDeck: (deckId) => {
    const src = get().decks.find((d) => d.id === deckId);
    if (!src) return null;
    const copy: Deck = {
      ...src,
      id: `deck_${Math.random().toString(36).slice(2, 8)}`,
      name: `${src.name} (Copy)`,
      active: false,
      updatedAt: new Date().toISOString(),
      cards: src.cards.map((c) => ({ ...c })),
    };
    set((s) => ({ decks: [...s.decks, copy] }));
    return copy;
  },

  renameDeck: (deckId, name) =>
    set((s) => ({
      decks: s.decks.map((d) => (d.id === deckId ? { ...d, name } : d)),
    })),

  toggleFavorite: (cardId) =>
    set((s) => {
      const next = new Set(s.favorites);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return { favorites: next };
    }),

  startQueue: (mode) => set({ queueMode: mode, queueSeconds: 0 }),
  tickQueue: () => set((s) => ({ queueSeconds: s.queueSeconds + 1 })),
  cancelQueue: () => set({ queueMode: null, queueSeconds: 0 }),
}));
