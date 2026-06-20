// Single-player campaign — "The Eight Hidden Trials".
// Eight story locations, each with a named boss who pilots a hand-built deck drawn
// from the 150-card Genesis Set, a distinct strategy, and in-depth lore.
//
// PLUG-IN POINT: persist `completed`/`unlocked` per user. Boss decks below are fed
// straight into the boardgame.io engine by /app/match/[id]/page.tsx via
// CAMPAIGN_ENCOUNTERS, so beating a node is a real match against that exact list.
import type { CampaignNode } from '@/lib/types';
import type { Prism } from '@/lib/game/types';

// A fully-specified opponent the match screen can drop into the engine.
export interface BossEncounter {
  id: string; // matches the CampaignNode id
  name: string; // the boss who pilots the deck
  avatar: string;
  deckName: string;
  prisms: Prism[];
  cards: string[]; // singleton decklist (validated against the engine rules)
  strategy: string;
}

// --- The eight boss decks (each validated: legal prisms, singleton, 15-25 cards) ---
export const CAMPAIGN_ENCOUNTERS: Record<string, BossEncounter> = {
  c1: {
    id: 'c1',
    name: 'Sensei Saru',
    avatar: '🐒',
    deckName: 'Way of the Open Palm',
    prisms: ['strength'],
    strategy:
      'Pure Oni aggression. Floods the board with cheap bodies, then closes the door with War Drums buffs and burn. Punishes a slow opening.',
    cards: [
      'str_recruit', 'str_initiate', 'str_warhound', 'str_berserker', 'str_brawler',
      'str_wolf', 'str_ronin', 'str_oniblade', 'str_warlord', 'str_sentinel',
      'str_ogre', 'str_rage', 'str_berserk', 'str_smash', 'str_challenge',
      'str_warcry', 'str_cleave', 'str_summon_oni',
    ],
  },
  c2: {
    id: 'c2',
    name: 'Whisperwind',
    avatar: '🦊',
    deckName: 'Bamboo Veil',
    prisms: ['agility'],
    strategy:
      'Shadow tempo. Stealthed and Haste threats trade up while Smoke Bomb hides the killer. Swarms with clones, then removes your blocker with Decapitate.',
    cards: [
      'agi_scout', 'agi_genin', 'agi_rogue', 'agi_duelist', 'agi_kunoichi',
      'agi_assassin', 'agi_falcon', 'agi_falconer', 'agi_windblade', 'agi_phantom',
      'agi_dash', 'agi_smoke', 'agi_ambush', 'agi_backstab', 'agi_swarm',
      'agi_volley', 'agi_nightraid', 'agi_decapitate',
    ],
  },
  c3: {
    id: 'c3',
    name: 'Master Fukurou',
    avatar: '🦉',
    deckName: 'Thousand Scrolls',
    prisms: ['wisdom'],
    strategy:
      'Sage spell control. Draws relentlessly, sweeps your board with Chain Lightning, Fire Storm and Arcane Nova, then ends it with the Nine-Tail Kitsune.',
    cards: [
      'wis_scholar', 'wis_acolyte', 'wis_bolt', 'wis_spark', 'wis_sage',
      'wis_diviner', 'wis_insight', 'wis_zap', 'wis_mystic', 'wis_oracle',
      'wis_chain', 'wis_scry', 'wis_mirror', 'wis_warden', 'wis_blast',
      'wis_meteor', 'wis_archmage', 'wis_judgment', 'wis_nova', 'wis_kitsune',
    ],
  },
  c4: {
    id: 'c4',
    name: 'Abbot Tetsu',
    avatar: '🧘',
    deckName: 'Iron Bodhi',
    prisms: ['heart', 'strength'],
    strategy:
      'Shrine attrition. Lifesteal walls and Regenerate Guards refuse to die while the Abbot out-heals your clock, then crushes the long game with heavy Oni bodies.',
    cards: [
      'hrt_medic', 'hrt_novice', 'hrt_cleric', 'hrt_acolyte', 'hrt_guardian',
      'hrt_monkdef', 'hrt_warden', 'hrt_treant', 'hrt_drummer', 'hrt_kirin',
      'hrt_protector', 'hrt_angel', 'hrt_avatar', 'hrt_blessing', 'hrt_prayer',
      'hrt_grace', 'str_sentinel', 'str_champion', 'str_juggernaut', 'str_smash',
    ],
  },
  c5: {
    id: 'c5',
    name: 'Engineer Kuro',
    avatar: '🤖',
    deckName: 'The Mechanism',
    prisms: ['intellect'],
    strategy:
      'Trapmaster value engine. Chokes your attacks with -Attack snares and Spike Traps, builds a wall of Clay Sentinels, then grinds you out with constructs.',
    cards: [
      'int_drone', 'int_disrupt', 'int_trapline', 'int_mechhound', 'int_turret',
      'int_engineer', 'int_overload', 'int_snare', 'int_tinkerer', 'int_saboteur',
      'int_spider', 'int_repairbot', 'int_reinforce', 'int_golemancer', 'int_construct',
      'int_minefield', 'int_summoner', 'int_siege', 'int_assembler', 'int_overlord',
    ],
  },
  c6: {
    id: 'c6',
    name: 'Warlord Goki',
    avatar: '👹',
    deckName: 'Crimson Onslaught',
    prisms: ['strength', 'agility'],
    strategy:
      'Momentum bruiser. Snowballs Pierce and Momentum threats that grow with every kill, accelerates them with Warpath, and overruns with Demon General buffs.',
    cards: [
      'str_warhound', 'str_brawler', 'str_oniblade', 'str_breaker', 'str_warlord',
      'str_marauder', 'str_ogre', 'str_avatar', 'str_titan', 'str_warbringer',
      'str_demon', 'str_bloodrage', 'str_warpath', 'str_onislam', 'agi_windblade',
      'agi_master', 'agi_reaper', 'agi_decapitate',
    ],
  },
  c7: {
    id: 'c7',
    name: 'The Oyabun',
    avatar: '🐍',
    deckName: 'Shadow Syndicate',
    prisms: ['agility', 'intellect'],
    strategy:
      'Venom control. Deathtouch dancers trade up against anything, EMP and Wire Snare defang your board, and Vanish threats become impossible to pin down.',
    cards: [
      'agi_genin', 'agi_kunoichi', 'agi_venomdart', 'agi_nightblade', 'agi_shadowstep',
      'agi_shadowmaster', 'agi_phantom', 'agi_reaper', 'agi_master', 'agi_oyabun',
      'agi_poison', 'agi_decapitate', 'int_disrupt', 'int_snare', 'int_spider',
      'int_emp', 'int_disruptor', 'int_hex', 'int_nuke', 'int_overlord',
    ],
  },
  c8: {
    id: 'c8',
    name: 'Forge Master Ryujin',
    avatar: '🐲',
    deckName: 'The Hidden Forge',
    prisms: ['wisdom', 'strength'],
    strategy:
      'Legendary midrange-control. Burns and draws through the early game, then lands an unbroken chain of legends — Celestial Dragon, Stone Oni, Avatar of War — that you cannot answer all at once.',
    cards: [
      'wis_spark', 'wis_bolt', 'wis_insight', 'wis_scry', 'wis_chain',
      'wis_archmage', 'wis_meteor', 'wis_judgment', 'wis_nova', 'wis_kitsune',
      'wis_celestial', 'wis_elder', 'wis_timebender', 'str_warlord', 'str_champion',
      'str_juggernaut', 'str_avatar', 'str_titan', 'str_demon', 'str_smash', 'str_cleave',
    ],
  },
};

