// POST /api/profile — save the player's chosen display name + avatar (used by the
// onboarding flow and profile editing). Requires an authenticated session.
import { NextResponse } from 'next/server';
import { getCurrentUserId, UnauthenticatedError, getProfile, getUser } from '@/lib/server/queries';
import { saveProfileBasics, selectHero } from '@/lib/server/auth';
import { HERO_BY_ID } from '@/lib/game/heroes';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const { displayName, avatar, hero } = (await req.json().catch(() => ({}))) as {
      displayName?: string;
      avatar?: string;
      hero?: string;
    };
    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json({ error: 'missing_display_name' }, { status: 400 });
    }
    if (hero && !HERO_BY_ID[hero]) {
      return NextResponse.json({ error: 'unknown_hero' }, { status: 400 });
    }
    // When a hero is chosen, its portrait becomes the avatar.
    const heroAvatar = hero ? HERO_BY_ID[hero].avatar : undefined;
    await saveProfileBasics(userId, displayName, heroAvatar ?? avatar ?? '🥷');
    if (hero) await selectHero(userId, hero);
    const [profile, user] = await Promise.all([getProfile(userId), getUser(userId)]);
    return NextResponse.json({ ok: true, profile, user });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }
    console.error('[api/profile]', err);
    return NextResponse.json({ error: 'profile_error' }, { status: 500 });
  }
}
