<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CharacterSummaryCard from '../components/character-summary-card.svelte';

  const { Story } = defineMeta({
    title: 'Components/CharacterSummaryCard',
    component: CharacterSummaryCard,
    tags: ['autodocs'],
    parameters: {
      layout: 'centered',
    },
  });
</script>

<Story 
  name="Default" 
  args={{
    character: {
      name: "Smokey",
      level: 3,
      class: "Wizard",
      background: "Gambler",
      playerName: "Stilts"
    }
  }} 
/>

<Story 
  name="High Level" 
  args={{
    character: {
      name: "Gandalf",
      level: 20,
      class: "Wizard",
      background: "Sage",
      playerName: "Sarah"
    }
  }} 
/>

<Story 
  name="Low Level" 
  args={{
    character: {
      name: "Pip",
      level: 1,
      class: "Rogue",
      background: "Criminal",
      playerName: "Mike"
    }
  }} 
/>