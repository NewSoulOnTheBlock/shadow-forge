import type { Prism } from './types';
import { RULES } from './types';
import { CARD_BY_ID } from './cards';

export interface DeckPreset {
  name: string;
  prisms: Prism[];
  cards: string[];
  heroId?: string;
}

export const STARTER_DECKS: DeckPreset[] = [
  {
    name: 'Stormwind Flight',
    heroId: 'skyweaver',
    prisms: ['agility', 'wisdom'],
    cards: [
      'agi_scout', 'agi_genin', 'agi_kunoichi', 'agi_falcon', 'agi_falconer', 'agi_windblade',
      'agi_swiftstrike', 'agi_tempest', 'agi_master', 'agi_dash', 'agi_flurry',
      'wis_acolyte', 'wis_diviner', 'wis_oracle', 'wis_stormcaller', 'wis_insight', 'wis_scry', 'wis_squall',
    ],
  },
  {
    name: 'Gatebreaker Horde',
    heroId: 'oni_warlord',
    prisms: ['strength', 'agility'],
    cards: [
      'str_recruit', 'str_initiate', 'str_berserker', 'str_brawler', 'str_warhound', 'str_oniblade',
      'str_ronin', 'str_breaker', 'str_warlord', 'str_ogre', 'str_champion',
      'str_rage', 'str_smash', 'str_cleave', 'str_warcry', 'str_onislam', 'agi_scout', 'agi_rogue',
    ],
  },
  {
    name: 'Eternal Archive',
    heroId: 'sage',
    prisms: ['wisdom', 'intellect'],
    cards: [
      'wis_scholar', 'wis_acolyte', 'wis_familiar', 'wis_sage', 'wis_oracle', 'wis_mirror',
      'wis_archmage', 'wis_elder', 'wis_celestial', 'wis_insight', 'wis_scry', 'wis_meteor', 'wis_nova',
      'int_drone', 'int_turret', 'int_construct', 'int_summoner', 'int_hex',
    ],
  },
  {
    name: 'Silent Ambush',
    heroId: 'shadow_ninja',
    prisms: ['agility', 'intellect'],
    cards: [
      'agi_genin', 'agi_scout', 'agi_rogue', 'agi_kunoichi', 'agi_assassin', 'agi_shadowstep',
      'agi_venomdart', 'agi_nightblade', 'agi_phantom', 'agi_reaper', 'agi_smoke', 'agi_ambush',
      'agi_backstab', 'agi_decapitate', 'int_saboteur', 'int_spider', 'int_snare', 'int_hex',
    ],
  },
  {
    name: 'Celestial Flame',
    heroId: 'dragon_monk',
    prisms: ['heart', 'strength'],
    cards: [
      'hrt_novice', 'hrt_medic', 'hrt_cleric', 'hrt_guardian', 'hrt_lifebloom', 'hrt_treant',
      'hrt_phoenix', 'hrt_kirin', 'hrt_angel', 'hrt_avatar', 'hrt_mend', 'hrt_blessing',
      'hrt_renewal', 'hrt_revive', 'str_recruit', 'str_warlord', 'str_champion', 'str_titan',
    ],
  },
];

export const DEFAULT_DECK = STARTER_DECKS[0];

export const STARTER_DECK_BY_HERO: Record<string, DeckPreset> = Object.fromEntries(
  STARTER_DECKS.filter((d) => d.heroId).map((d) => [d.heroId as string, d]),
);

// Returns an error string, or null if the deck is legal.
export function validateDeck(cards: string[], prisms: Prism[]): string | null {
  if (prisms.length < 1 || prisms.length > RULES.maxPrisms)
    return `Choose 1 to ${RULES.maxPrisms} prisms.`;
  if (cards.length < RULES.minDeck) return `Deck needs at least ${RULES.minDeck} cards.`;
  if (cards.length > RULES.maxDeck) return `Deck can have at most ${RULES.maxDeck} cards.`;
  const seen = new Set<string>();
  for (const id of cards) {
    const def = CARD_BY_ID[id];
    if (!def) return `Unknown card: ${id}`;
    if (def.token) return `Tokens cannot be in a deck.`;
    if (seen.has(id)) return `Duplicate card: ${def.name} (decks are singleton).`;
    seen.add(id);
    if (!prisms.includes(def.prism))
      return `${def.name} is not in your chosen prisms.`;
  }
  return null;
}
