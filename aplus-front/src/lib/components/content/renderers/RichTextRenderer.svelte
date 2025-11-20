<script lang="ts">
	/**
	 * Renders 5etools rich text with tag parsing
	 * Handles tags like: {@spell Fireball}, {@damage 8d6}, {@condition blinded}, etc.
	 * Currently renders as styled text without linking (linking to be implemented later)
	 */
	export let text: string;

	// Parse 5etools tags and convert to styled spans
	function parseRichText(input: string): string {
		if (!input) return '';

		let result = input;

		// {@spell spell name|source} or {@spell spell name}
		result = result.replace(/\{@spell ([^}|]+)(?:\|([^}]+))?\}/g, '<span class="spell-ref">$1</span>');

		// {@damage XdY} or {@dice XdY}
		result = result.replace(/\{@(?:damage|dice) ([^}]+)\}/g, '<span class="dice-ref">$1</span>');

		// {@dc X}
		result = result.replace(/\{@dc (\d+)\}/g, '<span class="dc-ref">DC $1</span>');

		// {@hit +X}
		result = result.replace(/\{@hit ([+-]?\d+)\}/g, '<span class="hit-ref">$1</span>');

		// {@condition condition name}
		result = result.replace(/\{@condition ([^}|]+)(?:\|([^}]+))?\}/g, '<span class="condition-ref">$1</span>');

		// {@creature creature name}
		result = result.replace(/\{@creature ([^}|]+)(?:\|([^}]+))?\}/g, '<span class="creature-ref">$1</span>');

		// {@item item name}
		result = result.replace(/\{@item ([^}|]+)(?:\|([^}]+))?\}/g, '<span class="item-ref">$1</span>');

		// {@skill skill name}
		result = result.replace(/\{@skill ([^}]+)\}/g, '<span class="skill-ref">$1</span>');

		// {@sense sense name}
		result = result.replace(/\{@sense ([^}]+)\}/g, '<span class="sense-ref">$1</span>');

		// {@atk mw} or {@atk rw}
		result = result.replace(/\{@atk mw\}/g, '<span class="attack-ref">Melee Weapon Attack</span>');
		result = result.replace(/\{@atk rw\}/g, '<span class="attack-ref">Ranged Weapon Attack</span>');
		result = result.replace(/\{@atk ms\}/g, '<span class="attack-ref">Melee Spell Attack</span>');
		result = result.replace(/\{@atk rs\}/g, '<span class="attack-ref">Ranged Spell Attack</span>');

		// {@h} hit marker
		result = result.replace(/\{@h\}/g, '<span class="hit-marker">Hit:</span>');

		// {@quickref reference}
		result = result.replace(/\{@quickref ([^}|]+)(?:\|([^}]+))?\}/g, '<span class="quickref-ref">$1</span>');

		// {@variantrule rule name}
		result = result.replace(/\{@variantrule ([^}]+)\}/g, '<span class="rule-ref">$1</span>');

		// {@filter ...} - complex filter tags, just show the display text
		result = result.replace(/\{@filter ([^|]+)\|[^}]+\}/g, '<span class="filter-ref">$1</span>');

		return result;
	}

	$: parsedText = parseRichText(text);
</script>

<span class="rich-text">{@html parsedText}</span>

<style>
	:global(.rich-text .spell-ref) {
		@apply font-semibold text-purple-700;
	}

	:global(.rich-text .dice-ref) {
		@apply font-mono text-red-600;
	}

	:global(.rich-text .dc-ref) {
		@apply font-semibold text-blue-600;
	}

	:global(.rich-text .hit-ref) {
		@apply font-semibold text-green-600;
	}

	:global(.rich-text .condition-ref) {
		@apply font-semibold text-orange-600;
	}

	:global(.rich-text .creature-ref) {
		@apply font-semibold text-indigo-600;
	}

	:global(.rich-text .item-ref) {
		@apply font-semibold text-yellow-700;
	}

	:global(.rich-text .skill-ref) {
		@apply font-semibold text-teal-600;
	}

	:global(.rich-text .sense-ref) {
		@apply font-semibold text-cyan-600;
	}

	:global(.rich-text .attack-ref) {
		@apply italic text-gray-700;
	}

	:global(.rich-text .hit-marker) {
		@apply font-semibold text-gray-800;
	}

	:global(.rich-text .quickref-ref),
	:global(.rich-text .rule-ref),
	:global(.rich-text .filter-ref) {
		@apply font-semibold text-blue-700;
	}
</style>
