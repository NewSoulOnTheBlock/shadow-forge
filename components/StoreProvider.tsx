'use client';

// Bootstraps the Zustand store from /api/bootstrap on first mount and gates the
// app behind auth. Public routes (sign-in, onboarding) render without gating;
// every other route requires a session, redirecting to /sign-in when absent.
// Mounted once in the root layout, around all routes.
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';

const PUBLIC_ROUTES = new Set(['/sign-in', '/onboarding']);

function Loader({ label }: { label: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-4">
        <span className="grid h-14 w-14 animate-pulse place-items-center rounded-xl bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-neon-2)] text-3xl text-black shadow-lg">
          🥷
        </span>
        <p className="text-sm font-semibold text-[var(--color-muted)]">{label}</p>
      </div>
    </div>
  );
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const loaded = useAppStore((s) => s.loaded);
  const authStatus = useAppStore((s) => s.authStatus);
  const bootstrap = useAppStore((s) => s.bootstrap);

  const isPublic = pathname ? PUBLIC_ROUTES.has(pathname) : false;

  useEffect(() => {
    if (!isPublic) void bootstrap();
  }, [isPublic, bootstrap]);

  // No valid session on a protected route -> send to sign-in.
  useEffect(() => {
    if (!isPublic && authStatus === 'unauthed') router.replace('/sign-in');
  }, [isPublic, authStatus, router]);

  if (isPublic) return <>{children}</>;

  if (authStatus === 'unauthed') return <Loader label="Redirecting to sign-in…" />;
  if (!loaded) return <Loader label="Entering the forge…" />;

  return <>{children}</>;
}
