<script lang="ts">
	import { EntryRenderer } from '../renderers';
	import { SPELL_DEFAULTS, SPELL_SCHOOLS } from '$lib/config/contentDefaults';

	export let spell: any;
	export let itemKey: string = '';
	export let compact: boolean = false; // Preview pane mode

	// Apply defaults
	$: level = spell.level ?? SPELL_DEFAULTS.level;
	$: school = spell.school ?? SPELL_DEFAULTS.school;
	$: time = spell.time ?? SPELL_DEFAULTS.time;
	$: range = spell.range ?? SPELL_DEFAULTS.range;
	$: components = spell.components ?? SPELL_DEFAULTS.components;
	$: duration = spell.duration ?? SPELL_DEFAULTS.duration;
	$: entries = spell.entries ?? SPELL_DEFAULTS.entries;
	$: entriesHigherLevel = spell.entriesHigherLevel ?? [];

	// Computed properties
	$: isCantrip = level === 0;
	$: levelText = isCantrip ? 'Cantrip' : `Level ${level}`;
	$: schoolInfo = SPELL_SCHOOLS[school] || { name: 'Unknown', color: 'text-gray-600' };
	$: isRitual = spell.meta?.ritual === true;

	// Format casting time
	function formatTime(timeArray: any[]): string {
		if (!timeArray || timeArray.length === 0) return '1 action';
		const t = timeArray[0];
		return t.condition ? `${t.number} ${t.unit} (${t.condition})` : `${t.number} ${t.unit}`;
	}

	// Format range
	function formatRange(rangeObj: any): string {
		if (!rangeObj) return 'Self';
		if (rangeObj.type === 'point') {
			const dist = rangeObj.distance;
			if (dist.type === 'self') return 'Self';
			if (dist.type === 'touch') return 'Touch';
			if (dist.type === 'sight') return 'Sight';
			if (dist.type === 'unlimited') return 'Unlimited';
			return `${dist.amount} ${dist.type}`;
		}
		if (rangeObj.type === 'radius') {
			return `Self (${rangeObj.distance.amount}-${rangeObj.distance.type} radius)`;
		}
		if (rangeObj.type === 'sphere') {
			return `${rangeObj.distance.amount}-${rangeObj.distance.type} sphere`;
		}
		if (rangeObj.type === 'cone') {
			return `Self (${rangeObj.distance.amount}-${rangeObj.distance.type} cone)`;
		}
		if (rangeObj.type === 'line') {
			return `Self (${rangeObj.distance.amount}-${rangeObj.distance.type} line)`;
		}
		return 'Special';
	}

	// Format duration
	function formatDuration(durationArray: any[]): string {
		if (!durationArray || durationArray.length === 0) return 'Instantaneous';
		const d = durationArray[0];
		if (d.type === 'instant') return 'Instantaneous';
		if (d.type === 'permanent') return d.ends ? 'Until dispelled' : 'Permanent';
		if (d.type === 'special') return 'Special';
		if (d.type === 'timed') {
			const dur = d.duration;
			let text = `${dur.amount} ${dur.type}${dur.amount > 1 ? 's' : ''}`;
			if (d.concentration) text = `Concentration, up to ${text}`;
			return text;
		}
		return 'Special';
	}

	// Format components
	$: componentText = [
		components.v ? 'V' : null,
		components.s ? 'S' : null,
		components.m ? `M (${components.m})` : null
	]
		.filter(Boolean)
		.join(', ') || 'None';
</script>

<div class="spell-card">
	<!-- Header -->
	<div class="spell-header">
		<div class="flex items-start justify-between">
			<div>
				<h3 class="spell-name">{spell.name}</h3>
				<p class="spell-subtitle">
					<span class={schoolInfo.color}>{levelText} {schoolInfo.name}</span>
					{#if isRitual}
						<span class="ritual-badge">Ritual</span>
					{/if}
				</p>
			</div>
			{#if spell.source}
				<div class="spell-source text-sm text-gray-500">
					{spell.source}{spell.page ? `, p${spell.page}` : ''}
				</div>
			{/if}
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="spell-stats">
		<div class="stat-row">
			<div class="stat-label">Casting Time</div>
			<div class="stat-value">{formatTime(time)}</div>
		</div>
		<div class="stat-row">
			<div class="stat-label">Range</div>
			<div class="stat-value">{formatRange(range)}</div>
		</div>
		<div class="stat-row">
			<div class="stat-label">Components</div>
			<div class="stat-value">{componentText}</div>
		</div>
		<div class="stat-row">
			<div class="stat-label">Duration</div>
			<div class="stat-value">{formatDuration(duration)}</div>
		</div>
	</div>

	<!-- Description -->
	<div class="spell-description" class:compact>
		{#if compact}
			<!-- Show only first entry in compact mode -->
			<EntryRenderer entries={entries.slice(0, 1)} contentType="spells" {itemKey} compact />
			{#if entries.length > 1}
				<a href="/content/spells/{encodeURIComponent(itemKey)}" class="read-more-link">
					Read more →
				</a>
			{/if}
		{:else}
			<EntryRenderer {entries} contentType="spells" {itemKey} />
		{/if}
	</div>

	<!-- At Higher Levels (hidden in compact mode) -->
	{#if !compact && entriesHigherLevel.length > 0}
		<div class="spell-higher-levels">
			<h4 class="higher-levels-title">At Higher Levels</h4>
			<EntryRenderer entries={entriesHigherLevel} contentType="spells" {itemKey} depth={1} />
		</div>
	{/if}

	<!-- Additional Info -->
	{#if spell.damageInflict || spell.savingThrow || spell.areaTags}
		<div class="spell-tags" class:compact>
			{#if spell.damageInflict}
				<div class="tag-group">
					<span class="tag-label">Damage:</span>
					{#each spell.damageInflict as damage}
						<span class="tag">{damage}</span>
					{/each}
				</div>
			{/if}
			{#if spell.savingThrow}
				<div class="tag-group">
					<span class="tag-label">Save:</span>
					{#each spell.savingThrow as save}
						<span class="tag">{save}</span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.spell-card {
		@apply rounded-lg border border-gray-300 bg-white shadow-sm;
	}

	.spell-header {
		@apply border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4;
	}

	.spell-name {
		@apply text-2xl font-bold text-gray-900;
	}

	.spell-subtitle {
		@apply mt-1 text-sm font-semibold;
	}

	.ritual-badge {
		@apply ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800;
	}

	.spell-stats {
		@apply border-b border-gray-200 bg-gray-50 p-4;
	}

	.stat-row {
		@apply grid grid-cols-3 gap-4 py-1;
	}

	.stat-label {
		@apply font-semibold text-gray-700;
	}

	.stat-value {
		@apply col-span-2 text-gray-900;
	}

	.spell-description {
		@apply p-4;
	}

	.spell-description.compact {
		@apply p-3;
	}

	.read-more-link {
		@apply mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800;
	}

	.spell-higher-levels {
		@apply border-t border-gray-200 bg-amber-50 p-4;
	}

	.higher-levels-title {
		@apply mb-2 text-sm font-bold uppercase tracking-wide text-amber-900;
	}

	.spell-tags {
		@apply border-t border-gray-200 p-4;
	}

	.spell-tags.compact {
		@apply p-2;
	}

	.tag-group {
		@apply mb-2 flex flex-wrap items-center gap-2;
	}

	.tag-label {
		@apply text-sm font-semibold text-gray-600;
	}

	.tag {
		@apply rounded bg-gray-200 px-2 py-1 text-xs font-medium capitalize text-gray-700;
	}
</style>