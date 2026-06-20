// =============================================================================
// Mock "database" facade.
// -----------------------------------------------------------------------------
// Every screen imports game data through this module so there is exactly ONE
// place to swap mock arrays for real Supabase/API calls.
//
//   PLUG-IN POINT: turn each getter into an async query, e.g.
//     export const db = {
//       getProfile: () => supabase.from('profiles').select().single(),
//       ...
//     }
//   then make consumers `await` them. The return shapes already match `/lib/types`.
// =============================================================================

import { CATALOG, CARD_BY_ID, getCard, cardRarity, RARITY_ORDER } from './cards';
import { CURRENT_USER, CURRENT_PROFILE } from './profile';
import { MOCK_DECKS, ACTIVE_DECK_ID } from './decks';
import { MOCK_COLLECTION, COLLECTION_BY_ID, collectionStats } from './collection';
import { MOCK_LOBBIES, createLobby, makeCode } from './lobbies';
import { CAMPAIGN, PRACTICE_OPPONENTS } from './campaign';
import {
  LEADERBOARD,
  MATCH_HISTORY,
  DAILY_REWARDS,
  ACHIEVEMENTS,
} from './progression';

export const db = {
  // catalog
  getCatalog: () => CATALOG,
  getCard,
  cardById: CARD_BY_ID,
  cardRarity,
  rarityOrder: RARITY_ORDER,
  // account
  getUser: () => CURRENT_USER,
  getProfile: () => CURRENT_PROFILE,
  // decks
  getDecks: () => MOCK_DECKS,
  activeDeckId: ACTIVE_DECK_ID,
  // collection
  getCollection: () => MOCK_COLLECTION,
  collectionById: COLLECTION_BY_ID,
  collectionStats,
  // lobby
  getLobbies: () => MOCK_LOBBIES,
  createLobby,
  makeCode,
  // single player
  getCampaign: () => CAMPAIGN,
  practiceOpponents: PRACTICE_OPPONENTS,
  // progression
  getLeaderboard: () => LEADERBOARD,
  getMatchHistory: () => MATCH_HISTORY,
  getDailyRewards: () => DAILY_REWARDS,
  getAchievements: () => ACHIEVEMENTS,
};

export * from './cards';
export * from './profile';
export * from './decks';
export * from './collection';
export * from './lobbies';
export * from './campaign';
export * from './progression';
