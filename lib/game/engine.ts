import type { GState, UnitInstance, Effect, TargetRef, Keyword } from './types';
import { RULES } from './types';
import { getCard } from './cards';

// Minimal shape of boardgame.io's random plugin we rely on.
export interface RandomAPI {
  Shuffle<T>(arr: T[]): T[];
  Die(spotvalue: number, count?: number): number | number[];
}

export function opponentOf(playerID: string): string {
  return playerID === '0' ? '1' : '0';
}

export function log(G: GState, text: string): void {
  G.log.push({ t: G.log.length, text });
  if (G.log.length > 60) G.log.shift();
}

export function findUnit(
  G: GState,
  iid: number,
): { unit: UnitInstance; owner: string } | null {
  for (const owner of Object.keys(G.players)) {
    const unit = G.players[owner].board.find((u) => u.iid === iid);
    if (unit) return { unit, owner };
  }
  return null;
}

export function hasKeyword(u: UnitInstance, k: Keyword): boolean {
  return u.keywords.includes(k);
}

export function grantKeyword(u: UnitInstance, k: Keyword): void {
  if (!u.keywords.includes(k)) u.keywords.push(k);
  if (k === 'haste') {
    u.summonedThisTurn = false;
    const want = u.keywords.includes('flurry') ? 2 : 1;
    if (u.attacksLeft < want) u.attacksLeft = want;
  }
  if (k === 'stealth' || k === 'vanish') u.stealthed = true;
}

// ---- drawing ----
export function drawCards(
  G: GState,
  pid: string,
  n: number,
  random: RandomAPI,
): void {
  const p = G.players[pid];
  for (let i = 0; i < n; i++) {
    if (G.secret.decks[pid].length === 0) {
      // Auto-shuffle: recycle the full decklist (no fatigue, Skyweaver-style).
      G.secret.decks[pid] = random.Shuffle([...G.secret.lists[pid]]);
      p.shuffles += 1;
    }
    const card = G.secret.decks[pid].pop();
    if (!card) break;
    if (p.hand.length < RULES.handMax) {
      p.hand.push(card);
    } // else: card is burned (over hand limit)
    p.deckCount = G.secret.decks[pid].length;
  }
}

// ---- unit creation ----
export function makeUnit(G: GState, cardId: string, owner: string): UnitInstance {
  const def = getCard(cardId);
  const keywords = [...(def.keywords ?? [])];
  const attacksPerTurn = keywords.includes('flurry') ? 2 : 1;
  return {
    iid: G.nextIid++,
    cardId,
    owner,
    attack: def.attack ?? 0,
    health: def.health ?? 1,
    maxHealth: def.health ?? 1,
    armor: 0,
    keywords,
    attacksLeft: keywords.includes('haste') ? attacksPerTurn : 0,
    summonedThisTurn: !keywords.includes('haste'),
    stealthed: keywords.includes('stealth'),
  };
}

export function summonUnits(
  G: GState,
  owner: string,
  cardId: string,
  count: number,
): void {
  const p = G.players[owner];
  for (let i = 0; i < count; i++) {
    if (p.board.length >= RULES.boardWidth) break;
    p.board.push(makeUnit(G, cardId, owner));
  }
}

// ---- damage / heal ----
export function damageHero(G: GState, player: string, amount: number): number {
  if (amount <= 0) return 0;
  const hero = G.players[player].hero;
  let dmg = amount;
  if (hero.armor > 0) {
    const absorbed = Math.min(hero.armor, dmg);
    hero.armor -= absorbed;
    dmg -= absorbed;
  }
  hero.hp -= dmg;
  return amount;
}

export function healHero(G: GState, player: string, amount: number): void {
  const hero = G.players[player].hero;
  hero.hp = Math.min(hero.maxHp, hero.hp + amount);
}

// Returns true if the effect was negated by Spellshield.
function spellshieldCheck(unit: UnitInstance, fromEnemy: boolean): boolean {
  if (fromEnemy && hasKeyword(unit, 'spellshield')) {
    unit.keywords = unit.keywords.filter((k) => k !== 'spellshield');
    return true;
  }
  return false;
}

export function damageUnit(unit: UnitInstance, amount: number): void {
  if (amount <= 0) return;
  let dmg = amount;
  if (unit.armor > 0) {
    const absorbed = Math.min(unit.armor, dmg);
    unit.armor -= absorbed;
    dmg -= absorbed;
  }
  unit.health -= dmg;
}

function wither(unit: UnitInstance): void {
  unit.attack = Math.max(0, unit.attack - 1);
  unit.maxHealth = Math.max(1, unit.maxHealth - 1);
  unit.health -= 1;
}

