<script lang="ts">
	import { EntryRenderer } from '../renderers';
	import { MONSTER_DEFAULTS, SIZE_NAMES, ABILITY_NAMES } from '$lib/config/contentDefaults';

	export let monster: any;
	export let itemKey: string = '';
	export let compact: boolean = false; // Preview pane mode

	// Apply defaults
	$: size = monster.size ?? MONSTER_DEFAULTS.size;
	$: type = monster.type ?? MONSTER_DEFAULTS.type;
	$: alignment = monster.alignment ?? MONSTER_DEFAULTS.alignment;
	$: ac = monster.ac ?? MONSTER_DEFAULTS.ac;
	$: hp = monster.hp ?? MONSTER_DEFAULTS.hp;
	$: speed = monster.speed ?? MONSTER_DEFAULTS.speed;
	$: str = monster.str ?? MONSTER_DEFAULTS.str;
	$: dex = monster.dex ?? MONSTER_DEFAULTS.dex;
	$: con = monster.con ?? MONSTER_DEFAULTS.con;
	$: int = monster.int ?? MONSTER_DEFAULTS.int;
	$: wis = monster.wis ?? MONSTER_DEFAULTS.wis;
	$: cha = monster.cha ?? MONSTER_DEFAULTS.cha;
	$: cr = monster.cr ?? MONSTER_DEFAULTS.cr;
	$: passive = monster.passive ?? MONSTER_DEFAULTS.passive;

	// Format helpers
	function formatSize(sizes: string[]): string {
		return sizes.map((s) => SIZE_NAMES[s] || s).join(' or ');
	}

	function formatType(typeData: any): string {
		if (typeof typeData === 'string') return typeData;
		if (typeData.type) {
			const base = typeData.type;
			const tags = typeData.tags ? ` (${typeData.tags.join(', ')})` : '';
			return base + tags;
		}
		return 'unknown';
	}

	function formatAlignment(align: string[]): string {
		if (!align || align.length === 0) return 'Unaligned';
		const alignMap: Record<string, string> = {
			L: 'Lawful',
			N: 'Neutral',
			C: 'Chaotic',
			G: 'Good',
			E: 'Evil',
			U: 'Unaligned',
			A: 'Any'
		};
		return align.map((a) => alignMap[a] || a).join(' ');
	}

	function formatAC(acArray: any[]): string {
		if (!acArray || acArray.length === 0) return '10';
		const first = acArray[0];
		if (typeof first === 'number') return String(first);
		if (first.ac !== undefined) {
			const from = first.from ? ` (${first.from.join(', ')})` : '';
			return String(first.ac) + from;
		}
		return '10';
	}

	function formatHP(hpData: any): string {
		if (!hpData) return '0';
		if (hpData.special) return hpData.special;
		return `${hpData.average} (${hpData.formula})`;
	}

	function formatSpeed(speedData: any): string {
		if (!speedData) return '30 ft.';
		const parts: string[] = [];
		if (speedData.walk) parts.push(`${speedData.walk} ft.`);
		if (speedData.fly) {
			const flySpeed =
				typeof speedData.fly === 'number' ? speedData.fly : speedData.fly.number;
			const hover = speedData.canHover ? ' (hover)' : '';
			parts.push(`fly ${flySpeed} ft.${hover}`);
		}
		if (speedData.swim) parts.push(`swim ${speedData.swim} ft.`);
		if (speedData.burrow) parts.push(`burrow ${speedData.burrow} ft.`);
		if (speedData.climb) parts.push(`climb ${speedData.climb} ft.`);
		return parts.join(', ') || '30 ft.';
	}

	function abilityModifier(score: number): string {
		const mod = Math.floor((score - 10) / 2);
		return mod >= 0 ? `+${mod}` : String(mod);
	}

	function formatSkills(skillData: any): string {
		if (!skillData) return '—';
		return Object.entries(skillData)
			.map(([skill, bonus]) => `${skill} ${bonus}`)
			.join(', ');
	}

	function formatList(list: string[] | undefined): string {
		return list && list.length > 0 ? list.join(', ') : '—';
	}
</script>

