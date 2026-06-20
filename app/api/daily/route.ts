// POST /api/daily — claim the next daily reward, advancing the player's streak.
import { NextResponse } from 'next/server';
import {
  getCurrentUserId,
  claimDailyReward,
  getDailyRewards,
} from '@/lib/server/queries';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const userId = await getCurrentUserId();
    await claimDailyReward(userId);
    const dailyRewards = await getDailyRewards(userId);
    return NextResponse.json({ dailyRewards });
  } catch (err) {
    console.error('[daily]', err);
    return NextResponse.json({ error: 'claim_failed' }, { status: 500 });
  }
}
