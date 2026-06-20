'use client';

// ActionLog — scrolling battle log.
import { useEffect, useRef } from 'react';

export default function ActionLog({ log }: { log: { t: number; text: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [log.length]);

  return (
    <div className="panel flex h-full flex-col p-3">
      <div className="stat-label mb-2">Battle Log</div>
      <div ref={ref} className="flex-1 space-y-1 overflow-y-auto pr-1 text-xs">
        {log.map((l, i) => (
          <div key={i} className="text-[var(--color-muted)]">
            <span className="mr-1 text-[var(--color-neon)]">T{l.t}</span>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
