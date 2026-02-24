<script lang="ts">
  import { cn } from '$lib/utils.js';

  interface Props {
    value: number;
    class?: string;
  }

  let { value, class: className }: Props = $props();

  const formatted = $derived(value >= 0 ? `+${value}` : `${value}`);
</script>

<span class={cn('tabular-nums', className)}>{formatted}</span>
