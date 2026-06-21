'use client';

import Icon from '@/components/Icon';
// =============================================================================
// Lobby (spec section: multiplayer lobby system).
// Full-frame overlay: `public/lobby-bg.png` paints the chrome (top nav, room
// browser toolbar, three room cards, and the right-side join/party panel). Live
// data from the DB-backed store is overlaid onto the painted regions via a
// percent-coordinate Region helper (same technique as deck-builder/leaderboard).
//
// PLUG-IN POINT: the useState-backed lobby list + currentLobby flow stands in for
// a realtime room subscription (WebSocket / Supabase Realtime / Socket.io). The
// shared Lobby shape maps directly to a live room record; LobbyPlayer entries map
// to per-user presence rows. createRoom/joinByCode should be validated server-side
// before this page receives the canonical Lobby payload.
// =============================================================================
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LobbyRoom from '@/components/lobby/LobbyRoom';
import type {
  Lobby,
  LobbyPlayer,
  LobbyVisibility,
  MatchMode,
  PlayerProfile,
} from '@/lib/types';
import { useAppStore } from '@/store/appStore';

const MODE_OPTIONS: ('all' | MatchMode)[] = ['all', 'ranked', 'casual', 'custom'];

// Painted top-nav icons -> routes (x% = icon center in the 1677px-wide frame).
const NAV: { c: number; href: string; label: string }[] = [
  { c: 3.7, href: '/play', label: 'Home' },
  { c: 12.2, href: '/play', label: 'Play' },
  { c: 18.8, href: '/single-player', label: 'Campaign' },
  { c: 25.0, href: '/profile', label: 'Profile' },
  { c: 30.9, href: '/lobby', label: 'Lobby' },
  { c: 37.0, href: '/deck-builder', label: 'Decks' },
  { c: 42.5, href: '/collection', label: 'Collection' },
  { c: 48.9, href: '/leaderboard', label: 'Ranks' },
  { c: 55.5, href: '/profile', label: 'Profile' },
  { c: 96.0, href: '/settings', label: 'Settings' },
];

function guestFromProfile(profile: PlayerProfile, deckId: string): LobbyPlayer {
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
      { userId: 'pending-host', displayName: 'Hidden Shinobi', avatar: '🥷', ready: false, isHost: true, slot: 0 },
      guest,
    ],
    spectators: [],
    maxPlayers: 2,
    rules: { mode: 'custom', format: 'Singleton · 15–25', timerSec: 90 },
    createdAt: new Date().toISOString(),
  };
}

interface Box {
  l: number;
  t: number;
  w: number;
  h: number;
}

function Region({ box, z = 10, children, className = '', style }: { box: Box; z?: number; children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ left: `${box.l}%`, top: `${box.t}%`, width: `${box.w}%`, height: `${box.h}%`, zIndex: z, ...style }}
    >
      {children}
    </div>
  );
}

