// /api/lobbies — list open lobbies (GET) and create a room (POST).
//   PLUG-IN POINT (realtime): seating, ready-state, and spectators sync over
//   WebSockets later; this persists the room row + host so it survives reload.
import { NextResponse } from 'next/server';
import { getCurrentUserId, getLobbies, createLobby } from '@/lib/server/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lobbies = await getLobbies();
    return NextResponse.json({ lobbies });
  } catch (err) {
    console.error('[lobbies:get]', err);
    return NextResponse.json({ error: 'lobbies_failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const { visibility } = await req.json();
    const lobby = await createLobby({
      hostId: userId,
      visibility: visibility === 'private' ? 'private' : 'public',
    });
    return NextResponse.json({ lobby });
  } catch (err) {
    console.error('[lobbies:post]', err);
    return NextResponse.json({ error: 'create_lobby_failed' }, { status: 500 });
  }
}
