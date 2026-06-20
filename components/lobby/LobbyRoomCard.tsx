'use client';

import { motion } from 'framer-motion';
import PlayerAvatar from '@/components/PlayerAvatar';
import type { Lobby } from '@/lib/types';
import { cx } from '@/lib/ui';

interface Props {
  lobby: Lobby;
  onJoin: (lobby: Lobby) => void;
}

function modeLabel(mode: Lobby['rules']['mode']) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export default function LobbyRoomCard({ lobby, onJoin }: Props) {
  const host = lobby.players.find((player) => player.isHost) ?? lobby.players[0];
  const isFull = lobby.players.length >= lobby.maxPlayers;

  return (
    <motion.article
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className="panel panel-hover relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--color-neon)] opacity-10 blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip text-[var(--color-neon)]">{modeLabel(lobby.rules.mode)}</span>
            <span className="chip text-[var(--color-gold)]">{lobby.visibility}</span>
          </div>
          <h3 className="mt-3 truncate text-xl font-black">{lobby.name}</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Code {lobby.code}</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] bg-black/20 px-3 py-2 text-right">
          <div className="stat-label">Players</div>
          <div className={cx('text-lg font-black', isFull ? 'text-[var(--color-gold)]' : 'text-[var(--color-neon)]')}>
            {lobby.players.length}/{lobby.maxPlayers}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          {host && <PlayerAvatar avatar={host.avatar} name={host.displayName} size="sm" active={host.ready} />}
          <div className="mt-3 text-sm text-[var(--color-muted)]">{lobby.rules.format}</div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={isFull}
          onClick={() => onJoin(lobby)}
        >
          {isFull ? 'Full' : 'Join'}
        </button>
      </div>
    </motion.article>
  );
}
