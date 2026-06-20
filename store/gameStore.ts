// =============================================================================
// Game state store (Zustand) — the match state machine.
// -----------------------------------------------------------------------------
// This holds ALL live match state and exposes mock actions (drawCard, playCard,
// endTurn, attack, concede). The logic here is intentionally a lightweight
// PLACEHOLDER so the UI can be exercised end-to-end.
//
//   PLUG-IN POINT (rules engine): swap the bodies of the actions for the real
//   engine in `/lib/game/engine.ts` (or an authoritative server move). The state
//   shape (units, heroes, mana, phases, targeting, log) is already aligned with
//   `/lib/game/types.ts`, so the engine can be dropped in with minimal churn.
//
//   PLUG-IN POINT (multiplayer): `activePlayer`, `turn`, and each action map
//   cleanly onto boardgame.io moves or Socket.io events. Replace `runAiTurn`
//   with networked opponent moves.
// =============================================================================
'use client';

import { create } from 'zustand';
import { getCard } from '@/lib/game/cards';
import type { Keyword } from '@/lib/game/types';

export type Side = 'player' | 'opponent';
export type Phase = 'main' | 'combat' | 'gameover';

export interface BoardUnit {
  iid: number;
  cardId: string;
  name: string;
  art: string;
  attack: number;
  health: number;
  maxHealth: number;
  keywords: Keyword[];
  canAttack: boolean;
  owner: Side;
}

export interface HandCard {
  uid: number;
  cardId: string;
}

export interface PlayerSide {
  name: string;
  avatar: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  hand: HandCard[];
  board: BoardUnit[];
  deckCount: number;
  graveyard: string[];
  deckList: string[]; // remaining draw pile (card ids)
}

export interface TargetingState {
  active: boolean;
  sourceIid: number | null; // attacking unit
}

export interface MatchState {
  matchId: string;
  mode: string;
  turn: number;
  activePlayer: Side;
  phase: Phase;
  player: PlayerSide;
  opponent: PlayerSide;
  log: { t: number; text: string }[];
  targeting: TargetingState;
  winner: Side | null;
  timer: number; // seconds left in turn (UI countdown)
}

interface GameActions {
  initMatch: (opts: {
    matchId: string;
    mode: string;
    deckCardIds: string[];
    playerName: string;
    playerAvatar: string;
    opponentName: string;
    opponentAvatar: string;
    opponentDeckIds: string[];
  }) => void;
  drawCard: (side: Side) => void;
  playCard: (handUid: number, targetIid?: number | 'hero') => void;
  beginAttack: (attackerIid: number) => void;
  attack: (attackerIid: number, target: number | 'hero') => void;
  cancelTargeting: () => void;
  endTurn: () => void;
  concede: () => void;
  tickTimer: () => void;
  reset: () => void;
}

let IID = 1;
let UID = 1;
const nextIid = () => IID++;
const nextUid = () => UID++;

// NOTE: Math.random is fine for a UI prototype. The real engine must use a
// seeded PRNG (see secret-and-randomness in the rules engine) for determinism.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeSide(
  name: string,
  avatar: string,
  deckIds: string[],
  openingHand: number,
): PlayerSide {
  const pile = shuffle(deckIds);
  const hand = pile.splice(0, openingHand).map((cardId) => ({ uid: nextUid(), cardId }));
  return {
    name,
    avatar,
    hp: 30,
    maxHp: 30,
    mana: 1,
    maxMana: 1,
    hand,
    board: [],
    deckCount: pile.length,
    graveyard: [],
    deckList: pile,
  };
}

function unitFromCard(cardId: string, owner: Side): BoardUnit {
  const def = getCard(cardId);
  const keywords = def.keywords ?? [];
  return {
    iid: nextIid(),
    cardId,
    name: def.name,
    art: def.art,
    attack: def.attack ?? 0,
    health: def.health ?? 1,
    maxHealth: def.health ?? 1,
    keywords: [...keywords],
    canAttack: keywords.includes('haste'),
    owner,
  };
}

const TURN_SECONDS = 75;

function logLine(state: MatchState, text: string) {
  state.log = [...state.log, { t: state.turn, text }].slice(-40);
}

