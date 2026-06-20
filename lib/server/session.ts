// =============================================================================
// Server-only session + sign-in nonce helpers.
// -----------------------------------------------------------------------------
// Sessions are stateless: a compact `payload.signature` token (HMAC-SHA256 over
// the payload, keyed by AUTH_SECRET) stored in an httpOnly cookie. No session
// table needed — verification is a constant-time HMAC compare.
//
// The sign-in nonce is issued in a short-lived signed cookie so the /verify
// route can confirm the exact message the wallet signed (anti-replay).
// =============================================================================
import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.AUTH_SECRET ?? 'dev-insecure-secret-change-me';
const SESSION_COOKIE = 'sf_session';
const NONCE_COOKIE = 'sf_nonce';
const SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days
const NONCE_TTL_S = 60 * 5; // 5 minutes

function sign(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Encode `{ ...payload }` into a tamper-proof token: base64url(json).hmac. */
function encodeToken(payload: Record<string, unknown>): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

function decodeToken<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac || !safeEqual(mac, sign(body))) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

// ---- Session ---------------------------------------------------------------

export async function setSession(userId: string): Promise<void> {
  const token = encodeToken({ uid: userId, iat: Date.now() });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_S,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Resolve the signed-in user id, or null if no valid session. */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const payload = decodeToken<{ uid: string; iat: number }>(store.get(SESSION_COOKIE)?.value);
  if (!payload?.uid) return null;
  if (Date.now() - payload.iat > SESSION_TTL_S * 1000) return null;
  return payload.uid;
}

// ---- Sign-in nonce ---------------------------------------------------------

/** Issue a fresh nonce + issuedAt, persisted in a short-lived signed cookie. */
export async function issueNonce(): Promise<{ nonce: string; issuedAt: string }> {
  const nonce = randomBytes(24).toString('base64url');
  const issuedAt = new Date().toISOString();
  const store = await cookies();
  store.set(NONCE_COOKIE, encodeToken({ nonce, issuedAt }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: NONCE_TTL_S,
  });
  return { nonce, issuedAt };
}

/** Read + consume the issued nonce (single-use). Returns null if absent/stale. */
export async function consumeNonce(): Promise<{ nonce: string; issuedAt: string } | null> {
  const store = await cookies();
  const payload = decodeToken<{ nonce: string; issuedAt: string }>(store.get(NONCE_COOKIE)?.value);
  store.delete(NONCE_COOKIE);
  if (!payload) return null;
  if (Date.now() - new Date(payload.issuedAt).getTime() > NONCE_TTL_S * 1000) return null;
  return payload;
}

/** The exact human-readable message a wallet signs to authenticate. */
export function buildSignInMessage(address: string, nonce: string, issuedAt: string): string {
  return [
    'Shadow Forge wants you to sign in with your Solana account:',
    address,
    '',
    'Sign in to Shadow Forge. This request will not trigger a blockchain transaction or cost any fees.',
    '',
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n');
}