// ---- target resolution for effects ----
export function resolveTargets(
  G: GState,
  caster: string,
  sel: Effect['target'],
  chosen: TargetRef | undefined,
  selfUnit: UnitInstance | undefined,
  random: RandomAPI,
): TargetRef[] {
  const enemy = opponentOf(caster);
  switch (sel) {
    case 'none':
      return [];
    case 'self':
      return selfUnit ? [{ kind: 'unit', iid: selfUnit.iid }] : [];
    case 'chosen':
      return chosen ? [chosen] : [];
    case 'enemy-hero':
      return [{ kind: 'hero', player: enemy }];
    case 'ally-hero':
      return [{ kind: 'hero', player: caster }];
    case 'all-enemy-units':
      return G.players[enemy].board.map((u) => ({ kind: 'unit', iid: u.iid }));
    case 'all-ally-units':
      return G.players[caster].board.map((u) => ({ kind: 'unit', iid: u.iid }));
    case 'all-units':
      return [...G.players['0'].board, ...G.players['1'].board].map((u) => ({
        kind: 'unit',
        iid: u.iid,
      }));
    case 'random-enemy-unit': {
      const board = G.players[enemy].board;
      if (board.length === 0) return [];
      const idx = (random.Die(board.length) as number) - 1;
      return [{ kind: 'unit', iid: board[idx].iid }];
    }
    default:
      return [];
  }
}

// Apply a single effect.
export function applyEffect(
  G: GState,
  caster: string,
  effect: Effect,
  chosen: TargetRef | undefined,
  selfUnit: UnitInstance | undefined,
  random: RandomAPI,
): void {
  // Effects with no board target.
  if (effect.kind === 'draw') {
    drawCards(G, caster, effect.amount ?? 1, random);
    return;
  }
  if (effect.kind === 'summon' && effect.token) {
    summonUnits(G, caster, effect.token, effect.count ?? 1);
    return;
  }

  const targets = resolveTargets(G, caster, effect.target, chosen, selfUnit, random);
  for (const ref of targets) {
    if (ref.kind === 'hero') {
      if (effect.kind === 'damage') damageHero(G, ref.player, effect.amount ?? 0);
      else if (effect.kind === 'heal') healHero(G, ref.player, effect.amount ?? 0);
      else if (effect.kind === 'armor') G.players[ref.player].hero.armor += effect.amount ?? 0;
      continue;
    }
    const found = findUnit(G, ref.iid);
    if (!found) continue;
    const unit = found.unit;
    const fromEnemy = found.owner !== caster;
    if (spellshieldCheck(unit, fromEnemy)) continue;
    switch (effect.kind) {
      case 'damage':
        damageUnit(unit, effect.amount ?? 0);
        break;
      case 'heal':
        unit.health = Math.min(unit.maxHealth, unit.health + (effect.amount ?? 0));
        break;
      case 'armor':
        unit.armor += effect.amount ?? 0;
        break;
      case 'buff':
        unit.attack = Math.max(0, unit.attack + (effect.atk ?? 0));
        unit.maxHealth += effect.hp ?? 0;
        unit.health += effect.hp ?? 0;
        break;
      case 'grant':
        if (effect.keyword) grantKeyword(unit, effect.keyword);
        break;
      case 'destroy':
        unit.health = 0;
        break;
    }
  }
}

export function runEffects(
  G: GState,
  caster: string,
  effects: Effect[] | undefined,
  chosen: TargetRef | undefined,
  selfUnit: UnitInstance | undefined,
  random: RandomAPI,
): void {
  if (!effects) return;
  for (const e of effects) applyEffect(G, caster, e, chosen, selfUnit, random);
}

// ---- deaths ----
export function cleanupDeaths(G: GState, random: RandomAPI): void {
  let changed = true;
  while (changed) {
    changed = false;
    for (const owner of Object.keys(G.players)) {
      const board = G.players[owner].board;
      const dead = board.filter((u) => u.health <= 0);
      if (dead.length === 0) continue;
      changed = true;
      G.players[owner].board = board.filter((u) => u.health > 0);
      for (const u of dead) {
        const def = getCard(u.cardId);
        log(G, `${def.name} was destroyed.`);
        if (def.onDeath) runEffects(G, owner, def.onDeath, undefined, u, random);
      }
    }
  }
}

// ---- combat ----
export interface AttackResult {
  ok: boolean;
  reason?: string;
}

export function defenderHasGuard(G: GState, defendingPlayer: string): boolean {
  return G.players[defendingPlayer].board.some((u) => hasKeyword(u, 'guard'));
}

