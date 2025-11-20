<script lang="ts">
	import { EntryRenderer } from '../renderers';
	import { FEAT_DEFAULTS, ABILITY_NAMES } from '$lib/config/contentDefaults';

	export let feat: any;
	export let itemKey: string = '';
	export let contentType: string = 'feats'; // Can be 'feats', 'optionalfeatures', or 'backgrounds'
	export let compact: boolean = false; // Preview pane mode

	// Apply defaults
	$: prerequisite = feat.prerequisite ?? FEAT_DEFAULTS.prerequisite;
	$: entries = feat.entries ?? FEAT_DEFAULTS.entries;

	// Check if this has ability improvements
	$: hasAbilityImprovement = feat.ability && feat.ability.length > 0;

	// Format prerequisites
	function formatPrerequisites(prereqs: any[]): string[] {
		if (!prereqs || prereqs.length === 0) return [];

		const formatted: string[] = [];
		prereqs.forEach((prereq) => {
			// Ability score prerequisite
			Object.entries(prereq).forEach(([key, value]) => {
				if (key === 'level') {
					formatted.push(`Level ${value}`);
				} else if (key === 'spellcasting') {
					formatted.push('Spellcasting ability');
				} else if (key === 'feature') {
					if (Array.isArray(value)) {
						formatted.push(`Feature: ${value.join(' or ')}`);
					} else {
						formatted.push(`Feature: ${value}`);
					}
				} else if (key === 'proficiency') {
					formatted.push(`Proficiency: ${JSON.stringify(value)}`);
				} else if (ABILITY_NAMES[key]) {
					formatted.push(`${ABILITY_NAMES[key]} ${value}+`);
				} else {
					formatted.push(`${key}: ${value}`);
				}
			});
		});

		return formatted;
	}

	// Format ability improvements
	function formatAbilityImprovements(abilityArray: any[]): string[] {
		if (!abilityArray || abilityArray.length === 0) return [];

		const improvements: string[] = [];
		abilityArray.forEach((abilitySet) => {
			const entries = Object.entries(abilitySet)
				.filter(([key]) => key !== 'choose')
				.map(([ability, value]) => {
					const abilityName = ABILITY_NAMES[ability] || ability.toUpperCase();
					return `${abilityName} +${value}`;
				});

			if (entries.length > 0) {
				improvements.push(entries.join(', '));
			}

			// Handle choose options
			if (abilitySet.choose) {
				const choose = abilitySet.choose;
				if (choose.from) {
					const options = choose.from.map((a: string) => ABILITY_NAMES[a] || a.toUpperCase());
					const count = choose.count || 1;
					const amount = choose.amount || 1;
					const countText = count === 1 ? 'one' : count.toString();
					improvements.push(
						`Choose +${amount} to ${countText} ${count === 1 ? 'ability' : 'abilities'} from: ${options.join(', ')}`
					);
				}
			}
		});

		return improvements;
	}

	$: prerequisites = formatPrerequisites(prerequisite);
	$: abilityImprovements = formatAbilityImprovements(feat.ability || []);

	// Determine header color based on content type
	$: headerColorClass = 
		contentType === 'backgrounds' ? 'from-amber-50 to-yellow-50' :
		contentType === 'optionalfeatures' ? 'from-cyan-50 to-blue-50' :
		'from-orange-50 to-red-50';
</script>

