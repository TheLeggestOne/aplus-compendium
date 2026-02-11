<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CharacterDeckPage from '../routes/character-deck/+page.svelte';

  const { Story } = defineMeta({
    title: 'Pages/CharacterDeck',
    component: CharacterDeckPage,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
    },
  });
</script>

<Story 
  name="Empty" 
  args={{
    characters: []
  }} 
/>

<Story 
  name="Few Characters" 
  args={{
    characters: [
      {
        name: "Aragorn",
        class: "Ranger", 
        level: 5,
        background: "Outlander",
        playerName: "John"
      },
      {
        name: "Legolas",
        class: "Fighter",
        level: 4,
        background: "Noble", 
        playerName: "Sarah"
      },
      {
        name: "Gandalf",
        class: "Wizard",
        level: 20,
        background: "Sage",
        playerName: "Emma"
      }
    ]
  }} 
/>

<Story 
  name="Full Party" 
  args={{
    characters: [
      {
        name: "Aragorn",
        class: "Ranger",
        level: 5,
        background: "Outlander",
        playerName: "John"
      },
      {
        name: "Legolas", 
        class: "Fighter",
        level: 4,
        background: "Noble",
        playerName: "Sarah"
      },
      {
        name: "Gimli",
        class: "Fighter", 
        level: 4,
        background: "Folk Hero",
        playerName: "Dave"
      },
      {
        name: "Gandalf",
        class: "Wizard",
        level: 20,
        background: "Sage", 
        playerName: "Emma"
      },
      {
        name: "Frodo",
        class: "Rogue",
        level: 3,
        background: "Hermit",
        playerName: "Mike"
      },
      {
        name: "Boromir",
        class: "Paladin",
        level: 6,
        background: "Soldier",
        playerName: "Alex"
      },
      {
        name: "Samwise",
        class: "Cleric",
        level: 3,
        background: "Folk Hero", 
        playerName: "Lisa"
      },
      {
        name: "Pippin",
        class: "Bard",
        level: 2,
        background: "Entertainer",
        playerName: "Tom"
      }
    ]
  }} 
/>