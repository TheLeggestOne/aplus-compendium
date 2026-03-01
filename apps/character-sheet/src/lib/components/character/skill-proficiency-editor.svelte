<script lang="ts">
  import type { SkillName, SkillProficiencyGrant } from '@aplus-compendium/types';
  import { SKILL_NAMES } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import XIcon from '@lucide/svelte/icons/x';
  import PlusIcon from '@lucide/svelte/icons/plus';

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();

  const { character } = $derived(characterStore);
  const grants = $derived(character.skillProficiencyGrants ?? []);

  // Add-source form state
  let addingSource = $state(false);
  let newLabel = $state('');
  let newCount = $state(2);

  function titleCase(s: string) {
    return s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /** Options for a grant's dropdowns: either its restricted list or all skills */
  function optionsFor(grant: SkillProficiencyGrant): SkillName[] {
    return grant.choices.length > 0 ? grant.choices : SKILL_NAMES;
  }

  function setSlot(grant: SkillProficiencyGrant, slotIndex: number, value: string) {
    // Build a new selected array with this slot updated
    const selected: (SkillName | undefined)[] = Array.from({ length: grant.count }, (_, i) =>
      grant.selected[i],
    );
    selected[slotIndex] = value ? (value as SkillName) : undefined;
    characterStore.setSkillGrantSelections(grant.id, selected.filter(Boolean) as SkillName[]);
  }

  function getSlotValue(grant: SkillProficiencyGrant, slotIndex: number): string {
    return grant.selected[slotIndex] ?? '';
  }

  function removeGrant(grantId: string) {
    characterStore.removeSkillGrant(grantId);
  }

  function addSource() {
    if (!newLabel.trim() || newCount < 1) return;
    characterStore.addManualSkillGrant(newLabel.trim(), newCount);
    newLabel = '';
    newCount = 2;
    addingSource = false;
  }

  const SOURCE_LABELS: Record<string, string> = {
    class: 'Class',
    background: 'Background',
    race: 'Race',
    manual: 'Custom',
    migrated: 'Migrated',
  };
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md max-h-[85vh] flex flex-col">
    <Dialog.Header>
      <Dialog.Title>Skill Proficiencies</Dialog.Title>
      <Dialog.Description class="text-xs text-muted-foreground">
        Manage where each skill proficiency comes from.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex-1 overflow-auto space-y-3 py-2 min-h-0">
      {#if grants.length === 0}
        <p class="text-sm text-muted-foreground text-center py-6">
          No skill proficiency sources. Add one below.
        </p>
      {/if}

      {#each grants as grant (grant.id)}
        {@const selectedCount = grant.selected.filter(Boolean).length}
        {@const overLimit = selectedCount > grant.count}
        {@const autoOnly = grant.choices.length === 1}
        {@const removable = grant.source !== 'class'}

        <div class="rounded-md border border-border bg-card/50 p-3 space-y-2">
          <!-- Grant header -->
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium flex-1">{grant.sourceLabel}</span>
            <Badge variant="outline" class="text-[10px] px-1.5 py-0 h-4 shrink-0">
              {SOURCE_LABELS[grant.source] ?? grant.source}
            </Badge>
            {#if !autoOnly}
              <span class="text-xs tabular-nums {overLimit ? 'text-destructive font-semibold' : 'text-muted-foreground'}">
                {selectedCount}/{grant.count}
              </span>
              {#if overLimit}
                <Badge variant="destructive" class="text-[10px] px-1 py-0 h-4">over</Badge>
              {/if}
            {/if}
            {#if removable}
              <button
                class="text-muted-foreground hover:text-destructive transition-colors"
                onclick={() => removeGrant(grant.id)}
                title="Remove this source"
              >
                <XIcon class="size-3.5" />
              </button>
            {/if}
          </div>

          <!-- Single-choice: auto-selected, just display -->
          {#if autoOnly}
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <span class="italic">Auto-selected:</span>
              <Badge variant="secondary" class="text-xs">{titleCase(grant.choices[0]!)}</Badge>
            </div>

          <!-- Multi-choice: N dropdowns -->
          {:else}
            <div class="space-y-1.5">
              {#each { length: grant.count } as _, i}
                {@const current = getSlotValue(grant, i)}
                {@const options = optionsFor(grant)}
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-muted-foreground w-10 shrink-0 tabular-nums">Slot {i + 1}</span>
                  <select
                    class="flex-1 h-7 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    value={current}
                    onchange={(e) => setSlot(grant, i, (e.currentTarget as HTMLSelectElement).value)}
                  >
                    <option value="">— none —</option>
                    {#each options as skill}
                      <option value={skill}>{titleCase(skill)}</option>
                    {/each}
                  </select>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      <!-- Add custom source -->
      <div class="rounded-md border border-dashed border-border p-3">
        {#if addingSource}
          <div class="space-y-2">
            <div class="flex gap-2 items-center">
              <Input
                type="text"
                class="h-7 text-xs flex-1"
                placeholder="Source name (e.g. Acolyte Background)"
                bind:value={newLabel}
              />
              <div class="flex items-center gap-1 shrink-0">
                <span class="text-xs text-muted-foreground">Count:</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  class="w-12 h-7 rounded border border-border bg-background px-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  bind:value={newCount}
                />
              </div>
            </div>
            <div class="flex gap-2">
              <Button size="sm" class="h-7 text-xs flex-1" onclick={addSource} disabled={!newLabel.trim()}>
                Add Source
              </Button>
              <Button variant="ghost" size="sm" class="h-7 text-xs" onclick={() => { addingSource = false; newLabel = ''; newCount = 2; }}>
                Cancel
              </Button>
            </div>
          </div>
        {:else}
          <button
            class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            onclick={() => addingSource = true}
          >
            <PlusIcon class="size-3.5" />
            Add custom source (background, race, feat, etc.)
          </button>
        {/if}
      </div>
    </div>

    <Dialog.Footer class="border-t border-border pt-3 mt-2">
      <Dialog.Close>
        <Button variant="outline" size="sm" class="text-xs">Done</Button>
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