export function canAttackTarget(
  G: GState,
  attacker: UnitInstance,
  target: TargetRef,
): AttackResult {
  if (attacker.attack <= 0) return { ok: false, reason: 'This unit has no Attack.' };
  if (attacker.attacksLeft <= 0)
    return { ok: false, reason: 'This unit cannot attack again this turn.' };

  const enemy = opponentOf(attacker.owner);
  const ignoresGuard = hasKeyword(attacker, 'flight');
  const guardUp = defenderHasGuard(G, enemy);

  if (target.kind === 'hero') {
    if (target.player !== enemy) return { ok: false, reason: 'Cannot attack your own hero.' };
    if (guardUp && !ignoresGuard) return { ok: false, reason: 'A Guard unit blocks the way.' };
    return { ok: true };
  }
  const found = findUnit(G, target.iid);
  if (!found) return { ok: false, reason: 'Target not found.' };
  if (found.owner !== enemy) return { ok: false, reason: 'Cannot attack your own unit.' };
  if (found.unit.stealthed) return { ok: false, reason: 'Stealthed units cannot be attacked.' };
  if (guardUp && !ignoresGuard && !hasKeyword(found.unit, 'guard'))
    return { ok: false, reason: 'You must attack a Guard unit first.' };
  return { ok: true };
}

export function resolveAttack(
  G: GState,
  attacker: UnitInstance,
  target: TargetRef,
  random: RandomAPI,
): void {
  const attackerLifesteal = hasKeyword(attacker, 'lifesteal');
  const attackerWither = hasKeyword(attacker, 'wither');
  const dealt = attacker.attack;

  if (target.kind === 'hero') {
    damageHero(G, target.player, dealt);
    if (attackerLifesteal) healHero(G, attacker.owner, dealt);
  } else {
    const found = findUnit(G, target.iid);
    if (!found) return;
    const defender = found.unit;
    const defenderHpBefore = defender.health;
    const retaliation = defender.attack;
    const ambush = hasKeyword(attacker, 'ambush');

    // Attacker always strikes the defender.
    damageUnit(defender, dealt);
    if (attackerLifesteal) healHero(G, attacker.owner, dealt);
    if (attackerWither) wither(defender);
    // Venom: any combat damage to a unit is lethal.
    if (dealt > 0 && hasKeyword(attacker, 'venom') && defender.health > 0) defender.health = 0;

    // Defender retaliates — unless Ambush killed it first.
    const defenderDead = defender.health <= 0;
    if (!(ambush && defenderDead)) {
      damageUnit(attacker, retaliation);
      if (hasKeyword(defender, 'lifesteal')) healHero(G, defender.owner, retaliation);
      if (hasKeyword(defender, 'wither')) wither(attacker);
      if (retaliation > 0 && hasKeyword(defender, 'venom') && attacker.health > 0) {
        attacker.health = 0;
      }
    }

    // Pierce: overflow lethal damage to the enemy hero.
    if (hasKeyword(attacker, 'pierce') && defender.health <= 0) {
      const overflow = dealt - Math.max(0, defenderHpBefore);
      if (overflow > 0) damageHero(G, found.owner, overflow);
    }

    // Momentum: surviving attacker that destroyed its target grows permanently.
    if (defender.health <= 0 && attacker.health > 0 && hasKeyword(attacker, 'momentum')) {
      attacker.attack += 1;
      attacker.maxHealth += 1;
      attacker.health += 1;
    }
  }

  attacker.attacksLeft -= 1;
  attacker.stealthed = false; // acting reveals the unit

  cleanupDeaths(G, random);
}

// ---- target legality for played cards (shared by moves, UI, AI) ----
import type { RequiredTarget } from './types';

export function isLegalCardTarget(
  G: GState,
  caster: string,
  required: RequiredTarget,
  target: TargetRef | undefined,
): boolean {
  if (!target) return false;
  const enemy = opponentOf(caster);
  if (target.kind === 'hero') {
    if (required === 'enemy-any') return target.player === enemy;
    if (required === 'any') return true;
    return false;
  }
  const found = findUnit(G, target.iid);
  if (!found) return false;
  const isEnemy = found.owner === enemy;
  // Enemy stealthed units cannot be targeted by the caster.
  if (isEnemy && found.unit.stealthed) return false;
  switch (required) {
    case 'enemy-unit':
      return isEnemy;
    case 'ally-unit':
      return !isEnemy;
    case 'any-unit':
      return true;
    case 'enemy-any':
      return isEnemy;
    case 'any':
      return true;
    default:
      return false;
  }
}

// ---- turn refresh ----
export function startOfTurn(G: GState, pid: string, random: RandomAPI): void {
  const p = G.players[pid];
  p.maxMana = Math.min(RULES.maxMana, p.maxMana + 1);
  p.mana = p.maxMana;
  for (const u of p.board) {
    u.attacksLeft = hasKeyword(u, 'flurry') ? 2 : 1;
    u.summonedThisTurn = false;
  }
  drawCards(G, pid, 1, random);
}

export function endOfTurn(G: GState, pid: string): void {
  const p = G.players[pid];
  for (const u of p.board) {
    if (hasKeyword(u, 'regenerate') && u.health < u.maxHealth) {
      u.health = u.maxHealth;
    }
    // Vanish: slip back into the shadows at the end of your turn.
    if (hasKeyword(u, 'vanish')) u.stealthed = true;
  }
}
