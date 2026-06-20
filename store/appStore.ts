// =============================================================================
// App store (Zustand) — session-level client cache, bootstrapped from Postgres.
// -----------------------------------------------------------------------------
// On first mount a single GET /api/bootstrap hydrates every piece of dynamic,
// user-scoped data (profile, decks, collection, leaderboard, history, etc.).
// Mutators update local state optimistically and persist through /api routes.
//
//   PLUG-IN POINT (auth): the bootstrap endpoint resolves the demo account
//   server-side; wire it to the session user and this store needs no changes.
//   PLUG-IN POINT (realtime): lobby seating/ready sync arrives over WebSockets;
//   `lobbies` here is the persisted room list.
// =============================================================================
'use client';

import { create } from 'zustand';
import { api, UnauthenticatedError } from '@/lib/api/client';
import type { MatchResultPayload } from '@/lib/api/client';
import type {
  Deck,
  PlayerProfile,
  User,
  CollectionItem,
  LeaderboardEntry,
  MatchHistory,
  Achievement,
  Reward,
  Lobby,
} from '@/lib/types';

export type QueueMode = 'ranked' | 'casual' | null;

// Neutral placeholders rendered for the brief window before bootstrap resolves.
const PLACEHOLDER_USER: User = {
  id: '',
  username: '',
  createdAt: new Date(0).toISOString(),
};

const PLACEHOLDER_PROFILE: PlayerProfile = {
  userId: '',
  displayName: '…',
  avatar: '🥷',
  level: 1,
  xp: 0,
  xpToNext: 1000,
  rank: { tier: 'Bronze', division: 4, points: 0 },
  wins: 0,
  losses: 0,
  badges: [],
  currency: 0,
};

interface AppState {
  loaded: boolean;
  authStatus: 'unknown' | 'authed' | 'unauthed';
  selfUserId: string;
  user: User;
  profile: PlayerProfile;
  decks: Deck[];
  activeDeckId: string;
  collection: CollectionItem[];
  collectionStats: { owned: number; total: number };
  favorites: Set<string>; // favorited card ids
  leaderboard: LeaderboardEntry[];
  matchHistory: MatchHistory[];
  achievements: Achievement[];
  dailyRewards: Reward[];
  lobbies: Lobby[];
  // matchmaking (client-only UI state)
  queueMode: QueueMode;
  queueSeconds: number;

  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
  setActiveDeck: (deckId: string) => void;
  upsertDeck: (deck: Deck) => Promise<Deck | null>;
  deleteDeck: (deckId: string) => void;
  duplicateDeck: (deckId: string) => Promise<Deck | null>;
  renameDeck: (deckId: string, name: string) => void;
  toggleFavorite: (cardId: string) => void;
  createLobby: (visibility: Lobby['visibility']) => Promise<Lobby | null>;
  claimDailyReward: () => Promise<void>;
  recordMatch: (payload: MatchResultPayload) => Promise<void>;
  startQueue: (mode: QueueMode) => void;
  tickQueue: () => void;
  cancelQueue: () => void;
}

let bootstrapPromise: Promise<void> | null = null;

