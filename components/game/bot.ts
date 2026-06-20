'use client';

// Headless AI opponent driver for local (single-player) matches.
//   PLUG-IN POINT (multiplayer): for real PvP, drop this bot and point the Client
//   at SocketIO({ server }) instead of Local() — the same SkyforgeGame runs on an
//   authoritative server and the opponent's moves arrive over the wire.
import type { State } from 'boardgame.io';
import type { GState } from '@/lib/game/types';
import { greedyTurn } from '@/lib/game/ai';

interface BotClient {
  getState(): State<GState> | null;
  moves: Record<string, (...args: unknown[]) => void>;
  events: { endTurn?: () => void };
}

// Drives a headless client as an AI opponent. Self-recurring loop so it never
// gets stuck on a rejected action. Returns a cancel function.
export function attachBot(
  client: BotClient,
  botID: string,
  deckCards: string[],
  deckPrisms: string[],
): () => void {
  let stopped = false;

  const loop = () => {
    if (stopped) return;
    const state = client.getState();
    if (!state) {
      setTimeout(loop, 250);
      return;
    }
    const { G, ctx } = state;
    if (ctx.gameover) return;

    if (ctx.phase === 'deckSelect') {
      if (!G.players[botID]?.deckSubmitted) {
        client.moves.submitDeck(deckCards, deckPrisms);
      }
      setTimeout(loop, 500);
      return;
    }

    if (ctx.phase === 'play' && ctx.currentPlayer === botID) {
      const step = greedyTurn(G, botID)[0];
      if (step) {
        if ('event' in step) {
          if (step.event === 'endTurn') client.events.endTurn?.();
        } else {
          const fn = client.moves[step.move] as (...a: unknown[]) => void;
          fn?.(...(step.args ?? []));
        }
      }
      setTimeout(loop, 700);
      return;
    }

    // not our turn — keep polling
    setTimeout(loop, 350);
  };

  loop();
  return () => {
    stopped = true;
  };
}