export default function LobbyPage() {
  const router = useRouter();
  const profile = useAppStore((state) => state.profile);
  const user = useAppStore((state) => state.user);
  const activeDeckId = useAppStore((state) => state.activeDeckId);
  const createLobby = useAppStore((state) => state.createLobby);
  const currency = useAppStore((state) => state.profile.currency);

  const [lobbies, setLobbies] = useState<Lobby[]>(() => useAppStore.getState().lobbies);
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [visibility, setVisibility] = useState<LobbyVisibility>('public');
  const [modeFilter, setModeFilter] = useState<'all' | MatchMode>('all');
  const [search, setSearch] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const publicLobbies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lobbies
      .filter((lobby) => lobby.visibility === 'public')
      .filter((lobby) => (modeFilter === 'all' ? true : lobby.rules.mode === modeFilter))
      .filter((lobby) => (q ? lobby.name.toLowerCase().includes(q) || lobby.code.toLowerCase().includes(q) : true));
  }, [lobbies, modeFilter, search]);

  async function createRoom() {
    // Persist the room (host + code) to the DB; name/mode/visibility are applied
    // client-side until the realtime room schema carries them.
    const created = await createLobby(visibility);
    if (!created) return;
    const lobby: Lobby = {
      ...created,
      name: `${profile.displayName}'s Dojo`,
      visibility,
      rules: { ...created.rules, mode: modeFilter === 'all' ? 'casual' : modeFilter },
    };
    setLobbies((items) => [lobby, ...items.filter((l) => l.id !== lobby.id)]);
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

  // ---- Entered a room: render the room view over a dark backdrop ----
  if (currentLobby) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-[#07070d]">
        <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-8 lg:px-8">
          <button
            type="button"
            onClick={() => setCurrentLobby(null)}
            className="mb-4 text-sm font-bold text-[var(--color-neon)] hover:text-[var(--color-neon-2)]"
          >
            ← Back to lobby
          </button>
          <LobbyRoom
            lobby={currentLobby}
            isHost={currentLobby.hostId === user.id}
            onLeave={() => setCurrentLobby(null)}
            onStart={() => router.push(`/match/${currentLobby.id}?mode=${currentLobby.rules.mode}`)}
          />
        </main>
      </div>
    );
  }

  // ---- Browse view: overlay onto the painted lobby frame ----
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'url(/lobby-bg.png)', backgroundSize: '100% 100%', backgroundPosition: 'center' }}
      />

      {/* ---- Top nav: clickable overlays on the painted icons ---- */}
      {NAV.map((n) => (
        <Link
          key={n.label + n.c}
          href={n.href}
          aria-label={n.label}
          className="absolute z-30 rounded-lg transition hover:bg-white/10"
          style={{ left: `${n.c - 2}%`, top: '1.5%', width: '4%', height: '8.5%' }}
        />
      ))}

      {/* Currency readout over the painted gem pill */}
      <div
        className="absolute z-30 flex items-center justify-center text-sm font-black text-[var(--color-gold)]"
        style={{ left: '77.5%', top: '3.5%', width: '8%', height: '5%' }}
      >
        {currency.toLocaleString()}
      </div>

      {/* ===================== LEFT: Room browser ===================== */}

      {/* Search field (filter rooms by name/code) */}
      <Region box={{ l: 7.5, t: 29.5, w: 24.5, h: 7.5 }} z={20}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rooms…"
          className="h-full w-full rounded-xl bg-transparent px-3 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
        />
      </Region>

      {/* Mode filter dropdown */}
      <Region box={{ l: 33.4, t: 29.5, w: 9.8, h: 7.5 }} z={20}>
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value as 'all' | MatchMode)}
          className="h-full w-full cursor-pointer rounded-xl bg-transparent px-3 text-sm font-bold capitalize text-[var(--color-ink)] outline-none"
        >
          {MODE_OPTIONS.map((option) => (
            <option key={option} value={option} className="bg-[#15101f]">
              {option === 'all' ? 'All modes' : option}
            </option>
          ))}
        </select>
      </Region>

      {/* Visibility toggle group (public swords / private shield) */}
      <Region box={{ l: 45.8, t: 29, w: 10.3, h: 7.8 }} z={20} className="flex">
        {(['public', 'private'] as LobbyVisibility[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setVisibility(option)}
            aria-label={option}
            title={option}
            className={`flex-1 rounded-lg text-lg transition ${visibility === option ? 'bg-[var(--color-neon)]/25 ring-1 ring-[var(--color-neon)]' : 'opacity-50 hover:opacity-90'}`}
          >
            {option === 'public' ? <Icon icon="game-icons:crossed-swords" size={18} /> : <Icon icon="ph:shield-duotone" size={18} />}
          </button>
        ))}
      </Region>

      {/* Big Create Room button (crossed swords) */}
      <Region box={{ l: 57.1, t: 29, w: 11.3, h: 9 }} z={20}>
        <button
          type="button"
          onClick={createRoom}
          className="grid h-full w-full place-items-center rounded-xl text-xs font-black uppercase tracking-wider text-[var(--color-neon)] transition hover:bg-[var(--color-neon)]/15"
        >
          Create
        </button>
      </Region>

      {/* Room-list count pill */}
      <div
        className="absolute z-20 flex items-center justify-center text-xs font-black text-[var(--color-muted)]"
        style={{ left: '62%', top: '42.5%', width: '6.3%', height: '4%' }}
      >
        {publicLobbies.length} live
      </div>

      {/* Three room cards */}
      {[
        { l: 4.9, t: 48.5, w: 30.5, h: 20.5 },
        { l: 36.8, t: 48.5, w: 31.6, h: 20.5 },
        { l: 4.9, t: 70.5, w: 30.5, h: 20.5 },
      ].map((box, i) => (
        <Region key={i} box={box} z={15}>
          <RoomCard lobby={publicLobbies[i]} onJoin={enterAsGuest} />
        </Region>
      ))}

      {/* ===================== RIGHT: Join / party ===================== */}

      {/* Join-by-code input (friends search field) */}
      <Region box={{ l: 73.5, t: 27, w: 21.5, h: 9 }} z={20} className="flex items-center">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter invite code…"
          maxLength={8}
          className="h-full w-full bg-transparent px-3 text-base font-black tracking-[0.2em] text-[var(--color-ink)] outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-[var(--color-muted)]"
        />
      </Region>

      {/* Party preview: 5 shield slots (you + invite slots) */}
      <Region box={{ l: 72.5, t: 41.5, w: 23.5, h: 7 }} z={20} className="flex items-center justify-between px-2">
        {Array.from({ length: 5 }).map((_, slot) => (
          <div key={slot} className="grid h-full flex-1 place-items-center text-lg">
            {slot === 0 ? profile.avatar : <span className="text-[var(--color-muted)] opacity-40">＋</span>}
          </div>
        ))}
      </Region>

      {/* Big Join button (compass) */}
      <Region box={{ l: 72.5, t: 54, w: 23.5, h: 12 }} z={20}>
        <button
          type="button"
          onClick={joinByCode}
          className="grid h-full w-full place-items-center rounded-2xl text-sm font-black uppercase tracking-widest text-[var(--color-neon)] transition hover:bg-[var(--color-neon)]/15"
        >
          Join Room
        </button>
      </Region>
    </div>
  );
}

