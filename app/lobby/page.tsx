'use client';

/*
  PLUG-IN POINT: This page is a local-state multiplayer lobby shell. Replace the
  useState-backed lobbies/currentLobby flow with a WebSocket, Supabase Realtime,
  or Socket.io room subscription. The shared Lobby shape maps directly to a live
  room record (id/code/name/visibility/rules), while LobbyPlayer entries map to
  per-user presence rows for players and spectators. Ready/deck changes should be
  broadcast as player updates and room creation/join-by-code should be validated
  server-side before this page receives the canonical Lobby payload.
*/

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LobbyRoom from '@/components/lobby/LobbyRoom';
import LobbyRoomCard from '@/components/lobby/LobbyRoomCard';
import { db } from '@/lib/mock-data';
import type { Lobby, LobbyPlayer, LobbyVisibility, MatchMode } from '@/lib/types';
import { useAppStore } from '@/store/appStore';

const MODE_OPTIONS: MatchMode[] = ['ranked', 'casual', 'custom'];

function guestFromProfile(profile: ReturnType<typeof db.getProfile>, deckId: string): LobbyPlayer {
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    avatar: profile.avatar,
    deckId,
    ready: false,
    isHost: false,
    slot: 1,
  };
}

function withGuest(lobby: Lobby, guest: LobbyPlayer): Lobby {
  const withoutGuest = lobby.players.filter((player) => player.userId !== guest.userId);
  const hasSlotOne = withoutGuest.some((player) => player.slot === 1);
  return {
    ...lobby,
    players: hasSlotOne ? withoutGuest : [...withoutGuest, guest].slice(0, lobby.maxPlayers),
  };
}

function syntheticLobby(code: string, guest: LobbyPlayer): Lobby {
  return {
    id: `lob_${code.toLowerCase()}`,
    code,
    name: `Private Room ${code}`,
    visibility: 'private',
    hostId: 'pending-host',
    players: [
      {
        userId: 'pending-host',
        displayName: 'Hidden Shinobi',
        avatar: '🥷',
        ready: false,
        isHost: true,
        slot: 0,
      },
      guest,
    ],
    spectators: [],
    maxPlayers: 2,
    rules: { mode: 'custom', format: 'Singleton · 15–25', timerSec: 90 },
    createdAt: new Date().toISOString(),
  };
}

export default function LobbyPage() {
  const router = useRouter();
  const profile = useAppStore((state) => state.profile);
  const user = useAppStore((state) => state.user);
  const activeDeckId = useAppStore((state) => state.activeDeckId);
  const [lobbies, setLobbies] = useState<Lobby[]>(() => db.getLobbies());
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [roomName, setRoomName] = useState(`${profile.displayName}'s Dojo`);
  const [visibility, setVisibility] = useState<LobbyVisibility>('public');
  const [mode, setMode] = useState<MatchMode>('casual');
  const [joinCode, setJoinCode] = useState('');

  const publicLobbies = useMemo(() => lobbies.filter((lobby) => lobby.visibility === 'public'), [lobbies]);

  function createRoom() {
    const lobby = db.createLobby({
      name: roomName.trim() || `${profile.displayName}'s Dojo`,
      visibility,
      mode,
      hostId: user.id,
      hostName: profile.displayName,
      hostAvatar: profile.avatar,
    });
    setLobbies((items) => [lobby, ...items]);
    setCurrentLobby(lobby);
  }

  function enterAsGuest(lobby: Lobby) {
    const joined = withGuest(lobby, guestFromProfile(profile, activeDeckId));
    setLobbies((items) => items.map((item) => (item.id === lobby.id ? joined : item)));
    setCurrentLobby(joined);
  }

  function joinByCode() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    // PLUG-IN POINT: validate invite codes server-side before entering private rooms.
    const found = lobbies.find((lobby) => lobby.code.toUpperCase() === code);
    const joined = found
      ? withGuest(found, guestFromProfile(profile, activeDeckId))
      : syntheticLobby(code, guestFromProfile(profile, activeDeckId));
    setCurrentLobby(joined);
    if (!found) setLobbies((items) => [joined, ...items]);
    else setLobbies((items) => items.map((item) => (item.id === joined.id ? joined : item)));
  }

  if (currentLobby) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-8 lg:px-8">
        <LobbyRoom
          lobby={currentLobby}
          isHost={currentLobby.hostId === user.id}
          onLeave={() => setCurrentLobby(null)}
          onStart={() => router.push(`/match/${currentLobby.id}?mode=${currentLobby.rules.mode}`)}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-8 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="text-sm font-bold text-[var(--color-neon)] hover:text-[var(--color-neon-2)]">
            ← Shadow Forge
          </Link>
          <h1 className="mt-4 text-5xl font-black neon-text">Lobby</h1>
          <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
            Forge a private duel, challenge the public room list, or enter with an invite code.
          </p>
        </div>
        <div className="chip text-[var(--color-gold)]">{profile.displayName} · Level {profile.level}</div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="stat-label" htmlFor="room-name">Create Room</label>
                <input
                  id="room-name"
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-2)] px-4 py-3 outline-none transition focus:border-[var(--color-neon)]"
                />
              </div>
              <div>
                <label className="stat-label" htmlFor="room-mode">Mode</label>
                <select
                  id="room-mode"
                  value={mode}
                  onChange={(event) => setMode(event.target.value as MatchMode)}
                  className="mt-2 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-2)] px-4 py-3 outline-none transition focus:border-[var(--color-neon)]"
                >
                  {MODE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div className="flex rounded-xl border border-[var(--color-line)] bg-black/20 p-1">
                {(['public', 'private'] as LobbyVisibility[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`rounded-lg px-4 py-2 text-sm font-bold capitalize transition ${visibility === option ? 'bg-[var(--color-neon)] text-black' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'}`}
                    onClick={() => setVisibility(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-primary" onClick={createRoom}>Create</button>
            </div>
          </motion.div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="stat-label">Public rooms</p>
                <h2 className="text-2xl font-black">Open challenges</h2>
              </div>
              <span className="chip">{publicLobbies.length} live</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {publicLobbies.map((lobby) => (
                <LobbyRoomCard key={lobby.id} lobby={lobby} onJoin={enterAsGuest} />
              ))}
            </div>
          </div>
        </div>

        <aside className="panel h-fit p-6">
          <p className="stat-label">Join by Code</p>
          <h2 className="mt-1 text-2xl font-black">Enter invite</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Private lobbies can be joined immediately in mock mode; live validation plugs in here later.
          </p>
          <input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            placeholder="KZ7QP"
            maxLength={8}
            className="mt-5 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-2)] px-4 py-3 text-center text-2xl font-black tracking-[0.35em] outline-none transition focus:border-[var(--color-neon)]"
          />
          <button type="button" className="btn btn-gold mt-4 w-full" onClick={joinByCode}>Join</button>
        </aside>
      </section>
    </main>
  );
}
