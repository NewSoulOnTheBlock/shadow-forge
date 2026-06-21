import type { Prism } from './types';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Hero {
  id: string;
  name: string;
  title: string;
  prism: Prism;
  /** Iconify glyph (game-icons set) used for the statue + badge. */
  glyph: string;
  /** Short emoji portrait stored as the account avatar. */
  avatar: string;
  /** Tailwind-friendly accent (hex) used across the ceremony + cards. */
  accent: string;
  difficulty: Difficulty;
  playstyle: string[];
  ability: { name: string; description: string };
  starterDeckTheme: string;
  /** Name of the seeded deck activated when this hero is chosen. */
  starterDeckName: string;
  campaignReward: string;
  masteryReward: string;
  lore: string;
}

export const HEROES: Hero[] = [
  {
    id: 'skyweaver',
    name: 'Skyweaver',
    title: 'Master of the Winds',
    prism: 'agility',
    glyph: 'game-icons:feathered-wing',
    avatar: '🌬️',
    accent: '#5ad1c8',
    difficulty: 'Medium',
    playstyle: ['Tempo', 'Mobility', 'Card Draw'],
    ability: {
      name: 'Wind Shift',
      description:
        'Once per turn, return one friendly unit to your hand and reduce its cost by 1.',
    },
    starterDeckTheme: 'Flying units · Fast attacks · Card advantage',
    starterDeckName: 'Stormwind Flight',
    campaignReward: 'Sky Temple Card Back',
    masteryReward: 'Legendary Wind Dragon',
    lore: 'Born on the highest peak of the Floating Monasteries, the Skyweaver learned to ride the storm before learning to walk. Her blade dances on the wind, never where her enemies expect.',
  },
  {
    id: 'oni_warlord',
    name: 'Oni Warlord',
    title: 'Breaker of Gates',
    prism: 'strength',
    glyph: 'game-icons:oni',
    avatar: '👹',
    accent: '#e0524a',
    difficulty: 'Easy',
    playstyle: ['Aggression', 'Combat', 'Direct Damage'],
    ability: {
      name: 'Blood Fury',
      description: 'Once per turn, a friendly unit gains +2 Attack and Haste.',
    },
    starterDeckTheme: 'Fast creatures · Direct damage · Pressure',
    starterDeckName: 'Gatebreaker Horde',
    campaignReward: 'Crimson Oni Avatar Frame',
    masteryReward: 'Legendary Blood Demon',
    lore: 'No wall has held against the Oni Warlord. Where he marches, gates splinter and banners fall. His fury is a fire that only victory can quench.',
  },
  {
    id: 'sage',
    name: 'Sage',
    title: 'Keeper of Wisdom',
    prism: 'wisdom',
    glyph: 'game-icons:scroll-unfurled',
    avatar: '📜',
    accent: '#5b8def',
    difficulty: 'Hard',
    playstyle: ['Control', 'Resource Generation', 'Value'],
    ability: {
      name: 'Ancient Insight',
      description: 'Draw a card, then discard a card.',
    },
    starterDeckTheme: 'Card draw · Control · Late game',
    starterDeckName: 'Eternal Archive',
    campaignReward: 'Sage Scroll Card Back',
    masteryReward: 'Legendary Ancient Scholar',
    lore: 'The Sage has read every scroll in the Forbidden Archive twice. He does not win battles — he ends them, having already foreseen each move his rival would make.',
  },
  {
    id: 'shadow_ninja',
    name: 'Shadow Ninja',
    title: 'The Silent Blade',
    prism: 'agility',
    glyph: 'game-icons:ninja-head',
    avatar: '🥷',
    accent: '#8b6dd6',
    difficulty: 'Medium',
    playstyle: ['Stealth', 'Assassination', 'Precision'],
    ability: {
      name: 'Shadow Step',
      description: 'A friendly unit gains Stealth until your next turn.',
    },
    starterDeckTheme: 'Stealth units · Removal · Ambush',
    starterDeckName: 'Silent Ambush',
    campaignReward: 'Shadow Clan Profile Banner',
    masteryReward: 'Legendary Phantom Assassin',
    lore: 'No one has seen the Silent Blade and lived to describe it. She is the held breath before the strike, the shadow that was never there.',
  },
  {
    id: 'dragon_monk',
    name: 'Dragon Monk',
    title: 'Voice of the Eternal Flame',
    prism: 'heart',
    glyph: 'game-icons:dragon-head',
    avatar: '🐉',
    accent: '#f0a429',
    difficulty: 'Easy',
    playstyle: ['Midrange', 'Healing', 'Powerful Finishers'],
    ability: {
      name: 'Dragon Spirit',
      description: 'Restore 2 Health to your Hero.',
    },
    starterDeckTheme: 'Healing · Strong units · Late-game dragons',
    starterDeckName: 'Celestial Flame',
    campaignReward: 'Dragon Flame Card Back',
    masteryReward: 'Legendary Celestial Dragon',
    lore: 'The Dragon Monk carries the Eternal Flame within his chest. He heals the wounded and razes the wicked with the same unbroken serenity.',
  },
];

export const HERO_BY_ID: Record<string, Hero> = Object.fromEntries(
  HEROES.map((h) => [h.id, h]),
);

export function getHero(id: string | null | undefined): Hero | undefined {
  return id ? HERO_BY_ID[id] : undefined;
}
