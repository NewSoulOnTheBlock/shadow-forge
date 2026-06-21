import type { CardDef } from './types';

// =============================================================================
// SHADOW FORGE — GENESIS SET
// 150 collectible cards, 30 per clan, plus supporting tokens.
//   Oni (strength) · Sage (wisdom) · Shadow (agility) · Shrine (heart) · Trapmaster (intellect)
// Keywords (Genesis): guard, haste, stealth, lifesteal, flight, wither, regenerate,
//   pierce, spellshield, venom, flurry, ambush, momentum, vanish.
// ids are stable identifiers referenced by decks + saved state — never reuse/rename.
// =============================================================================

// --- Tokens (created by effects, never in a deck) ---
const TOKENS: CardDef[] = [
  { id: 'tok_wisp', name: 'Shadow Clone', type: 'unit', prism: 'agility', cost: 1, attack: 1, health: 1, text: '', art: '🌫️', token: true },
  { id: 'tok_golem', name: 'Clay Sentinel', type: 'unit', prism: 'intellect', cost: 2, attack: 2, health: 2, text: '', art: '🗿', token: true },
  { id: 'tok_sapling', name: 'Bamboo Shoot', type: 'unit', prism: 'heart', cost: 1, attack: 0, health: 2, keywords: ['guard'], text: 'Guard', art: '🎋', token: true },
  { id: 'tok_oni', name: 'Oni Spirit', type: 'unit', prism: 'strength', cost: 3, attack: 3, health: 3, text: '', art: '👺', token: true },
  { id: 'tok_shuriken', name: 'Spinning Shuriken', type: 'unit', prism: 'agility', cost: 1, attack: 1, health: 1, keywords: ['haste'], text: 'Haste', art: '🌟', token: true },
  { id: 'tok_spirit', name: 'Fox Spirit', type: 'unit', prism: 'heart', cost: 2, attack: 2, health: 2, text: '', art: '🦊', token: true },
  { id: 'tok_kage', name: 'Shadow Wraith', type: 'unit', prism: 'agility', cost: 2, attack: 2, health: 1, keywords: ['stealth'], text: 'Stealth', art: '👤', token: true },
];