export const useGameStore = create<MatchState & GameActions>((set, get) => ({
  matchId: '',
  mode: 'casual',
  turn: 1,
  activePlayer: 'player',
  phase: 'main',
  player: makeSide('You', '🦊', [], 0),
  opponent: makeSide('Opponent', '🐉', [], 0),
  log: [],
  targeting: { active: false, sourceIid: null },
  winner: null,
  timer: TURN_SECONDS,

  initMatch: (o) => {
    IID = 1;
    UID = 1;
    const player = makeSide(o.playerName, o.playerAvatar, o.deckCardIds, 3);
    const opponent = makeSide(o.opponentName, o.opponentAvatar, o.opponentDeckIds, 4);
    set({
      matchId: o.matchId,
      mode: o.mode,
      turn: 1,
      activePlayer: 'player',
      phase: 'main',
      player,
      opponent,
      targeting: { active: false, sourceIid: null },
      winner: null,
      timer: TURN_SECONDS,
      log: [{ t: 1, text: `Match started — ${o.playerName} vs ${o.opponentName}.` }],
    });
  },

  drawCard: (side) =>
    set((s) => {
      const st = structuredClone(s) as MatchState;
      const p = st[side];
      if (p.deckList.length === 0) {
        // No fatigue in the prototype — reshuffle graveyard back (Skyweaver-style).
        p.deckList = shuffle(p.graveyard);
        p.graveyard = [];
      }
      const cardId = p.deckList.shift();
      if (cardId) {
        p.hand.push({ uid: nextUid(), cardId });
        p.deckCount = p.deckList.length;
        logLine(st, `${p.name} drew a card.`);
      }
      return st;
    }),

  playCard: (handUid, target) =>
    set((s) => {
      const st = structuredClone(s) as MatchState;
      const side = st.activePlayer;
      const p = st[side];
      const idx = p.hand.findIndex((h) => h.uid === handUid);
      if (idx < 0) return st;
      const def = getCard(p.hand[idx].cardId);
      if (def.cost > p.mana) return st; // not enough mana
      p.mana -= def.cost;
      const [card] = p.hand.splice(idx, 1);

      if (def.type === 'unit') {
        p.board.push(unitFromCard(card.cardId, side));
        logLine(st, `${p.name} summoned ${def.name}.`);
      } else {
        // PLACEHOLDER spell resolution: only a couple of effect kinds, enough to
        // demonstrate targeting + state changes. Real resolution lives in engine.
        const foe = side === 'player' ? st.opponent : st.player;
        const dmg = def.onPlay?.find((e) => e.kind === 'damage')?.amount ?? 0;
        const heal = def.onPlay?.find((e) => e.kind === 'heal')?.amount ?? 0;
        if (dmg && typeof target === 'number') {
          const u = foe.board.find((b) => b.iid === target);
          if (u) {
            u.health -= dmg;
            if (u.health <= 0) {
              foe.board = foe.board.filter((b) => b.iid !== u.iid);
              foe.graveyard.push(u.cardId);
            }
          }
        } else if (dmg && target === 'hero') {
          foe.hp -= dmg;
        }
        if (heal) p.hp = Math.min(p.maxHp, p.hp + heal);
        p.graveyard.push(card.cardId);
        logLine(st, `${p.name} cast ${def.name}.`);
      }
      checkWin(st);
      return st;
    }),

  beginAttack: (attackerIid) =>
    set((s) => ({ targeting: { active: true, sourceIid: attackerIid } })),

  cancelTargeting: () => set({ targeting: { active: false, sourceIid: null } }),

  attack: (attackerIid, target) =>
    set((s) => {
      const st = structuredClone(s) as MatchState;
      const me = st[st.activePlayer];
      const foe = st.activePlayer === 'player' ? st.opponent : st.player;
      const attacker = me.board.find((u) => u.iid === attackerIid);
      if (!attacker || !attacker.canAttack) return st;

      if (target === 'hero') {
        foe.hp -= attacker.attack;
        logLine(st, `${attacker.name} hit ${foe.name} for ${attacker.attack}.`);
      } else {
        const defender = foe.board.find((u) => u.iid === target);
        if (!defender) return st;
        defender.health -= attacker.attack;
        attacker.health -= defender.attack;
        logLine(st, `${attacker.name} clashed with ${defender.name}.`);
        if (defender.health <= 0) {
          foe.board = foe.board.filter((u) => u.iid !== defender.iid);
          foe.graveyard.push(defender.cardId);
        }
        if (attacker.health <= 0) {
          me.board = me.board.filter((u) => u.iid !== attacker.iid);
          me.graveyard.push(attacker.cardId);
        }
      }
      if (attacker.health > 0) attacker.canAttack = false;
      st.targeting = { active: false, sourceIid: null };
      checkWin(st);
      return st;
    }),

  endTurn: () => {
    const s = get();
    if (s.phase === 'gameover') return;
    // Hand control to the AI opponent, then back to the player.
    if (s.activePlayer === 'player') {
      set((st) => beginTurn(structuredClone(st) as MatchState, 'opponent'));
      runAiTurn(get, set);
    } else {
      set((st) => beginTurn(structuredClone(st) as MatchState, 'player'));
    }
  },

  concede: () =>
    set((s) => {
      const st = structuredClone(s) as MatchState;
      st.winner = 'opponent';
      st.phase = 'gameover';
      logLine(st, `${st.player.name} conceded.`);
      return st;
    }),

  tickTimer: () =>
    set((s) => {
      if (s.phase === 'gameover') return s;
      if (s.timer <= 1 && s.activePlayer === 'player') {
        // Auto-pass on timeout.
        get().endTurn();
        return s;
      }
      return { timer: Math.max(0, s.timer - 1) };
    }),

  reset: () => set({ phase: 'gameover', winner: null }),
}));

