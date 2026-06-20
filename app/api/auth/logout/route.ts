// POST /api/auth/logout — clear the session cookie.
import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
