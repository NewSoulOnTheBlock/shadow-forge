// =============================================================================
// Legend of Ki — Core data models
// -----------------------------------------------------------------------------
// These TypeScript interfaces describe every entity in the game. They are the
// single source of truth for the mock data layer (`/lib/mock-data`) and are
// shaped so they can later be backed 1:1 by Supabase tables / an API.
//
//   PLUG-IN POINT: replace the mock-data accessors with Supabase queries that
//   return these exact shapes. Nothing in the UI should need to change.
// =============================================================================

import type { CardDef, Prism, Keyword } from '@/lib/game/types';

export type { CardDef, Prism, Keyword } from '@/lib/game/types';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/** Cosmetic finishes a card can be owned in. */
export type VariantStyle = 'standard' | 'foil' | 'prismatic' | 'gold';

/** Canonical card definition === the game engine's CardDef (ninja pool). */
export type Card = CardDef;

export interface CardVariant {
  id: string;
  cardId: string;
  style: VariantStyle;
  label: string;
}

/** A row in a player's collection (owned cards). */
export interface CollectionItem {
  cardId: string;
  quantity: number;
  variants: VariantStyle[]; // cosmetic finishes the player owns
  favorite: boolean;
  acquiredAt: string; // ISO date
}

// --- Ranking -----------------------------------------------------------------

export type RankTier =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Mythic';

export interface Rank {
  tier: RankTier;
  division: number; // 1 (highest) .. 4 (lowest) within a tier
  points: number; // ladder points
}

// --- Accounts ----------------------------------------------------------------

export interface User {
  id: string;
  username: string;
  email?: string;
  walletAddress?: string; // wallet-ready: populated once a wallet links
  createdAt: string;
}

export interface PlayerProfile {
  userId: string;
  displayName: string;
  avatar: string; // emoji glyph (swap for image URL later)
  level: number;
  xp: number;
  xpToNext: number;
  rank: Rank;
  wins: number;
  losses: number;
  favoriteDeckId?: string;
  badges: string[]; // cosmetic badge ids
  title?: string; // equipped cosmetic title
  currency: number; // soft currency (shards)
}

// --- Decks -------------------------------------------------------------------

export interface DeckCard {
  cardId: string;
  count: number; // singleton format keeps this at 1, model supports more
}

export interface Deck {
  id: string;
  name: string;
  ownerId: string;
  prisms: Prism[]; // chosen clans
  cards: DeckCard[];
  active: boolean;
  updatedAt: string;
  coverArt: string; // emoji glyph used as deck cover
}

// --- Matches -----------------------------------------------------------------

export type MatchMode = 'ranked' | 'casual' | 'single' | 'custom';
export type MatchStatus = 'queued' | 'in_progress' | 'complete';

export interface MatchPlayer {
  userId: string;
  displayName: string;
  avatar: string;
  deckId: string;
  hp: number;
}

export interface Match {
  id: string;
  mode: MatchMode;
  status: MatchStatus;
  players: MatchPlayer[];
  turn: number;
  activePlayer: string; // userId
  createdAt: string;
}

export interface MatchHistory {
  id: string;
  mode: MatchMode;
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  opponentAvatar: string;
  deckName: string;
  rankDelta: number;
  durationSec: number;
  playedAt: string;
}

// --- Lobby -------------------------------------------------------------------

export type LobbyVisibility = 'public' | 'private';

export interface LobbyPlayer {
  userId: string;
  displayName: string;
  avatar: string;
  deckId?: string;
  ready: boolean;
  isHost: boolean;
  slot: number;
  spectator?: boolean;
}

export interface Lobby {
  id: string;
  code: string; // shareable join code
  name: string;
  visibility: LobbyVisibility;
  hostId: string;
  players: LobbyPlayer[];
  spectators: LobbyPlayer[];
  maxPlayers: number;
  rules: {
    mode: MatchMode;
    format: string; // e.g. "Singleton · 15-25"
    timerSec: number;
  };
  createdAt: string;
}

// --- Rewards & progression ---------------------------------------------------

export type RewardType = 'card' | 'currency' | 'cosmetic' | 'pack';

export interface Reward {
  id: string;
  type: RewardType;
  label: string;
  amount?: number;
  icon: string;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  goal: number;
  unlocked: boolean;
}

// --- Single-player campaign --------------------------------------------------

export type Difficulty = 'beginner' | 'intermediate' | 'expert' | 'boss';

export interface CampaignNode {
  id: string;
  name: string;
  difficulty: Difficulty;
  opponentAvatar: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  rewards: Reward[];
  x: number; // map position (percent)
  y: number;
  connects: string[]; // node ids this connects to (for path lines)
  // --- campaign encounter (optional; present on story nodes) ---
  opponentName?: string; // the named boss who pilots the deck
  subtitle?: string; // clan / location flavour line
  deckName?: string; // the name of the boss's deck
  strategy?: string; // one-line summary of how this opponent plays
  story?: string[]; // in-depth, multi-paragraph lore for this location
}

// --- Leaderboard -------------------------------------------------------------

export interface LeaderboardEntry {
  position: number;
  userId: string;
  displayName: string;
  avatar: string;
  rankTier: RankTier;
  points: number;
  wins: number;
}

// Re-export keyword/rarity helpers used widely.
export type { Keyword as KeywordType };
export type CardKeyword = Keyword;