// Room card overlay: positions name/code pills, host avatar, player count, and a
// Join button onto the painted card. Renders an "Open slot" hint when empty.
function RoomCard({ lobby, onJoin }: { lobby?: Lobby; onJoin: (lobby: Lobby) => void }) {
  if (!lobby) {
    return (
      <div className="grid h-full w-full place-items-center text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] opacity-40">
        Open slot
      </div>
    );
  }
  const players = lobby.players.length;
  return (
    <div className="relative h-full w-full">
      {/* name pill */}
      <div className="absolute left-[6%] top-[15%] flex h-[20%] w-[48%] items-center truncate px-2 text-xs font-black text-[var(--color-neon)]">
        {lobby.name}
      </div>
      {/* code pill */}
      <div className="absolute left-[56%] top-[15%] flex h-[20%] w-[36%] items-center justify-center text-xs font-black text-[var(--color-gold)]">
        {lobby.code}
      </div>
      {/* host avatar (shield) */}
      <div className="absolute left-[6%] top-[44%] grid h-[34%] w-[12%] place-items-center text-2xl">
        {lobby.players.find((p) => p.isHost)?.avatar ?? '🥷'}
      </div>
      {/* player count (top-right) */}
      <div className="absolute left-[76%] top-[15%] grid h-[26%] w-[16%] place-items-center text-xs font-black text-[var(--color-ink)]">
        {players}/{lobby.maxPlayers}
      </div>
      {/* Join sub-button */}
      <button
        type="button"
        onClick={() => onJoin(lobby)}
        className="absolute left-[75%] top-[65%] grid h-[22%] w-[18%] place-items-center rounded-md text-[10px] font-black uppercase tracking-wide text-[var(--color-neon)] transition hover:bg-[var(--color-neon)]/20"
      >
        Join
      </button>
    </div>
  );
}
