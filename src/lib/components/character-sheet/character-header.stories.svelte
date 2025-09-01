<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CharacterHeader from './character-header.svelte';

  const { Story } = defineMeta({
    title: 'Components/CharacterSheet/CharacterHeader',
    component: CharacterHeader,
    args: {
      characterHeaderProps: {
        name: 'Swampy Waters',
        classLevel: 'Bard 17 Fighter 3',
        background: 'Folk Hero',
        player: 'Stilts',
        race: 'Lizardfolk',
        alignment: 'Neutral Good',
        exp: "979400"
      }
    }
  });
</script>

<Story name="Swampy Waters" />