export const CAMPAIGN: CampaignNode[] = [
  {
    id: 'c1',
    name: 'The Training Grounds',
    subtitle: 'Open Palm Dojo · Dawn',
    difficulty: 'beginner',
    opponentAvatar: '🐒',
    opponentName: 'Sensei Saru',
    deckName: 'Way of the Open Palm',
    description: 'Learn the way of the blade against the old monkey-sage, Sensei Saru.',
    strategy: CAMPAIGN_ENCOUNTERS.c1.strategy,
    story: [
      'Every shinobi of the Hidden Forge begins here, in a clearing of raked gravel and worn straw dummies, under the crooked pine where Sensei Saru has taught for sixty winters. He is small, grey-muzzled, and deceptively quick — the kind of master who lands three strikes before you finish a bow.',
      '"You came to forge a blade," he says, tossing you a wooden one instead. "But a blade is only as honest as the hand. Show me you can press an advantage, and I will let you leave this clearing."',
      'Saru fights the way he teaches: simple, fast, relentless. He throws Foot Ninja and War Hounds forward without hesitation and beats the War Drums to make them all hit harder. There is no trick here, only tempo — and the lesson that hesitation is its own kind of defeat.',
      'Beat the open palm, and the gate to the bamboo road opens behind him.',
    ],
    unlocked: true,
    completed: true,
    rewards: [{ id: 'r_c1', type: 'currency', label: '100 Shards', amount: 100, icon: '💠', claimed: true }],
    x: 9, y: 78, connects: ['c2'],
  },
  {
    id: 'c2',
    name: 'Bamboo Forest Veil',
    subtitle: 'The Whispering Groves · Dusk',
    difficulty: 'beginner',
    opponentAvatar: '🦊',
    opponentName: 'Whisperwind',
    deckName: 'Bamboo Veil',
    description: 'Something unseen stalks the green dark. It calls itself Whisperwind.',
    strategy: CAMPAIGN_ENCOUNTERS.c2.strategy,
    story: [
      'The road north climbs into a sea of bamboo so thick the sun arrives in coins. Travellers whisper of a fox-spirit in shinobi black who robs caravans without ever being seen — only the soft hiss of a smoke bomb and, afterward, an empty road.',
      'You find her by not finding her. A voice arrives from your blind side: "Most people walk through my forest. You walked into it. Brave. Or stupid. The fox always learns which."',
      'Whisperwind never trades fairly. She keeps her real threat Stealthed behind a smoke screen, lets your blockers swing at clones, and slips a Silent Assassin past your guard the instant you commit. When you finally corner something, she vanishes it and starts again.',
      'Learn to bait the veil before it closes — patience is the only lantern that works in these groves.',
    ],
    unlocked: true,
    completed: false,
    rewards: [{ id: 'r_c2', type: 'card', label: 'Rare Card', icon: '🎴', claimed: false }],
    x: 23, y: 56, connects: ['c3'],
  },
  {
    id: 'c3',
    name: 'The Floating Library',
    subtitle: 'Sky Pavilion of a Thousand Scrolls',
    difficulty: 'intermediate',
    opponentAvatar: '🦉',
    opponentName: 'Master Fukurou',
    deckName: 'Thousand Scrolls',
    description: 'A library that drifts above the cloud line, guarded by an owl who has read every jutsu ever written.',
    strategy: CAMPAIGN_ENCOUNTERS.c3.strategy,
    story: [
      'Beyond the bamboo, a stone stair ends in open air — and a pavilion of paper and lacquer floating on nothing, tethered to the mountain by a single silk thread. Inside, ten thousand scrolls turn their own pages in a wind you cannot feel.',
      'Master Fukurou does not look up from his reading. "The Forge gives power to hands," the owl murmurs. "I prefer to give it to minds. Every spell you might cast, I have already answered on page four hundred and nine. Shall we test the index?"',
      'Fukurou is a wall of knowledge. He draws two and three cards at a time, snipes your early board with sealing bolts, and when you finally build a threat he erases the whole row with Fire Storm or Arcane Nova. Run him out of answers and the Nine-Tail Kitsune is waiting on the last page.',
      'You cannot out-card the library. You must end the chapter before he reaches the ending he has already written.',
    ],
    unlocked: true,
    completed: false,
    rewards: [{ id: 'r_c3', type: 'pack', label: 'Card Pack', icon: '📦', claimed: false }],
    x: 36, y: 80, connects: ['c4'],
  },
  {
    id: 'c4',
    name: 'The Mountain Shrine',
    subtitle: 'Temple of the Iron Bodhi',
    difficulty: 'intermediate',
    opponentAvatar: '🧘',
    opponentName: 'Abbot Tetsu',
    deckName: 'Iron Bodhi',
    description: 'A monastery carved into living rock, kept by an abbot who simply refuses to fall.',
    strategy: CAMPAIGN_ENCOUNTERS.c4.strategy,
    story: [
      'Snow begins where the stairs end. The Temple of the Iron Bodhi is half-cave, half-cathedral, its monks sitting so still they wear caps of frost. At its heart sits Abbot Tetsu, broad as a temple bell, hands folded, eyes closed.',
      '"Strike if you must," he says without opening them. "The mountain has been struck by lightning, by armies, by ten thousand winters. The mountain is still here. So am I."',
      'Tetsu wins by outlasting you. His Guards regenerate, his monks drain life with every blow, and Shrine Blessings undo whole turns of your work. Behind that endless wall he hides Stone Sentinels and an Iron Juggernaut that finish the game once your hand runs dry.',
      'Aggression burns out against the Bodhi. Bring reach, bring pressure he cannot heal through, or be ground to powder against the rock.',
    ],
    unlocked: false,
    completed: false,
    rewards: [{ id: 'r_c4', type: 'currency', label: '250 Shards', amount: 250, icon: '💠', claimed: false }],
    x: 49, y: 55, connects: ['c5'],
  },
  {
    id: 'c5',
    name: "The Trapmaster's Workshop",
    subtitle: 'Clockwork Foundry Beneath the Pass',
    difficulty: 'expert',
    opponentAvatar: '🤖',
    opponentName: 'Engineer Kuro',
    deckName: 'The Mechanism',
    description: 'A foundry of gears and tripwires where the floor itself wants you dead.',
    strategy: CAMPAIGN_ENCOUNTERS.c5.strategy,
    story: [
      'The pass on the far side of the shrine has been hollowed into a foundry. Pistons breathe, belts crawl, and every tile of the floor clicks faintly as you step — counting you. This is the workshop of Engineer Kuro, who left the clans to build soldiers that never tire and never flee.',
      '"Flesh is such poor material," Kuro says, voice flat behind a riveted mask. "It bleeds. It fears. It improvises. My constructs only execute. Let us measure your improvisation against my certainty."',
      'Kuro turns the board into a machine. Spike Traps and snares strip the attack from everything you commit, Clay Sentinels reassemble faster than you can break them, and minefields punish a wide board. Every turn you do not close, the Mechanism adds another gear — and the War Automaton at the end does not negotiate.',
      'Disrupt the assembly line or be processed by it.',
    ],
    unlocked: false,
    completed: false,
    rewards: [{ id: 'r_c5', type: 'cosmetic', label: 'Card Back', icon: '🎏', claimed: false }],
    x: 61, y: 80, connects: ['c6'],
  },
  {
    id: 'c6',
    name: 'The Oni Stronghold',
    subtitle: 'Fortress of the Crimson Banner',
    difficulty: 'expert',
    opponentAvatar: '👹',
    opponentName: 'Warlord Goki',
    deckName: 'Crimson Onslaught',
    description: 'A war-fortress that has never been taken, commanded by a warlord who only knows forward.',
    strategy: CAMPAIGN_ENCOUNTERS.c6.strategy,
    story: [
      'Smoke marks the stronghold long before its walls do. Crimson banners snap over black timber, and the gate is a slab of iron scarred by every siege that ever failed against it. Warlord Goki meets you in the courtyard himself, because he has never once waited behind a wall.',
      '"Good," the oni rumbles, hefting an axe the size of a door. "The Forge sends me a sharpening stone. Every blade I break only makes the next swing cleaner. Come — let us find out how many times you break."',
      'Goki snowballs. His Momentum and Pierce threats grow with every kill they make, Warpath gives the whole horde haste, and a Demon General can buff a board into a single unanswerable wave. Give him one good turn of trades and the Crimson Onslaught becomes a landslide.',
      'You cannot win the long game against a deck that gets stronger every time it fights. Break his momentum early, or be buried under it.',
    ],
    unlocked: false,
    completed: false,
    rewards: [{ id: 'r_c6', type: 'pack', label: 'Epic Pack', icon: '🧨', claimed: false }],
    x: 71, y: 53, connects: ['c7'],
  },
  {
    id: 'c7',
    name: 'The Shadow Syndicate',
    subtitle: 'Undercity of the Coiled Serpent',
    difficulty: 'expert',
    opponentAvatar: '🐍',
    opponentName: 'The Oyabun',
    deckName: 'Shadow Syndicate',
    description: 'Below the city of forges runs a second city — and it answers to one cold voice.',
    strategy: CAMPAIGN_ENCOUNTERS.c7.strategy,
    story: [
      'Not every clan fights in the sun. Beneath the forge-city runs the Undercity, a lattice of tunnels and tea-houses where the Shadow Syndicate sells poison, secrets, and silence. To reach the mountain above, you must first be granted passage by the Oyabun — and the Oyabun grants nothing for free.',
      '"You walk toward the Forge as if it is owed to you," the serpent-masked boss says, pouring two cups and drinking from neither. "Everything above is built on what we permit below. Convince me you are worth more alive than as an example."',
      'The Syndicate kills with patience and poison. Venom dancers destroy anything they touch in combat, so every trade favours the Oyabun; EMP and Wire Snare leave your board toothless; and Vanishing threats reset their Stealth turn after turn so you never get a clean swing. The Shadow Oyabun himself can cloak the whole gang at once.',
      'Brute force feeds the venom. Win this with precise removal and a clock the poison cannot outlast.',
    ],
    unlocked: false,
    completed: false,
    rewards: [{ id: 'r_c7', type: 'cosmetic', label: 'Serpent Avatar', icon: '🎭', claimed: false }],
    x: 83, y: 76, connects: ['c8'],
  },
  {
    id: 'c8',
    name: 'The Hidden Forge',
    subtitle: 'Summit of Embers · Where Blades Are Born',
    difficulty: 'boss',
    opponentAvatar: '🐲',
    opponentName: 'Forge Master Ryujin',
    deckName: 'The Hidden Forge',
    description: 'The summit. The dragon. The duel that decides the clan war and the worth of your blade.',
    strategy: CAMPAIGN_ENCOUNTERS.c8.strategy,
    story: [
      'At the roof of the world the air shivers with heat. The Hidden Forge is not a building — it is the living heart of the mountain, a lake of ember the dragon Ryujin shapes with his bare claws. Every legendary blade the clans have ever revered was drawn from this fire. So, it is said, was the first shinobi.',
      'Ryujin does not rise to threaten you. He rises to measure you. "Eight trials," the dragon says, each word a furnace door swinging open. "The palm, the veil, the library, the rock, the machine, the banner, the serpent. You carry a little of each now. Good. A blade is only worth the trials it survived. Let us see what you have become — and whether you are worth the steel."',
      'The Forge Master plays the perfect game. He burns and draws through your opening like Master Fukurou, then, where the others had one finisher, Ryujin has a dozen: Celestial Dragon, Stone Oni, Avatar of War, Demon General — an unbroken chain of legends, any one of which can end you, arriving faster than you can answer them all.',
      'There is no eighth lesson. There is only everything the first seven taught you, spent at once, against the fire that made them. Win, and the Forge is yours. Lose, and the mountain keeps its secret a little longer.',
    ],
    unlocked: false,
    completed: false,
    rewards: [{ id: 'r_c8', type: 'cosmetic', label: 'Forge Master Avatar', icon: '🏆', claimed: false }],
    x: 92, y: 44, connects: [],
  },
];

export const PRACTICE_OPPONENTS = [
  { id: 'p_easy', name: 'Sparring Dummy', avatar: '🪵', difficulty: 'beginner' as const },
  { id: 'p_mid', name: 'Wandering Ronin', avatar: '🥷', difficulty: 'intermediate' as const },
  { id: 'p_hard', name: 'Shadow Adept', avatar: '👤', difficulty: 'expert' as const },
];
