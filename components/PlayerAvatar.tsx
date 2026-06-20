// PlayerAvatar — circular avatar with optional level ring + active glow.
import { cx } from '@/lib/ui';

interface Props {
  avatar: string;
  name?: string;
  level?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  active?: boolean;
  className?: string;
}

const DIM: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-9 w-9 text-lg',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-16 w-16 text-3xl',
  xl: 'h-24 w-24 text-5xl',
};

export default function PlayerAvatar({
  avatar,
  name,
  level,
  size = 'md',
  active,
  className,
}: Props) {
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <div className="relative">
        <div
          className={cx(
            'grid place-items-center rounded-full border bg-[var(--color-panel-2)]',
            DIM[size],
            active ? 'glow-ring animate-pulse-glow border-transparent' : 'border-[var(--color-line)]',
          )}
        >
          {avatar}
        </div>
        {typeof level === 'number' && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-[var(--color-line)] bg-black px-1.5 text-[10px] font-bold">
            {level}
          </span>
        )}
      </div>
      {name && <span className="font-bold">{name}</span>}
    </div>
  );
}
