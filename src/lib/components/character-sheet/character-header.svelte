<script lang="ts">
  import { Input } from "../ui/input";
	import { useDebouncedChange } from "./utilities/useDebouncedChange";

  export type CharacterHeaderProps = {
    name?: string;
    classLevel?: string;
    background?: string;
    player?: string;
    race?: string;
    alignment?: string;
    exp?: string;
  }

  const {
    characterHeaderProps,
    onChange
  } = $props<{
    characterHeaderProps?: CharacterHeaderProps;
    onChange?: (data: CharacterHeaderProps) => void;
  }>();

  let localHeader = $state(characterHeaderProps);

  const emitChange = useDebouncedChange(onChange, 800);

  $effect(() => {
    if(emitChange){
      emitChange({
        name: localHeader.name,
        classLevel: localHeader.classLevel,
        background: localHeader.background,
        player: localHeader.player,
        race: localHeader.race,
        alignment: localHeader.alignment,
        exp: localHeader.exp
      });
    }
  });

  function updateHeader(key: keyof CharacterHeaderProps, value: string) {
    localHeader = { ...localHeader, [key]: value };
  }
</script>


<div class="p-4 border rounded-lg bg-background">
  <div class="flex flex-row gap-8 items-center min-h-[120px]">
  <div class="flex-1 min-w-[200px] flex flex-col justify-center h-full">
  <Input 
    id="character-name" 
    type="text" 
    value={localHeader.name}
    oninput={(e) => updateHeader("name", (e.target as HTMLInputElement).value)}
    placeholder="Name" 
    class="w-full !text-3xl border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        <label for="character-name" class="block text-xs font-semibold mb-1">Character Name</label>
    </div>
    <div class="flex flex-col gap-2 flex-[2] min-w-[350px]">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label for="character-class" class="block text-xs font-semibold mb-1">Class & Level</label>
          <Input 
            id="character-class" 
            type="text" 
            value={localHeader.classLevel} 
            oninput={(e) => updateHeader("classLevel", (e.target as HTMLInputElement).value)}
            placeholder="Class & Level" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
        <div>
          <label for="character-background" class="block text-xs font-semibold mb-1">Background</label>
          <Input
            id="character-background"  
            type="text" 
            value={localHeader.background}
            oninput={(e) => updateHeader("background", (e.target as HTMLInputElement).value)}
            placeholder="Background" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
        <div>
          <label for="character-player" class="block text-xs font-semibold mb-1">Player</label>
          <Input 
            id="character-player" 
            type="text" 
            value={localHeader.player}
            oninput={(e) => updateHeader("player", (e.target as HTMLInputElement).value)}
            placeholder="Player" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label for="character-race" class="block text-xs font-semibold mb-1">Race</label>
          <Input 
            id="character-race" 
            type="text" 
            value={localHeader.race}
            oninput={(e) => updateHeader("race", (e.target as HTMLInputElement).value)}
            placeholder="Race" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
        <div>
          <label for="character-alignment" class="block text-xs font-semibold mb-1">Alignment</label>
          <Input 
            id="character-alignment" 
            type="text" 
            value={localHeader.alignment}
            oninput={(e) => updateHeader("alignment", (e.target as HTMLInputElement).value)}
            placeholder="Alignment" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
        <div>
          <label for="character-exp" class="block text-xs font-semibold mb-1">Experience Points</label>
          <Input 
            id="character-exp" 
            type="text" 
            value={localHeader.exp}
            oninput={(e) => updateHeader("exp", (e.target as HTMLInputElement).value)}
            placeholder="EXP" 
            class="w-full border-0 border-b-2 border-input bg-transparent rounded-none focus:ring-0 focus:border-ring shadow-none px-0" />
        </div>
      </div>
    </div>
  </div>
</div>
