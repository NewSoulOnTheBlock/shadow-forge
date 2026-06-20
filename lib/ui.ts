// Shared UI helpers: clan (prism) + rarity + keyword presentation.
// Re-exports the ninja PRISM_META/KEYWORD_META and adds rarity styling that
// matches the design-system tokens in globals.css.
import { PRISM_META, KEYWORD_META } from '@/lib/game/meta';
import type { Prism } from '@/lib/game/types';
import type { Rarity } from '@/lib/types';

export { PRISM_META, KEYWORD_META };

export const CLAN_COLOR: Record<Prism, string> = {
  strength: 'var(--color-oni)',
  wisdom: 'var(--color-sage)',
  agility: 'var(--color-shadow)',
  heart: 'var(--color-shrine)',
  intellect: 'var(--color-trap)',
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: 'var(--color-r-common)',
  rare: 'var(--color-r-rare)',
  epic: 'var(--color-r-epic)',
  legendary: 'var(--color-r-legendary)',
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export function clanLabel(p: Prism) {
  return PRISM_META[p].label;
}

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}
