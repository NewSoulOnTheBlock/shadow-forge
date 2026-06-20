'use client';

// =============================================================================
// SoundProvider — plays the sword-slice SFX (public/sfx-button.mp3) whenever any
// button is pressed, app-wide. Mounted once in the root layout. Uses a global
// capture-phase click listener so it fires even when a handler stops propagation,
// and clones the audio node per press so rapid clicks overlap cleanly.
//
// Matches real <button>s plus anything styled/marked as a button (.btn /
// role="button"). Disabled controls are skipped.
// =============================================================================
import { useEffect } from 'react';

export default function SoundProvider() {
  useEffect(() => {
    const base = new Audio('/sfx-button.mp3');
    base.preload = 'auto';

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const el = target?.closest('button, .btn, [role="button"]') as HTMLElement | null;
      if (!el) return;
      if (el instanceof HTMLButtonElement && el.disabled) return;
      if (el.getAttribute('aria-disabled') === 'true') return;
      try {
        const clip = base.cloneNode(true) as HTMLAudioElement;
        clip.volume = 0.35;
        void clip.play();
      } catch {
        /* autoplay/codec failures are non-fatal */
      }
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
