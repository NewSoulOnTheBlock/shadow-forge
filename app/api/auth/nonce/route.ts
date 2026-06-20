// POST /api/auth/nonce — issue a single-use sign-in nonce + the exact message
// the wallet must sign. The nonce is stashed in a short-lived signed cookie.
import { NextResponse } from 'next/server';
import { buildSignInMessage, issueNonce } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { address } = (await req.json().catch(() => ({}))) as { address?: string };
  if (!address || typeof address !== 'string' || address.length < 32 || address.length > 64) {
    return NextResponse.json({ error: 'bad_address' }, { status: 400 });
  }
  const { nonce, issuedAt } = await issueNonce();
  return NextResponse.json({ nonce, message: buildSignInMessage(address, nonce, issuedAt) });
}
