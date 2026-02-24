<script lang="ts">
  import type { SpellSlot } from '@aplus-compendium/types';
  import SpellSlotGroup from './spell-slot-group.svelte';
  import SectionHeader from './section-header.svelte';

  interface Props {
    slots: SpellSlot[];
  }

  let { slots }: Props = $props();
</script>

<div>
  <SectionHeader title="Spell Slots" />
  <div class="flex flex-wrap gap-3">
    {#each slots as slot}
      <SpellSlotGroup {slot} />
    {/each}
  </div>
</div>
