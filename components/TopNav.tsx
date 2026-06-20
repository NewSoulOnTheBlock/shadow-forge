'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { cx } from '@/lib/ui';

const LINKS = [
  { href: '/play', label: 'Play', icon: '⚔️' },
  { href: '/single-player', label: 'Campaign', icon: '🗺️' },
  { href: '/lobby', label: 'Lobby', icon: '🏯' },
  { href: '/deck-builder', label: 'Decks', icon: '🛠️' },
  { href: '/collection', label: 'Collection', icon: '🎴' },
  { href: '/leaderboard', label: 'Ranks', icon: '🏆' },
];

export default function TopNav() {
  const pathname = usePathname();
  const profile = useAppStore((s) => s.profile);
  const logout = useAppStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide the chrome on the immersive match screen and the full-frame home hub.
  if (
    pathname?.startsWith('/match/') ||
    pathname === '/play' ||
    pathname === '/single-player' ||
    pathname === '/deck-builder' ||
    pathname === '/sign-in'
  )
    return null;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[rgba(7,7,13,0.72)] backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4">
        <Link href="/play" className="mr-2 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-neon-2)] text-lg text-black shadow-lg">
            🥷
          </span>
          <span className="hidden text-lg font-black tracking-tight sm:block">
            SHADOW<span className="neon-text">FORGE</span>
          </span>
        </Link>

        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cx(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
                  active
                    ? 'bg-[var(--color-panel-2)] text-[var(--color-ink)] glow-ring'
                    : 'text-[var(--color-muted)] hover:bg-white/5 hover:text-[var(--color-ink)]',
                )}
              >
                <span className="text-base">{l.icon}</span>
                <span className="hidden md:inline">{l.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-white/5 px-2.5 py-1.5 text-sm font-bold text-[var(--color-gold)] sm:flex">
            💠 {profile.currency.toLocaleString()}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-white/5 px-2 py-1.5 transition hover:border-[var(--color-neon)]"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--color-panel-2)] text-lg">
                {profile.avatar}
              </span>
              <div className="hidden text-left leading-tight sm:block">
                <div className="text-xs font-bold">{profile.displayName}</div>
                <div className="text-[10px] text-[var(--color-muted)]">Lv {profile.level}</div>
              </div>
              <span className="text-[10px] text-[var(--color-muted)]">▾</span>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[var(--color-line)] bg-[rgba(12,13,24,0.97)] py-1 shadow-2xl backdrop-blur-xl">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-semibold text-[var(--color-muted)] transition hover:bg-white/5 hover:text-[var(--color-ink)]"
                  >
                    👤 Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-semibold text-[var(--color-muted)] transition hover:bg-white/5 hover:text-[var(--color-ink)]"
                  >
                    ⚙️ Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      void logout();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[var(--color-oni)] transition hover:bg-white/5"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
          <Link href="/settings" className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-line)] text-[var(--color-muted)] transition hover:border-[var(--color-neon)] hover:text-[var(--color-ink)]">
            ⚙️
          </Link>
        </div>
      </nav>
    </header>
  );
}
