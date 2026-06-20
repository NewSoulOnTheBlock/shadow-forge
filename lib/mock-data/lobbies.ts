// Mock public lobbies + a factory for a freshly-created room.
// PLUG-IN POINT: replace with Supabase Realtime / Socket.io rooms. The `Lobby`
// shape already separates host, players, spectators, and rules for live sync.
import type { Lobby, LobbyPlayer, MatchMode, LobbyVisibility } from '@/lib/types';

export function makeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const host = (
  userId: string,
  displayName: string,
  avatar: string,
  ready = false,
): LobbyPlayer => ({
  userId,
  displayName,
  avatar,
  ready,
  isHost: true,
  slot: 0,
  deckId: 'deck_shadow_blade',
});

export const MOCK_LOBBIES: Lobby[] = [
  {
    id: 'lob_1',
    code: 'KZ7QP',
    name: "Tetsu's Dojo",
    visibility: 'public',
    hostId: 'u_tetsu',
    players: [host('u_tetsu', 'Tetsu', '🐉', true)],
    spectators: [],
    maxPlayers: 2,
    rules: { mode: 'casual', format: 'Singleton · 15–25', timerSec: 90 },
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'lob_2',
    code: 'M4XR9',
    name: 'Ranked Sparring',
    visibility: 'public',
    hostId: 'u_kira',
    players: [host('u_kira', 'Kira', '🦂', false)],
    spectators: [{ userId: 'u_obs', displayName: 'Watcher', avatar: '👁️', ready: false, isHost: false, slot: 0, spectator: true }],
    maxPlayers: 2,
    rules: { mode: 'ranked', format: 'Singleton · 15–25', timerSec: 75 },
    createdAt: new Date(Date.now() - 340000).toISOString(),
  },
  {
    id: 'lob_3',
    code: 'BB2HT',
    name: 'Bring Your Jank',
    visibility: 'public',
    hostId: 'u_rei',
    players: [host('u_rei', 'Rei', '🌸', false)],
    spectators: [],
    maxPlayers: 2,
    rules: { mode: 'custom', format: 'Singleton · 15–25', timerSec: 120 },
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

/** Build a new lobby owned by the current player. */
export function createLobby(opts: {
  name: string;
  visibility: LobbyVisibility;
  mode: MatchMode;
  hostId: string;
  hostName: string;
  hostAvatar: string;
}): Lobby {
  return {
    id: `lob_${Math.random().toString(36).slice(2, 8)}`,
    code: makeCode(),
    name: opts.name,
    visibility: opts.visibility,
    hostId: opts.hostId,
    players: [host(opts.hostId, opts.hostName, opts.hostAvatar, false)],
    spectators: [],
    maxPlayers: 2,
    rules: { mode: opts.mode, format: 'Singleton · 15–25', timerSec: 90 },
    createdAt: new Date().toISOString(),
  };
}
