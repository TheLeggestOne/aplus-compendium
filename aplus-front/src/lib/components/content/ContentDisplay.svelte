<script lang="ts">
	import SpellCard from './cards/SpellCard.svelte';
	import MonsterStatBlock from './cards/MonsterStatBlock.svelte';
	import ItemCard from './cards/ItemCard.svelte';
	import ClassDisplay from './displays/ClassDisplay.svelte';
	import RaceDisplay from './displays/RaceDisplay.svelte';
	import FeatDisplay from './displays/FeatDisplay.svelte';
	import SimpleContentDisplay from './displays/SimpleContentDisplay.svelte';

	/**
	 * Content router component that selects the appropriate display component
	 * based on content type and passes item data
	 */
	export let contentType: string;
	export let item: any;
	export let itemKey: string = '';
	export let compact: boolean = false; // Preview pane mode

	// Parse compound key if needed (name::source)
	$: parsedKey = itemKey || `${item.name}::${item.source}`;

	// Determine which component to use
	$: displayComponent = getDisplayComponent(contentType);

	function getDisplayComponent(type: string): any {
		switch (type) {
			// Specialized stat blocks
			case 'spells':
				return SpellCard;
			case 'monsters':
				return MonsterStatBlock;
			case 'items':
				return ItemCard;

			// Mid-tier displays
			case 'classes':
				return ClassDisplay;
			case 'races':
				return RaceDisplay;
			case 'feats':
			case 'optionalfeatures':
			case 'backgrounds':
				return FeatDisplay;

			// Simple content types
			case 'conditions':
			case 'actions':
			case 'languages':
			case 'skills':
			case 'senses':
			case 'deities':
			case 'objects':
			case 'traps':
			case 'decks':
			case 'rules':
			default:
				return SimpleContentDisplay;
		}
	}

	// Component-specific props
	$: componentProps = getComponentProps(contentType, item, parsedKey, compact);

	function getComponentProps(type: string, itemData: any, key: string, isCompact: boolean): any {
		const baseProps = { itemKey: key, contentType: type, compact: isCompact };

		switch (type) {
			case 'spells':
				return { ...baseProps, spell: itemData };
			case 'monsters':
				return { ...baseProps, monster: itemData };
			case 'items':
				return { ...baseProps, item: itemData };
			case 'classes':
				return { ...baseProps, classData: itemData };
			case 'races':
				return { ...baseProps, race: itemData };
			case 'feats':
			case 'optionalfeatures':
			case 'backgrounds':
				return { ...baseProps, feat: itemData };
			default:
				return { ...baseProps, content: itemData };
		}
	}
</script>

<svelte:component this={displayComponent} {...componentProps} />
