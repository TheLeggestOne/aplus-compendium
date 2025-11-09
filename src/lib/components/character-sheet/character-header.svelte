<script lang="ts">
  import { Label } from 'bits-ui';

  let {
    name, classLevel, background, player, race, alignment, exp,
    onChange
  } = $props<{
    name?: string;
    classLevel?: string;
    background?: string;
    player?: string;
    race?: string;
    alignment?: string;
    exp?: string;
    onChange?: (data: { name: string; classLevel: string; background: string; player: string; race: string; alignment: string; exp: string; }) => void;
  }>();

  let localName = $state(name);
  let localClassLevel = $state(classLevel);
  let localBackground = $state(background);
  let localPlayer = $state(player);
  let localRace = $state(race);
  let localAlignment = $state(alignment);
  let localExp = $state(exp);

  $effect(() => {
    if (onChange) {
      onChange({
        name: localName,
        classLevel: localClassLevel,
        background: localBackground,
        player: localPlayer,
        race: localRace,
        alignment: localAlignment,
        exp: localExp
      });
    }
  });

</script>


<div class="p-4 border rounded-lg bg-background">
  <div class="flex flex-row gap-8 items-center min-h-[120px]">
  <div class="flex-1 min-w-[200px] flex flex-col justify-center h-full">
  <input 
    id="character-name" 
    type="text" 
    bind:value={localName}
    placeholder="Name" 
    class="w-full !text-3xl border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        <Label.Root for="character-name" class="block text-xs font-semibold mb-1">Character Name</Label.Root>
    </div>
    <div class="flex flex-col gap-2 flex-[2] min-w-[350px]">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <Label.Root for="character-class" class="block text-xs font-semibold mb-1">Class & Level</Label.Root>
          <input 
            id="character-class" 
            type="text" 
            bind:value={localClassLevel} 
            placeholder="Class & Level" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
        <div>
          <Label.Root for="character-background" class="block text-xs font-semibold mb-1">Background</Label.Root>
          <input
            id="character-background"  
            type="text" 
            bind:value={localBackground}
            placeholder="Background" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
        <div>
          <Label.Root for="character-player" class="block text-xs font-semibold mb-1">Player</Label.Root>
          <input 
            id="character-player" 
            type="text" 
            bind:value={localPlayer}
            placeholder="Player" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <Label.Root for="character-race" class="block text-xs font-semibold mb-1">Race</Label.Root>
          <input 
            id="character-race" 
            type="text" 
            bind:value={localRace}
            placeholder="Race" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
        <div>
          <Label.Root for="character-alignment" class="block text-xs font-semibold mb-1">Alignment</Label.Root>
          <input 
            id="character-alignment" 
            type="text" 
            bind:value={localAlignment}
            placeholder="Alignment" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
        <div>
          <Label.Root for="character-exp" class="block text-xs font-semibold mb-1">Experience Points</Label.Root>
          <input 
            id="character-exp" 
            type="text" 
            bind:value={localExp}
            placeholder="EXP" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
      </div>
    </div>
  </div>
</div>