// === ONI CLAN — Strength: brute force, momentum, pierce, wither, buffs =======
const STRENGTH: CardDef[] = [
  { id: 'str_recruit', name: 'Foot Ninja', type: 'unit', prism: 'strength', cost: 1, attack: 2, health: 1, text: '', art: '🗡️' },
  { id: 'str_initiate', name: 'Dojo Initiate', type: 'unit', prism: 'strength', cost: 1, attack: 1, health: 2, keywords: ['guard'], text: 'Guard', art: '🥋' },
  { id: 'str_warhound', name: 'War Hound', type: 'unit', prism: 'strength', cost: 2, attack: 2, health: 1, keywords: ['haste'], text: 'Haste', art: '🐕' },
  { id: 'str_berserker', name: 'Blade Fury', type: 'unit', prism: 'strength', cost: 2, attack: 3, health: 2, text: '', art: '🪓' },
  { id: 'str_brawler', name: 'Pit Brawler', type: 'unit', prism: 'strength', cost: 2, attack: 2, health: 2, keywords: ['momentum'], rarity: 'rare', text: 'Momentum', art: '🥊' },
  { id: 'str_wolf', name: 'Shadow Hound', type: 'unit', prism: 'strength', cost: 3, attack: 3, health: 2, keywords: ['wither'], text: 'Wither', art: '🐺' },
  { id: 'str_ronin', name: 'Wandering Ronin', type: 'unit', prism: 'strength', cost: 3, attack: 4, health: 2, text: '', art: '🧖' },
  { id: 'str_oniblade', name: 'Oni Blademaster', type: 'unit', prism: 'strength', cost: 3, attack: 3, health: 3, keywords: ['momentum'], rarity: 'rare', text: 'Momentum', art: '⚔️' },
  { id: 'str_breaker', name: 'Gate Breaker', type: 'unit', prism: 'strength', cost: 4, attack: 4, health: 3, keywords: ['pierce'], rarity: 'rare', text: 'Pierce', art: '🔨' },
  { id: 'str_warlord', name: 'Clan Warlord', type: 'unit', prism: 'strength', cost: 4, attack: 4, health: 4, rarity: 'rare', text: 'Battlecry: give your other units +1/+0.', art: '🎌', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 1, hp: 0 }] },
  { id: 'str_sentinel', name: 'Stone Sentinel', type: 'unit', prism: 'strength', cost: 4, attack: 2, health: 6, keywords: ['guard'], text: 'Guard', art: '🗿' },
  { id: 'str_marauder', name: 'Mountain Marauder', type: 'unit', prism: 'strength', cost: 5, attack: 5, health: 4, keywords: ['wither'], rarity: 'rare', text: 'Wither', art: '⛏️' },
  { id: 'str_ogre', name: 'Oni Brute', type: 'unit', prism: 'strength', cost: 5, attack: 6, health: 5, keywords: ['guard'], text: 'Guard', art: '👹' },
  { id: 'str_executioner', name: 'Oni Executioner', type: 'unit', prism: 'strength', cost: 5, attack: 4, health: 4, rarity: 'epic', text: 'Battlecry: deal 3 damage to an enemy unit.', art: '🪦', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }] },
  { id: 'str_champion', name: 'Samurai Champion', type: 'unit', prism: 'strength', cost: 6, attack: 5, health: 5, keywords: ['guard'], rarity: 'rare', text: 'Guard', art: '🛡️' },
  { id: 'str_juggernaut', name: 'Iron Juggernaut', type: 'unit', prism: 'strength', cost: 6, attack: 6, health: 6, keywords: ['guard'], text: 'Guard', art: '🐲' },
  { id: 'str_avatar', name: 'Avatar of War', type: 'unit', prism: 'strength', cost: 6, attack: 5, health: 5, keywords: ['flurry'], rarity: 'legendary', text: 'Flurry', art: '🔱' },
  { id: 'str_titan', name: 'Stone Oni', type: 'unit', prism: 'strength', cost: 7, attack: 8, health: 8, keywords: ['pierce'], rarity: 'legendary', text: 'Pierce', art: '🏔️' },
  { id: 'str_warbringer', name: 'Warbringer', type: 'unit', prism: 'strength', cost: 7, attack: 7, health: 6, keywords: ['momentum'], rarity: 'rare', text: 'Momentum. Battlecry: give your other units +1/+1.', art: '🎺', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 1, hp: 1 }] },
  { id: 'str_demon', name: 'Demon General', type: 'unit', prism: 'strength', cost: 8, attack: 8, health: 8, rarity: 'epic', text: 'Battlecry: give your other units +2/+2.', art: '😈', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 2, hp: 2 }] },
  { id: 'str_rage', name: 'Blood Fury', type: 'spell', prism: 'strength', cost: 1, text: 'Give a friendly unit +2/+1 and Haste.', art: '🔥', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 2, hp: 1 }, { kind: 'grant', target: 'chosen', keyword: 'haste' }] },
  { id: 'str_berserk', name: 'Reckless Charge', type: 'spell', prism: 'strength', cost: 1, text: 'Give a friendly unit +2/+2.', art: '💢', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 2, hp: 2 }] },
  { id: 'str_smash', name: 'Iron Crush', type: 'spell', prism: 'strength', cost: 2, text: 'Deal 4 damage to a unit.', art: '💥', requiresTarget: 'any-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 4 }] },
  { id: 'str_bloodrage', name: 'Bloodrage', type: 'spell', prism: 'strength', cost: 2, rarity: 'rare', text: 'Give a friendly unit +3/+0 and Momentum.', art: '🩸', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 3, hp: 0 }, { kind: 'grant', target: 'chosen', keyword: 'momentum' }] },
  { id: 'str_challenge', name: 'War Banner', type: 'spell', prism: 'strength', cost: 2, text: 'Give a friendly unit +1/+2.', art: '🚩', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 1, hp: 2 }] },
  { id: 'str_warcry', name: 'War Drums', type: 'spell', prism: 'strength', cost: 3, rarity: 'rare', text: 'Give your units +1/+1.', art: '🥁', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 1, hp: 1 }] },
  { id: 'str_cleave', name: 'Cleaving Strike', type: 'spell', prism: 'strength', cost: 3, rarity: 'epic', text: 'Deal 5 damage to a unit.', art: '🌋', requiresTarget: 'any-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 5 }] },
  { id: 'str_warpath', name: 'Warpath', type: 'spell', prism: 'strength', cost: 4, rarity: 'rare', text: 'Give your units +2/+0 and Haste.', art: '🐾', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 2, hp: 0 }, { kind: 'grant', target: 'all-ally-units', keyword: 'haste' }] },
  { id: 'str_onislam', name: 'Oni Slam', type: 'spell', prism: 'strength', cost: 4, rarity: 'epic', text: 'Deal 6 damage to a unit.', art: '☄️', requiresTarget: 'any-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 6 }] },
  { id: 'str_summon_oni', name: 'Summon Oni', type: 'spell', prism: 'strength', cost: 5, rarity: 'rare', text: 'Summon two 3/3 Oni Spirits.', art: '🔺', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_oni', count: 2 }] },
];

// === SAGE CLAN — Wisdom: card draw, spell damage, area control =============
const WISDOM: CardDef[] = [
  { id: 'wis_scholar', name: 'Scroll Apprentice', type: 'unit', prism: 'wisdom', cost: 1, attack: 1, health: 2, text: 'Battlecry: draw a card.', art: '📜', onPlay: [{ kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_acolyte', name: 'Ink Acolyte', type: 'unit', prism: 'wisdom', cost: 1, attack: 2, health: 1, keywords: ['guard'], text: 'Guard', art: '🖌️' },
  { id: 'wis_sage', name: 'Owl Sensei', type: 'unit', prism: 'wisdom', cost: 2, attack: 2, health: 2, keywords: ['guard'], text: 'Guard', art: '🦉' },
  { id: 'wis_diviner', name: 'Star Diviner', type: 'unit', prism: 'wisdom', cost: 2, attack: 1, health: 3, rarity: 'rare', text: 'Battlecry: draw a card.', art: '🌟', onPlay: [{ kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_mystic', name: 'Storm Mystic', type: 'unit', prism: 'wisdom', cost: 3, attack: 3, health: 2, text: 'Battlecry: deal 1 damage to any target.', art: '🌩️', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 1 }] },
  { id: 'wis_oracle', name: 'Fortune Seer', type: 'unit', prism: 'wisdom', cost: 3, attack: 2, health: 3, text: 'Battlecry: draw a card.', art: '🔮', onPlay: [{ kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_mirror', name: 'Mirror Image', type: 'unit', prism: 'wisdom', cost: 4, attack: 3, health: 4, keywords: ['spellshield'], text: 'Spellshield', art: '🪞' },
  { id: 'wis_warden', name: 'Rune Warden', type: 'unit', prism: 'wisdom', cost: 4, attack: 2, health: 5, keywords: ['guard'], text: 'Guard', art: '🪧' },
  { id: 'wis_seer2', name: 'Tea House Seer', type: 'unit', prism: 'wisdom', cost: 4, attack: 3, health: 3, rarity: 'rare', text: 'Battlecry: draw a card.', art: '🍵', onPlay: [{ kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_familiar', name: 'Paper Crane', type: 'unit', prism: 'wisdom', cost: 2, attack: 1, health: 1, keywords: ['flight'], text: 'Flight. Battlecry: draw a card.', art: '🕊️', onPlay: [{ kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_stormcaller', name: 'Storm Caller', type: 'unit', prism: 'wisdom', cost: 5, attack: 3, health: 5, rarity: 'rare', text: 'Battlecry: deal 2 damage to all enemy units.', art: '⛈️', onPlay: [{ kind: 'damage', target: 'all-enemy-units', amount: 2 }] },
  { id: 'wis_archmage', name: 'Genjutsu Master', type: 'unit', prism: 'wisdom', cost: 5, attack: 4, health: 4, rarity: 'rare', text: 'Battlecry: draw 2 cards.', art: '🧙', onPlay: [{ kind: 'draw', target: 'none', amount: 2 }] },
  { id: 'wis_timebender', name: 'Time Weaver', type: 'unit', prism: 'wisdom', cost: 6, attack: 4, health: 5, rarity: 'rare', text: 'Battlecry: draw 2 cards.', art: '⏳', onPlay: [{ kind: 'draw', target: 'none', amount: 2 }] },
  { id: 'wis_elder', name: 'Elder Sage', type: 'unit', prism: 'wisdom', cost: 6, attack: 5, health: 5, keywords: ['spellshield'], rarity: 'epic', text: 'Spellshield. Battlecry: deal 3 damage to any target.', art: '🧓', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }] },
  { id: 'wis_kitsune', name: 'Nine-Tail Kitsune', type: 'unit', prism: 'wisdom', cost: 7, attack: 6, health: 6, rarity: 'legendary', text: 'Battlecry: deal 3 damage to all enemy units.', art: '🦊', onPlay: [{ kind: 'damage', target: 'all-enemy-units', amount: 3 }] },
  { id: 'wis_celestial', name: 'Celestial Dragon', type: 'unit', prism: 'wisdom', cost: 8, attack: 7, health: 7, rarity: 'legendary', text: 'Battlecry: deal 4 damage to any target and draw a card.', art: '🐉', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 4 }, { kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_bolt', name: 'Lightning Seal', type: 'spell', prism: 'wisdom', cost: 1, text: 'Deal 2 damage to any target.', art: '⚡', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 2 }] },
  { id: 'wis_spark', name: 'Spirit Spark', type: 'spell', prism: 'wisdom', cost: 1, text: 'Deal 1 damage to any target. Draw a card.', art: '✨', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 1 }, { kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_insight', name: 'Forbidden Scroll', type: 'spell', prism: 'wisdom', cost: 2, text: 'Draw 2 cards.', art: '📖', onPlay: [{ kind: 'draw', target: 'none', amount: 2 }] },
  { id: 'wis_frost', name: 'Binding Talisman', type: 'spell', prism: 'wisdom', cost: 2, text: 'Deal 3 damage to an enemy unit.', art: '🧿', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }] },
  { id: 'wis_zap', name: 'Static Jolt', type: 'spell', prism: 'wisdom', cost: 2, text: 'Deal 3 damage to any target.', art: '🔌', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }] },
  { id: 'wis_recall', name: 'Recall Scroll', type: 'spell', prism: 'wisdom', cost: 2, text: 'Deal 1 damage to any target. Draw 2 cards.', art: '📃', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 1 }, { kind: 'draw', target: 'none', amount: 2 }] },
  { id: 'wis_chain', name: 'Chain Lightning', type: 'spell', prism: 'wisdom', cost: 3, rarity: 'rare', text: 'Deal 2 damage to all enemy units.', art: '🌐', onPlay: [{ kind: 'damage', target: 'all-enemy-units', amount: 2 }] },
  { id: 'wis_scry', name: 'Far Sight', type: 'spell', prism: 'wisdom', cost: 3, rarity: 'rare', text: 'Draw 3 cards.', art: '👁️', onPlay: [{ kind: 'draw', target: 'none', amount: 3 }] },
  { id: 'wis_blast', name: 'Mind Snare', type: 'spell', prism: 'wisdom', cost: 4, text: 'Deal 3 damage to any target. Draw a card.', art: '🌀', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }, { kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_squall', name: 'Howling Squall', type: 'spell', prism: 'wisdom', cost: 4, text: 'Deal 1 damage to all units. Draw a card.', art: '🍃', onPlay: [{ kind: 'damage', target: 'all-units', amount: 1 }, { kind: 'draw', target: 'none', amount: 1 }] },
  { id: 'wis_purge', name: 'Spirit Purge', type: 'spell', prism: 'wisdom', cost: 4, rarity: 'epic', text: 'Destroy an enemy unit.', art: '🕯️', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'destroy', target: 'chosen' }] },
  { id: 'wis_meteor', name: 'Fire Storm Jutsu', type: 'spell', prism: 'wisdom', cost: 5, rarity: 'epic', text: 'Deal 3 damage to all enemy units.', art: '☄️', onPlay: [{ kind: 'damage', target: 'all-enemy-units', amount: 3 }] },
  { id: 'wis_judgment', name: "Heaven's Judgment", type: 'spell', prism: 'wisdom', cost: 5, rarity: 'rare', text: 'Deal 5 damage to any target.', art: '🌠', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 5 }] },
  { id: 'wis_nova', name: 'Arcane Nova', type: 'spell', prism: 'wisdom', cost: 6, rarity: 'epic', text: 'Deal 4 damage to all enemy units.', art: '💫', onPlay: [{ kind: 'damage', target: 'all-enemy-units', amount: 4 }] },
];

// === SHADOW CLAN — Agility: haste, stealth, ambush, venom, flurry, vanish ===
const AGILITY: CardDef[] = [
  { id: 'agi_scout', name: 'Shadow Scout', type: 'unit', prism: 'agility', cost: 1, attack: 1, health: 1, keywords: ['haste'], text: 'Haste', art: '🏃' },
  { id: 'agi_genin', name: 'Genin Trainee', type: 'unit', prism: 'agility', cost: 1, attack: 1, health: 2, keywords: ['stealth'], text: 'Stealth', art: '🌑' },
  { id: 'agi_rogue', name: 'Smoke Ninja', type: 'unit', prism: 'agility', cost: 2, attack: 2, health: 1, keywords: ['stealth'], text: 'Stealth', art: '💨' },
  { id: 'agi_duelist', name: 'Twin-Blade Ninja', type: 'unit', prism: 'agility', cost: 2, attack: 2, health: 2, keywords: ['haste'], text: 'Haste', art: '⚔️' },
  { id: 'agi_kunoichi', name: 'Kunoichi Initiate', type: 'unit', prism: 'agility', cost: 2, attack: 2, health: 2, keywords: ['ambush'], rarity: 'rare', text: 'Ambush', art: '🌸' },
  { id: 'agi_falcon', name: 'Hawk Rider', type: 'unit', prism: 'agility', cost: 3, attack: 2, health: 3, keywords: ['flight'], text: 'Flight', art: '🦅' },
  { id: 'agi_assassin', name: 'Silent Assassin', type: 'unit', prism: 'agility', cost: 3, attack: 3, health: 2, keywords: ['stealth'], rarity: 'rare', text: 'Stealth', art: '🥷' },
  { id: 'agi_venomdart', name: 'Venom Dancer', type: 'unit', prism: 'agility', cost: 3, attack: 2, health: 2, keywords: ['venom'], rarity: 'rare', text: 'Venom', art: '🐍' },
  { id: 'agi_shadowstep', name: 'Shadowstep Adept', type: 'unit', prism: 'agility', cost: 3, attack: 3, health: 3, keywords: ['vanish'], rarity: 'rare', text: 'Vanish', art: '🌫️' },
  { id: 'agi_falconer', name: 'Roof Runner', type: 'unit', prism: 'agility', cost: 3, attack: 3, health: 3, keywords: ['flight'], text: 'Flight', art: '🏯' },
  { id: 'agi_windblade', name: 'Wind Blade Kunoichi', type: 'unit', prism: 'agility', cost: 4, attack: 4, health: 3, keywords: ['haste'], rarity: 'rare', text: 'Haste', art: '🌪️' },
  { id: 'agi_nightblade', name: 'Nightblade', type: 'unit', prism: 'agility', cost: 4, attack: 3, health: 3, keywords: ['venom'], rarity: 'rare', text: 'Venom', art: '🌙' },
  { id: 'agi_swiftstrike', name: 'Swift Strike Ninja', type: 'unit', prism: 'agility', cost: 4, attack: 2, health: 3, keywords: ['flurry'], rarity: 'rare', text: 'Flurry', art: '💠' },
  { id: 'agi_phantom', name: 'Phantom Stalker', type: 'unit', prism: 'agility', cost: 5, attack: 5, health: 4, keywords: ['stealth'], rarity: 'rare', text: 'Stealth', art: '👤' },
  { id: 'agi_shadowmaster', name: 'Shadow Master', type: 'unit', prism: 'agility', cost: 5, attack: 4, health: 4, keywords: ['vanish'], rarity: 'epic', text: 'Vanish. Battlecry: summon a 2/1 Shadow Wraith.', art: '🎭', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_kage', count: 1 }] },
  { id: 'agi_reaper', name: 'Crimson Reaper', type: 'unit', prism: 'agility', cost: 6, attack: 5, health: 5, keywords: ['venom'], rarity: 'epic', text: 'Venom', art: '🔪' },
  { id: 'agi_tempest', name: 'Tempest Dancer', type: 'unit', prism: 'agility', cost: 6, attack: 4, health: 4, keywords: ['flurry'], rarity: 'epic', text: 'Flurry', art: '🍥' },
  { id: 'agi_master', name: 'Grandmaster Shinobi', type: 'unit', prism: 'agility', cost: 7, attack: 6, health: 6, keywords: ['ambush', 'flurry'], rarity: 'legendary', text: 'Ambush, Flurry', art: '🥷' },
  { id: 'agi_oyabun', name: 'Shadow Oyabun', type: 'unit', prism: 'agility', cost: 8, attack: 6, health: 6, rarity: 'legendary', text: 'Battlecry: summon two 2/1 Shadow Wraiths and give your units Stealth.', art: '🐯', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_kage', count: 2 }, { kind: 'grant', target: 'all-ally-units', keyword: 'stealth' }] },
  { id: 'agi_dash', name: 'Shunpo', type: 'spell', prism: 'agility', cost: 1, text: 'Give a friendly unit +1/+0 and Haste.', art: '💨', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 1, hp: 0 }, { kind: 'grant', target: 'chosen', keyword: 'haste' }] },
  { id: 'agi_smoke', name: 'Smoke Bomb', type: 'spell', prism: 'agility', cost: 1, text: 'Give a friendly unit Stealth.', art: '🌫️', requiresTarget: 'ally-unit', onPlay: [{ kind: 'grant', target: 'chosen', keyword: 'stealth' }] },
  { id: 'agi_ambush', name: 'Shuriken Strike', type: 'spell', prism: 'agility', cost: 2, text: 'Deal 3 damage to an enemy unit.', art: '🌟', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }] },
  { id: 'agi_poison', name: 'Poison Blade', type: 'spell', prism: 'agility', cost: 2, rarity: 'rare', text: 'Give a friendly unit +1/+0 and Venom.', art: '🧪', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 1, hp: 0 }, { kind: 'grant', target: 'chosen', keyword: 'venom' }] },
  { id: 'agi_backstab', name: 'Backstab', type: 'spell', prism: 'agility', cost: 2, text: 'Deal 4 damage to an enemy unit.', art: '🗡️', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 4 }] },
  { id: 'agi_vanishspell', name: 'Vanishing Act', type: 'spell', prism: 'agility', cost: 2, text: 'Give a friendly unit +1/+1 and Vanish.', art: '🎇', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 1, hp: 1 }, { kind: 'grant', target: 'chosen', keyword: 'vanish' }] },
  { id: 'agi_swarm', name: 'Shadow Clone Jutsu', type: 'spell', prism: 'agility', cost: 3, text: 'Summon two 1/1 Shadow Clones.', art: '👥', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_wisp', count: 2 }] },
  { id: 'agi_volley', name: 'Shuriken Volley', type: 'spell', prism: 'agility', cost: 3, rarity: 'rare', text: 'Summon two 1/1 Spinning Shurikens with Haste.', art: '🎯', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_shuriken', count: 2 }] },
  { id: 'agi_flurry', name: 'Blade Flurry', type: 'spell', prism: 'agility', cost: 3, rarity: 'rare', text: 'Give a friendly unit +1/+0 and Flurry.', art: '🌀', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 1, hp: 0 }, { kind: 'grant', target: 'chosen', keyword: 'flurry' }] },
  { id: 'agi_nightraid', name: 'Night Raid', type: 'spell', prism: 'agility', cost: 4, rarity: 'rare', text: 'Summon two 2/1 Shadow Wraiths.', art: '🌃', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_kage', count: 2 }] },
  { id: 'agi_decapitate', name: 'Decapitate', type: 'spell', prism: 'agility', cost: 4, rarity: 'epic', text: 'Destroy an enemy unit.', art: '☠️', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'destroy', target: 'chosen' }] },
];