export const useAppStore = create<AppState>((set, get) => ({
  loaded: false,
  authStatus: 'unknown',
  selfUserId: '',
  user: PLACEHOLDER_USER,
  profile: PLACEHOLDER_PROFILE,
  decks: [],
  activeDeckId: '',
  collection: [],
  collectionStats: { owned: 0, total: 0 },
  favorites: new Set<string>(),
  leaderboard: [],
  matchHistory: [],
  achievements: [],
  dailyRewards: [],
  lobbies: [],
  queueMode: null,
  queueSeconds: 0,

  // Hydrate the whole client cache from the DB. Guarded so concurrent callers
  // (multiple pages mounting) share a single in-flight request.
  bootstrap: async () => {
    if (get().loaded) return;
    if (bootstrapPromise) return bootstrapPromise;
    bootstrapPromise = (async () => {
      try {
        const data = await api.bootstrap();
        set({
          loaded: true,
          authStatus: 'authed',
          selfUserId: data.selfUserId,
          user: data.user,
          profile: data.profile,
          decks: data.decks,
          activeDeckId: data.activeDeckId,
          collection: data.collection,
          collectionStats: data.collectionStats,
          favorites: new Set(data.favorites),
          leaderboard: data.leaderboard,
          matchHistory: data.matchHistory,
          achievements: data.achievements,
          dailyRewards: data.dailyRewards,
          lobbies: data.lobbies,
        });
      } catch (err) {
        if (err instanceof UnauthenticatedError) {
          set({ authStatus: 'unauthed' });
        } else {
          console.error('[store.bootstrap]', err);
        }
      } finally {
        bootstrapPromise = null;
      }
    })();
    return bootstrapPromise;
  },

  // Clear the server session + reset client state, then send the user to sign-in.
  logout: async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('[logout]', e);
    }
    set({ loaded: false, authStatus: 'unauthed', profile: PLACEHOLDER_PROFILE, user: PLACEHOLDER_USER });
    if (typeof window !== 'undefined') window.location.href = '/sign-in';
  },

  setActiveDeck: (deckId) => {
    set((s) => ({
      activeDeckId: deckId,
      decks: s.decks.map((d) => ({ ...d, active: d.id === deckId })),
    }));
    void api.setActiveDeck(deckId).catch((e) => console.error('[setActiveDeck]', e));
  },

  // Persist a deck (insert for client-temp ids, update for known uuids) and
  // reconcile local state with the canonical row the server returns.
  upsertDeck: async (deck) => {
    const exists = get().decks.some((d) => d.id === deck.id);
    try {
      const { deck: saved } = await api.saveDeck({
        id: exists ? deck.id : undefined,
        name: deck.name,
        prisms: deck.prisms,
        coverArt: deck.coverArt,
        cards: deck.cards,
      });
      set((s) => {
        const known = s.decks.some((d) => d.id === saved.id);
        const decks = known
          ? s.decks.map((d) => (d.id === saved.id ? saved : d))
          : [...s.decks, saved];
        return { decks };
      });
      return saved;
    } catch (err) {
      console.error('[upsertDeck]', err);
      return null;
    }
  },

  deleteDeck: (deckId) => {
    set((s) => {
      const remaining = s.decks.filter((d) => d.id !== deckId);
      const nextActive =
        s.activeDeckId === deckId && remaining[0] ? remaining[0].id : s.activeDeckId;
      return {
        decks: remaining.map((d) => ({ ...d, active: d.id === nextActive })),
        activeDeckId: nextActive,
      };
    });
    void api.deleteDeck(deckId).catch((e) => console.error('[deleteDeck]', e));
  },

  duplicateDeck: async (deckId) => {
    const src = get().decks.find((d) => d.id === deckId);
    if (!src) return null;
    try {
      const { deck: saved } = await api.saveDeck({
        name: `${src.name} (Copy)`,
        prisms: src.prisms,
        coverArt: src.coverArt,
        cards: src.cards.map((c) => ({ ...c })),
      });
      set((s) => ({ decks: [...s.decks, saved] }));
      return saved;
    } catch (err) {
      console.error('[duplicateDeck]', err);
      return null;
    }
  },

  renameDeck: (deckId, name) => {
    set((s) => ({
      decks: s.decks.map((d) => (d.id === deckId ? { ...d, name } : d)),
    }));
    void api.renameDeck(deckId, name).catch((e) => console.error('[renameDeck]', e));
  },

  toggleFavorite: (cardId) => {
    let next = false;
    set((s) => {
      const favorites = new Set(s.favorites);
      if (favorites.has(cardId)) favorites.delete(cardId);
      else {
        favorites.add(cardId);
        next = true;
      }
      const collection = s.collection.map((c) =>
        c.cardId === cardId ? { ...c, favorite: favorites.has(cardId) } : c,
      );
      return { favorites, collection };
    });
    void api.setFavorite(cardId, next).catch((e) => console.error('[toggleFavorite]', e));
  },

  createLobby: async (visibility) => {
    try {
      const { lobby } = await api.createLobby(visibility);
      set((s) => ({ lobbies: [lobby, ...s.lobbies] }));
      return lobby;
    } catch (err) {
      console.error('[createLobby]', err);
      return null;
    }
  },

  claimDailyReward: async () => {
    try {
      const { dailyRewards } = await api.claimDaily();
      set({ dailyRewards });
    } catch (err) {
      console.error('[claimDailyReward]', err);
    }
  },

  recordMatch: async (payload) => {
    try {
      const res = await api.recordMatch(payload);
      set((s) => ({
        profile: {
          ...s.profile,
          rank: res.rank,
          wins: res.wins,
          losses: res.losses,
        },
        leaderboard: res.leaderboard,
        matchHistory: [res.matchHistoryItem, ...s.matchHistory],
      }));
    } catch (err) {
      console.error('[recordMatch]', err);
    }
  },

  startQueue: (mode) => set({ queueMode: mode, queueSeconds: 0 }),
  tickQueue: () => set((s) => ({ queueSeconds: s.queueSeconds + 1 })),
  cancelQueue: () => set({ queueMode: null, queueSeconds: 0 }),
}));
