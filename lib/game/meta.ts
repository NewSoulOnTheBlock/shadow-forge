import type { Prism, Keyword } from './types';

export const PRISM_META: Record<
  Prism,
  { label: string; color: string; glyph: string }
> = {
  strength: { label: 'Oni', color: '#e2502f', glyph: '👹' },
  wisdom: { label: 'Sage', color: '#3b82f6', glyph: '📜' },
  agility: { label: 'Shadow', color: '#22c55e', glyph: '🥷' },
  heart: { label: 'Shrine', color: '#ec4899', glyph: '⛩️' },
  intellect: { label: 'Trapmaster', color: '#a855f7', glyph: '🪤' },
};

export const KEYWORD_META: Record<Keyword, { label: string; icon: string; tip: string }> = {
  guard: { label: 'Guard', icon: '🛡️', tip: 'Enemies must attack this unit first.' },
  haste: { label: 'Haste', icon: '⚡', tip: 'Can attack the turn it is played.' },
  stealth: { label: 'Stealth', icon: '🌫️', tip: 'Cannot be attacked or targeted by enemies until it attacks.' },
  lifesteal: { label: 'Lifesteal', icon: '🩸', tip: 'Damage it deals restores your hero.' },
  flight: { label: 'Flight', icon: '🪶', tip: 'Ignores enemy Guard when attacking.' },
  wither: { label: 'Wither', icon: '☠️', tip: 'Units it damages permanently get -1/-1.' },
  regenerate: { label: 'Regenerate', icon: '♻️', tip: 'Heals to full at the end of your turn.' },
  pierce: { label: 'Pierce', icon: '🏹', tip: 'Excess attack damage hits the enemy hero.' },
  spellshield: { label: 'Spellshield', icon: '✨', tip: 'Negates the first enemy effect that targets it.' },
  venom: { label: 'Venom', icon: '🐍', tip: 'Any combat damage it deals to a unit destroys that unit.' },
  flurry: { label: 'Flurry', icon: '🌀', tip: 'Can attack twice each turn.' },
  ambush: { label: 'Ambush', icon: '🗡️', tip: 'When attacking a unit it strikes first; a lethal blow prevents retaliation.' },
  momentum: { label: 'Momentum', icon: '📈', tip: 'After destroying a unit in combat, it permanently gains +1/+1.' },
  vanish: { label: 'Vanish', icon: '💨', tip: 'Re-gains Stealth at the end of your turn.' },
};
