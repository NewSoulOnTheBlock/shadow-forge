'use client';

// Sign-in screen — Solana wallet authentication.
//   `public/signin-bg.png` fills the viewport as an atmospheric backdrop. Players
//   authenticate by signing a server-issued nonce with a Solana wallet (desktop
//   extensions + Solana Mobile Wallet Adapter). New wallets are routed through
//   onboarding; returning wallets drop straight into the hub.
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api/client';
import { connectAndSign, listWallets, onWalletsChange, type UiWallet } from '@/lib/wallet/mwa';

export default function SignInPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<UiWallet[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 scale-110 blur-[2px]"
        style={{ backgroundImage: 'url(/signin-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(7,7,13,0.55),rgba(7,7,13,0.92))]" />

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
              Sign in with your Solana wallet to enter the forge.
            </p>
          </div>

          {/* Wallet list */}
          <div className="mt-6 space-y-2">
            {wallets.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-black/30 p-4 text-center text-sm text-[var(--color-muted)]">
                No Solana wallet detected. Install Phantom or Solflare, or open this
                page in a Solana Mobile wallet to continue.
              </div>
            )}
            {wallets.map((w) => (
              <button
                key={w.name}
                type="button"
                disabled={busy !== null}
                onClick={() => signIn(w)}
                className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-2)] px-4 py-3 text-left font-bold transition hover:border-[var(--color-neon)] hover:bg-[var(--color-panel)] disabled:opacity-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {w.icon ? <img src={w.icon} alt="" className="h-7 w-7 rounded-md" /> : <span className="text-xl">👛</span>}
                <span className="flex-1">{busy === w.name ? 'Check your wallet…' : `Continue with ${w.name}`}</span>
                {busy === w.name && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-neon)] border-t-transparent" />
                )}
              </button>
            ))}
          </div>

          {error && <p className="mt-4 text-center text-sm text-[var(--color-oni)]">{error}</p>}

          <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
            We never see your keys. You sign a one-time message to prove wallet
            ownership — no transaction, no fees.
          </p>
        </motion.div>

        <p className="absolute bottom-5 left-0 right-0 text-center text-xs text-[var(--color-muted)]">
          By entering you accept the{' '}
          <Link href="/settings" className="text-[var(--color-neon)] hover:underline">code of the clan</Link>.
        </p>
      </div>
    </div>
  );
}
