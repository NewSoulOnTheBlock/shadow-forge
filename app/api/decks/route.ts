// /api/decks — deck mutations (persist to Postgres). Action-discriminated POST
// keeps the client store mutators 1:1 with a single endpoint.
//   save     -> upsert a deck + its card list, returns the saved Deck
//   delete   -> remove a deck
//   rename   -> rename a deck
//   setActive-> mark one deck active (clears the rest)
import { NextResponse } from 'next/server';
import {
  getCurrentUserId,
  saveDeck,
  deleteDeck,
  renameDeck,
  setActiveDeck,
} from '@/lib/server/queries';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();

    switch (body.action) {
      case 'save': {
        const deck = await saveDeck(userId, body.deck);
        return NextResponse.json({ deck });
      }
      case 'delete':
        await deleteDeck(userId, body.id);
        return NextResponse.json({ ok: true });
      case 'rename':
        await renameDeck(userId, body.id, body.name);
        return NextResponse.json({ ok: true });
      case 'setActive':
        await setActiveDeck(userId, body.id);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
    }
  } catch (err) {
    console.error('[decks]', err);
    return NextResponse.json({ error: 'deck_op_failed' }, { status: 500 });
  }
}
