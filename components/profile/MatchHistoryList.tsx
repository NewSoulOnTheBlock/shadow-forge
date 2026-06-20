import PlayerAvatar from '@/components/PlayerAvatar';
import type { MatchHistory } from '@/lib/types';
import { cx } from '@/lib/ui';

const RESULT_COLOR: Record<MatchHistory['result'], string> = {
  win: 'var(--color-shadow)',
  loss: 'var(--color-oni)',
  draw: 'var(--color-muted)',
};

function relativeTime(playedAt: string) {
  const elapsed = Math.max(0, Date.now() - new Date(playedAt).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
}

function formatDuration(durationSec: number) {
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDelta(rankDelta: number) {
  if (rankDelta === 0) return '±0';
  return `${rankDelta > 0 ? '+' : ''}${rankDelta}`;
}

export default function MatchHistoryList({ matches }: { matches: MatchHistory[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-[var(--color-line)] p-4">
        <p className="stat-label">Recent Combat Logs</p>
        <h2 className="text-xl font-black">Match History</h2>
      </div>

      <div className="hidden grid-cols-[110px_1.4fr_100px_1fr_90px_90px_90px] gap-4 border-b border-[var(--color-line)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] lg:grid">
        <span>Result</span>
        <span>Opponent</span>
        <span>Mode</span>
        <span>Deck</span>
        <span>Rank</span>
        <span>Time</span>
        <span>Duration</span>
      </div>

      <div className="divide-y divide-[var(--color-line)]">
        {matches.map((match) => (
          <div
            key={match.id}
            className="grid gap-3 p-4 transition hover:bg-white/[0.03] lg:grid-cols-[110px_1.4fr_100px_1fr_90px_90px_90px] lg:items-center lg:gap-4"
          >
            <span
              className="chip w-fit uppercase"
              style={{
                color: RESULT_COLOR[match.result],
                borderColor: `color-mix(in srgb, ${RESULT_COLOR[match.result]} 55%, transparent)`,
              }}
            >
              {match.result}
            </span>

            <PlayerAvatar
              avatar={match.opponentAvatar}
              name={match.opponent}
              size="sm"
              className="min-w-0"
            />

            <span className="chip w-fit capitalize">{match.mode}</span>
            <span className="text-sm font-bold text-[var(--color-ink)]">{match.deckName}</span>

            <span
              className={cx(
                'font-black',
                match.rankDelta > 0 && 'text-[var(--color-shadow)]',
                match.rankDelta < 0 && 'text-[var(--color-oni)]',
                match.rankDelta === 0 && 'text-[var(--color-muted)]',
              )}
            >
              {formatDelta(match.rankDelta)}
            </span>

            <span className="text-sm text-[var(--color-muted)]">{relativeTime(match.playedAt)}</span>
            <span className="text-sm font-bold">{formatDuration(match.durationSec)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
