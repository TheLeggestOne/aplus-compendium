<script lang="ts">
	import * as Card from "$lib/components/ui/card";
  import type { Character } from "@aplus-compendium/types";
	import { Button } from "$lib/components/ui/button";

  let { character } = $props();
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{character.name}</Card.Title>
    <Card.Description>Level {character.level} {character.class}</Card.Description>
  </Card.Header>
  <Card.Content>
    <img src="/portrait-smokey.jpg" alt={character.name} class="w-full h-48 object-cover rounded-md mb-4" />
    <form>
      <Button type="submit">Select</Button>
    </form>
  </Card.Content>
</Card.Root>