<div class="feat-display">
	<!-- Header -->
	<div class="feat-header {headerColorClass}">
		<div class="flex items-start justify-between">
			<div>
				<h3 class="feat-name">{feat.name}</h3>
				{#if feat.featureType}
					<p class="feat-type">
						{#each feat.featureType as type}
							<span class="type-badge">{type}</span>
						{/each}
					</p>
				{/if}
			</div>
			{#if feat.source}
				<div class="feat-source">{feat.source}{feat.page ? `, p${feat.page}` : ''}</div>
			{/if}
		</div>

		{#if feat.repeatable}
			<div class="repeatable-badge">Repeatable</div>
		{/if}
	</div>

	<!-- Prerequisites -->
	{#if prerequisites.length > 0}
		<div class="prerequisites-section">
			<h4 class="prereq-title">Prerequisites</h4>
			<div class="prereq-list">
				{#each prerequisites as prereq}
					<div class="prereq-item">{prereq}</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Ability Score Improvements -->
	{#if hasAbilityImprovement}
		<div class="ability-section">
			<h4 class="ability-title">Ability Score Improvement</h4>
			<div class="ability-list">
				{#each abilityImprovements as improvement}
					<div class="ability-item">{improvement}</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Benefits -->
	<div class="feat-benefits" class:compact>
		<h4 class="benefits-title">
			{contentType === 'backgrounds' ? 'Features' : 'Benefits'}
		</h4>
		{#if compact}
			<EntryRenderer entries={entries.slice(0, 1)} {contentType} {itemKey} compact />
			{#if entries.length > 1}
				<a href="/content/{contentType}/{encodeURIComponent(itemKey)}" class="read-more-link">
					Read more →
				</a>
			{/if}
		{:else}
			<EntryRenderer {entries} {contentType} {itemKey} />
		{/if}
	</div>

	<!-- Skill Proficiencies (for backgrounds) -->
	{#if feat.skillProficiencies}
		<div class="proficiencies-section">
			<h4 class="section-title">Skill Proficiencies</h4>
			<div class="text-sm text-gray-900">
				{JSON.stringify(feat.skillProficiencies)}
			</div>
		</div>
	{/if}

	<!-- Language Proficiencies (for backgrounds) -->
	{#if feat.languageProficiencies}
		<div class="proficiencies-section">
			<h4 class="section-title">Language Proficiencies</h4>
			<div class="text-sm text-gray-900">
				{JSON.stringify(feat.languageProficiencies)}
			</div>
		</div>
	{/if}
</div>

<style>
	.feat-display {
		@apply rounded-lg border border-gray-300 bg-white shadow-sm;
	}

	.feat-header {
		@apply border-b border-gray-200 bg-gradient-to-r p-4;
	}

	.feat-name {
		@apply text-2xl font-bold text-gray-900;
	}

	.feat-type {
		@apply mt-1 flex flex-wrap gap-2;
	}

	.type-badge {
		@apply rounded bg-gray-200 px-2 py-1 text-xs font-semibold uppercase text-gray-700;
	}

	.feat-source {
		@apply text-sm text-gray-500;
	}

	.repeatable-badge {
		@apply mt-2 inline-block rounded bg-green-100 px-3 py-1 text-xs font-semibold text-green-800;
	}

	.prerequisites-section {
		@apply border-b border-gray-200 bg-yellow-50 p-4;
	}

	.prereq-title {
		@apply mb-2 text-sm font-bold uppercase tracking-wide text-yellow-900;
	}

	.prereq-list {
		@apply space-y-1;
	}

	.prereq-item {
		@apply rounded bg-white px-3 py-2 text-sm font-semibold text-yellow-900;
	}

	.ability-section {
		@apply border-b border-gray-200 bg-blue-50 p-4;
	}

	.ability-title {
		@apply mb-2 text-sm font-bold uppercase tracking-wide text-blue-900;
	}

	.ability-list {
		@apply space-y-1;
	}

	.ability-item {
		@apply rounded bg-white px-3 py-2 text-sm font-semibold text-blue-900;
	}

	.feat-benefits {
		@apply p-4;
	}

	.feat-benefits.compact {
		@apply p-3;
	}

	.benefits-title {
		@apply mb-3 text-base font-bold text-gray-900;
	}

	.read-more-link {
		@apply mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800;
	}

	.proficiencies-section {
		@apply border-t border-gray-200 p-4;
	}

	.section-title {
		@apply mb-2 text-sm font-bold text-gray-900;
	}
</style>
