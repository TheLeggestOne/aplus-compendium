<script lang="ts">
	import { EntryRenderer } from '../renderers';
	import { ITEM_DEFAULTS, RARITY_COLORS } from '$lib/config/contentDefaults';

	export let item: any;
	export let itemKey: string = '';
	export let compact: boolean = false; // Preview pane mode

	// Apply defaults
	$: rarity = item.rarity ?? ITEM_DEFAULTS.rarity;
	$: weight = item.weight ?? ITEM_DEFAULTS.weight;
	$: value = item.value ?? ITEM_DEFAULTS.value;
	$: entries = item.entries ?? ITEM_DEFAULTS.entries;

	// Computed properties
	$: rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.none;
	$: rarityText = rarity.charAt(0).toUpperCase() + rarity.slice(1);
	$: valueGold = value > 0 ? (value / 100).toFixed(2) : '0';

	// Item type detection
	$: isWeapon = item.type && (item.type.includes('M') || item.type.includes('R') || item.weaponCategory);
	$: isArmor = item.type && item.type.includes('A') && !item.type.includes('MA');
	$: isMagicItem = rarity !== 'none' || item.reqAttune;

	// Format attunement requirement
	function formatAttunement(reqAttune: any): string {
		if (!reqAttune) return '';
		if (reqAttune === true) return 'Requires attunement';
		if (typeof reqAttune === 'string') return `Requires attunement ${reqAttune}`;
		return '';
	}

	$: attunementText = formatAttunement(item.reqAttune);

	// Weapon properties
	function formatDamage(dmg: string, dmgType: string): string {
		if (!dmg) return '';
		const typeMap: Record<string, string> = {
			S: 'slashing',
			P: 'piercing',
			B: 'bludgeoning',
			F: 'fire',
			C: 'cold',
			A: 'acid',
			T: 'thunder',
			L: 'lightning',
			N: 'necrotic',
			R: 'radiant',
			O: 'force',
			Y: 'psychic',
			I: 'poison'
		};
		return `${dmg} ${typeMap[dmgType] || dmgType}`;
	}

	$: weaponDamage = item.dmg1 ? formatDamage(item.dmg1, item.dmgType) : null;
	$: weaponRange = item.range ? `${item.range} ft.` : null;
	$: armorAC = item.ac !== undefined ? String(item.ac) : null;
</script>

<div class="item-card">
	<!-- Header -->
	<div class="item-header">
		<div class="flex items-start justify-between">
			<div>
				<h3 class="item-name">{item.name}</h3>
				<p class="item-type">
					{#if item.type}
						<span class="text-gray-600">{item.type}</span>
					{/if}
					{#if rarity !== 'none'}
						<span class={rarityColor}>({rarityText})</span>
					{/if}
				</p>
			</div>
			{#if item.source}
				<div class="item-source text-sm text-gray-500">
					{item.source}{item.page ? `, p${item.page}` : ''}
				</div>
			{/if}
		</div>

		{#if attunementText}
			<div class="attunement-badge">{attunementText}</div>
		{/if}
	</div>

	<!-- Stats Section -->
	{#if isWeapon || isArmor || weight > 0 || value > 0}
		<div class="item-stats">
			{#if weaponDamage}
				<div class="stat-row">
					<span class="stat-label">Damage</span>
					<span class="stat-value">{weaponDamage}</span>
				</div>
			{/if}
			{#if item.bonusWeapon}
				<div class="stat-row">
					<span class="stat-label">Bonus</span>
					<span class="stat-value">+{item.bonusWeapon}</span>
				</div>
			{/if}
			{#if weaponRange}
				<div class="stat-row">
					<span class="stat-label">Range</span>
					<span class="stat-value">{weaponRange}</span>
				</div>
			{/if}
			{#if armorAC !== null}
				<div class="stat-row">
					<span class="stat-label">Armor Class</span>
					<span class="stat-value">{armorAC}</span>
				</div>
			{/if}
			{#if item.strength}
				<div class="stat-row">
					<span class="stat-label">Strength Requirement</span>
					<span class="stat-value">{item.strength}</span>
				</div>
			{/if}
			{#if weight > 0}
				<div class="stat-row">
					<span class="stat-label">Weight</span>
					<span class="stat-value">{weight} lb.</span>
				</div>
			{/if}
			{#if value > 0}
				<div class="stat-row">
					<span class="stat-label">Value</span>
					<span class="stat-value">{valueGold} gp</span>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Magic Item Properties -->
	{#if item.charges}
		<div class="item-charges">
			<span class="charges-label">Charges:</span>
			<span class="charges-value">{item.charges}</span>
			{#if item.recharge}
				<span class="recharge-text">({item.recharge})</span>
			{/if}
		</div>
	{/if}

	<!-- Properties -->
	{#if item.property}
		<div class="item-properties">
			<span class="properties-label">Properties:</span>
			{#each item.property as prop}
				<span class="property-badge">{prop}</span>
			{/each}
		</div>
	{/if}

	<!-- Description -->
	<div class="item-description" class:compact>
		{#if compact}
			<EntryRenderer entries={entries.slice(0, 1)} contentType="items" {itemKey} compact />
			{#if entries.length > 1 || item.additionalEntries}
				<a href="/content/items/{encodeURIComponent(itemKey)}" class="read-more-link">
					Read more →
				</a>
			{/if}
		{:else}
			<EntryRenderer {entries} contentType="items" {itemKey} />
		{/if}
	</div>

	<!-- Additional Entries (hidden in compact mode) -->
	{#if !compact && item.additionalEntries}
		<div class="item-additional">
			<EntryRenderer entries={item.additionalEntries} contentType="items" {itemKey} depth={1} />
		</div>
	{/if}
</div>

<style>
	.item-card {
		@apply rounded-lg border border-gray-300 bg-white shadow-sm;
	}

	.item-header {
		@apply border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-4;
	}

	.item-name {
		@apply text-2xl font-bold text-gray-900;
	}

	.item-type {
		@apply mt-1 text-sm font-semibold;
	}

	.attunement-badge {
		@apply mt-2 inline-block rounded bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800;
	}

	.item-stats {
		@apply border-b border-gray-200 bg-gray-50 p-4;
	}

	.stat-row {
		@apply flex justify-between py-1;
	}

	.stat-label {
		@apply font-semibold text-gray-700;
	}

	.stat-value {
		@apply text-gray-900;
	}

	.item-charges {
		@apply border-b border-gray-200 bg-blue-50 p-3 text-sm;
	}

	.charges-label {
		@apply font-semibold text-blue-900;
	}

	.charges-value {
		@apply ml-2 font-bold text-blue-700;
	}

	.recharge-text {
		@apply ml-2 italic text-blue-600;
	}

	.item-properties {
		@apply flex flex-wrap items-center gap-2 border-b border-gray-200 p-3;
	}

	.properties-label {
		@apply text-sm font-semibold text-gray-700;
	}

	.property-badge {
		@apply rounded bg-gray-200 px-2 py-1 text-xs font-medium capitalize text-gray-700;
	}

	.item-description {
		@apply p-4;
	}

	.item-description.compact {
		@apply p-3;
	}

	.read-more-link {
		@apply mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800;
	}

	.item-additional {
		@apply border-t border-gray-200 bg-gray-50 p-4;
	}
</style>
