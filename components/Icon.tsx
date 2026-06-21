'use client';

// Icon — thin wrapper over @iconify/react so the whole app references Iconify
// icons (line/duotone, ninja-themed) instead of emoji. Icons inherit the
// surrounding text color via `currentColor`, so wrapping them in a gold/neon
// text class gives the accent automatically.
import { Icon as Iconify } from '@iconify/react';

export default function Icon({
  icon,
  className,
  size = 18,
}: {
  icon: string;
  className?: string;
  size?: number | string;
}) {
  return (
    <Iconify
      icon={icon}
      width={size}
      height={size}
      className={className}
      aria-hidden
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}
