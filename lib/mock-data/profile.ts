// Mock current user + profile. PLUG-IN POINT: replace with auth/session + `profiles` table.
import type { User, PlayerProfile } from '@/lib/types';

export const CURRENT_USER: User = {
  id: 'u_self',
  username: 'shadowfox',
  email: 'shadowfox@shadowforge.gg',
  walletAddress: undefined, // populated when a wallet links
  createdAt: '2025-01-14T09:00:00.000Z',
};

export const CURRENT_PROFILE: PlayerProfile = {
  userId: 'u_self',
  displayName: 'ShadowFox',
  avatar: '🦊',
  level: 27,
  xp: 6450,
  xpToNext: 9000,
  rank: { tier: 'Platinum', division: 2, points: 1840 },
  wins: 312,
  losses: 188,
  favoriteDeckId: 'deck_shadow_blade',
  badges: ['founder', 'season1', 'flawless'],
  title: 'Of the Silent Step',
  currency: 4250,
};
