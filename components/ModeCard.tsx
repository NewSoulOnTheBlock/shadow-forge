'use client';

// ModeCard — featured play-mode tile on the home/play screen.
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cx } from '@/lib/ui';

interface Props {
  title: string;
  subtitle: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  accent?: string; // css color
  badge?: string;
  featured?: boolean;
}

export default function ModeCard({
  title,
  subtitle,
  icon,
  href,
  onClick,
  accent = 'var(--color-neon)',
  badge,
  featured,
}: Props) {
  const inner = (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      style={{ ['--accent' as string]: accent }}
      className={cx(
        'panel panel-hover relative h-full overflow-hidden p-5',
        featured ? 'min-h-[180px]' : 'min-h-[120px]',
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-2xl"
        style={{ background: accent }}
      />
      {badge && (
        <span
          className="absolute right-3 top-3 chip"
          style={{ color: accent, borderColor: accent }}
        >
          {badge}
        </span>
      )}
      <div className={cx('mb-3', featured ? 'text-5xl' : 'text-3xl')}>{icon}</div>
      <h3 className={cx('font-black', featured ? 'text-2xl' : 'text-lg')}>{title}</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
      <span
        className="mt-3 inline-flex items-center gap-1 text-sm font-bold"
        style={{ color: accent }}
      >
        Enter →
      </span>
    </motion.div>
  );

  if (href) return <Link href={href} className="block h-full">{inner}</Link>;
  return (
    <button onClick={onClick} className="block h-full w-full text-left">
      {inner}
    </button>
  );
}
