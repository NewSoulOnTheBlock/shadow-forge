'use client';

// Onboarding — shown once after a brand-new wallet signs in (needsOnboarding).
//   The player picks a display name + avatar; `POST /api/profile` persists it and
//   flips `profiles.onboarded` true. A hard navigation to /play then re-bootstraps
//   the store with the freshly named profile. The session was already set by
//   /api/auth/verify, so this route is reachable but server-gated.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api/client';

const AVATARS = ['🥷', '🗡️', '🌑', '🦊', '🐉', '🦅', '🐺', '🦂', '👹', '🪷', '⚡', '🔥', '❄️', '🌪️', '🩸', '🌕'];

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const valid = trimmed.length >= 3 && trimmed.length <= 20;

  const submit = async () => {
    if (!valid || busy) return;
    setError(null);
    setBusy(true);
    try {
      await api.saveProfile(trimmed, avatar);
      // Full navigation so StoreProvider re-bootstraps with the new profile.
      window.location.href = '/play';
    } catch (err) {
      console.error('[onboarding]', err);
      setError('Could not save your profile. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 scale-110 blur-[2px]"
        style={{ backgroundImage: 'url(/signin-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(7,7,13,0.55),rgba(7,7,13,0.93))]" />

      <div className="relative grid h-full place-items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="panel w-full max-w-lg p-7 shadow-2xl backdrop-blur-xl"
          style={{ background: 'rgba(12,13,24,0.8)' }}
        >
          <div className="text-center">
            <span className="grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-neon-2)] text-3xl text-black shadow-lg">
              {avatar}
            </span>
            <h1 className="mt-4 text-2xl font-black tracking-tight">
              Forge your <span className="neon-text">identity</span>
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Choose how the clans will know you. You can change this later in settings.
            </p>
          </div>

          {/* Display name */}
          <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
            Display name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            maxLength={20}
            placeholder="ShadowFox"
            className="mt-2 w-full rounded-xl border border-[var(--color-line)] bg-black/40 px-4 py-3 font-bold outline-none transition focus:border-[var(--color-neon)]"
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">3–20 characters.</p>

          {/* Avatar grid */}
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
            Avatar
          </label>
          <div className="mt-2 grid grid-cols-8 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`grid aspect-square place-items-center rounded-lg border text-2xl transition ${
                  avatar === a
                    ? 'border-[var(--color-neon)] bg-[var(--color-panel)] scale-105'
                    : 'border-[var(--color-line)] bg-[var(--color-panel-2)] hover:border-[var(--color-neon-2)]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {error && <p className="mt-4 text-center text-sm text-[var(--color-oni)]">{error}</p>}

          <button
            type="button"
            disabled={!valid || busy}
            onClick={submit}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[var(--color-neon)] to-[var(--color-neon-2)] px-4 py-3 font-black text-black shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Entering the forge…' : 'Enter Shadow Forge'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
