<script lang="ts">
  import { page } from '$app/stores';
  import { uiStore } from '$lib/stores/ui-state.svelte.js';
  import ScrollTextIcon from '@lucide/svelte/icons/scroll-text';
  import UsersIcon from '@lucide/svelte/icons/users';
  import SettingsIcon from '@lucide/svelte/icons/settings';

  interface NavItem {
    href: string;
    match: string;
    icon: typeof UsersIcon;
    label: string;
  }

  const nav = $derived<NavItem[]>([
    { href: '/characters', match: '/characters', icon: UsersIcon, label: 'Characters' },
    ...(uiStore.activeCharacterId
      ? [{ href: `/character/${uiStore.activeCharacterId}`, match: '/character/', icon: ScrollTextIcon, label: 'Sheet' }]
      : []),
    { href: '/options', match: '/options', icon: SettingsIcon, label: 'Options' },
  ]);
</script>

<nav class="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-background py-3">
  {#each nav as item}
    <a
      href={item.href}
      class="flex flex-col items-center gap-0.5 rounded-md px-1 py-2 w-12 text-[10px] leading-none transition-colors
        {$page.url.pathname.startsWith(item.match)
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}"
    >
      <item.icon class="size-5 mb-0.5" />
      {item.label}
    </a>
  {/each}
</nav>