// === SHRINE CLAN — Heart: healing, lifesteal, regenerate, guard, defense =====
const HEART: CardDef[] = [
  { id: 'hrt_medic', name: 'Healing Monk', type: 'unit', prism: 'heart', cost: 1, attack: 1, health: 2, text: 'Battlecry: restore 2 health to your hero.', art: '🧎', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 2 }] },
  { id: 'hrt_novice', name: 'Shrine Novice', type: 'unit', prism: 'heart', cost: 1, attack: 1, health: 1, keywords: ['lifesteal'], text: 'Lifesteal', art: '🕊️' },
  { id: 'hrt_pilgrim', name: 'Wandering Pilgrim', type: 'unit', prism: 'heart', cost: 2, attack: 2, health: 2, text: 'Battlecry: restore 2 health to your hero.', art: '🧳', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 2 }] },
  { id: 'hrt_cleric', name: 'Chi Channeler', type: 'unit', prism: 'heart', cost: 2, attack: 2, health: 3, keywords: ['lifesteal'], text: 'Lifesteal', art: '☯️' },
  { id: 'hrt_acolyte', name: 'Prayer Acolyte', type: 'unit', prism: 'heart', cost: 2, attack: 1, health: 4, keywords: ['guard'], text: 'Guard', art: '📿' },
  { id: 'hrt_guardian', name: 'Shrine Guardian', type: 'unit', prism: 'heart', cost: 3, attack: 2, health: 5, keywords: ['guard'], text: 'Guard', art: '⛩️' },
  { id: 'hrt_lifebloom', name: 'Blossom Sage', type: 'unit', prism: 'heart', cost: 3, attack: 2, health: 2, rarity: 'rare', text: 'Battlecry: give your units +0/+2.', art: '🌸', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 0, hp: 2 }] },
  { id: 'hrt_monkdef', name: 'Iron Palm Monk', type: 'unit', prism: 'heart', cost: 3, attack: 3, health: 3, keywords: ['regenerate'], rarity: 'rare', text: 'Regenerate', art: '✊' },
  { id: 'hrt_warden', name: 'Temple Warden', type: 'unit', prism: 'heart', cost: 4, attack: 3, health: 4, keywords: ['guard', 'lifesteal'], rarity: 'rare', text: 'Guard, Lifesteal', art: '🛡️' },
  { id: 'hrt_treant', name: 'Ancient Bonsai Spirit', type: 'unit', prism: 'heart', cost: 4, attack: 3, health: 6, keywords: ['guard', 'regenerate'], rarity: 'rare', text: 'Guard, Regenerate', art: '🌳' },
  { id: 'hrt_drummer', name: 'War Monk', type: 'unit', prism: 'heart', cost: 4, attack: 4, health: 4, keywords: ['lifesteal'], text: 'Lifesteal', art: '🥁' },
  { id: 'hrt_kirin', name: 'Sacred Kirin', type: 'unit', prism: 'heart', cost: 5, attack: 4, health: 4, keywords: ['lifesteal'], rarity: 'rare', text: 'Lifesteal. Battlecry: restore 3 health to your hero.', art: '🦄', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 3 }] },
  { id: 'hrt_phoenix', name: 'Phoenix Spirit', type: 'unit', prism: 'heart', cost: 5, attack: 4, health: 4, rarity: 'epic', text: 'Deathwish: restore 4 health to your hero.', art: '🐦‍🔥', onDeath: [{ kind: 'heal', target: 'ally-hero', amount: 4 }] },
  { id: 'hrt_protector', name: 'Mountain Protector', type: 'unit', prism: 'heart', cost: 5, attack: 2, health: 8, keywords: ['guard', 'regenerate'], rarity: 'epic', text: 'Guard, Regenerate', art: '🗻' },
  { id: 'hrt_celestguard', name: 'Celestial Guard', type: 'unit', prism: 'heart', cost: 5, attack: 3, health: 6, keywords: ['guard', 'lifesteal'], rarity: 'rare', text: 'Guard, Lifesteal', art: '🏮' },
  { id: 'hrt_spirit_fox', name: 'Nine Blessings Fox', type: 'unit', prism: 'heart', cost: 6, attack: 4, health: 5, rarity: 'epic', text: 'Battlecry: summon two 2/2 Fox Spirits.', art: '🦊', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_spirit', count: 2 }] },
  { id: 'hrt_angel', name: 'Celestial Tengu', type: 'unit', prism: 'heart', cost: 6, attack: 5, health: 5, keywords: ['lifesteal', 'flight'], rarity: 'legendary', text: 'Lifesteal, Flight', art: '👺' },
  { id: 'hrt_avatar', name: 'Avatar of Mercy', type: 'unit', prism: 'heart', cost: 7, attack: 5, health: 7, keywords: ['guard', 'lifesteal'], rarity: 'legendary', text: 'Guard, Lifesteal. Battlecry: restore 5 health to your hero.', art: '🌟', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 5 }] },
  { id: 'hrt_blessing', name: 'Shrine Blessing', type: 'spell', prism: 'heart', cost: 1, text: 'Restore 4 health to your hero.', art: '🙏', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 4 }] },
  { id: 'hrt_ward', name: 'Warding Charm', type: 'spell', prism: 'heart', cost: 1, text: 'Give a friendly unit +0/+3.', art: '🧧', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 0, hp: 3 }] },
  { id: 'hrt_mend', name: 'Chi Mend', type: 'spell', prism: 'heart', cost: 2, text: 'Give a friendly unit +0/+3 and Regenerate.', art: '🍃', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 0, hp: 3 }, { kind: 'grant', target: 'chosen', keyword: 'regenerate' }] },
  { id: 'hrt_prayer', name: 'Group Prayer', type: 'spell', prism: 'heart', cost: 2, text: 'Give your units +0/+2.', art: '🛐', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 0, hp: 2 }] },
  { id: 'hrt_lifelink', name: 'Spirit Bond', type: 'spell', prism: 'heart', cost: 2, rarity: 'rare', text: 'Give a friendly unit +1/+1 and Lifesteal.', art: '🔗', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 1, hp: 1 }, { kind: 'grant', target: 'chosen', keyword: 'lifesteal' }] },
  { id: 'hrt_barrier', name: 'Stone Barrier', type: 'spell', prism: 'heart', cost: 3, rarity: 'rare', text: 'Give a friendly unit +0/+4 and Guard.', art: '🧱', requiresTarget: 'ally-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: 0, hp: 4 }, { kind: 'grant', target: 'chosen', keyword: 'guard' }] },
  { id: 'hrt_grace', name: 'Divine Grace', type: 'spell', prism: 'heart', cost: 3, rarity: 'rare', text: 'Give your units +0/+3.', art: '🕊️', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 0, hp: 3 }] },
  { id: 'hrt_renewal', name: 'Spring Renewal', type: 'spell', prism: 'heart', cost: 3, rarity: 'rare', text: 'Restore 6 health to your hero.', art: '🌷', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 6 }] },
  { id: 'hrt_sanctuary', name: 'Sacred Sanctuary', type: 'spell', prism: 'heart', cost: 4, rarity: 'rare', text: 'Restore 3 health to your hero and give your units +0/+2.', art: '🏯', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 3 }, { kind: 'buff', target: 'all-ally-units', atk: 0, hp: 2 }] },
  { id: 'hrt_bulwark', name: 'Bulwark Chant', type: 'spell', prism: 'heart', cost: 4, rarity: 'epic', text: 'Give your units +0/+2 and Regenerate.', art: '📯', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 0, hp: 2 }, { kind: 'grant', target: 'all-ally-units', keyword: 'regenerate' }] },
  { id: 'hrt_revive', name: 'Spirit Revival', type: 'spell', prism: 'heart', cost: 5, rarity: 'rare', text: 'Summon two 2/2 Fox Spirits and restore 3 health to your hero.', art: '🪷', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_spirit', count: 2 }, { kind: 'heal', target: 'ally-hero', amount: 3 }] },
  { id: 'hrt_lastrites', name: 'Last Rites', type: 'spell', prism: 'heart', cost: 6, rarity: 'epic', text: 'Restore 8 health to your hero and give your units +0/+2.', art: '⚱️', onPlay: [{ kind: 'heal', target: 'ally-hero', amount: 8 }, { kind: 'buff', target: 'all-ally-units', atk: 0, hp: 2 }] },
];

