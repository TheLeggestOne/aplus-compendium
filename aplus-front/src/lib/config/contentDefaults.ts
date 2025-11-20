/**
 * Default values for D&D 5e content types when fields are missing.
 * Used to ensure consistent rendering even with incomplete data.
 */

export const SPELL_DEFAULTS = {
	level: 0,
	school: 'A', // Abjuration
	time: [{ number: 1, unit: 'action' }],
	range: { type: 'self' },
	components: {},
	duration: [{ type: 'instant' }],
	entries: []
} as const;

export const MONSTER_DEFAULTS = {
	size: ['M'] as const,
	type: 'humanoid',
	alignment: ['N'] as const,
	ac: [10],
	hp: { average: 0, formula: '1d8' },
	speed: { walk: 30 },
	str: 10,
	dex: 10,
	con: 10,
	int: 10,
	wis: 10,
	cha: 10,
	cr: '0',
	passive: 10,
	languages: [],
	entries: []
} as const;

export const ITEM_DEFAULTS = {
	rarity: 'none',
	weight: 0,
	value: 0,
	entries: []
} as const;

export const CLASS_DEFAULTS = {
	hd: { number: 1, faces: 6 },
	proficiency: [],
	startingProficiencies: {
		armor: [],
		weapons: [],
		skills: []
	},
	entries: []
} as const;

export const RACE_DEFAULTS = {
	size: ['M'] as const,
	speed: 30,
	ability: [],
	entries: []
} as const;

export const FEAT_DEFAULTS = {
	prerequisite: [],
	entries: []
} as const;

export const BACKGROUND_DEFAULTS = {
	skillProficiencies: [],
	languageProficiencies: [],
	entries: []
} as const;

export const SIMPLE_CONTENT_DEFAULTS = {
	entries: []
} as const;

/**
 * Get default value for a missing field based on content type
 */
export function getDefaultValue<T>(contentType: string, field: string, fallback: T): T {
	const defaultsMap: Record<string, any> = {
		spells: SPELL_DEFAULTS,
		monsters: MONSTER_DEFAULTS,
		items: ITEM_DEFAULTS,
		classes: CLASS_DEFAULTS,
		races: RACE_DEFAULTS,
		feats: FEAT_DEFAULTS,
		backgrounds: BACKGROUND_DEFAULTS,
		// Simple content types all use SIMPLE_CONTENT_DEFAULTS
		conditions: SIMPLE_CONTENT_DEFAULTS,
		actions: SIMPLE_CONTENT_DEFAULTS,
		languages: SIMPLE_CONTENT_DEFAULTS,
		skills: SIMPLE_CONTENT_DEFAULTS,
		senses: SIMPLE_CONTENT_DEFAULTS,
		deities: SIMPLE_CONTENT_DEFAULTS,
		objects: SIMPLE_CONTENT_DEFAULTS,
		traps: SIMPLE_CONTENT_DEFAULTS,
		optionalfeatures: FEAT_DEFAULTS, // Similar to feats
		decks: SIMPLE_CONTENT_DEFAULTS,
		rules: SIMPLE_CONTENT_DEFAULTS
	};

	const defaults = defaultsMap[contentType];
	if (defaults && field in defaults) {
		return defaults[field];
	}

	return fallback;
}

/**
 * Get placeholder text for empty entries
 */
export const EMPTY_ENTRIES_PLACEHOLDER = 'No description available';

/**
 * D&D 5e school abbreviations
 */
export const SPELL_SCHOOLS: Record<string, { name: string; color: string }> = {
	A: { name: 'Abjuration', color: 'text-blue-600' },
	C: { name: 'Conjuration', color: 'text-yellow-600' },
	D: { name: 'Divination', color: 'text-purple-600' },
	E: { name: 'Enchantment', color: 'text-pink-600' },
	V: { name: 'Evocation', color: 'text-red-600' },
	I: { name: 'Illusion', color: 'text-indigo-600' },
	N: { name: 'Necromancy', color: 'text-green-600' },
	T: { name: 'Transmutation', color: 'text-orange-600' }
} as const;

/**
 * Size abbreviations
 */
export const SIZE_NAMES: Record<string, string> = {
	T: 'Tiny',
	S: 'Small',
	M: 'Medium',
	L: 'Large',
	H: 'Huge',
	G: 'Gargantuan'
} as const;

/**
 * Ability score abbreviations
 */
export const ABILITY_NAMES: Record<string, string> = {
	str: 'Strength',
	dex: 'Dexterity',
	con: 'Constitution',
	int: 'Intelligence',
	wis: 'Wisdom',
	cha: 'Charisma'
} as const;

/**
 * Item rarity colors
 */
export const RARITY_COLORS: Record<string, string> = {
	common: 'text-gray-600',
	uncommon: 'text-green-600',
	rare: 'text-blue-600',
	'very rare': 'text-purple-600',
	legendary: 'text-orange-600',
	artifact: 'text-red-600',
	none: 'text-gray-800'
} as const;