<div class="monster-stat-block" class:compact>
	{#if compact}
		<!-- Compact mode: Show only essentials -->
		<div class="monster-compact">
			<div class="compact-header">
				<h3 class="compact-name">{monster.name}</h3>
				<p class="compact-meta">
					{formatSize(size)} {formatType(type)}, CR {cr}
				</p>
			</div>

			<div class="compact-vitals">
				<span><strong>AC</strong> {formatAC(ac)}</span>
				<span><strong>HP</strong> {hp.average || formatHP(hp)}</span>
				<span><strong>Speed</strong> {formatSpeed(speed)}</span>
			</div>

			{#if monster.trait && monster.trait.length > 0}
				<div class="compact-feature">
					<strong>{monster.trait[0].name}:</strong>
					<EntryRenderer
						entries={monster.trait[0].entries.slice(0, 1)}
						contentType="monsters"
						{itemKey}
						compact
						depth={1}
					/>
				</div>
			{:else if monster.action && monster.action.length > 0}
				<div class="compact-feature">
					<strong>{monster.action[0].name}:</strong>
					<EntryRenderer
						entries={monster.action[0].entries.slice(0, 1)}
						contentType="monsters"
						{itemKey}
						compact
						depth={1}
					/>
				</div>
			{/if}

			<a href="/content/monsters/{encodeURIComponent(itemKey)}" class="read-more-link">
				View full stat block →
			</a>
		</div>
	{:else}
		<!-- Full stat block -->
		<!-- Header -->
	<div class="monster-header">
		<h3 class="monster-name">{monster.name}</h3>
		<p class="monster-meta">
			{formatSize(size)} {formatType(type)}, {formatAlignment(alignment)}
		</p>
		{#if monster.source}
			<p class="monster-source">{monster.source}{monster.page ? `, p${monster.page}` : ''}</p>
		{/if}
	</div>

	<div class="divider"></div>

	<!-- AC, HP, Speed -->
	<div class="monster-vitals">
		<div class="vital-row">
			<span class="vital-label">Armor Class</span>
			<span class="vital-value">{formatAC(ac)}</span>
		</div>
		<div class="vital-row">
			<span class="vital-label">Hit Points</span>
			<span class="vital-value">{formatHP(hp)}</span>
		</div>
		<div class="vital-row">
			<span class="vital-label">Speed</span>
			<span class="vital-value">{formatSpeed(speed)}</span>
		</div>
	</div>

	<div class="divider"></div>

	<!-- Ability Scores -->
	<div class="ability-scores">
		<div class="ability-score">
			<div class="ability-name">STR</div>
			<div class="ability-value">{str} ({abilityModifier(str)})</div>
		</div>
		<div class="ability-score">
			<div class="ability-name">DEX</div>
			<div class="ability-value">{dex} ({abilityModifier(dex)})</div>
		</div>
		<div class="ability-score">
			<div class="ability-name">CON</div>
			<div class="ability-value">{con} ({abilityModifier(con)})</div>
		</div>
		<div class="ability-score">
			<div class="ability-name">INT</div>
			<div class="ability-value">{int} ({abilityModifier(int)})</div>
		</div>
		<div class="ability-score">
			<div class="ability-name">WIS</div>
			<div class="ability-value">{wis} ({abilityModifier(wis)})</div>
		</div>
		<div class="ability-score">
			<div class="ability-name">CHA</div>
			<div class="ability-value">{cha} ({abilityModifier(cha)})</div>
		</div>
	</div>

	<div class="divider"></div>

	<!-- Saves, Skills, etc. -->
	<div class="monster-details">
		{#if monster.save}
			<div class="detail-row">
				<span class="detail-label">Saving Throws</span>
				<span class="detail-value">{formatSkills(monster.save)}</span>
			</div>
		{/if}
		{#if monster.skill}
			<div class="detail-row">
				<span class="detail-label">Skills</span>
				<span class="detail-value">{formatSkills(monster.skill)}</span>
			</div>
		{/if}
		{#if monster.vulnerable}
			<div class="detail-row">
				<span class="detail-label">Damage Vulnerabilities</span>
				<span class="detail-value">{formatList(monster.vulnerable)}</span>
			</div>
		{/if}
		{#if monster.resist}
			<div class="detail-row">
				<span class="detail-label">Damage Resistances</span>
				<span class="detail-value">{formatList(monster.resist)}</span>
			</div>
		{/if}
		{#if monster.immune}
			<div class="detail-row">
				<span class="detail-label">Damage Immunities</span>
				<span class="detail-value">{formatList(monster.immune)}</span>
			</div>
		{/if}
		{#if monster.conditionImmune}
			<div class="detail-row">
				<span class="detail-label">Condition Immunities</span>
				<span class="detail-value">{formatList(monster.conditionImmune)}</span>
			</div>
		{/if}
		<div class="detail-row">
			<span class="detail-label">Senses</span>
			<span class="detail-value"
				>{formatList(monster.senses)}, passive Perception {passive}</span
			>
		</div>
		<div class="detail-row">
			<span class="detail-label">Languages</span>
			<span class="detail-value">{formatList(monster.languages)}</span>
		</div>
		<div class="detail-row">
			<span class="detail-label">Challenge</span>
			<span class="detail-value">{cr}</span>
		</div>
	</div>

	<!-- Traits -->
	{#if monster.trait && monster.trait.length > 0}
		<div class="divider"></div>
		<div class="monster-section">
			{#each monster.trait as trait}
				<div class="feature">
					<h4 class="feature-name">{trait.name}</h4>
					<div class="feature-entries">
						<EntryRenderer entries={trait.entries} contentType="monsters" {itemKey} depth={1} />
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Actions -->
	{#if monster.action && monster.action.length > 0}
		<div class="divider"></div>
		<div class="monster-section">
			<h4 class="section-title">Actions</h4>
			{#each monster.action as action}
				<div class="feature">
					<h4 class="feature-name">{action.name}</h4>
					<div class="feature-entries">
						<EntryRenderer entries={action.entries} contentType="monsters" {itemKey} depth={1} />
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Reactions -->
	{#if monster.reaction && monster.reaction.length > 0}
		<div class="divider"></div>
		<div class="monster-section">
			<h4 class="section-title">Reactions</h4>
			{#each monster.reaction as reaction}
				<div class="feature">
					<h4 class="feature-name">{reaction.name}</h4>
					<div class="feature-entries">
						<EntryRenderer entries={reaction.entries} contentType="monsters" {itemKey} depth={1} />
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Legendary Actions -->
	{#if monster.legendary && monster.legendary.length > 0}
		<div class="divider"></div>
		<div class="monster-section">
			<h4 class="section-title">Legendary Actions</h4>
			{#each monster.legendary as legendary}
				<div class="feature">
					<h4 class="feature-name">{legendary.name}</h4>
					<div class="feature-entries">
						<EntryRenderer entries={legendary.entries} contentType="monsters" {itemKey} depth={1} />
					</div>
				</div>
			{/each}
		</div>
	{/if}
	{/if}
</div>

<style>
	.monster-stat-block {
		@apply rounded-lg border-2 border-red-800 bg-amber-50 p-4 font-serif shadow-lg;
	}

	.monster-stat-block.compact {
		@apply border border-red-300 p-0;
	}

	.monster-compact {
		@apply space-y-3 p-3;
	}

	.compact-header {
		@apply border-b border-red-300 pb-2;
	}

	.compact-name {
		@apply text-lg font-bold text-red-900;
	}

	.compact-meta {
		@apply text-sm italic text-gray-700;
	}

	.compact-vitals {
		@apply flex flex-wrap gap-3 text-sm;
	}

	.compact-feature {
		@apply border-t border-red-200 pt-2 text-sm;
	}

	.read-more-link {
		@apply mt-2 inline-block text-sm font-semibold text-red-700 hover:text-red-900;
	}

	.monster-header {
		@apply mb-2;
	}

	.monster-name {
		@apply text-2xl font-bold text-red-900;
	}

	.monster-meta {
		@apply text-sm italic text-gray-700;
	}

	.monster-source {
		@apply mt-1 text-xs text-gray-500;
	}

	.divider {
		@apply my-3 border-t-2 border-red-700;
	}

	.monster-vitals {
		@apply space-y-1 text-sm;
	}

	.vital-row {
		@apply flex gap-2;
	}

	.vital-label {
		@apply font-bold text-gray-800;
	}

	.vital-value {
		@apply text-gray-900;
	}

	.ability-scores {
		@apply grid grid-cols-6 gap-2 text-center;
	}

	.ability-score {
		@apply rounded border border-gray-400 bg-white p-2;
	}

	.ability-name {
		@apply text-xs font-bold uppercase text-gray-700;
	}

	.ability-value {
		@apply text-sm font-semibold text-gray-900;
	}

	.monster-details {
		@apply space-y-1 text-sm;
	}

	.detail-row {
		@apply flex gap-2;
	}

	.detail-label {
		@apply min-w-[180px] font-bold text-gray-800;
	}

	.detail-value {
		@apply text-gray-900;
	}

	.monster-section {
		@apply mt-3 space-y-3;
	}

	.section-title {
		@apply mb-2 text-lg font-bold text-red-900;
	}

	.feature {
		@apply mb-3;
	}

	.feature-name {
		@apply mb-1 text-sm font-bold italic text-gray-800;
	}

	.feature-entries {
		@apply text-sm text-gray-900;
	}
</style>
