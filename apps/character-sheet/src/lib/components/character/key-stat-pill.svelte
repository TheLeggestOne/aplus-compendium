<script lang="ts">
  import { cn } from '$lib/utils.js';

  interface Props {
    label: string;
    value: string | number;
    class?: string;
    subtle?: boolean;
  }

  let { label, value, class: className, subtle = false }: Props = $props();
</script>

<div
  class={cn(
    'flex flex-col items-center justify-center rounded-md border border-border px-3 py-2 min-w-[60px]',
    subtle ? 'bg-transparent' : 'bg-card',
    className,
  )}
>
  <span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground leading-none mb-1">
    {label}
  </span>
  <span class="text-lg font-bold leading-none tabular-nums">
    {value}
  </span>
</div>
