// Mock leaderboard, match history, rewards, achievements.
// PLUG-IN POINT: each maps to a table/query; shapes match `/lib/types`.
import type {
  LeaderboardEntry,
  MatchHistory,
  Reward,
  Achievement,
} from '@/lib/types';

export const LEADERBOARD: LeaderboardEntry[] = [
  { position: 1, userId: 'u_ryu', displayName: 'RyuStorm', avatar: '🐉', rankTier: 'Mythic', points: 3120, wins: 901 },
  { position: 2, userId: 'u_kage', displayName: 'KageNoOu', avatar: '👤', rankTier: 'Mythic', points: 3005, wins: 845 },
  { position: 3, userId: 'u_yuki', displayName: 'YukiBlade', avatar: '❄️', rankTier: 'Mythic', points: 2980, wins: 812 },
  { position: 4, userId: 'u_tora', displayName: 'ToraFang', avatar: '🐯', rankTier: 'Diamond', points: 2740, wins: 760 },
  { position: 5, userId: 'u_hana', displayName: 'HanaPetal', avatar: '🌸', rankTier: 'Diamond', points: 2690, wins: 741 },
  { position: 6, userId: 'u_jin', displayName: 'JinSpark', avatar: '⚡', rankTier: 'Diamond', points: 2610, wins: 702 },
  { position: 7, userId: 'u_mizu', displayName: 'MizuFlow', avatar: '🌊', rankTier: 'Platinum', points: 2400, wins: 688 },
  { position: 8, userId: 'u_self', displayName: 'ShadowFox', avatar: '🦊', rankTier: 'Platinum', points: 1840, wins: 312 },
  { position: 9, userId: 'u_kuro', displayName: 'KuroMaru', avatar: '🐺', rankTier: 'Gold', points: 1620, wins: 401 },
  { position: 10, userId: 'u_aka', displayName: 'AkaOni', avatar: '👹', rankTier: 'Gold', points: 1555, wins: 388 },
];

export const MATCH_HISTORY: MatchHistory[] = [
  { id: 'm1', mode: 'ranked', result: 'win', opponent: 'KageNoOu', opponentAvatar: '👤', deckName: 'Shadow Blade Clan', rankDelta: 18, durationSec: 412, playedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm2', mode: 'ranked', result: 'loss', opponent: 'YukiBlade', opponentAvatar: '❄️', deckName: 'Shadow Blade Clan', rankDelta: -15, durationSec: 540, playedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'm3', mode: 'casual', result: 'win', opponent: 'HanaPetal', opponentAvatar: '🌸', deckName: 'Shrine Warrior Clan', rankDelta: 0, durationSec: 380, playedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm4', mode: 'ranked', result: 'win', opponent: 'JinSpark', opponentAvatar: '⚡', deckName: 'Scroll & Trap Clan', rankDelta: 16, durationSec: 295, playedAt: new Date(Date.now() - 90000000).toISOString() },
  { id: 'm5', mode: 'single', result: 'win', opponent: 'Sensei Saru', opponentAvatar: '🐒', deckName: 'Shadow Blade Clan', rankDelta: 0, durationSec: 210, playedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'm6', mode: 'ranked', result: 'loss', opponent: 'ToraFang', opponentAvatar: '🐯', deckName: 'Shadow Blade Clan', rankDelta: -14, durationSec: 631, playedAt: new Date(Date.now() - 180000000).toISOString() },
];

export const DAILY_REWARDS: Reward[] = [
  { id: 'd1', type: 'currency', label: 'Day 1', amount: 50, icon: '💠', claimed: true },
  { id: 'd2', type: 'currency', label: 'Day 2', amount: 75, icon: '💠', claimed: true },
  { id: 'd3', type: 'card', label: 'Day 3', icon: '🎴', claimed: false },
  { id: 'd4', type: 'pack', label: 'Day 4', icon: '📦', claimed: false },
  { id: 'd5', type: 'cosmetic', label: 'Day 5', icon: '🎏', claimed: false },
  { id: 'd6', type: 'currency', label: 'Day 6', amount: 200, icon: '💠', claimed: false },
  { id: 'd7', type: 'pack', label: 'Day 7', icon: '🏆', claimed: false },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: 'First Blood', description: 'Win your first match.', icon: '🩸', progress: 1, goal: 1, unlocked: true },
  { id: 'a2', name: 'Clan Master', description: 'Win 100 ranked matches.', icon: '🎌', progress: 312, goal: 100, unlocked: true },
  { id: 'a3', name: 'Collector', description: 'Own 30 unique cards.', icon: '🎴', progress: 38, goal: 30, unlocked: true },
  { id: 'a4', name: 'Flawless', description: 'Win a match without losing health.', icon: '✨', progress: 1, goal: 1, unlocked: true },
  { id: 'a5', name: 'Shadow Walker', description: 'Win 50 matches with stealth units.', icon: '🥷', progress: 31, goal: 50, unlocked: false },
  { id: 'a6', name: 'Ascendant', description: 'Reach Mythic rank.', icon: '👑', progress: 0, goal: 1, unlocked: false },
];
