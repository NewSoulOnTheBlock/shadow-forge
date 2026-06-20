'use client';

// Sign-in screen — ornate two-panel "scroll" framed in gold/red marble with a
// shuriken medallion on the top edge.
//   LEFT panel: `public/signin-art.png` (hooded ninja overlooking a moonlit
//   pagoda city). RIGHT panel: the credentials card.
//   Auth is Solana-wallet based: the red "Sign In" and "Create Account" buttons
//   both run the wallet flow (sign a server nonce — no transaction). New wallets
//   are routed to onboarding; returning wallets drop into the hub. The username /
//   password fields are presentational for now; an explicit wallet picker is kept
//   below for multi-wallet users.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api/client';
import { connectAndSign, listWallets, onWalletsChange, type UiWallet } from '@/lib/wallet/mwa';

// Purple shuriken crest used for the right-panel emblem and the top medallion.
function Shuriken({ className, glow = false }: { className?: string; glow?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="shuri-fill" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#d8b3ff" />
          <stop offset="55%" stopColor="#b14bff" />
          <stop offset="100%" stopColor="#5e1f9e" />
        </radialGradient>
      </defs>
      <g fill="url(#shuri-fill)" stroke="#e9d4ff" strokeWidth={1.5} strokeLinejoin="round"
         style={glow ? { filter: 'drop-shadow(0 0 10px rgba(177,75,255,0.9))' } : undefined}>
        {[0, 90, 180, 270].map((a) => (
          <path key={a} transform={`rotate(${a} 50 50)`}
            d="M50 6 L60 40 L50 50 L40 40 Z" />
        ))}
        {[45, 135, 225, 315].map((a) => (
          <path key={a} transform={`rotate(${a} 50 50)`}
            d="M50 20 L57 43 L50 50 L43 43 Z" opacity={0.85} />
        ))}
      </g>
      <circle cx="50" cy="50" r="10" fill="#2a0f4a" stroke="#e9d4ff" strokeWidth={2} />
      <circle cx="50" cy="50" r="3.4" fill="#d8b3ff" />
    </svg>
  );
}

// Small gold diamond used in dividers and corner flourishes.
function Diamond({ className }: { className?: string }) {
  return <span className={`inline-block rotate-45 bg-[var(--color-gold)] ${className ?? ''}`} />;
}

