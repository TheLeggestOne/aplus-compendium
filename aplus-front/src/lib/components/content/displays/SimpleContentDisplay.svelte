<script lang="ts">
	import { EntryRenderer } from '../renderers';
	import { SIMPLE_CONTENT_DEFAULTS } from '$lib/config/contentDefaults';

	export let content: any;
	export let contentType: string;
	export let itemKey: string = '';
	export let compact: boolean = false; // Preview pane mode

	// Apply defaults
	$: entries = content.entries ?? SIMPLE_CONTENT_DEFAULTS.entries;

	// Type-specific metadata rendering
	$: isDeity = contentType === 'deities';
	$: isLanguage = contentType === 'languages';
	$: isSkill = contentType === 'skills';
	$: isAction = contentType === 'actions';
	$: isTrap = contentType === 'traps';
	$: isObject = contentType === 'objects';

	// Format time for actions
	function formatTime(timeArray: any[]): string {
		if (!timeArray || timeArray.length === 0) return '';
		const t = timeArray[0];
		return t.condition ? `${t.number} ${t.unit} (${t.condition})` : `${t.number} ${t.unit}`;
	}

	// Determine header gradient based on content type
	function getHeaderGradient(type: string): string {
		const gradients: Record<string, string> = {
			conditions: 'from-red-50 to-orange-50',
			actions: 'from-blue-50 to-cyan-50',
			languages: 'from-purple-50 to-pink-50',
			skills: 'from-green-50 to-teal-50',
			senses: 'from-yellow-50 to-amber-50',
			deities: 'from-indigo-50 to-purple-50',
			objects: 'from-gray-50 to-slate-50',
			traps: 'from-red-50 to-rose-50',
			decks: 'from-violet-50 to-fuchsia-50',
			rules: 'from-slate-50 to-gray-50'
		};
		return gradients[type] || 'from-gray-50 to-slate-50';
	}

	$: headerGradient = getHeaderGradient(contentType);
</script>

<div class="simple-content-display">
	<!-- Header -->
	<div class="content-header {headerGradient}">
		<div class="flex items-start justify-between">
			<div>
				<h3 class="content-name">{content.name}</h3>

				<!-- Type-specific metadata badges -->
				<div class="metadata-badges">
					{#if isDeity && content.pantheon}
						<span class="badge badge-pantheon">{content.pantheon}</span>
					{/if}
					{#if isDeity && content.alignment}
						<span class="badge badge-alignment">
							{Array.isArray(content.alignment) ? content.alignment.join('') : content.alignment}
						</span>
					{/if}
					{#if isLanguage && content.type}
						<span class="badge badge-type">{content.type}</span>
					{/if}
					{#if isLanguage && content.script}
						<span class="badge badge-script">Script: {content.script}</span>
					{/if}
					{#if isSkill && content.ability}
						<span class="badge badge-ability">{content.ability.toUpperCase()}</span>
					{/if}
					{#if isAction && content.time}
						<span class="badge badge-time">{formatTime(content.time)}</span>
					{/if}
					{#if isTrap && content.trapHazType}
						<span class="badge badge-trap">{content.trapHazType}</span>
					{/if}
					{#if isObject && content.size}
						<span class="badge badge-size">
							{Array.isArray(content.size) ? content.size.join('/') : content.size}
						</span>
					{/if}
				</div>
			</div>

			{#if content.source}
				<div class="content-source">{content.source}{content.page ? `, p${content.page}` : ''}</div>
			{/if}
		</div>
	</div>

	<!-- Additional Info Section for Deities -->
	{#if isDeity}
		<div class="deity-info">
			{#if content.title}
				<div class="info-row">
					<span class="info-label">Title:</span>
					<span class="info-value">{content.title}</span>
				</div>
			{/if}
			{#if content.domains}
				<div class="info-row">
					<span class="info-label">Domains:</span>
					<span class="info-value">{content.domains.join(', ')}</span>
				</div>
			{/if}
			{#if content.symbol}
				<div class="info-row">
					<span class="info-label">Symbol:</span>
					<span class="info-value">{content.symbol}</span>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Additional Info for Languages -->
	{#if isLanguage && content.typicalSpeakers}
		<div class="language-info">
			<div class="info-row">
				<span class="info-label">Typical Speakers:</span>
				<span class="info-value">{content.typicalSpeakers.join(', ')}</span>
			</div>
		</div>
	{/if}

	<!-- Additional Info for Objects -->
	{#if isObject}
		<div class="object-stats">
			{#if content.ac}
				<div class="stat-item">
					<span class="stat-label">AC:</span>
					<span class="stat-value">
						{typeof content.ac === 'object' && content.ac.special ? content.ac.special : content.ac}
					</span>
				</div>
			{/if}
			{#if content.hp}
				<div class="stat-item">
					<span class="stat-label">HP:</span>
					<span class="stat-value">
						{typeof content.hp === 'object' && content.hp.special ? content.hp.special : content.hp}
					</span>
				</div>
			{/if}
			{#if content.immune}
				<div class="stat-item">
					<span class="stat-label">Immunities:</span>
					<span class="stat-value">{content.immune.join(', ')}</span>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Additional Info for Traps -->
	{#if isTrap}
		<div class="trap-info">
			{#if content.trigger}
				<div class="info-row">
					<span class="info-label">Trigger:</span>
					<span class="info-value">{content.trigger.join(', ')}</span>
				</div>
			{/if}
			{#if content.duration}
				<div class="info-row">
					<span class="info-label">Duration:</span>
					<span class="info-value">{JSON.stringify(content.duration)}</span>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Main Content -->
	<div class="content-description" class:compact>
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
</div>

<style>
	.simple-content-display {
		@apply rounded-lg border border-gray-300 bg-white shadow-sm;
	}

	.content-header {
		@apply border-b border-gray-200 bg-gradient-to-r p-4;
	}

	.content-name {
		@apply text-2xl font-bold text-gray-900;
	}

	.metadata-badges {
		@apply mt-2 flex flex-wrap gap-2;
	}

	.badge {
		@apply rounded px-2 py-1 text-xs font-semibold;
	}

	.badge-pantheon {
		@apply bg-purple-100 text-purple-800;
	}

	.badge-alignment {
		@apply bg-blue-100 text-blue-800;
	}

	.badge-type {
		@apply bg-gray-200 text-gray-700;
	}

	.badge-script {
		@apply bg-indigo-100 text-indigo-800;
	}

	.badge-ability {
		@apply bg-green-100 text-green-800;
	}

	.badge-time {
		@apply bg-blue-100 text-blue-800;
	}

	.badge-trap {
		@apply bg-red-100 text-red-800;
	}

	.badge-size {
		@apply bg-gray-200 text-gray-700;
	}

	.content-source {
		@apply text-sm text-gray-500;
	}

	.deity-info,
	.language-info,
	.object-stats,
	.trap-info {
		@apply border-b border-gray-200 bg-gray-50 p-4;
	}

	.info-row {
		@apply mb-2 text-sm last:mb-0;
	}

	.info-label {
		@apply font-semibold text-gray-700;
	}

	.info-value {
		@apply ml-2 text-gray-900;
	}

	.object-stats {
		@apply flex flex-wrap gap-4;
	}

	.stat-item {
		@apply text-sm;
	}

	.stat-label {
		@apply font-semibold text-gray-700;
	}

	.stat-value {
		@apply ml-1 text-gray-900;
	}

	.content-description {
		@apply p-4;
	}

	.content-description.compact {
		@apply p-3;
	}

	.read-more-link {
		@apply mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800;
	}
</style>
