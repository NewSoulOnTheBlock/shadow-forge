'use client';

import Icon from '@/components/Icon';
import { useState } from 'react';
import { cx } from '@/lib/ui';
import { useAppStore } from '@/store/appStore';

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--color-line)] bg-black/20 p-3 text-left transition hover:border-[var(--color-neon)]"
    >
      <span className="font-bold">{label}</span>
      <span
        className={cx(
          'relative h-6 w-11 rounded-full border transition',
          checked
            ? 'border-[var(--color-neon)] bg-[rgba(0,229,255,0.28)]'
            : 'border-[var(--color-line)] bg-[var(--color-panel-2)]',
        )}
      >
        <span
          className={cx(
            'absolute top-1 h-4 w-4 rounded-full bg-[var(--color-ink)] transition',
            checked ? 'left-6 shadow-[0_0_14px_var(--color-neon)]' : 'left-1',
          )}
        />
      </span>
    </button>
  );
}

function Range({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-xl border border-[var(--color-line)] bg-black/20 p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-bold">{label}</span>
        <span className="chip">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--color-neon)]"
      />
    </label>
  );
}

export default function SettingsPage() {
  // PLUG-IN POINT: persist settings and account edits to authenticated user preferences.
  const profile = useAppStore((s) => s.profile);
  const user = useAppStore((s) => s.user);

  const [username, setUsername] = useState(profile.displayName);
  const [animations, setAnimations] = useState(true);
  const [autoPass, setAutoPass] = useState(false);
  const [confirmRisky, setConfirmRisky] = useState(true);
  const [music, setMusic] = useState(62);
  const [sfx, setSfx] = useState(78);
  const [quality, setQuality] = useState('High');
  const [cardAnimations, setCardAnimations] = useState(true);
  const [visibility, setVisibility] = useState('Friends');
  const [showHistory, setShowHistory] = useState(true);

  return (
    <>
      {/* Settings page backdrop — ninja-at-the-shrine key art (fixed, full-bleed). */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/settings-bg.png')" }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/70 to-black/85" />
      <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-8 pb-28 sm:px-6 lg:px-8">
      <section className="panel p-6">
        <p className="stat-label">Command Center</p>
        <h1 className="neon-text mt-1 text-4xl font-black tracking-tight sm:text-5xl">Settings</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Tune account, gameplay, audio, and privacy before entering the forge.
        </p>
      </section>

      <section className="panel p-5">
        <p className="stat-label">Account</p>
        <h2 className="mt-1 text-xl font-black">Profile Access</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="stat-label">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-2)] px-4 py-3 font-bold outline-none transition focus:border-[var(--color-neon)]"
            />
          </label>
          <label className="block">
            <span className="stat-label">Email</span>
            <input
              value={user.email ?? 'unlinked@shadowforge.local'}
              readOnly
              className="mt-2 w-full rounded-xl border border-[var(--color-line)] bg-black/30 px-4 py-3 text-[var(--color-muted)] outline-none"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {/* PLUG-IN POINT: connect wallet provider and store verified walletAddress. */}
          <button type="button" className="btn" disabled>
            <Icon icon="ph:link-duotone" size={16} /> Connect Wallet <span className="text-xs">(coming soon)</span>
          </button>
          {/* PLUG-IN POINT: call auth sign-out and clear client stores. */}
          <button type="button" className="btn">
            Sign out
          </button>
        </div>
      </section>

      <section className="panel p-5">
        <p className="stat-label">Gameplay</p>
        <h2 className="mt-1 text-xl font-black">Duel Preferences</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Toggle label="Animations" checked={animations} onChange={setAnimations} />
          <Toggle label="Auto-pass turn" checked={autoPass} onChange={setAutoPass} />
          <Toggle label="Confirm risky actions" checked={confirmRisky} onChange={setConfirmRisky} />
        </div>
      </section>

      <section className="panel p-5">
        <p className="stat-label">Audio</p>
        <h2 className="mt-1 text-xl font-black">Sound Rituals</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Range label="Music volume" value={music} onChange={setMusic} />
          <Range label="SFX volume" value={sfx} onChange={setSfx} />
        </div>
      </section>

      <section className="panel p-5">
        <p className="stat-label">Graphics</p>
        <h2 className="mt-1 text-xl font-black">Visual Fidelity</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block rounded-xl border border-[var(--color-line)] bg-black/20 p-3">
            <span className="font-bold">Quality</span>
            <select
              value={quality}
              onChange={(event) => setQuality(event.target.value)}
              className="mt-3 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 font-bold outline-none transition focus:border-[var(--color-neon)]"
            >
              {['Low', 'Medium', 'High', 'Ultra'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <Toggle label="Card animations" checked={cardAnimations} onChange={setCardAnimations} />
        </div>
      </section>

      <section className="panel p-5">
        <p className="stat-label">Privacy</p>
        <h2 className="mt-1 text-xl font-black">Visibility</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block rounded-xl border border-[var(--color-line)] bg-black/20 p-3">
            <span className="font-bold">Profile visibility</span>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              className="mt-3 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 font-bold outline-none transition focus:border-[var(--color-neon)]"
            >
              {['Public', 'Friends', 'Private'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <Toggle label="Show match history" checked={showHistory} onChange={setShowHistory} />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-line)] bg-[rgba(7,7,13,0.86)] px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-muted)]">Local settings preview for {username}.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              // PLUG-IN POINT: send settings payload to backend preferences endpoint.
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </main>
    </>
  );
}
