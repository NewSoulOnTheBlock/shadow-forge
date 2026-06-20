// Core domain types for Skyforge (Skyweaver-style TCG)

export type Prism = 'strength' | 'wisdom' | 'agility' | 'heart' | 'intellect';

export const PRISMS: Prism[] = [
  'strength',
  'wisdom',
  'agility',
  'heart',
  'intellect',
];

export type Keyword =
  | 'guard' // enemies must attack this unit first
  | 'haste' // can attack the turn it is played
  | 'stealth' // cannot be attacked or targeted by enemies until it attacks
  | 'lifesteal' // damage this deals heals its hero
  | 'flight' // ignores enemy Guard when attacking
  | 'wither' // units it damages permanently get -1/-1
  | 'regenerate' // heals to full at the end of its owner's turn
  | 'pierce' // excess attack damage overflows to the enemy hero
  | 'spellshield'; // negates the first enemy effect that targets it

export const ALL_KEYWORDS: Keyword[] = [
  'guard',
  'haste',
  'stealth',
  'lifesteal',
  'flight',
  'wither',
  'regenerate',
  'pierce',
  'spellshield',
];

// What a single Effect points at.
export type TargetSel =
  | 'none'
  | 'self' // the source unit (battlecries only)
  | 'chosen' // the target the player selected when playing the card
  | 'enemy-hero'
  | 'ally-hero'
  | 'all-enemy-units'
  | 'all-ally-units'
  | 'all-units'
  | 'random-enemy-unit';

export type EffectKind =
  | 'damage'
  | 'heal'
  | 'buff' // +atk/+hp (permanent)
  | 'armor' // grant armor
  | 'draw'
  | 'summon'
  | 'destroy'
  | 'grant'; // grant a keyword

export interface Effect {
  kind: EffectKind;
  target: TargetSel;
  amount?: number; // damage / heal / draw count / armor
  atk?: number; // buff
  hp?: number; // buff
  keyword?: Keyword; // grant
  token?: string; // summon: card id of token to create
  count?: number; // summon: how many
}

export type CardType = 'unit' | 'spell';

// What kind of target the player must pick when playing the card (if any).
export type RequiredTarget =
  | 'enemy-unit'
  | 'ally-unit'
  | 'any-unit'
  | 'enemy-any' // enemy unit or enemy hero
  | 'any'; // any unit or hero

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  prism: Prism;
  cost: number;
  attack?: number;
  health?: number;
  keywords?: Keyword[];
  text: string;
  art: string; // emoji glyph used for CSS art
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  onPlay?: Effect[]; // battlecry (unit) or the spell's effect
  onDeath?: Effect[]; // deathwish
  requiresTarget?: RequiredTarget; // forces target selection for `chosen` effects
  token?: boolean; // not selectable in the deckbuilder
}

// A unit instance living on the battlefield.
export interface UnitInstance {
  iid: number;
  cardId: string;
  owner: string; // playerID
  attack: number;
  health: number; // current
  maxHealth: number;
  armor: number;
  keywords: Keyword[];
  attacksLeft: number;
  summonedThisTurn: boolean;
  stealthed: boolean;
}

export interface Hero {
  hp: number;
  maxHp: number;
  armor: number;
}

export interface PlayerState {
  hero: Hero;
  hand: string[]; // card ids (hidden from the opponent)
  board: UnitInstance[];
  mana: number;
  maxMana: number;
  deckCount: number; // public
  prisms: Prism[];
  deckSubmitted: boolean;
  shuffles: number; // times the deck recycled
}

export interface LogEntry {
  t: number;
  text: string;
}

export interface GState {
  players: Record<string, PlayerState>;
  // decks: live draw piles (consumed as cards are drawn)
  // lists: the full original decklist, reshuffled back when a draw pile empties
  secret: { decks: Record<string, string[]>; lists: Record<string, string[]> };
  nextIid: number;
  log: LogEntry[];
  setupDone: boolean;
}

export type TargetRef =
  | { kind: 'unit'; iid: number }
  | { kind: 'hero'; player: string };

// ---- tunables ----
export const RULES = {
  heroHp: 30,
  startMana: 1,
  maxMana: 12,
  boardWidth: 6,
  handMax: 10,
  openingHand: 3,
  secondPlayerBonusCards: 1,
  minDeck: 15,
  maxDeck: 25,
  maxPrisms: 2,
} as const;
