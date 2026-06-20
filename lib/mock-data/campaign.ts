// Mock single-player campaign map. Nodes form a branching path with difficulty tiers.
// PLUG-IN POINT: persist `completed`/`unlocked` per user; drive AI from /lib/game.
import type { CampaignNode } from '@/lib/types';

export const CAMPAIGN: CampaignNode[] = [
  {
    id: 'c1',
    name: 'The Training Grounds',
    difficulty: 'beginner',
    opponentAvatar: '🐒',
    description: 'Learn the basics of summoning and combat against Sensei Saru.',
    unlocked: true,
    completed: true,
    rewards: [{ id: 'r_c1', type: 'currency', label: '100 Shards', amount: 100, icon: '💠', claimed: true }],
    x: 10, y: 50, connects: ['c2'],
  },
  {
    id: 'c2',
    name: 'Bamboo Forest Ambush',
    difficulty: 'beginner',
    opponentAvatar: '🐼',
    description: 'Survive a stealthy ambush in the bamboo groves.',
    unlocked: true,
    completed: true,
    rewards: [{ id: 'r_c2', type: 'card', label: 'Rare Card', icon: '🎴', claimed: false }],
    x: 26, y: 32, connects: ['c3', 'c4'],
  },
  {
    id: 'c3',
    name: 'Scroll Thieves',
    difficulty: 'intermediate',
    opponentAvatar: '🦝',
    description: 'Recover stolen jutsu scrolls from the Sage clan.',
    unlocked: true,
    completed: false,
    rewards: [{ id: 'r_c3', type: 'pack', label: 'Card Pack', icon: '📦', claimed: false }],
    x: 42, y: 60, connects: ['c5'],
  },
  {
    id: 'c4',
    name: 'Mountain Shrine',
    difficulty: 'intermediate',
    opponentAvatar: '🦅',
    description: 'Defend the high shrine from aerial raiders.',
    unlocked: true,
    completed: false,
    rewards: [{ id: 'r_c4', type: 'currency', label: '250 Shards', amount: 250, icon: '💠', claimed: false }],
    x: 50, y: 22, connects: ['c5'],
  },
  {
    id: 'c5',
    name: 'The Oni Stronghold',
    difficulty: 'expert',
    opponentAvatar: '👹',
    description: 'Breach the brute clan fortress. Heavy bodies and big swings.',
    unlocked: false,
    completed: false,
    rewards: [{ id: 'r_c5', type: 'cosmetic', label: 'Card Back', icon: '🎏', claimed: false }],
    x: 68, y: 45, connects: ['c6'],
  },
  {
    id: 'c6',
    name: 'Master of the Hidden Forge',
    difficulty: 'boss',
    opponentAvatar: '🐲',
    description: 'Face the legendary Forge Master in a duel to decide the clan war.',
    unlocked: false,
    completed: false,
    rewards: [{ id: 'r_c6', type: 'cosmetic', label: 'Legendary Avatar', icon: '🏆', claimed: false }],
    x: 88, y: 56, connects: [],
  },
];

export const PRACTICE_OPPONENTS = [
  { id: 'p_easy', name: 'Sparring Dummy', avatar: '🪵', difficulty: 'beginner' as const },
  { id: 'p_mid', name: 'Wandering Ronin', avatar: '🥷', difficulty: 'intermediate' as const },
  { id: 'p_hard', name: 'Shadow Adept', avatar: '👤', difficulty: 'expert' as const },
];