// === TRAPMASTER CLAN — Intellect: removal, constructs/summons, debuffs ======
const INTELLECT: CardDef[] = [
  { id: 'int_drone', name: 'Scout Drone', type: 'unit', prism: 'intellect', cost: 1, attack: 1, health: 2, keywords: ['guard'], text: 'Guard', art: '🛸' },
  { id: 'int_mechhound', name: 'Mech Hound', type: 'unit', prism: 'intellect', cost: 2, attack: 3, health: 1, text: '', art: '🐕‍🦺' },
  { id: 'int_turret', name: 'Spike Trap', type: 'unit', prism: 'intellect', cost: 2, attack: 0, health: 4, keywords: ['guard'], text: 'Guard', art: '🪤' },
  { id: 'int_engineer', name: 'Trap Engineer', type: 'unit', prism: 'intellect', cost: 2, attack: 2, health: 2, rarity: 'rare', text: 'Battlecry: deal 1 damage to all enemy units.', art: '🛠️', onPlay: [{ kind: 'damage', target: 'all-enemy-units', amount: 1 }] },
  { id: 'int_tinkerer', name: 'Trap Tinkerer', type: 'unit', prism: 'intellect', cost: 3, attack: 1, health: 1, text: 'Battlecry: summon a 2/2 Clay Sentinel.', art: '🔧', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_golem', count: 1 }] },
  { id: 'int_saboteur', name: 'Bomb Saboteur', type: 'unit', prism: 'intellect', cost: 3, attack: 3, health: 3, text: 'Battlecry: deal 2 damage to an enemy unit.', art: '💣', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 2 }] },
  { id: 'int_spider', name: 'Trapdoor Spider', type: 'unit', prism: 'intellect', cost: 3, attack: 3, health: 2, keywords: ['venom'], rarity: 'rare', text: 'Venom', art: '🕷️' },
  { id: 'int_glider', name: 'Kite Glider', type: 'unit', prism: 'intellect', cost: 3, attack: 2, health: 3, keywords: ['flight'], text: 'Flight', art: '🪁' },
  { id: 'int_repairbot', name: 'Repair Bot', type: 'unit', prism: 'intellect', cost: 3, attack: 2, health: 3, rarity: 'rare', text: 'Battlecry: give your units +0/+2.', art: '🤲', onPlay: [{ kind: 'buff', target: 'all-ally-units', atk: 0, hp: 2 }] },
  { id: 'int_golemancer', name: 'Golem Crafter', type: 'unit', prism: 'intellect', cost: 4, attack: 2, health: 3, rarity: 'rare', text: 'Battlecry: summon a 2/2 Clay Sentinel.', art: '🪛', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_golem', count: 1 }] },
  { id: 'int_construct', name: 'Iron Sentinel', type: 'unit', prism: 'intellect', cost: 4, attack: 3, health: 5, keywords: ['guard'], text: 'Guard', art: '🤖' },
  { id: 'int_warden', name: 'Iron Warden', type: 'unit', prism: 'intellect', cost: 4, attack: 2, health: 6, keywords: ['guard'], text: 'Guard', art: '🚧' },
  { id: 'int_summoner', name: 'Puppet Master', type: 'unit', prism: 'intellect', cost: 5, attack: 3, health: 3, rarity: 'rare', text: 'Battlecry: summon two 2/2 Clay Sentinels.', art: '🎎', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_golem', count: 2 }] },
  { id: 'int_disruptor', name: 'Mind Disruptor', type: 'unit', prism: 'intellect', cost: 5, attack: 4, health: 4, rarity: 'rare', text: 'Battlecry: give an enemy unit -3 Attack.', art: '🧠', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: -3, hp: 0 }] },
  { id: 'int_siege', name: 'Siege Engine', type: 'unit', prism: 'intellect', cost: 5, attack: 5, health: 5, rarity: 'epic', text: 'Battlecry: deal 3 damage to any target.', art: '🏹', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }] },
  { id: 'int_sentinel2', name: 'Guardian Construct', type: 'unit', prism: 'intellect', cost: 6, attack: 5, health: 7, keywords: ['guard'], rarity: 'epic', text: 'Guard', art: '🗼' },
  { id: 'int_assembler', name: 'Mech Assembler', type: 'unit', prism: 'intellect', cost: 6, attack: 4, health: 4, rarity: 'epic', text: 'Battlecry: summon two 2/2 Clay Sentinels and give your units +1/+0.', art: '🏭', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_golem', count: 2 }, { kind: 'buff', target: 'all-ally-units', atk: 1, hp: 0 }] },
  { id: 'int_colossus', name: 'War Automaton', type: 'unit', prism: 'intellect', cost: 7, attack: 7, health: 7, keywords: ['guard'], rarity: 'legendary', text: 'Guard', art: '⚙️' },
  { id: 'int_overlord', name: 'Clockwork Overlord', type: 'unit', prism: 'intellect', cost: 8, attack: 7, health: 8, rarity: 'legendary', text: 'Battlecry: summon two 2/2 Clay Sentinels.', art: '👑', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_golem', count: 2 }] },
  { id: 'int_disrupt', name: 'Caltrops', type: 'spell', prism: 'intellect', cost: 1, text: 'Give an enemy unit -2 Attack.', art: '🪡', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: -2, hp: 0 }] },
  { id: 'int_trapline', name: 'Tripwire', type: 'spell', prism: 'intellect', cost: 1, text: 'Deal 2 damage to an enemy unit.', art: '➰', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'damage', target: 'chosen', amount: 2 }] },
  { id: 'int_overload', name: 'Explosive Tags', type: 'spell', prism: 'intellect', cost: 2, text: 'Deal 1 damage to all units.', art: '🧨', onPlay: [{ kind: 'damage', target: 'all-units', amount: 1 }] },
  { id: 'int_snare', name: 'Wire Snare', type: 'spell', prism: 'intellect', cost: 2, rarity: 'rare', text: 'Give an enemy unit -3 Attack.', art: '🕸️', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'buff', target: 'chosen', atk: -3, hp: 0 }] },
  { id: 'int_blast', name: 'Flash Bomb', type: 'spell', prism: 'intellect', cost: 3, text: 'Deal 3 damage to any target.', art: '🎆', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 3 }] },
  { id: 'int_reinforce', name: 'Reinforce', type: 'spell', prism: 'intellect', cost: 3, rarity: 'rare', text: 'Summon two 2/2 Clay Sentinels.', art: '🔩', onPlay: [{ kind: 'summon', target: 'none', token: 'tok_golem', count: 2 }] },
  { id: 'int_emp', name: 'EMP Burst', type: 'spell', prism: 'intellect', cost: 3, rarity: 'rare', text: 'Give all enemy units -2 Attack.', art: '📡', onPlay: [{ kind: 'buff', target: 'all-enemy-units', atk: -2, hp: 0 }] },
  { id: 'int_minefield', name: 'Minefield', type: 'spell', prism: 'intellect', cost: 4, rarity: 'rare', text: 'Deal 2 damage to all enemy units.', art: '💢', onPlay: [{ kind: 'damage', target: 'all-enemy-units', amount: 2 }] },
  { id: 'int_hex', name: 'Poison Dart', type: 'spell', prism: 'intellect', cost: 4, rarity: 'epic', text: 'Destroy an enemy unit.', art: '☠️', requiresTarget: 'enemy-unit', onPlay: [{ kind: 'destroy', target: 'chosen' }] },
  { id: 'int_detonate', name: 'Detonate', type: 'spell', prism: 'intellect', cost: 4, text: 'Deal 5 damage to any target.', art: '🔥', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 5 }] },
  { id: 'int_nuke', name: 'Orbital Strike', type: 'spell', prism: 'intellect', cost: 6, rarity: 'epic', text: 'Deal 5 damage to any target.', art: '🛰️', requiresTarget: 'enemy-any', onPlay: [{ kind: 'damage', target: 'chosen', amount: 5 }] },
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
