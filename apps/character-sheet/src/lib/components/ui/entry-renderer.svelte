<script lang="ts">
  import { renderInline, renderEntries } from '$lib/utils/tag-renderer.js';

  interface Props {
    /** A single string or a 5etools entries array */
    entries?: unknown[];
    /** Convenience prop: a single string to render inline */
    text?: string;
    class?: string;
  }

  const { entries, text, class: className = '' }: Props = $props();

  const html = $derived(() => {
    if (text !== undefined) return renderInline(text);
    if (entries !== undefined) return renderEntries(entries);
    return '';
  });
</script>

<!-- Data is local 5etools JSON — @html is safe here -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="entry-renderer prose-sm text-foreground leading-relaxed {className}">
  {@html html()}
</div>

<style>
  .entry-renderer :global(p) {
    margin-bottom: 0.5rem;
  }
  .entry-renderer :global(p:last-child) {
    margin-bottom: 0;
  }
  .entry-renderer :global(ul) {
    padding-left: 1rem;
  }
  .entry-renderer :global(strong) {
    color: inherit;
    font-weight: 600;
  }
</style>
