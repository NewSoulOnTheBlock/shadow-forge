import { cx } from '@/lib/ui';

type StatItem = {
  label: string;
  value: string | number;
  accent?: string;
  icon?: string;
};

export default function ProfileStats({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="panel overflow-hidden p-4">
          <div
            className="mb-3 h-1 w-12 rounded-full"
            style={{ background: item.accent ?? 'var(--color-neon)' }}
          />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="stat-label">{item.label}</p>
              <p
                className={cx(
                  'mt-1 text-2xl font-black tracking-tight',
                  !item.accent && 'neon-text',
                )}
                style={item.accent ? { color: item.accent } : undefined}
              >
                {item.value}
              </p>
            </div>
            {item.icon && <span className="text-2xl opacity-80">{item.icon}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
