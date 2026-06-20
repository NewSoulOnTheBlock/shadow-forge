'use client';

// Sign-in screen.
//   `public/signin-bg.png` fills the viewport as an atmospheric backdrop; a dark
//   gradient veil keeps the auth card readable. The form is a UI prototype —
//   wire the marked PLUG-IN POINT to real auth (NextAuth / Supabase / wallet).
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cx } from '@/lib/ui';

type Mode = 'signin' | 'signup';

const OAUTH = [
  { id: 'google', label: 'Google', icon: '🌐' },
  { id: 'discord', label: 'Discord', icon: '🎮' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
];

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // PLUG-IN POINT: replace with a real auth call (NextAuth signIn / Supabase
    // auth.signInWithPassword / wallet signature). On success, bootstrap the
    // store and route into the hub.
    await new Promise((r) => setTimeout(r, 600));
    router.push('/play');
  };

  const enterAsGuest = () => {
    // PLUG-IN POINT: create an anonymous session before entering the hub.
    router.push('/play');
  };

  const fieldClass =
    'w-full rounded-xl border border-[var(--color-line)] bg-black/40 px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-neon)] focus:ring-2 focus:ring-[var(--color-neon)]/30';

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 scale-110 blur-[2px]"
        style={{ backgroundImage: 'url(/signin-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(7,7,13,0.55),rgba(7,7,13,0.92))]" />

      {/* Auth card */}
      <div className="relative grid h-full place-items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="panel w-full max-w-md overflow-hidden p-7 shadow-2xl backdrop-blur-xl"
          style={{ background: 'rgba(12,13,24,0.78)' }}
        >
          {/* Brand */}
          <div className="flex flex-col items-center text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-neon-2)] text-3xl text-black shadow-lg">
              🥷
            </span>
            <h1 className="mt-4 text-2xl font-black tracking-tight">
              <span className="neon-text">Shadow Forge</span>
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {mode === 'signin' ? 'Step back into the shadows.' : 'Forge your clan name.'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-[var(--color-line)] bg-black/30 p-1">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cx(
                  'rounded-lg px-3 py-2 text-sm font-bold transition',
                  mode === m ? 'bg-[var(--color-panel-2)] text-[var(--color-ink)]' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]',
                )}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="stat-label mb-1.5 block" htmlFor="username">Clan name</label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ShadowFox"
                  autoComplete="username"
                  required
                  className={fieldClass}
                />
              </div>
            )}
            <div>
              <label className="stat-label mb-1.5 block" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ninja@shadowforge.gg"
                autoComplete="email"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="stat-label" htmlFor="password">Password</label>
                {mode === 'signin' && (
                  <button type="button" className="text-xs font-semibold text-[var(--color-neon)] hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                className={fieldClass}
              />
            </div>

            <button type="submit" disabled={busy} className="btn btn-primary mt-1 w-full">
              {busy ? 'Entering…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 text-xs text-[var(--color-muted)]">
            <span className="h-px flex-1 bg-[var(--color-line)]" />
            or continue with
            <span className="h-px flex-1 bg-[var(--color-line)]" />
          </div>

          {/* OAuth / wallet placeholders */}
          <div className="grid grid-cols-3 gap-2">
            {OAUTH.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={enterAsGuest}
                className="btn flex-col gap-1 py-3 text-xs"
                aria-label={`Continue with ${provider.label}`}
              >
                <span className="text-lg">{provider.icon}</span>
                {provider.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={enterAsGuest}
            className="mt-4 w-full text-center text-sm font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-neon)]"
          >
            Enter as guest →
          </button>
        </motion.div>

        <p className="absolute bottom-5 left-0 right-0 text-center text-xs text-[var(--color-muted)]">
          By entering you accept the{' '}
          <Link href="/settings" className="text-[var(--color-neon)] hover:underline">code of the clan</Link>.
        </p>
      </div>
    </div>
  );
}
