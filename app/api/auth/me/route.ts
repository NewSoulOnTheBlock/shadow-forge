// GET /api/auth/me — lightweight session probe used by the sign-in/onboarding
// gate. Returns whether a session exists and if onboarding is still pending.
import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/server/session';
import { queryOne } from '@/lib/server/pool';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ authenticated: false });
  const row = await queryOne<{ onboarded: boolean }>(
    'select coalesce(onboarded, true) as onboarded from profiles where id = $1',
    [uid],
  );
  return NextResponse.json({ authenticated: true, needsOnboarding: !(row?.onboarded ?? true) });
}
