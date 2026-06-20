// POST /api/auth/verify — verify the wallet's signature over our sign-in message,
// then establish a session. Creates a fresh (un-onboarded) account on first use.
//
// Body: { address: base58, signature: base64 }
// The signed message is rebuilt server-side from the consumed nonce cookie, so a
// client cannot substitute a different message than the one we issued.
import { NextResponse } from 'next/server';
import { buildSignInMessage, consumeNonce, setSession } from '@/lib/server/session';
import { upsertWalletAccount, verifyWalletSignature } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { address, signature } = (await req.json().catch(() => ({}))) as {
    address?: string;
    signature?: string;
  };
  if (!address || !signature) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const issued = await consumeNonce();
  if (!issued) {
    return NextResponse.json({ error: 'nonce_expired' }, { status: 400 });
  }

  const message = buildSignInMessage(address, issued.nonce, issued.issuedAt);
  if (!verifyWalletSignature(address, message, signature)) {
    return NextResponse.json({ error: 'bad_signature' }, { status: 401 });
  }

  try {
    const account = await upsertWalletAccount(address);
    await setSession(account.userId);
    return NextResponse.json({ ok: true, needsOnboarding: !account.onboarded, isNew: account.isNew });
  } catch (err) {
    console.error('[auth/verify]', err);
    return NextResponse.json({ error: 'account_error' }, { status: 500 });
  }
}
