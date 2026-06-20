'use client';

// ResourceDisplay — mana crystals (filled = available).
export default function ResourceDisplay({
  mana,
  maxMana,
}: {
  mana: number;
  maxMana: number;
}) {
  const crystals = Array.from({ length: Math.max(maxMana, 1) });
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex flex-wrap gap-0.5">
        {crystals.map((_, i) => (
          <span
            key={i}
            className="h-3 w-3 rotate-45 rounded-[2px] border"
            style={{
              borderColor: 'rgba(125,233,255,0.5)',
              background:
                i < mana
                  ? 'linear-gradient(135deg,#7fe9ff,#4d8bff)'
                  : 'transparent',
              boxShadow: i < mana ? '0 0 6px rgba(0,229,255,0.6)' : 'none',
            }}
          />
        ))}
      </div>
      <span className="text-sm font-black tabular-nums text-[var(--color-neon)]">
        {mana}/{maxMana}
      </span>
    </div>
  );
}
