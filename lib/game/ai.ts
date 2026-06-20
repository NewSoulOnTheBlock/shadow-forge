import type { GState, TargetRef } from './types';
import { getCard } from './cards';
import { DEFAULT_DECK } from './decks';
import {
  opponentOf,
  canAttackTarget,
  isLegalCardTarget,
} from './engine';

export type AIMove =
  | { move: string; args?: unknown[] }
  | { event: string; args?: unknown[] };

interface AICtx {
  phase: string | null;
  currentPlayer: string;
}

// Enumerate candidate moves for boardgame.io's bots.
export function enumerateMoves(
  G: GState,
  ctx: AICtx,
  playerID?: string,
): AIMove[] {
  const pid = playerID ?? ctx.currentPlayer;

  if (ctx.phase === 'deckSelect') {
    if (!G.players[pid]?.deckSubmitted) {
      return [{ move: 'submitDeck', args: [DEFAULT_DECK.cards, DEFAULT_DECK.prisms] }];
    }
    return [];
  }

  if (ctx.phase !== 'play' || ctx.currentPlayer !== pid) return [];

  const p = G.players[pid];
  const enemy = opponentOf(pid);
  const moves: AIMove[] = [];

  // Play cards from hand.
  p.hand.forEach((cardId, idx) => {
    if (cardId === 'HIDDEN') return;
    const def = getCard(cardId);
    if (def.cost > p.mana) return;
    if (def.type === 'unit' && p.board.length >= 6) return;
    if (def.requiresTarget) {
      for (const t of legalCardTargets(G, pid, def.requiresTarget)) {
        moves.push({ move: 'playCard', args: [idx, t] });
      }
    } else {
      moves.push({ move: 'playCard', args: [idx] });
    }
  });

  // Attack with ready units.
  for (const u of p.board) {
    const targets: TargetRef[] = [
      { kind: 'hero', player: enemy },
      ...G.players[enemy].board.map((e) => ({ kind: 'unit', iid: e.iid }) as TargetRef),
    ];
    for (const t of targets) {
      if (canAttackTarget(G, u, t).ok) moves.push({ move: 'attack', args: [u.iid, t] });
    }
  }

  moves.push({ event: 'endTurn' });
  return moves;
}

function legalCardTargets(
  G: GState,
  pid: string,
  required: NonNullable<ReturnType<typeof getCard>['requiresTarget']>,
): TargetRef[] {
  const out: TargetRef[] = [];
  const candidates: TargetRef[] = [
    { kind: 'hero', player: '0' },
    { kind: 'hero', player: '1' },
    ...G.players['0'].board.map((u) => ({ kind: 'unit', iid: u.iid }) as TargetRef),
    ...G.players['1'].board.map((u) => ({ kind: 'unit', iid: u.iid }) as TargetRef),
  ];
  for (const t of candidates) {
    if (isLegalCardTarget(G, pid, required, t)) out.push(t);
  }
  return out;
}

// A lightweight greedy heuristic the single-player driver can use directly,
// avoiding MCTS exploration of hidden-information branches.
export function greedyTurn(G: GState, pid: string): AIMove[] {
  const plan: AIMove[] = [];
  const p = G.players[pid];
  const enemy = opponentOf(pid);

  // 1) Play the most expensive affordable card each step (mana sink), targeting
  //    the strongest enemy unit / enemy hero for damage spells.
  let mana = p.mana;
  const hand = p.hand
    .map((id, idx) => ({ id, idx }))
    .filter((c) => c.id !== 'HIDDEN');
  hand.sort((a, b) => getCard(b.id).cost - getCard(a.id).cost);
  let boardCount = p.board.length;
  for (const c of hand) {
    const def = getCard(c.id);
    if (def.cost > mana) continue;
    if (def.type === 'unit' && boardCount >= 6) continue;
    if (def.requiresTarget) {
      const t = pickTarget(G, pid, def.requiresTarget);
      if (!t) continue;
      plan.push({ move: 'playCard', args: [c.idx, t] });
    } else {
      plan.push({ move: 'playCard', args: [c.idx] });
    }
    mana -= def.cost;
    if (def.type === 'unit') boardCount++;
  }

  // 2) Attack: clear threats, then face.
  for (const u of p.board) {
    if (canAttackTarget(G, u, { kind: 'hero', player: enemy }).ok) {
      plan.push({ move: 'attack', args: [u.iid, { kind: 'hero', player: enemy }] });
    } else {
      const blocker = G.players[enemy].board.find(
        (e) => canAttackTarget(G, u, { kind: 'unit', iid: e.iid }).ok,
      );
      if (blocker)
        plan.push({ move: 'attack', args: [u.iid, { kind: 'unit', iid: blocker.iid }] });
    }
  }

  plan.push({ event: 'endTurn' });
  return plan;
}

function pickTarget(
  G: GState,
  pid: string,
  required: NonNullable<ReturnType<typeof getCard>['requiresTarget']>,
): TargetRef | undefined {
  const enemy = opponentOf(pid);
  if (required === 'ally-unit') {
    const ally = [...G.players[pid].board].sort((a, b) => b.attack - a.attack)[0];
    return ally ? { kind: 'unit', iid: ally.iid } : undefined;
  }
  // Prefer the strongest enemy unit; fall back to the enemy hero where allowed.
  const enemyUnits = [...G.players[enemy].board]
    .filter((u) => !u.stealthed)
    .sort((a, b) => b.attack - a.attack);
  if (enemyUnits[0]) return { kind: 'unit', iid: enemyUnits[0].iid };
  if (required === 'enemy-any' || required === 'any')
    return { kind: 'hero', player: enemy };
  return undefined;
}
