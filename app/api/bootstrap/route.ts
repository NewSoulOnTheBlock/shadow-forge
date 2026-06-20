// GET /api/bootstrap — one payload with every piece of dynamic, user-scoped data
// the client store needs on load. Static game content (card catalog, campaign
// layout, practice opponents) is NOT here — that ships in the client bundle from
// the engine, since it is game content rather than per-user data.
//
//   PLUG-IN POINT (auth): getCurrentUserId() resolves the demo account today;
//   swap it for the session user once auth lands. Nothing else changes.
import { NextResponse } from 'next/server';
import { COLLECTION } from '@/lib/game/cards';
import {
  getCurrentUserId,
  UnauthenticatedError,
  getUser,
  getProfile,
  getDecks,
  getCollection,
  getLeaderboard,
  getMatchHistory,
  getAchievements,
  getDailyRewards,
  getLobbies,
} from '@/lib/server/queries';

// Always hit the live DB; never statically cache per-user data.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const [
      user,
      profile,
      decks,
      collection,
      leaderboard,
      matchHistory,
      achievements,
      dailyRewards,
      lobbies,
    ] = await Promise.all([
      getUser(userId),
      getProfile(userId),
      getDecks(userId),
      getCollection(userId),
      getLeaderboard(10),
      getMatchHistory(userId),
      getAchievements(userId),
      getDailyRewards(userId),
      getLobbies(),
    ]);

    const activeDeckId = decks.find((d) => d.active)?.id ?? decks[0]?.id ?? '';
    const favorites = collection.filter((c) => c.favorite).map((c) => c.cardId);
    const collectionStats = { owned: collection.length, total: COLLECTION.length };

    return NextResponse.json({
      user,
      profile,
      decks,
      activeDeckId,
      collection,
      collectionStats,
      favorites,
      leaderboard,
      selfUserId: userId,
      matchHistory,
      achievements,
      dailyRewards,
      lobbies,
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }
    console.error('[bootstrap]', err);
    return NextResponse.json({ error: 'bootstrap_failed' }, { status: 500 });
  }
}