// --- helpers operating on a draft MatchState ---------------------------------

function beginTurn(st: MatchState, side: Side): MatchState {
  st.activePlayer = side;
  if (side === 'player') st.turn += 1;
  const p = st[side];
  p.maxMana = Math.min(12, p.maxMana + 1);
  p.mana = p.maxMana;
  p.board.forEach((u) => (u.canAttack = true));
  st.timer = TURN_SECONDS;
  // draw for the side starting its turn
  if (p.deckList.length === 0 && p.graveyard.length) {
    p.deckList = shuffle(p.graveyard);
    p.graveyard = [];
  }
  const drawn = p.deckList.shift();
  if (drawn) {
    p.hand.push({ uid: nextUid(), cardId: drawn });
    p.deckCount = p.deckList.length;
  }
  st.log = [...st.log, { t: st.turn, text: `${p.name}'s turn.` }].slice(-40);
  return st;
}

function checkWin(st: MatchState) {
  if (st.opponent.hp <= 0) {
    st.winner = 'player';
    st.phase = 'gameover';
  } else if (st.player.hp <= 0) {
    st.winner = 'opponent';
    st.phase = 'gameover';
  }
}

// Minimal AI: play affordable units, then swing everything at the hero.
// PLUG-IN POINT: replace with `/lib/game/ai.ts` greedyTurn or a server opponent.
function runAiTurn(
  get: () => MatchState & GameActions,
  set: (partial: Partial<MatchState> | ((s: MatchState) => MatchState | Partial<MatchState>)) => void,
) {
  const step = (i: number) => {
    const s = get();
    if (s.phase === 'gameover' || s.activePlayer !== 'opponent') return;

    set((prev) => {
      const st = structuredClone(prev) as MatchState;
      const ai = st.opponent;
      // play one affordable unit
      const playable = ai.hand.find((h) => {
        const def = getCard(h.cardId);
        return def.type === 'unit' && def.cost <= ai.mana;
      });
      if (playable) {
        const def = getCard(playable.cardId);
        ai.mana -= def.cost;
        ai.hand = ai.hand.filter((h) => h.uid !== playable.uid);
        ai.board.push(unitFromCard(playable.cardId, 'opponent'));
        st.log = [...st.log, { t: st.turn, text: `${ai.name} summoned ${def.name}.` }].slice(-40);
      }
      return st;
    });

    if (i < 2) {
      setTimeout(() => step(i + 1), 650);
      return;
    }

    // attack phase
    setTimeout(() => {
      set((prev) => {
        const st = structuredClone(prev) as MatchState;
        const ai = st.opponent;
        ai.board.forEach((u) => {
          if (u.canAttack && u.attack > 0) {
            st.player.hp -= u.attack;
            u.canAttack = false;
            st.log = [...st.log, { t: st.turn, text: `${u.name} struck ${st.player.name} for ${u.attack}.` }].slice(-40);
          }
        });
        checkWin(st);
        return st;
      });
      setTimeout(() => {
        if (get().phase !== 'gameover') get().endTurn();
      }, 700);
    }, 650);
  };
  setTimeout(() => step(0), 700);
}
