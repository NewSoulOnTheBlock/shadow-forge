import type { Game } from 'boardgame.io';
import { INVALID_MOVE, ActivePlayers } from 'boardgame.io/core';
import type { GState, PlayerState, TargetRef, Prism } from './types';
import { RULES } from './types';
import { getCard } from './cards';
import { validateDeck } from './decks';
import {
  makeUnit,
  runEffects,
  cleanupDeaths,
  canAttackTarget,
  resolveAttack,
  startOfTurn,
  endOfTurn,
  drawCards,
  isLegalCardTarget,
  log,
  type RandomAPI,
} from './engine';
import { enumerateMoves } from './ai';

function blankPlayer(): PlayerState {
  return {
    hero: { hp: RULES.heroHp, maxHp: RULES.heroHp, armor: 0 },
    hand: [],
    board: [],
    mana: 0,
    maxMana: 0,
    deckCount: 0,
    prisms: [],
    deckSubmitted: false,
    shuffles: 0,
  };
}

export const SkyforgeGame: Game<GState> = {
  name: 'skyforge',
  minPlayers: 2,
  maxPlayers: 2,

  setup: ({ ctx }) => {
    const players: Record<string, PlayerState> = {};
    for (let i = 0; i < ctx.numPlayers; i++) players[String(i)] = blankPlayer();
    return {
      players,
      secret: { decks: {}, lists: {} },
      nextIid: 1,
      log: [],
      setupDone: false,
    };
  },

  phases: {
    deckSelect: {
      start: true,
      next: 'play',
      turn: { activePlayers: ActivePlayers.ALL },
      endIf: ({ G }) =>
        Object.values(G.players).every((p) => p.deckSubmitted),
      moves: {
        submitDeck: {
          move: (
            { G, playerID }: { G: GState; playerID: string },
            cards: string[],
            prisms: Prism[],
          ) => {
            const p = G.players[playerID];
            if (p.deckSubmitted) return INVALID_MOVE;
            if (validateDeck(cards, prisms)) return INVALID_MOVE;
            G.secret.lists[playerID] = [...cards];
            p.prisms = [...prisms];
            p.deckSubmitted = true;
            p.deckCount = cards.length;
          },
          client: false,
          redact: true,
        },
      },
    },

    play: {
      onBegin: ({ G, random }) => {
        const r = random as unknown as RandomAPI;
        for (const pid of Object.keys(G.players)) {
          G.secret.decks[pid] = r.Shuffle([...G.secret.lists[pid]]);
          G.players[pid].deckCount = G.secret.decks[pid].length;
        }
        drawCards(G, '0', RULES.openingHand, r);
        drawCards(G, '1', RULES.openingHand + RULES.secondPlayerBonusCards, r);
        G.setupDone = true;
        log(G, 'The duel begins!');
      },
      turn: {
        onBegin: ({ G, ctx, random }) => {
          startOfTurn(G, ctx.currentPlayer, random as unknown as RandomAPI);
        },
        onEnd: ({ G, ctx }) => {
          endOfTurn(G, ctx.currentPlayer);
        },
      },
      moves: {
        playCard: {
          move: (
            { G, playerID, random }: { G: GState; playerID: string; random: RandomAPI },
            handIndex: number,
            target?: TargetRef,
          ) => {
            const p = G.players[playerID];
            const cardId = p.hand[handIndex];
            if (!cardId) return INVALID_MOVE;
            const def = getCard(cardId);
            if (def.cost > p.mana) return INVALID_MOVE;
            if (def.type === 'unit' && p.board.length >= RULES.boardWidth)
              return INVALID_MOVE;
            if (def.requiresTarget) {
              if (!isLegalCardTarget(G, playerID, def.requiresTarget, target))
                return INVALID_MOVE;
            }
            p.hand.splice(handIndex, 1);
            p.mana -= def.cost;
            if (def.type === 'unit') {
              const unit = makeUnit(G, cardId, playerID);
              p.board.push(unit);
              log(G, `P${playerID} played ${def.name}.`);
              runEffects(G, playerID, def.onPlay, target, unit, random);
            } else {
              log(G, `P${playerID} cast ${def.name}.`);
              runEffects(G, playerID, def.onPlay, target, undefined, random);
            }
            cleanupDeaths(G, random);
          },
          client: false,
        },

        attack: {
          move: (
            { G, playerID, random }: { G: GState; playerID: string; random: RandomAPI },
            attackerIid: number,
            target: TargetRef,
          ) => {
            const attacker = G.players[playerID].board.find(
              (u) => u.iid === attackerIid,
            );
            if (!attacker) return INVALID_MOVE;
            const res = canAttackTarget(G, attacker, target);
            if (!res.ok) return INVALID_MOVE;
            resolveAttack(G, attacker, target, random);
          },
        },
      },
    },
  },

  endIf: ({ G }) => {
    const hp0 = G.players['0'].hero.hp;
    const hp1 = G.players['1'].hero.hp;
    if (hp0 <= 0 && hp1 <= 0) return { draw: true };
    if (hp1 <= 0) return { winner: '0' };
    if (hp0 <= 0) return { winner: '1' };
  },

  // Hide each opponent's hand contents and the secret piles.
  playerView: ({ G, playerID }) => {
    const clone: GState = JSON.parse(JSON.stringify(G));
    clone.secret = { decks: {}, lists: {} };
    for (const pid of Object.keys(clone.players)) {
      if (pid !== playerID) {
        clone.players[pid].hand = clone.players[pid].hand.map(() => 'HIDDEN');
      }
    }
    return clone;
  },

  ai: {
    enumerate: (G, ctx, playerID) =>
      enumerateMoves(G, { phase: ctx.phase, currentPlayer: ctx.currentPlayer }, playerID),
  },
};
