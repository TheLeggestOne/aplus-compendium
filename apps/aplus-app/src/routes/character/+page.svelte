<script lang="ts">
    import { GridStack } from "gridstack";
    import { onMount } from "svelte";

    let grid: GridStack;

    onMount(() => {
        grid = GridStack.init({
            column: 3,
            cellHeight: 80,
            disableDrag: false,
            disableResize: true,
            margin: 10,
        });
    });
</script>

<div class="grid-stack">
    <div class="grid-stack-item bg-parchment">
        <div class="grid-stack-item-content">Hello</div>
    </div>
    <div class="grid-stack-item">
        <div class="grid-stack-item-content">World</div>
    </div>
</div>
