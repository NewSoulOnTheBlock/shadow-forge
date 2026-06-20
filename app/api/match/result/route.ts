// POST /api/match/result — persist a finished match and return updated standings.
import { NextResponse } from 'next/server';
import {
  getCurrentUserId,
  recordMatchResult,
  UnauthenticatedError,
  type MatchResultInput,
} from '@/lib/server/queries';
import type { MatchMode } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MODES: MatchMode[] = ['ranked', 'casual', 'single', 'custom'];

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();

    const result =
      body.result === 'win' || body.result === 'loss' || body.result === 'draw'
        ? body.result
        : 'draw';
    const mode: MatchMode = MODES.includes(body.mode) ? body.mode : 'casual';

    const input: MatchResultInput = {
      result,
      mode,
      opponent: String(body.opponent ?? 'Opponent').slice(0, 64),
      opponentAvatar: String(body.opponentAvatar ?? '🥷').slice(0, 16),
      deckName: String(body.deckName ?? '').slice(0, 64),
      durationSec: Number.isFinite(body.durationSec) ? Number(body.durationSec) : 0,
    };

    const outcome = await recordMatchResult(userId, input);
    return NextResponse.json(outcome);
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }
    console.error('[match/result]', err);
    return NextResponse.json({ error: 'record_failed' }, { status: 500 });
  }
}
