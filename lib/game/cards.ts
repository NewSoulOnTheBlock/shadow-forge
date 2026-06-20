import type { CardDef } from './types';

// Token units (created by effects, never in a deck).
const TOKENS: CardDef[] = [
  { id: 'tok_wisp', name: 'Shadow Clone', type: 'unit', prism: 'agility', cost: 1, attack: 1, health: 1, text: '', art: '🌫️', token: true },
  { id: 'tok_golem', name: 'Clay Sentinel', type: 'unit', prism: 'intellect', cost: 2, attack: 2, health: 2, text: '', art: '🗿', token: true },
  { id: 'tok_sapling', name: 'Bamboo Shoot', type: 'unit', prism: 'heart', cost: 1, attack: 0, health: 2, keywords: ['guard'], text: 'Guard', art: '🎋', token: true },
];

// --- Strength: Oni Clan — brute warriors, buffs, big bodies, wither ---
const STRENGTH: CardDef[] = [
  { id: 'str_recruit', name: 'Foot Ninja', type: 'unit', prism: 'strength', cost: 1, attack: 2, health: 1, text: '', art: '🗡️' },
  { id: 'str_berserker', name: 'Blade Fury', type: 'unit', prism: 'strength', cost: 2, attack: 3, health: 2, text: '', art: '🪓' },
  { id: 'str_wolf', name: 'Shadow Hound', type: 'unit', prism: 'strength', cost: 3, attack: 3, health: 2, keywords: ['wither'], text: 'Wither', art: '🐺' },
  { id: 'str_warlord', name: 'Clan Warlord', type: 'unit', prism: 'strength', cost: 4, attack: 4, health: 4, rarity: 'rare', text: 'Battlecry: give your other units +1/+0.', art: '🎌', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 1, hp: 0 }] },
  { id: 'str_champion', name: 'Samurai Champion', type: 'unit', prism: 'strength', cost: 6, attack: 5, health: 5, keywords: ['guard'], rarity: 'rare', text: 'Guard', art: '🛡️' },
  { id: 'str_ogre', name: 'Oni Brute', type: 'unit', prism: 'strength', cost: 5, attack: 6, health: 5, text: '', art: '👹' },
  { id: 'str_titan', name: 'Stone Oni', type: 'unit', prism: 'strength', cost: 7, attack: 8, health: 8, keywords: ['pierce'], rarity: 'legendary', text: 'Pierce', art: '🗿' },
  { id: 'str_smash', name: 'Iron Crush', type: 'spell', prism: 'strength', cost: 2, text: 'Deal 4 damage to a unit.', art: '💥', requiresTarget: 'any-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 4 }] },
  { id: 'str_rage', name: 'Blood Fury', type: 'spell', prism: 'strength', cost: 1, text: 'Give a friendly unit +2/+1 and Haste.', art: '🔥', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 2, hp: 1 }, { kind: 'grant', target: 'chosen', keyword: 'haste' }] },
  { id: 'str_warcry', name: 'War Drums', type: 'spell', prism: 'strength', cost: 3, rarity: 'rare', text: 'Give your units +1/+1.', art: '🥁', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 1, hp: 1 }] },
];

