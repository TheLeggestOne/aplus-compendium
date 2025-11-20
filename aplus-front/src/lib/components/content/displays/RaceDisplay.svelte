<script lang="ts">
	import { EntryRenderer } from '../renderers';
	import { RACE_DEFAULTS, SIZE_NAMES, ABILITY_NAMES } from '$lib/config/contentDefaults';

	export let race: any;
	export let itemKey: string = '';
	export let compact: boolean = false; // Preview pane mode

	// Apply defaults
	$: size = race.size ?? RACE_DEFAULTS.size;
	$: speed = race.speed ?? RACE_DEFAULTS.speed;
	$: ability = race.ability ?? RACE_DEFAULTS.ability;
	$: entries = race.entries ?? RACE_DEFAULTS.entries;

	// Format size
	function formatSize(sizes: string[]): string {
		return sizes.map((s) => SIZE_NAMES[s] || s).join(' or ');
	}

	// Format speed
	function formatSpeed(speedData: any): string {
		if (typeof speedData === 'number') return `${speedData} ft.`;
		if (!speedData) return '30 ft.';

		const parts: string[] = [];
		if (speedData.walk) parts.push(`${speedData.walk} ft.`);
		if (speedData.fly) parts.push(`fly ${speedData.fly} ft.`);
		if (speedData.swim) parts.push(`swim ${speedData.swim} ft.`);
		if (speedData.climb) parts.push(`climb ${speedData.climb} ft.`);
		return parts.join(', ') || '30 ft.';
	}

	// Format ability score improvements
	function formatAbilityImprovements(abilityArray: any[]): string[] {
		if (!abilityArray || abilityArray.length === 0) return ['No ability score improvements'];

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
					improvements.push(`Choose +${choose.amount || 1} to ${choose.count} from: ${options.join(', ')}`);
				}
			}
		});

		return improvements.length > 0 ? improvements : ['No ability score improvements'];
	}

	// Format language proficiencies
	function formatLanguages(langProfs: any): string {
		if (!langProfs) return 'None';
		
		// Handle array format - extract first element if it's an array
		if (Array.isArray(langProfs)) {
			// If array has objects, process the first one
			if (langProfs.length > 0 && typeof langProfs[0] === 'object' && !Array.isArray(langProfs[0])) {
				// Process the object inside the array
				return formatLanguages(langProfs[0]);
			}
			
			// Otherwise map array of strings
			return langProfs.map((lang: any) => {
				if (typeof lang === 'string') {
					return lang.charAt(0).toUpperCase() + lang.slice(1);
				}
				// Handle object with language choices
				if (lang.choose) {
					const count = lang.choose.count || 1;
					const from = lang.choose.from || [];
					if (from.length > 0) {
						const options = from.map((l: string) => l.charAt(0).toUpperCase() + l.slice(1));
						return `Choose ${count} from: ${options.join(', ')}`;
					}
					return `Any ${count} language${count > 1 ? 's' : ''}`;
				}
				return JSON.stringify(lang);
			}).join(', ');
		}
		
		// Handle object format (e.g., {common: true, draconic: true})
		if (typeof langProfs === 'object') {
			const languages: string[] = [];
			const choices: string[] = [];
			
			Object.entries(langProfs).forEach(([key, value]) => {
				if (key === 'choose') {
					// Handle choose options
					const choose = value as any;
					const count = choose.count || 1;
					const from = choose.from || [];
					if (from.length > 0) {
						const options = from.map((l: string) => l.charAt(0).toUpperCase() + l.slice(1));
						choices.push(`Choose ${count} from: ${options.join(', ')}`);
					} else {
						choices.push(`Any ${count} language${count > 1 ? 's' : ''}`);
					}
				} else if (value === true) {
					// Language is granted
					languages.push(key.charAt(0).toUpperCase() + key.slice(1));
				}
			});
			
			const parts = [...languages, ...choices];
			return parts.length > 0 ? parts.join(', ') : 'None';
		}
		
		return 'None';
	}

	$: abilityImprovements = formatAbilityImprovements(ability);
	$: formattedLanguages = formatLanguages(race.languageProficiencies);
	
	// Debug logging
	$: if (race.languageProficiencies) {
		console.log('Race languageProficiencies:', race.languageProficiencies);
		console.log('Formatted languages:', formattedLanguages);
	}
