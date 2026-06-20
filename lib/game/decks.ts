import type { Prism } from './types';
import { RULES } from './types';
import { CARD_BY_ID } from './cards';

export interface DeckPreset {
  name: string;
  prisms: Prism[];
  cards: string[];
}

export const STARTER_DECKS: DeckPreset[] = [
  {
    name: 'Shadow Blade Clan',
    prisms: ['strength', 'agility'],
    cards: [
      'str_recruit', 'str_berserker', 'str_wolf', 'str_warlord', 'str_champion', 'str_ogre', 'str_smash', 'str_rage',
      'agi_scout', 'agi_rogue', 'agi_duelist', 'agi_falcon', 'agi_assassin', 'agi_windblade', 'agi_dash', 'agi_ambush',
    ],
  },
  {
    name: 'Scroll & Trap Clan',
    prisms: ['wisdom', 'intellect'],
    cards: [
      'wis_scholar', 'wis_sage', 'wis_oracle', 'wis_mirror', 'wis_archmage', 'wis_bolt', 'wis_insight', 'wis_meteor',
      'int_turret', 'int_tinkerer', 'int_saboteur', 'int_construct', 'int_summoner', 'int_disrupt', 'int_overload', 'int_hex',
    ],
  },
  {
    name: 'Shrine Warrior Clan',
    prisms: ['heart', 'strength'],
    cards: [
      'hrt_medic', 'hrt_cleric', 'hrt_guardian', 'hrt_lifebloom', 'hrt_treant', 'hrt_phoenix', 'hrt_angel', 'hrt_blessing',
      'str_recruit', 'str_berserker', 'str_warlord', 'str_champion', 'str_ogre', 'str_titan', 'str_smash', 'str_warcry',
    ],
  },
];

export const DEFAULT_DECK = STARTER_DECKS[0];

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
