<script lang="ts">
  import type { ProficiencyLevel } from '@aplus-compendium/types';
  import { cn } from '$lib/utils.js';

  interface Props {
    level: ProficiencyLevel;
    class?: string;
  }

  let { level, class: className }: Props = $props();
</script>

<span
  class={cn(
    'inline-block size-3 rounded-full border-2 shrink-0',
    level === 'none' && 'border-muted-foreground/40 bg-transparent',
    level === 'proficient' && 'border-primary bg-primary',
    level === 'expertise' && 'border-yellow-500 bg-yellow-500',
    className,
  )}
  title={level}
></span>