// --- Wisdom: Scroll Sages — card draw, genjutsu spell damage, manipulation ---
const WISDOM: CardDef[] = [
  { id: 'wis_scholar', name: 'Scroll Apprentice', type: 'unit', prism: 'wisdom', cost: 1, attack: 1, health: 2, text: 'Battlecry: draw a card.', art: '📜', onPlay: [{ kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_sage', name: 'Owl Sensei', type: 'unit', prism: 'wisdom', cost: 2, attack: 2, health: 2, text: '', art: '🦉' },
  { id: 'wis_oracle', name: 'Fortune Seer', type: 'unit', prism: 'wisdom', cost: 3, attack: 2, health: 3, text: 'Battlecry: draw a card.', art: '🔮', onPlay: [{ kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_mirror', name: 'Mirror Image', type: 'unit', prism: 'wisdom', cost: 4, attack: 3, health: 4, keywords: ['spellshield'], text: 'Spellshield', art: '🪞' },
  { id: 'wis_archmage', name: 'Genjutsu Master', type: 'unit', prism: 'wisdom', cost: 5, attack: 4, health: 4, rarity: 'rare', text: 'Battlecry: draw 2 cards.', art: '🧙', onPlay: [{ kind: 'draw', target: 'none', amount: 2 }] },
  { id: 'wis_bolt', name: 'Lightning Seal', type: 'spell', prism: 'wisdom', cost: 1, text: 'Deal 2 damage to any target.', art: '⚡', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 2 }] },
  { id: 'wis_insight', name: 'Forbidden Scroll', type: 'spell', prism: 'wisdom', cost: 2, text: 'Draw 2 cards.', art: '📖', onPlay: [{ kind: 'draw', target: 'none', amount: 2 }] },
  { id: 'wis_meteor', name: 'Fire Storm Jutsu', type: 'spell', prism: 'wisdom', cost: 5, rarity: 'epic', text: 'Deal 3 damage to all enemy units.', art: '☄️', onPlay: [{ kind: 'damage', target: 'all-enemy-units', amount: 3 }] },
  { id: 'wis_blast', name: 'Mind Snare', type: 'spell', prism: 'wisdom', cost: 4, text: 'Deal 3 damage to any target. Draw a card.', art: '🌀', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }, { kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_timebender', name: 'Time Weaver', type: 'unit', prism: 'wisdom', cost: 6, attack: 4, health: 5, rarity: 'rare', text: 'Battlecry: draw 2 cards.', art: '⏳', onPlay: [{ kind: 'draw', target: 'none', amount: 2 }] },
];

// --- Agility: Shadow Clan — cheap, haste, stealth, evasion ---
const AGILITY: CardDef[] = [
  { id: 'agi_scout', name: 'Shadow Scout', type: 'unit', prism: 'agility', cost: 1, attack: 1, health: 1, keywords: ['haste'], text: 'Haste', art: '🏃' },
  { id: 'agi_rogue', name: 'Smoke Ninja', type: 'unit', prism: 'agility', cost: 2, attack: 2, health: 1, keywords: ['stealth'], text: 'Stealth', art: '💨' },
  { id: 'agi_duelist', name: 'Twin-Blade Ninja', type: 'unit', prism: 'agility', cost: 2, attack: 2, health: 2, keywords: ['haste'], text: 'Haste', art: '⚔️' },
  { id: 'agi_falcon', name: 'Hawk Rider', type: 'unit', prism: 'agility', cost: 3, attack: 2, health: 3, keywords: ['flight'], text: 'Flight', art: '🦅' },
  { id: 'agi_assassin', name: 'Silent Assassin', type: 'unit', prism: 'agility', cost: 3, attack: 3, health: 2, keywords: ['stealth'], rarity: 'rare', text: 'Stealth', art: '🥷' },
  { id: 'agi_windblade', name: 'Wind Blade Kunoichi', type: 'unit', prism: 'agility', cost: 4, attack: 4, health: 3, keywords: ['haste'], rarity: 'rare', text: 'Haste', art: '🌪️' },
  { id: 'agi_phantom', name: 'Phantom Stalker', type: 'unit', prism: 'agility', cost: 5, attack: 5, health: 4, keywords: ['stealth'], rarity: 'rare', text: 'Stealth', art: '👤' },
  { id: 'agi_dash', name: 'Shunpo', type: 'spell', prism: 'agility', cost: 1, text: 'Give a friendly unit +1/+0 and Haste.', art: '💨', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 1, hp: 0 }, { kind: 'grant', target: 'chosen', keyword: 'haste' }] },
  { id: 'agi_swarm', name: 'Shadow Clone Jutsu', type: 'spell', prism: 'agility', cost: 3, text: 'Summon two 1/1 Shadow Clones.', art: '🌫️', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_wisp', count: 2 }] },
  { id: 'agi_ambush', name: 'Shuriken Strike', type: 'spell', prism: 'agility', cost: 2, text: 'Deal 3 damage to an enemy unit.', art: '🌟', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }] },
];

// --- Heart: Shrine Monks — healing, lifesteal, regenerate, guards ---
const HEART: CardDef[] = [
  { id: 'hrt_medic', name: 'Healing Monk', type: 'unit', prism: 'heart', cost: 1, attack: 1, health: 2, text: 'Battlecry: restore 2 health to your hero.', art: '🧎', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 2 }] },
  { id: 'hrt_cleric', name: 'Chi Channeler', type: 'unit', prism: 'heart', cost: 2, attack: 2, health: 3, keywords: ['lifesteal'], text: 'Lifesteal', art: '☯️' },
  { id: 'hrt_guardian', name: 'Shrine Guardian', type: 'unit', prism: 'heart', cost: 3, attack: 2, health: 5, keywords: ['guard'], text: 'Guard', art: '⛩️' },
  { id: 'hrt_lifebloom', name: 'Blossom Sage', type: 'unit', prism: 'heart', cost: 3, attack: 2, health: 2, rarity: 'rare', text: 'Battlecry: give your units +0/+2.', art: '🌸', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 0, hp: 2 }] },
  { id: 'hrt_treant', name: 'Ancient Bonsai Spirit', type: 'unit', prism: 'heart', cost: 4, attack: 3, health: 6, keywords: ['guard', 'regenerate'], rarity: 'rare', text: 'Guard, Regenerate', art: '🌳' },
  { id: 'hrt_phoenix', name: 'Phoenix Spirit', type: 'unit', prism: 'heart', cost: 5, attack: 4, health: 4, rarity: 'epic', text: 'Deathwish: restore 4 health to your hero.', art: '🐦‍🔥', onDeath: [{ kind: 'heal', target: 'ally-hero', amount: 4 }] },
  { id: 'hrt_angel', name: 'Celestial Tengu', type: 'unit', prism: 'heart', cost: 6, attack: 5, health: 5, keywords: ['lifesteal', 'flight'], rarity: 'legendary', text: 'Lifesteal, Flight', art: '👺' },
  { id: 'hrt_blessing', name: 'Shrine Blessing', type: 'spell', prism: 'heart', cost: 1, text: 'Restore 4 health to your hero.', art: '🙏', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 4 }] },
  { id: 'hrt_mend', name: 'Chi Mend', type: 'spell', prism: 'heart', cost: 2, text: 'Give a friendly unit +0/+3 and Regenerate.', art: '🍃', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 0, hp: 3 }, { kind: 'grant', target: 'chosen', keyword: 'regenerate' }] },
  { id: 'hrt_sanctuary', name: 'Sacred Sanctuary', type: 'spell', prism: 'heart', cost: 4, rarity: 'rare', text: 'Restore 3 health to your hero and give your units +0/+2.', art: '⛩️', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 3 }, { kind: 'buff', target: 'all-ally-units', atk: 0, hp: 2 }] },
];

