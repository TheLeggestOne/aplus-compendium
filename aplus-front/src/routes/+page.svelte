<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
	<title>Thorin Ironforge - APlus Compendium</title>
</svelte:head>

<div class="p-6 pt-14">
	<div class="flex items-center justify-between mb-4">
		<h1 class="text-2xl font-bold">Thorin Ironforge</h1>
		<Button variant="outline">Edit Character</Button>
	</div>

	<div class="grid grid-cols-3 gap-4 mb-6">
		<Card class="p-4">
			<div class="text-sm text-muted-foreground">Level</div>
			<div class="text-2xl font-bold">5</div>
		</Card>
		<Card class="p-4">
			<div class="text-sm text-muted-foreground">Race</div>
			<div class="text-2xl font-bold">Dwarf</div>
		</Card>
		<Card class="p-4">
			<div class="text-sm text-muted-foreground">Class</div>
			<div class="text-2xl font-bold">Fighter</div>
		</Card>
	</div>

	<div class="grid grid-cols-6 gap-4">
		<Card class="p-4">
			<div class="text-xs text-center text-muted-foreground">STR</div>
			<div class="text-3xl font-bold text-center">16</div>
			<div class="text-sm text-center text-muted-foreground">+3</div>
		</Card>
		<Card class="p-4">
			<div class="text-xs text-center text-muted-foreground">DEX</div>
			<div class="text-3xl font-bold text-center">12</div>
			<div class="text-sm text-center text-muted-foreground">+1</div>
		</Card>
		<Card class="p-4">
			<div class="text-xs text-center text-muted-foreground">CON</div>
			<div class="text-3xl font-bold text-center">14</div>
			<div class="text-sm text-center text-muted-foreground">+2</div>
		</Card>
		<Card class="p-4">
			<div class="text-xs text-center text-muted-foreground">INT</div>
			<div class="text-3xl font-bold text-center">10</div>
			<div class="text-sm text-center text-muted-foreground">+0</div>
		</Card>
		<Card class="p-4">
			<div class="text-xs text-center text-muted-foreground">WIS</div>
			<div class="text-3xl font-bold text-center">13</div>
			<div class="text-sm text-center text-muted-foreground">+1</div>
		</Card>
		<Card class="p-4">
			<div class="text-xs text-center text-muted-foreground">CHA</div>
			<div class="text-3xl font-bold text-center">8</div>
			<div class="text-sm text-center text-muted-foreground">-1</div>
		</Card>
	</div>
</div>
