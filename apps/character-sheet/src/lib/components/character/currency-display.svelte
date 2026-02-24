<script lang="ts">
  import type { Currency } from '@aplus-compendium/types';
  import SectionHeader from './section-header.svelte';

  interface Props {
    currency: Currency;
  }

  let { currency }: Props = $props();

  const COINS = [
    { key: 'platinum' as const, label: 'PP', color: 'text-slate-300' },
    { key: 'gold' as const, label: 'GP', color: 'text-yellow-400' },
    { key: 'electrum' as const, label: 'EP', color: 'text-cyan-400' },
    { key: 'silver' as const, label: 'SP', color: 'text-slate-400' },
    { key: 'copper' as const, label: 'CP', color: 'text-orange-400' },
  ];
</script>

<div>
  <SectionHeader title="Currency" />
  <div class="flex gap-2 flex-wrap">
    {#each COINS as coin}
      {#if currency[coin.key] > 0}
        <div class="flex flex-col items-center justify-center rounded-md border border-border bg-card px-3 py-2 min-w-[52px]">
          <span class="text-lg font-bold tabular-nums {coin.color}">{currency[coin.key]}</span>
          <span class="text-[10px] font-medium text-muted-foreground">{coin.label}</span>
        </div>
      {/if}
    {/each}
  </div>
</div>
