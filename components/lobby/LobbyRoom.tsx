'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PlayerAvatar from '@/components/PlayerAvatar';
import { useAppStore } from '@/store/appStore';
import type { Deck, Lobby, LobbyPlayer } from '@/lib/types';
import { CLAN_COLOR, PRISM_META, cx } from '@/lib/ui';

interface Props {
  lobby: Lobby;
  isHost: boolean;
  onLeave: () => void;
  onStart: () => void;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}:${remain.toString().padStart(2, '0')}`;
}

function DeckOption({ deck }: { deck: Deck }) {
  return (
    <>
      {deck.prisms.map((prism) => PRISM_META[prism].glyph).join(' ')} {deck.name}
    </>
  );
}

export default function LobbyRoom({ lobby, isHost, onLeave, onStart }: Props) {
  const profile = useAppStore((state) => state.profile);
  const decks = useAppStore((state) => state.decks);
  const activeDeckId = useAppStore((state) => state.activeDeckId);
  const [ready, setReady] = useState(
    lobby.players.find((player) => player.userId === profile.userId)?.ready ?? false,
  );
  const [selectedDeckId, setSelectedDeckId] = useState(activeDeckId);
  const [copied, setCopied] = useState(false);

  const players = useMemo<LobbyPlayer[]>(() => {
    const next = lobby.players.map((player) =>
      player.userId === profile.userId ? { ...player, ready, deckId: selectedDeckId } : player,
    );
    return next.sort((a, b) => a.slot - b.slot);
  }, [lobby.players, profile.userId, ready, selectedDeckId]);

  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId) ?? decks[0];
  const bothReady = players.length === lobby.maxPlayers && players.every((player) => player.ready);

  async function copyCode() {
    setCopied(true);
    // PLUG-IN POINT: replace code-only copy with a real Supabase Realtime / Socket.io invite URL.
    await navigator.clipboard?.writeText(lobby.code);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="stat-label">Live room</p>
              <h1 className="mt-1 text-3xl font-black neon-text">{lobby.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="chip">Code {lobby.code}</span>
                <span className="chip text-[var(--color-gold)]">{lobby.visibility}</span>
                <span className="chip text-[var(--color-neon)]">{lobby.rules.mode}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn" onClick={copyCode}>
                {copied ? 'Copied' : 'Copy invite link'}
              </button>
              <button type="button" className="btn" onClick={onLeave}>
                Leave
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((slot) => {
            const player = players.find((candidate) => candidate.slot === slot);
            return (
              <motion.div
                key={slot}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: slot * 0.06 }}
                className={cx('panel min-h-48 p-5', player && 'glow-ring')}
              >
                <div className="flex items-center justify-between">
                  <span className="stat-label">Slot {slot + 1}</span>
                  {player?.isHost && <span className="chip text-[var(--color-gold)]">Host</span>}
                </div>
                {player ? (
                  <div className="mt-6">
                    <PlayerAvatar avatar={player.avatar} name={player.displayName} size="lg" active={player.ready} />
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className={cx('chip', player.ready ? 'text-[var(--color-neon)]' : 'text-[var(--color-muted)]')}>
                        {player.ready ? 'Ready' : 'Not ready'}
                      </span>
                      {player.deckId && <span className="chip">Deck locked</span>}
                    </div>
                  </div>
                ) : (
                  <div className="mt-10 flex items-center gap-3 text-[var(--color-muted)]">
                    <span className="h-3 w-3 rounded-full bg-[var(--color-neon)] animate-pulse-glow" />
                    Waiting for opponent…
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="panel p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0 flex-1">
                <label className="stat-label" htmlFor="deck-select">Deck selection</label>
                <select
                  id="deck-select"
                  value={selectedDeckId}
                  onChange={(event) => setSelectedDeckId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-2)] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[var(--color-neon)]"
                >
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      <DeckOption deck={deck} />
                    </option>
                  ))}
                </select>
                {selectedDeck && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedDeck.prisms.map((prism) => (
                      <span key={prism} className="chip" style={{ color: CLAN_COLOR[prism] }}>
                        {PRISM_META[prism].glyph} {PRISM_META[prism].label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className={cx('btn', ready ? 'btn-gold' : 'btn-primary')} onClick={() => setReady((value) => !value)}>
                {ready ? 'Unready' : 'Ready'}
              </button>
            </div>
          </div>

          <div className="panel p-5">
            <p className="stat-label">Match rules</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-[var(--color-muted)]">Mode</dt><dd className="font-bold capitalize">{lobby.rules.mode}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--color-muted)]">Format</dt><dd className="font-bold">{lobby.rules.format}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--color-muted)]">Timer</dt><dd className="font-bold">{formatTimer(lobby.rules.timerSec)}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="stat-label">Spectators</p>
            <span className="chip">{lobby.spectators.length}/1</span>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-[var(--color-line)] p-4">
            {lobby.spectators[0] ? (
              <PlayerAvatar avatar={lobby.spectators[0].avatar} name={lobby.spectators[0].displayName} size="sm" />
            ) : (
              <span className="text-sm text-[var(--color-muted)]">Spectator slot open</span>
            )}
          </div>
        </div>

        <div className="panel p-5">
          <p className="stat-label">War room chat</p>
          <div className="mt-4 space-y-3 text-sm">
            <p className="rounded-xl bg-white/5 p-3 text-[var(--color-muted)]">System: Room created.</p>
            <p className="rounded-xl bg-white/5 p-3 text-[var(--color-muted)]">System: Waiting for both duelists to ready up.</p>
            <p className="rounded-xl bg-white/5 p-3 text-[var(--color-muted)]">System: Match server handshake pending.</p>
          </div>
          <input
            disabled
            placeholder="Chat coming soon"
            className="mt-4 w-full rounded-xl border border-[var(--color-line)] bg-black/20 px-4 py-3 text-sm text-[var(--color-muted)] outline-none"
          />
        </div>

        {isHost && (
          <button type="button" className="btn btn-gold w-full" disabled={!bothReady} onClick={onStart}>
            Start Match
          </button>
        )}
        {!isHost && <p className="text-center text-sm text-[var(--color-muted)]">Only the host can start once both players are ready.</p>}
      </aside>
    </div>
  );
}