</script>

<div class="race-display">
	<!-- Header -->
	<div class="race-header">
		<h3 class="race-name">{race.name}</h3>
		{#if race.source}
			<p class="race-source">{race.source}{race.page ? `, p${race.page}` : ''}</p>
		{/if}
	</div>

	<!-- Core Stats -->
	<div class="race-stats">
		<div class="stat-group">
			<div class="stat-label">Size</div>
			<div class="stat-value">{formatSize(size)}</div>
		</div>
		<div class="stat-group">
			<div class="stat-label">Speed</div>
			<div class="stat-value">{formatSpeed(speed)}</div>
		</div>
	</div>

	<!-- Ability Score Improvements -->
	<div class="ability-improvements">
		<h4 class="section-title">Ability Score Increase</h4>
		<div class="improvements-list">
			{#each abilityImprovements as improvement}
				<div class="improvement-item">{improvement}</div>
			{/each}
		</div>
	</div>

	<!-- Racial Traits -->
	<div class="race-traits" class:compact>
		<h4 class="section-title">Traits</h4>
		{#if compact}
			<EntryRenderer entries={entries.slice(0, 1)} contentType="races" {itemKey} compact />
			{#if entries.length > 1}
				<a href="/content/races/{encodeURIComponent(itemKey)}" class="read-more-link">
					Read more →
				</a>
			{/if}
		{:else}
			<EntryRenderer {entries} contentType="races" {itemKey} />
		{/if}
	</div>

	<!-- Languages -->
	{#if race.languageProficiencies}
		<div class="languages-section">
			<h4 class="section-title">Languages</h4>
			<div class="text-sm text-gray-900">
				{formattedLanguages}
			</div>
		</div>
	{/if}

	<!-- Additional Info -->
	{#if race.age || race.heightAndWeight}
		<div class="additional-info">
			{#if race.age}
				<div class="info-item">
					<span class="info-label">Maturity:</span>
					<span class="info-value">{race.age.mature} years</span>
					{#if race.age.max}
						<span class="info-value ml-2">Max Age: {race.age.max} years</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.race-display {
		@apply rounded-lg border border-gray-300 bg-white shadow-sm;
	}

	.race-header {
		@apply border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50 p-4;
	}

	.race-name {
		@apply text-2xl font-bold text-gray-900;
	}

	.race-source {
		@apply mt-1 text-sm text-gray-500;
	}

	.race-stats {
		@apply grid grid-cols-2 gap-4 border-b border-gray-200 bg-gray-50 p-4;
	}

	.stat-group {
		@apply text-center;
	}

	.stat-label {
		@apply text-xs font-semibold uppercase tracking-wide text-gray-600;
	}

	.stat-value {
		@apply mt-1 text-lg font-bold text-gray-900;
	}

	.ability-improvements {
		@apply border-b border-gray-200 bg-blue-50 p-4;
	}

	.section-title {
		@apply mb-3 text-base font-bold text-gray-900;
	}

	.improvements-list {
		@apply space-y-1;
	}

	.improvement-item {
		@apply rounded bg-white px-3 py-2 text-sm font-semibold text-blue-900;
	}

	.race-traits {
		@apply p-4;
	}

	.race-traits.compact {
		@apply p-3;
	}

	.read-more-link {
		@apply mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800;
	}

	.languages-section {
		@apply border-t border-gray-200 p-4;
	}

	.additional-info {
		@apply border-t border-gray-200 bg-gray-50 p-4;
	}

	.info-item {
		@apply text-sm;
	}

	.info-label {
		@apply font-semibold text-gray-700;
	}

	.info-value {
		@apply text-gray-900;
	}
</style>
