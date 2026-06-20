'use client';

// DeckList — the current deck's cards as compact rows (cost · name · stats · remove).
import { getCard } from '@/lib/game/cards';
import { CLAN_COLOR, PRISM_META, cx } from '@/lib/ui';

export default function DeckList({
  cardIds,
  onRemove,
  onInspect,
}: {
  cardIds: string[];
  onRemove: (id: string) => void;
  onInspect?: (id: string) => void;
}) {
  const sorted = [...cardIds].sort((a, b) => {
    const ca = getCard(a);
    const cb = getCard(b);
    return ca.cost - cb.cost || ca.name.localeCompare(cb.name);
  });

  if (sorted.length === 0) {
    return (
      <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-[var(--color-line)] p-6 text-center text-sm text-[var(--color-muted)]">
        Click cards to add them to your deck.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sorted.map((id) => {
        const c = getCard(id);
        return (
          <div
            key={id}
            className="group flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-1.5 transition hover:border-[var(--clan)]"
            style={{ ['--clan' as string]: CLAN_COLOR[c.prism] }}
          >
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black text-black"
              style={{ background: 'linear-gradient(135deg,#7fe9ff,#4d8bff)' }}
            >
              {c.cost}
            </span>
            <span className="text-base">{c.art}</span>
            <button
              onClick={() => onInspect?.(id)}
              className="min-w-0 flex-1 truncate text-left text-sm font-semibold hover:text-[var(--color-neon)]"
            >
              {c.name}
            </button>
            <span style={{ color: CLAN_COLOR[c.prism] }} title={PRISM_META[c.prism].label}>
              {PRISM_META[c.prism].glyph}
            </span>
            {c.type === 'unit' && (
              <span className="hidden text-[11px] font-bold text-[var(--color-muted)] sm:inline">
                {c.attack}/{c.health}
              </span>
            )}
            <button
              onClick={() => onRemove(id)}
              className="grid h-5 w-5 place-items-center rounded text-[var(--color-muted)] transition hover:bg-[var(--color-oni)]/20 hover:text-[var(--color-oni)]"
              title="Remove"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
