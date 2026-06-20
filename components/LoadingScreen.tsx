'use client';

// =============================================================================
// LoadingScreen — the single, game-wide loading screen for "Legend of Ki".
// Paints the branded scroll art (public/loading-bg.png, which already carries the
// KI / LEGEND OF KI logo and a "LOADING" bar) full-bleed, with an animated sheen
// sliding across the painted loading bar so the screen reads as active.
//
// Used by: StoreProvider (app boot/auth gate), the /match route fallback, and the
// in-match deck-select hand-off. Pass an optional `label` for context.
// =============================================================================

export default function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/loading-bg.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
        }}
      />

      {/* Animated sheen over the painted "LOADING" bar (centred, lower third). */}
      <div
        className="absolute overflow-hidden rounded-full"
        style={{ left: '39%', top: '81.2%', width: '22%', height: '0.8%' }}
      >
        <div
          className="animate-ki-load h-full w-1/2 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,225,170,0.9), rgba(0,229,255,0.7), transparent)',
            filter: 'drop-shadow(0 0 6px rgba(255,210,140,0.8))',
          }}
        />
      </div>

      {label ? (
        <p
          className="absolute left-1/2 -translate-x-1/2 text-center text-xs font-semibold uppercase tracking-[0.4em] text-[rgba(230,210,170,0.75)]"
          style={{ top: '88%' }}
        >
          {label}
        </p>
      ) : null}
    </div>
  );
}
