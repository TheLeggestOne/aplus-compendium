<script lang="ts">
	import { EntryRenderer } from '../renderers';
	import { CLASS_DEFAULTS } from '$lib/config/contentDefaults';

	export let classData: any;
	export let itemKey: string = '';
	export let compact: boolean = false; // Preview pane mode

	// Apply defaults
	$: hd = classData.hd ?? CLASS_DEFAULTS.hd;
	$: proficiency = classData.proficiency ?? CLASS_DEFAULTS.proficiency;
	$: startingProficiencies = classData.startingProficiencies ?? CLASS_DEFAULTS.startingProficiencies;

	// Format proficiency list
	function formatProficiencies(prof: string[]): string {
		if (!prof || prof.length === 0) return 'None';
		const abilityMap: Record<string, string> = {
			str: 'Strength',
			dex: 'Dexterity',
			con: 'Constitution',
			int: 'Intelligence',
			wis: 'Wisdom',
			cha: 'Charisma'
		};
		return prof.map((p) => abilityMap[p] || p).join(', ');
	}

	function formatArmorProf(armor: string[]): string {
		if (!armor || armor.length === 0) return 'None';
		return armor.join(', ');
	}

	function formatWeaponProf(weapons: string[]): string {
		if (!weapons || weapons.length === 0) return 'None';
		return weapons.join(', ');
	}
</script>

<div class="class-display">
	<!-- Header -->
	<div class="class-header">
		<h3 class="class-name">{classData.name}</h3>
		{#if classData.source}
			<p class="class-source">{classData.source}{classData.page ? `, p${classData.page}` : ''}</p>
		{/if}
	</div>

	<!-- Core Stats -->
	<div class="class-stats">
		<div class="stat-group">
			<div class="stat-label">Hit Die</div>
			<div class="stat-value">d{hd.faces}</div>
		</div>
		<div class="stat-group">
			<div class="stat-label">Primary Ability</div>
			<div class="stat-value">
				{classData.primaryAbility ? classData.primaryAbility.join(', ').toUpperCase() : '—'}
			</div>
		</div>
		<div class="stat-group">
			<div class="stat-label">Saves</div>
			<div class="stat-value">{formatProficiencies(proficiency)}</div>
		</div>
	</div>

	<!-- Starting Proficiencies -->
	{#if startingProficiencies}
		<div class="proficiencies-section">
			<h4 class="section-title">Starting Proficiencies</h4>
			<div class="proficiency-list">
				{#if startingProficiencies.armor}
					<div class="proficiency-item">
						<span class="prof-label">Armor:</span>
						<span class="prof-value">{formatArmorProf(startingProficiencies.armor)}</span>
					</div>
				{/if}
				{#if startingProficiencies.weapons}
					<div class="proficiency-item">
						<span class="prof-label">Weapons:</span>
						<span class="prof-value">{formatWeaponProf(startingProficiencies.weapons)}</span>
					</div>
				{/if}
				{#if startingProficiencies.tools}
					<div class="proficiency-item">
						<span class="prof-label">Tools:</span>
						<span class="prof-value">{formatArmorProf(startingProficiencies.tools)}</span>
					</div>
				{/if}
				{#if startingProficiencies.skills}
					<div class="proficiency-item">
						<span class="prof-label">Skills:</span>
						<span class="prof-value">
							{#if startingProficiencies.skills[0]?.choose}
								Choose {startingProficiencies.skills[0].choose.count} from {startingProficiencies.skills[0].choose.from.join(', ')}
							{:else}
								{startingProficiencies.skills.join(', ')}
							{/if}
						</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Class Table -->
	{#if classData.classTableGroups && classData.classTableGroups.length > 0}
		<div class="class-table-section">
			<h4 class="section-title">Class Features by Level</h4>
			{#each classData.classTableGroups as tableGroup}
				<div class="class-table">
					<!-- Simple representation - full table would be more complex -->
					<p class="text-sm text-gray-600 italic">Class progression table available</p>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Description -->
	{#if classData.fluff || classData.entries}
		<div class="class-description" class:compact>
			{#if compact}
				<EntryRenderer entries={(classData.entries || []).slice(0, 1)} contentType="classes" {itemKey} compact />
				{#if (classData.entries || []).length > 1}
					<a href="/content/classes/{encodeURIComponent(itemKey)}" class="read-more-link">
						Read more →
					</a>
				{/if}
			{:else}
				<EntryRenderer entries={classData.entries || []} contentType="classes" {itemKey} />
			{/if}
		</div>
	{/if}

	<!-- Subclass Note -->
	{#if classData.subclassTitle}
		<div class="subclass-note">
			<h4 class="subclass-title">{classData.subclassTitle}</h4>
			<p class="text-sm text-gray-600">
				Subclasses for this class should be viewed separately.
			</p>
		</div>
	{/if}
</div>

<style>
	.class-display {
		@apply rounded-lg border border-gray-300 bg-white shadow-sm;
	}

	.class-header {
		@apply border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4;
	}

	.class-name {
		@apply text-2xl font-bold text-gray-900;
	}

	.class-source {
		@apply mt-1 text-sm text-gray-500;
	}

	.class-stats {
		@apply grid grid-cols-3 gap-4 border-b border-gray-200 bg-gray-50 p-4;
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

	.proficiencies-section {
		@apply border-b border-gray-200 p-4;
	}

	.section-title {
		@apply mb-3 text-lg font-bold text-gray-900;
	}

	.proficiency-list {
		@apply space-y-2;
	}

	.proficiency-item {
		@apply text-sm;
	}

	.prof-label {
		@apply font-semibold text-gray-700;
	}

	.prof-value {
		@apply ml-2 text-gray-900;
	}

	.class-table-section {
		@apply border-b border-gray-200 p-4;
	}

	.class-description {
		@apply p-4;
	}

	.class-description.compact {
		@apply p-3;
	}

	.read-more-link {
		@apply mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800;
	}

	.subclass-note {
		@apply border-t border-gray-200 bg-purple-50 p-4;
	}

	.subclass-title {
		@apply mb-2 text-base font-bold text-purple-900;
	}
</style>
