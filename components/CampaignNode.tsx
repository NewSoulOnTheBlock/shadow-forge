import Icon from '@/components/Icon';
import { motion } from 'framer-motion';
import type { CampaignNode as CampaignNodeType, Difficulty } from '@/lib/types';
import { cx } from '@/lib/ui';

interface CampaignNodeProps {
  node: CampaignNodeType;
  selected: boolean;
  onSelect: (node: CampaignNodeType) => void;
}

const DIFFICULTY_RING: Record<Difficulty, string> = {
  beginner: 'var(--color-shadow)',
  intermediate: 'var(--color-sage)',
  expert: 'var(--color-oni)',
  boss: 'var(--color-gold)',
};

export default function CampaignNode({ node, selected, onSelect }: CampaignNodeProps) {
  const ringColor = DIFFICULTY_RING[node.difficulty];

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-label={`${node.name} ${node.unlocked ? node.difficulty : 'locked'}`}
      onClick={() => onSelect(node)}
      whileHover={node.unlocked ? { y: -3, scale: selected ? 1.1 : 1.04 } : undefined}
      whileTap={{ scale: 0.96 }}
      animate={{ scale: selected ? 1.08 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center outline-none"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      <span
        className={cx(
          'relative grid h-16 w-16 place-items-center rounded-full border-2 bg-[var(--color-panel-2)] text-3xl shadow-2xl transition-all duration-200',
          selected && 'glow-ring',
          !node.unlocked && 'grayscale opacity-45',
        )}
        style={{ borderColor: ringColor, boxShadow: selected ? undefined : `0 0 18px -8px ${ringColor}` }}
      >
        {node.opponentAvatar}
        {!node.unlocked && (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/55 text-xl" aria-hidden="true">
            <Icon icon="ph:lock-duotone" size={26} />
          </span>
        )}
        {node.completed && (
          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-shadow)] text-xs font-black text-black">
            <Icon icon="ph:check-bold" size={13} />
          </span>
        )}
      </span>
      <span
        className={cx(
          'max-w-24 rounded-full border border-[var(--color-line)] bg-black/45 px-2 py-1 text-[11px] font-bold leading-tight text-[var(--color-ink)] backdrop-blur',
          selected && 'border-[var(--color-neon)] text-[var(--color-neon)]',
          !node.unlocked && 'opacity-55',
        )}
      >
        {node.name}
      </span>
    </motion.button>
  );
}