// --- Intellect: Trapmasters — removal, summons, gadget control tricks ---
const INTELLECT: CardDef[] = [
  { id: 'int_turret', name: 'Spike Trap', type: 'unit', prism: 'intellect', cost: 2, attack: 0, health: 4, keywords: ['guard'], text: 'Guard', art: '🪤' },
  { id: 'int_tinkerer', name: 'Trap Tinkerer', type: 'unit', prism: 'intellect', cost: 3, attack: 1, health: 1, text: 'Battlecry: summon a 2/2 Clay Sentinel.', art: '🔧', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_golem', count: 1 }] },
  { id: 'int_saboteur', name: 'Bomb Saboteur', type: 'unit', prism: 'intellect', cost: 3, attack: 3, health: 3, text: 'Battlecry: deal 2 damage to an enemy unit.', art: '💣', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 2 }] },
  { id: 'int_construct', name: 'Iron Sentinel', type: 'unit', prism: 'intellect', cost: 4, attack: 3, health: 5, text: '', art: '🤖' },
  { id: 'int_summoner', name: 'Puppet Master', type: 'unit', prism: 'intellect', cost: 5, attack: 3, health: 3, rarity: 'rare', text: 'Battlecry: summon two 2/2 Clay Sentinels.', art: '🎎', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_golem', count: 2 }] },
  { id: 'int_colossus', name: 'War Automaton', type: 'unit', prism: 'intellect', cost: 7, attack: 7, health: 7, rarity: 'legendary', text: '', art: '⚙️' },
  { id: 'int_disrupt', name: 'Caltrops', type: 'spell', prism: 'intellect', cost: 1, text: 'Give an enemy unit -2 Attack.', art: '🪡', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: -2, hp: 0 }] },
  { id: 'int_overload', name: 'Explosive Tags', type: 'spell', prism: 'intellect', cost: 2, text: 'Deal 1 damage to all units.', art: '🧨', onPlay: [{ kind: 'damage', target: 'all-units', amount: 1 }] },
  { id: 'int_hex', name: 'Poison Dart', type: 'spell', prism: 'intellect', cost: 4, rarity: 'epic', text: 'Destroy an enemy unit.', art: '☠️', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'destroy', target: 'chosen' }] },
  { id: 'int_blast', name: 'Flash Bomb', type: 'spell', prism: 'intellect', cost: 3, text: 'Deal 3 damage to any target.', art: '🎆', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }] },
];

export const ALL_CARDS: CardDef[] = [
  ...TOKENS,
  ...STRENGTH,
  ...WISDOM,
  ...AGILITY,
  ...HEART,
  ...INTELLECT,
];

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(
  ALL_CARDS.map((c) => [c.id, c]),
);

// Cards selectable in the deckbuilder (no tokens).
export const COLLECTION: CardDef[] = ALL_CARDS.filter((c) => !c.token);

export function getCard(id: string): CardDef {
  const c = CARD_BY_ID[id];
  if (!c) throw new Error(`Unknown card id: ${id}`);
  return c;
}
