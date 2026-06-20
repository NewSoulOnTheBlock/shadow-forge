// POST /api/favorites — toggle a card's favorite flag in the player's collection.
import { NextResponse } from 'next/server';
import { getCurrentUserId, setFavoriteCard } from '@/lib/server/queries';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const { cardId, favorite } = await req.json();
    await setFavoriteCard(userId, cardId, Boolean(favorite));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[favorites]', err);
    return NextResponse.json({ error: 'favorite_failed' }, { status: 500 });
  }
}