export default function SignInPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<UiWallet[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  const refresh = useCallback(() => {
    listWallets().then(setWallets).catch(() => setWallets([]));
  }, []);

  useEffect(() => {
    refresh();
    let off: (() => void) | undefined;
    onWalletsChange(refresh).then((fn) => {
      off = fn;
    });
    return () => off?.();
  }, [refresh]);

  // Login theme music. Looped while the sign-in screen is mounted; stops on exit.
  // Browsers block autoplay-with-sound until a gesture, so fall back to starting
  // on the first interaction if the initial play() is rejected.
  useEffect(() => {
    const audio = new Audio('/login-music.mp3');
    audio.loop = true;
    audio.volume = 0.45;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      void audio.play().catch(() => {});
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    audio
      .play()
      .then(() => {
        started = true;
      })
      .catch(() => {
        window.addEventListener('pointerdown', start);
        window.addEventListener('keydown', start);
      });
    return () => {
      audio.pause();
      audio.src = '';
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  const signIn = async ({ name, wallet }: UiWallet) => {
    setError(null);
    setBusy(name);
    try {
      // Connect, then sign the nonce message the server builds for the connected
      // address — a single signature prompt, no transaction.
      const { address, signature } = await connectAndSign(wallet, async (addr) => {
        const { message } = await api.authNonce(addr);
        return message;
      });
      const result = await api.authVerify(address, signature);
      router.replace(result.needsOnboarding ? '/onboarding' : '/play');
    } catch (err) {
      console.error('[signIn]', err);
      setError('Sign-in was cancelled or failed. Please try again.');
      setBusy(null);
    }
  };

  // The red "Sign In" / "Create Account" buttons funnel into the wallet flow.
  // First-time wallets are routed to onboarding (account creation) automatically.
  const handleWalletAuth = () => {
    const primary = wallets[0];
    if (!primary) {
      setError('No Solana wallet detected. Install Phantom or Solflare to continue.');
      return;
    }
    void signIn(primary);
  };

  const anyBusy = busy !== null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--color-bg)]">
      {/* Ambient backdrop behind the framed scroll */}
      <div
        className="absolute inset-0 scale-110 opacity-40 blur-[6px]"
        style={{ backgroundImage: 'url(/signin-art.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(7,7,13,0.55),rgba(7,7,13,0.96))]" />

      <div className="relative grid h-full place-items-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          className="relative w-full max-w-6xl"
          style={{ height: 'min(92vh, 760px)' }}
        >
          {/* Ornate gold / red-marble frame */}
          <div
            className="absolute inset-0 rounded-[22px] p-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
            style={{
              background:
                'linear-gradient(145deg,#3a0d12,#7a1d22 18%,#b8862f 40%,#ffe08a 50%,#b8862f 60%,#7a1d22 82%,#3a0d12)',
            }}
          >
            <div className="absolute inset-[4px] rounded-[18px] border border-[#ffce5c]/40" />
            {/* Corner flourishes */}
            {[
              'left-2 top-2',
              'right-2 top-2',
              'left-2 bottom-2',
              'right-2 bottom-2',
            ].map((pos) => (
              <span key={pos} className={`absolute ${pos} grid place-items-center`}>
                <Diamond className="h-3 w-3 shadow-[0_0_8px_rgba(255,206,92,0.8)]" />
              </span>
            ))}

            {/* Inner content surface */}
            <div className="relative grid h-full w-full grid-cols-1 overflow-hidden rounded-[14px] md:grid-cols-[1.25fr_1fr]"
                 style={{ background: 'var(--color-bg-2)' }}>
              {/* LEFT — art */}
              <div className="relative hidden md:block">
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: 'url(/signin-art.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,transparent_70%,rgba(8,6,16,0.85))]" />
              </div>

              {/* RIGHT — credentials */}
              <div className="relative flex flex-col justify-center border-t border-[#ffce5c]/20 px-6 py-8 md:border-l md:border-t-0 sm:px-10"
                   style={{ background: 'linear-gradient(180deg,rgba(20,14,30,0.96),rgba(12,9,20,0.98))' }}>
                {/* Emblem */}
                <div className="flex justify-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-[radial-gradient(circle,rgba(177,75,255,0.25),transparent_70%)]">
                    <Shuriken className="h-14 w-14" glow />
                  </span>
                </div>

                {/* Title */}
                <h1 className="mt-3 text-center font-serif text-3xl font-black tracking-[0.35em] text-[#f4e6c8]"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                  SIGN IN
                </h1>
                <div className="mx-auto mt-3 flex w-3/4 items-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--color-gold)]/70" />
                  <Diamond className="h-2 w-2" />
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--color-gold)]/70" />
                </div>

                {/* Fields */}
                <div className="mx-auto mt-6 w-full max-w-sm space-y-3">
                  <label className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-3 focus-within:border-[var(--color-neon-2)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-[var(--color-neon-2)]" aria-hidden>
                      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Username"
                      autoComplete="username"
                      className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-3 focus-within:border-[var(--color-neon-2)]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-[var(--color-neon-2)]" aria-hidden>
                      <path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9Zm-8-2a3 3 0 0 1 6 0v2H9Zm3 6a1.8 1.8 0 0 1 1 3.3V18a1 1 0 0 1-2 0v-1.7A1.8 1.8 0 0 1 12 13Z" />
                    </svg>
                    <input
                      type="password"
                      placeholder="Password"
                      autoComplete="current-password"
                      className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none"
                    />
                  </label>

                  {/* Primary: Sign In (wallet flow) */}
                  <button
                    type="button"
                    onClick={handleWalletAuth}
                    disabled={anyBusy}
                    className="group relative mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-[#ffb4a8]/30 px-4 py-3 font-bold tracking-widest text-white shadow-lg transition disabled:opacity-60"
                    style={{ background: 'linear-gradient(180deg,#ff6a5c,#c52a25)' }}
                  >
                    <Diamond className="h-1.5 w-1.5 opacity-80" />
                    {anyBusy ? 'CHECK YOUR WALLET…' : 'SIGN IN'}
                    <Diamond className="h-1.5 w-1.5 opacity-80" />
                  </button>

                  {/* OR divider */}
                  <div className="flex items-center gap-3 py-1">
                    <span className="h-px flex-1 bg-[var(--color-line)]" />
                    <span className="text-xs font-bold tracking-widest text-[var(--color-muted)]">OR</span>
                    <span className="h-px flex-1 bg-[var(--color-line)]" />
                  </div>

                  {/* Secondary: Create Account (also wallet flow → onboarding) */}
                  <button
                    type="button"
                    onClick={handleWalletAuth}
                    disabled={anyBusy}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-gold)]/50 bg-black/30 px-4 py-3 font-bold tracking-wide text-[#f4e6c8] transition hover:border-[var(--color-gold)] hover:bg-black/50 disabled:opacity-60"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[var(--color-gold)]" aria-hidden>
                      <path d="M4 5h13a2 2 0 0 1 2 2v3h-2V7H4v10h7v2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm15 8v3h3v2h-3v3h-2v-3h-3v-2h3v-3Z" />
                    </svg>
                    CREATE ACCOUNT
                  </button>

                  {error && (
                    <p className="text-center text-sm text-[var(--color-oni)]">{error}</p>
                  )}

                  {/* Explicit wallet picker (kept for multi-wallet users) */}
                  {wallets.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-center text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                        Sign in with wallet
                      </p>
                      {wallets.map((w) => (
                        <button
                          key={w.name}
                          type="button"
                          disabled={anyBusy}
                          onClick={() => signIn(w)}
                          className="flex w-full items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-2)] px-3 py-2.5 text-left text-sm font-bold transition hover:border-[var(--color-neon-2)] hover:bg-[var(--color-panel)] disabled:opacity-50"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {w.icon ? <img src={w.icon} alt="" className="h-6 w-6 rounded-md" /> : <span className="text-lg">👛</span>}
                          <span className="flex-1">{busy === w.name ? 'Check your wallet…' : `Continue with ${w.name}`}</span>
                          {busy === w.name && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-neon-2)] border-t-transparent" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Forgot password (wallet auth has no password) */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgot((v) => !v)}
                      className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-neon-2)] transition hover:text-[#d8b3ff]"
                    >
                      Forgot Password?
                    </button>
                    {showForgot && (
                      <p className="mx-auto mt-2 max-w-xs text-[11px] leading-relaxed text-[var(--color-muted)]">
                        Legend of Ki has no passwords to lose — your Solana wallet is
                        your key. Connect it above to enter.
                      </p>
                    )}
                  </div>
                </div>

                <p className="mt-6 text-center text-[11px] text-[var(--color-muted)]">
                  You sign a one-time message to prove wallet ownership — no
                  transaction, no fees. Accept the{' '}
                  <Link href="/settings" className="text-[var(--color-neon-2)] hover:underline">code of the clan</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Top-edge shuriken medallion */}
          <span className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
            <span className="grid h-20 w-20 place-items-center rounded-full border-[3px] border-[#ffce5c] shadow-[0_0_20px_rgba(255,206,92,0.6)]"
                  style={{ background: 'radial-gradient(circle,#2a0f1a,#120a14)' }}>
              <Shuriken className="h-12 w-12" />
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}
