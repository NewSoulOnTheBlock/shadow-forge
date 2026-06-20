// =============================================================================
// Client-side API helpers — thin typed fetch wrappers over the /api routes.
// The store calls these; pages read the resulting data from the store.
// =============================================================================
'use client';

import type {
  User,
  PlayerProfile,
  Deck,
  CollectionItem,
  LeaderboardEntry,
  MatchHistory,
  Achievement,
  Reward,
  Lobby,
  LobbyVisibility,
  MatchMode,
  Rank,
  Prism,
} from '@/lib/types';

export interface BootstrapData {
  user: User;
  profile: PlayerProfile;
  decks: Deck[];
  activeDeckId: string;
  collection: CollectionItem[];
  collectionStats: { owned: number; total: number };
  favorites: string[];
  leaderboard: LeaderboardEntry[];
  selfUserId: string;
  matchHistory: MatchHistory[];
  achievements: Achievement[];
  dailyRewards: Reward[];
  lobbies: Lobby[];
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json() as Promise<T>;
}

/** Thrown by `api.bootstrap()` when there is no valid session (HTTP 401). */
export class UnauthenticatedError extends Error {
  constructor() {
    super('unauthenticated');
    this.name = 'UnauthenticatedError';
  }
}

export interface MatchResultPayload {
  result: 'win' | 'loss' | 'draw';
  mode: MatchMode;
  opponent: string;
  opponentAvatar: string;
  deckName: string;
  durationSec: number;
}

export interface MatchResultResponse {
  rank: Rank;
  wins: number;
  losses: number;
  leaderboard: LeaderboardEntry[];
  matchHistoryItem: MatchHistory;
}

export const api = {
  bootstrap: async (): Promise<BootstrapData> => {
    const res = await fetch('/api/bootstrap', { cache: 'no-store' });
    if (res.status === 401) throw new UnauthenticatedError();
    if (!res.ok) throw new Error(`bootstrap -> ${res.status}`);
    return res.json() as Promise<BootstrapData>;
  },

  // --- Auth (Solana wallet sign-in) ---
  authNonce: (address: string) =>
    postJson<{ nonce: string; message: string }>('/api/auth/nonce', { address }),

  authVerify: (address: string, signature: string) =>
    postJson<{ ok: true; needsOnboarding: boolean; isNew: boolean }>('/api/auth/verify', {
      address,
      signature,
    }),

  authMe: async (): Promise<{ authenticated: boolean; needsOnboarding?: boolean }> => {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return { authenticated: false };
    return res.json();
  },

  logout: () => postJson<{ ok: true }>('/api/auth/logout', {}),

  saveProfile: (displayName: string, avatar: string) =>
    postJson<{ ok: true; profile: PlayerProfile; user: User }>('/api/profile', {
      displayName,
      avatar,
    }),

  saveDeck: (deck: {
    id?: string;
    name: string;
    prisms: Prism[];
    coverArt: string;
    cards: { cardId: string; count: number }[];
  }) => postJson<{ deck: Deck }>('/api/decks', { action: 'save', deck }),

  deleteDeck: (id: string) =>
    postJson<{ ok: true }>('/api/decks', { action: 'delete', id }),

  renameDeck: (id: string, name: string) =>
    postJson<{ ok: true }>('/api/decks', { action: 'rename', id, name }),

  setActiveDeck: (id: string) =>
    postJson<{ ok: true }>('/api/decks', { action: 'setActive', id }),

  setFavorite: (cardId: string, favorite: boolean) =>
    postJson<{ ok: true }>('/api/favorites', { cardId, favorite }),

  createLobby: (visibility: LobbyVisibility) =>
    postJson<{ lobby: Lobby }>('/api/lobbies', { visibility }),

  claimDaily: () => postJson<{ dailyRewards: Reward[] }>('/api/daily', {}),

  recordMatch: (payload: MatchResultPayload) =>
    postJson<MatchResultResponse>('/api/match/result', payload),
};
