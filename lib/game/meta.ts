import type { Prism, Keyword } from './types';

export const PRISM_META: Record<
  Prism,
  { label: string; color: string; glyph: string; iconify: string }
> = {
  strength: { label: 'Oni', color: '#e2502f', glyph: '👹', iconify: 'game-icons:oni' },
  wisdom: { label: 'Sage', color: '#3b82f6', glyph: '📜', iconify: 'game-icons:scroll-unfurled' },
  agility: { label: 'Shadow', color: '#22c55e', glyph: '🥷', iconify: 'game-icons:ninja-head' },
  heart: { label: 'Shrine', color: '#ec4899', glyph: '⛩️', iconify: 'game-icons:shinto-shrine' },
  intellect: { label: 'Trapmaster', color: '#a855f7', glyph: '🪤', iconify: 'game-icons:mantrap' },
};

export const KEYWORD_META: Record<
  Keyword,
  { label: string; icon: string; iconify: string; tip: string }
> = {
  guard: { label: 'Guard', icon: '🛡️', iconify: 'game-icons:checked-shield', tip: 'Enemies must attack this unit first.' },
  haste: { label: 'Haste', icon: '⚡', iconify: 'ph:lightning-duotone', tip: 'Can attack the turn it is played.' },
  stealth: { label: 'Stealth', icon: '🌫️', iconify: 'ph:cloud-fog-duotone', tip: 'Cannot be attacked or targeted by enemies until it attacks.' },
  lifesteal: { label: 'Lifesteal', icon: '🩸', iconify: 'ph:drop-duotone', tip: 'Damage it deals restores your hero.' },
  flight: { label: 'Flight', icon: '🪶', iconify: 'ph:feather-duotone', tip: 'Ignores enemy Guard when attacking.' },
  wither: { label: 'Wither', icon: '☠️', iconify: 'ph:skull-duotone', tip: 'Units it damages permanently get -1/-1.' },
  regenerate: { label: 'Regenerate', icon: '♻️', iconify: 'ph:arrows-clockwise-bold', tip: 'Heals to full at the end of your turn.' },
  pierce: { label: 'Pierce', icon: '🏹', iconify: 'game-icons:broadhead-arrow', tip: 'Excess attack damage hits the enemy hero.' },
  spellshield: { label: 'Spellshield', icon: '✨', iconify: 'ph:sparkle-duotone', tip: 'Negates the first enemy effect that targets it.' },
  venom: { label: 'Venom', icon: '🐍', iconify: 'game-icons:snake', tip: 'Any combat damage it deals to a unit destroys that unit.' },
  flurry: { label: 'Flurry', icon: '🌀', iconify: 'game-icons:tornado', tip: 'Can attack twice each turn.' },
  ambush: { label: 'Ambush', icon: '🗡️', iconify: 'game-icons:plain-dagger', tip: 'When attacking a unit it strikes first; a lethal blow prevents retaliation.' },
  momentum: { label: 'Momentum', icon: '📈', iconify: 'ph:chart-line-up-duotone', tip: 'After destroying a unit in combat, it permanently gains +1/+1.' },
  vanish: { label: 'Vanish', icon: '💨', iconify: 'ph:wind-duotone', tip: 'Re-gains Stealth at the end of your turn.' },
};
