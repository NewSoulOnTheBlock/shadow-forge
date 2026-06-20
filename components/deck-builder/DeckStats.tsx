'use client';

// DeckStats — mana curve + type/rarity breakdowns for the deck builder.
import { useMemo } from 'react';
import { getCard } from '@/lib/game/cards';
import { RARITY_COLOR, RARITY_LABEL, CLAN_COLOR, PRISM_META } from '@/lib/ui';
import type { Rarity, Prism } from '@/lib/types';

export default function DeckStats({ cardIds }: { cardIds: string[] }) {
  const stats = useMemo(() => {
    const curve = [0, 0, 0, 0, 0, 0, 0, 0]; // index 7 == 7+
    const types = { unit: 0, spell: 0 };
    const rarity: Record<Rarity, number> = { common: 0, rare: 0, epic: 0, legendary: 0 };
    const clans: Partial<Record<Prism, number>> = {};
    let totalCost = 0;
    for (const id of cardIds) {
      const c = getCard(id);
      curve[Math.min(7, c.cost)]++;
      types[c.type]++;
      rarity[(c.rarity ?? 'common') as Rarity]++;
      clans[c.prism] = (clans[c.prism] ?? 0) + 1;
      totalCost += c.cost;
    }
    const max = Math.max(1, ...curve);
    const avg = cardIds.length ? (totalCost / cardIds.length).toFixed(1) : '0.0';
    return { curve, types, rarity, clans, max, avg };
  }, [cardIds]);

  return (
    <div className="space-y-4">
      {/* Mana curve */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <div className="stat-label">Mana Curve</div>
          <div className="text-xs text-[var(--color-muted)]">avg {stats.avg}</div>
        </div>
        <div className="flex h-20 items-end gap-1">
          {stats.curve.map((n, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-[var(--color-neon-2)] to-[var(--color-neon)] transition-all"
                  style={{ height: `${(n / stats.max) * 100}%`, minHeight: n ? 4 : 0 }}
                  title={`${n} card(s) at cost ${i === 7 ? '7+' : i}`}
                />
              </div>
              <span className="text-[9px] text-[var(--color-muted)]">{i === 7 ? '7+' : i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Type breakdown */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-[var(--color-line)] p-2">
          <div className="text-lg font-black text-[var(--color-sage)]">{stats.types.unit}</div>
          <div className="stat-label">Units</div>
        </div>
        <div className="rounded-lg border border-[var(--color-line)] p-2">
          <div className="text-lg font-black text-[var(--color-trap)]">{stats.types.spell}</div>
          <div className="stat-label">Spells</div>
        </div>
      </div>

      {/* Rarity breakdown */}
      <div>
        <div className="stat-label mb-1.5">Rarity</div>
        <div className="space-y-1">
          {(Object.keys(stats.rarity) as Rarity[]).map((r) => (
            <div key={r} className="flex items-center gap-2 text-xs">
              <span className="w-16" style={{ color: RARITY_COLOR[r] }}>
                {RARITY_LABEL[r]}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-panel-2)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${cardIds.length ? (stats.rarity[r] / cardIds.length) * 100 : 0}%`,
                    background: RARITY_COLOR[r],
                  }}
                />
              </div>
              <span className="w-4 text-right text-[var(--color-muted)]">{stats.rarity[r]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Clan split */}
      {Object.keys(stats.clans).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(stats.clans) as [Prism, number][]).map(([p, n]) => (
            <span key={p} className="chip" style={{ color: CLAN_COLOR[p] }}>
              {PRISM_META[p].glyph} {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
