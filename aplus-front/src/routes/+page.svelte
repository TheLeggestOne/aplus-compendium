<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Separator } from '$lib/components/ui/separator';
	import { Trash2, Plus, Minus } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Thorin Ironforge - APlus Compendium</title>
</svelte:head>

<div class="h-full flex flex-col pt-14">
	<!-- Persistent Header -->
	<div class="p-4 pb-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="flex items-center justify-between mb-3">
			<h1 class="text-xl font-bold">Thorin Ironforge</h1>
			<Button variant="outline" size="sm">Edit</Button>
		</div>

		<div class="grid grid-cols-6 gap-2">
			<Card class="p-2">
				<div class="text-xs text-muted-foreground">HP</div>
				<div class="text-lg font-bold">42/42</div>
			</Card>
			<Card class="p-2">
				<div class="text-xs text-muted-foreground">AC</div>
				<div class="text-lg font-bold">18</div>
			</Card>
			<Card class="p-2">
				<div class="text-xs text-muted-foreground">Init</div>
				<div class="text-lg font-bold">+1</div>
			</Card>
			<Card class="p-2">
				<div class="text-xs text-muted-foreground">Speed</div>
				<div class="text-lg font-bold">25 ft</div>
			</Card>
			<Card class="p-2">
				<div class="text-xs text-muted-foreground">Class</div>
				<div class="text-sm font-bold">Fighter 5</div>
			</Card>
			<Card class="p-2">
				<div class="text-xs text-muted-foreground">Race</div>
				<div class="text-sm font-bold">Dwarf</div>
			</Card>
		</div>
	</div>

	<!-- Tabbed Content -->
	<div class="flex-1 overflow-auto">
		<Tabs.Root value="stats" class="h-full flex flex-col">
			<Tabs.List class="px-4 pt-2">
				<Tabs.Trigger value="stats">Stats</Tabs.Trigger>
				<Tabs.Trigger value="combat">Combat</Tabs.Trigger>
				<Tabs.Trigger value="inventory">Inventory</Tabs.Trigger>
				<Tabs.Trigger value="spellcasting">Spellcasting</Tabs.Trigger>
				<Tabs.Trigger value="information">Information</Tabs.Trigger>
				<Tabs.Trigger value="notes">Notes</Tabs.Trigger>
			</Tabs.List>

			<!-- Stats Tab -->
			<Tabs.Content value="stats" class="flex-1 p-4 space-y-4">
				<div>
					<h2 class="text-sm font-semibold mb-2">Ability Scores</h2>
					<div class="grid grid-cols-6 gap-2">
						{#each [
							{ name: 'STR', score: 16, mod: '+3' },
							{ name: 'DEX', score: 12, mod: '+1' },
							{ name: 'CON', score: 14, mod: '+2' },
							{ name: 'INT', score: 10, mod: '+0' },
							{ name: 'WIS', score: 13, mod: '+1' },
							{ name: 'CHA', score: 8, mod: '-1' }
						] as ability}
							<Card class="p-3">
								<div class="text-xs text-center text-muted-foreground">{ability.name}</div>
								<div class="text-2xl font-bold text-center">{ability.score}</div>
								<div class="text-sm text-center text-muted-foreground">{ability.mod}</div>
							</Card>
						{/each}
					</div>
				</div>

				<Separator />

				<div class="grid grid-cols-2 gap-4">
					<div>
						<h2 class="text-sm font-semibold mb-2">Saving Throws</h2>
						<div class="space-y-1">
							{#each [
								{ name: 'Strength', mod: '+6', proficient: true },
								{ name: 'Dexterity', mod: '+1', proficient: false },
								{ name: 'Constitution', mod: '+5', proficient: true },
								{ name: 'Intelligence', mod: '+0', proficient: false },
								{ name: 'Wisdom', mod: '+1', proficient: false },
								{ name: 'Charisma', mod: '-1', proficient: false }
							] as save}
								<div class="flex items-center gap-2 p-1.5 rounded border text-sm">
									<div class="w-3 h-3 rounded-sm border {save.proficient ? 'bg-primary' : 'bg-muted'}"></div>
									<span class="flex-1">{save.name}</span>
									<span class="font-semibold">{save.mod}</span>
								</div>
							{/each}
						</div>
					</div>

					<div>
						<h2 class="text-sm font-semibold mb-2">Skills</h2>
						<div class="space-y-0.5">
							{#each [
								{ name: 'Acrobatics', mod: '+1', proficient: false },
								{ name: 'Animal Handling', mod: '+1', proficient: false },
								{ name: 'Arcana', mod: '+0', proficient: false },
								{ name: 'Athletics', mod: '+6', proficient: true },
								{ name: 'Deception', mod: '-1', proficient: false },
								{ name: 'History', mod: '+0', proficient: false },
								{ name: 'Insight', mod: '+1', proficient: false },
								{ name: 'Intimidation', mod: '+2', proficient: true },
								{ name: 'Investigation', mod: '+0', proficient: false },
								{ name: 'Medicine', mod: '+1', proficient: false },
								{ name: 'Nature', mod: '+0', proficient: false },
								{ name: 'Perception', mod: '+4', proficient: true },
								{ name: 'Performance', mod: '-1', proficient: false },
								{ name: 'Persuasion', mod: '-1', proficient: false },
								{ name: 'Religion', mod: '+0', proficient: false },
								{ name: 'Sleight of Hand', mod: '+1', proficient: false },
								{ name: 'Stealth', mod: '+1', proficient: false },
								{ name: 'Survival', mod: '+1', proficient: false }
							] as skill}
								<div class="flex items-center gap-2 p-1 rounded hover:bg-muted text-sm">
									<div class="w-3 h-3 rounded-sm border {skill.proficient ? 'bg-primary' : 'bg-muted'}"></div>
									<span class="flex-1">{skill.name}</span>
									<span class="font-semibold">{skill.mod}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<Separator />

				<div>
					<h2 class="text-sm font-semibold mb-2">Other Proficiencies</h2>
					<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
						<div>
							<span class="font-medium">Prof. Bonus:</span>
							<span class="ml-2">+3</span>
						</div>
						<div>
							<span class="font-medium">Languages:</span>
							<span class="ml-2">Common, Dwarvish</span>
						</div>
						<div>
							<span class="font-medium">Armor:</span>
							<span class="ml-2">All armor, shields</span>
						</div>
						<div>
							<span class="font-medium">Weapons:</span>
							<span class="ml-2">Simple, martial</span>
						</div>
						<div class="col-span-2">
							<span class="font-medium">Tools:</span>
							<span class="ml-2">Smith's tools</span>
						</div>
					</div>
				</div>
			</Tabs.Content>

			<!-- Combat Tab -->
			<Tabs.Content value="combat" class="flex-1 p-4 space-y-4">
				<div>
					<h2 class="text-sm font-semibold mb-2">Attacks & Spellcasting</h2>
					<div class="space-y-2">
						{#each [
							{ name: 'Battleaxe', bonus: '+6', damage: '1d8+3', type: 'slashing' },
							{ name: 'Handaxe (thrown)', bonus: '+6', damage: '1d6+3', type: 'slashing', range: '20/60 ft' }
						] as attack}
							<Card class="p-3">
								<div class="flex items-center justify-between mb-1">
									<h3 class="font-semibold text-sm">{attack.name}</h3>
									<Button variant="outline" size="sm" class="h-7 px-2">Roll</Button>
								</div>
								<div class="text-xs text-muted-foreground">
									<span class="mr-3">Atk: {attack.bonus}</span>
									<span class="mr-3">Dmg: {attack.damage} {attack.type}</span>
									{#if attack.range}
										<span>Range: {attack.range}</span>
									{/if}
								</div>
							</Card>
						{/each}
					</div>
				</div>

				<Separator />

				<div>
					<h2 class="text-sm font-semibold mb-2">Features & Traits</h2>
					<div class="space-y-2">
						{#each [
							{ name: 'Second Wind', source: 'Fighter', description: 'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level.' },
							{ name: 'Action Surge', source: 'Fighter', description: 'Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again.' },
							{ name: 'Darkvision', source: 'Dwarf', description: 'Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.' },
							{ name: 'Dwarven Resilience', source: 'Dwarf', description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.' }
						] as feature}
							<Card class="p-3">
								<div class="flex items-center justify-between mb-1">
									<h3 class="font-semibold text-sm">{feature.name}</h3>
									<span class="text-xs text-muted-foreground">{feature.source}</span>
								</div>
								<p class="text-xs text-muted-foreground">{feature.description}</p>
							</Card>
						{/each}
					</div>
				</div>
			</Tabs.Content>

			<!-- Inventory Tab -->
			<Tabs.Content value="inventory" class="flex-1 p-4 space-y-4">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-sm font-semibold">Inventories</h2>
					<div class="flex items-center gap-2">
						<Button variant="outline" size="sm" class="h-7 px-2">
							<Plus class="h-3 w-3 mr-1" />
							New Inventory
						</Button>
					</div>
				</div>

				<!-- Inventory List as Accordions -->
				<div class="space-y-2">
					<Accordion.Root type="multiple" value={['character-inventory']}>
						<!-- Character Inventory (Main) -->
						<Accordion.Item value="character-inventory" class="border rounded">
							<Accordion.Trigger class="text-sm font-medium hover:bg-muted px-3 py-2 rounded">
								<div class="flex items-center justify-between w-full pr-2">
									<span class="font-semibold">Character Inventory</span>
									<span class="text-xs text-muted-foreground">7 items · 69 / 240 lbs</span>
								</div>
							</Accordion.Trigger>
							<Accordion.Content>
								<div class="px-2 pb-2">
									<div class="text-xs text-muted-foreground mb-2 px-2">Equipped and carried items</div>
									<div class="space-y-1">
										{#each [
											{ name: 'Chain Mail', quantity: 1, weight: 55 },
											{ name: 'Shield', quantity: 1, weight: 6 },
											{ name: 'Battleaxe', quantity: 1, weight: 4 },
											{ name: 'Handaxe', quantity: 2, weight: 4 },
											{ name: 'Explorer\'s Pack', quantity: 1, weight: 10 },
											{ name: 'Hempen Rope (50 ft)', quantity: 1, weight: 10 },
											{ name: 'Waterskin', quantity: 1, weight: 5 }
										] as item}
											<div class="flex items-center gap-2 p-2 rounded border hover:bg-muted text-sm group">
												<div class="text-muted-foreground cursor-move">⋮⋮</div>
												<div class="flex-1 min-w-0">
													<div class="font-medium truncate">{item.name}</div>
												</div>
												<div class="text-xs text-muted-foreground whitespace-nowrap">{item.weight * item.quantity} lbs</div>
												<div class="flex items-center gap-1">
													<Button variant="ghost" size="icon" class="h-6 w-6 opacity-0 group-hover:opacity-100">
														<Minus class="h-3 w-3" />
													</Button>
													<span class="text-xs w-6 text-center">×{item.quantity}</span>
													<Button variant="ghost" size="icon" class="h-6 w-6 opacity-0 group-hover:opacity-100">
														<Plus class="h-3 w-3" />
													</Button>
												</div>
												<Button variant="ghost" size="icon" class="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100">
													<Trash2 class="h-3 w-3" />
												</Button>
											</div>
										{/each}
									</div>
									<Button variant="ghost" size="sm" class="w-full h-8 mt-2 text-xs">
										<Plus class="h-3 w-3 mr-1" />
										Add Item
									</Button>
								</div>
							</Accordion.Content>
						</Accordion.Item>

						<!-- Bag of Holding -->
						<Accordion.Item value="bag-of-holding" class="border rounded">
							<Accordion.Trigger class="text-sm font-medium hover:bg-muted px-3 py-2 rounded">
								<div class="flex items-center justify-between w-full pr-2">
									<input 
										type="text" 
										value="Bag of Holding" 
										class="bg-transparent border-none outline-none focus:bg-background focus:px-2 focus:py-1 focus:rounded" 
										onclick={(e) => e.stopPropagation()}
									/>
									<span class="text-xs text-muted-foreground">3 items · 21.5 lbs</span>
								</div>
							</Accordion.Trigger>
							<Accordion.Content>
								<div class="px-2 pb-2">
									<div class="text-xs text-muted-foreground mb-2 px-2">Extradimensional storage</div>
									<div class="space-y-1">
										{#each [
											{ name: 'Potion of Healing', quantity: 3, weight: 0.5 },
											{ name: 'Rations (1 day)', quantity: 10, weight: 2 },
											{ name: 'Bedroll', quantity: 1, weight: 7 }
										] as item}
											<div class="flex items-center gap-2 p-2 rounded border hover:bg-muted text-sm group">
												<div class="text-muted-foreground cursor-move">⋮⋮</div>
												<div class="flex-1 min-w-0">
													<div class="font-medium truncate">{item.name}</div>
												</div>
												<div class="text-xs text-muted-foreground whitespace-nowrap">{item.weight * item.quantity} lbs</div>
												<div class="flex items-center gap-1">
													<Button variant="ghost" size="icon" class="h-6 w-6 opacity-0 group-hover:opacity-100">
														<Minus class="h-3 w-3" />
													</Button>
													<span class="text-xs w-6 text-center">×{item.quantity}</span>
													<Button variant="ghost" size="icon" class="h-6 w-6 opacity-0 group-hover:opacity-100">
														<Plus class="h-3 w-3" />
													</Button>
												</div>
												<Button variant="ghost" size="icon" class="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100">
													<Trash2 class="h-3 w-3" />
												</Button>
											</div>
										{/each}
									</div>
									<Button variant="ghost" size="sm" class="w-full h-8 mt-2 text-xs">
										<Plus class="h-3 w-3 mr-1" />
										Add Item
									</Button>
								</div>
							</Accordion.Content>
						</Accordion.Item>

						<!-- Party Loot -->
						<Accordion.Item value="party-loot" class="border rounded">
							<Accordion.Trigger class="text-sm font-medium hover:bg-muted px-3 py-2 rounded">
								<div class="flex items-center justify-between w-full pr-2">
									<input 
										type="text" 
										value="Party Loot - Dragon's Hoard" 
										class="bg-transparent border-none outline-none focus:bg-background focus:px-2 focus:py-1 focus:rounded" 
										onclick={(e) => e.stopPropagation()}
									/>
									<span class="text-xs text-muted-foreground">2 items · 15 lbs</span>
								</div>
							</Accordion.Trigger>
							<Accordion.Content>
								<div class="px-2 pb-2">
									<div class="text-xs text-muted-foreground mb-2 px-2">Shared party treasure</div>
									<div class="space-y-1">
										{#each [
											{ name: 'Ancient Tome', quantity: 1, weight: 5 },
											{ name: 'Golden Chalice', quantity: 1, weight: 10 }
										] as item}
											<div class="flex items-center gap-2 p-2 rounded border hover:bg-muted text-sm group">
												<div class="text-muted-foreground cursor-move">⋮⋮</div>
												<div class="flex-1 min-w-0">
													<div class="font-medium truncate">{item.name}</div>
												</div>
												<div class="text-xs text-muted-foreground whitespace-nowrap">{item.weight * item.quantity} lbs</div>
												<div class="flex items-center gap-1">
													<Button variant="ghost" size="icon" class="h-6 w-6 opacity-0 group-hover:opacity-100">
														<Minus class="h-3 w-3" />
													</Button>
													<span class="text-xs w-6 text-center">×{item.quantity}</span>
													<Button variant="ghost" size="icon" class="h-6 w-6 opacity-0 group-hover:opacity-100">
														<Plus class="h-3 w-3" />
													</Button>
												</div>
												<Button variant="ghost" size="icon" class="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100">
													<Trash2 class="h-3 w-3" />
												</Button>
											</div>
										{/each}
									</div>
									<Button variant="ghost" size="sm" class="w-full h-8 mt-2 text-xs">
										<Plus class="h-3 w-3 mr-1" />
										Add Item
									</Button>
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</div>

				<Separator />

				<div>
					<h2 class="text-sm font-semibold mb-2">Currency</h2>
					<div class="grid grid-cols-5 gap-2">
						{#each [
							{ name: 'CP', amount: 23 },
							{ name: 'SP', amount: 15 },
							{ name: 'GP', amount: 47 },
							{ name: 'EP', amount: 0 },
							{ name: 'PP', amount: 2 }
						] as currency}
							<Card class="p-2 text-center">
								<div class="text-lg font-bold">{currency.amount}</div>
								<div class="text-xs text-muted-foreground">{currency.name}</div>
							</Card>
						{/each}
					</div>
				</div>
			</Tabs.Content>

			<!-- Spellcasting Tab -->
			<Tabs.Content value="spellcasting" class="flex-1 p-6">
				<div class="flex items-center justify-center h-full">
					<div class="text-center text-muted-foreground">
						<p class="text-lg mb-2">No spellcasting ability</p>
						<p class="text-sm">This character doesn't have the ability to cast spells.</p>
					</div>
				</div>
			</Tabs.Content>

			<!-- Information Tab -->
			<Tabs.Content value="information" class="flex-1 p-4 space-y-4">
				<div>
					<h2 class="text-sm font-semibold mb-2">Character Details</h2>
					<div class="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
						<div>
							<span class="font-medium">Alignment:</span>
							<span class="ml-2">Lawful Good</span>
						</div>
						<div>
							<span class="font-medium">Background:</span>
							<span class="ml-2">Soldier</span>
						</div>
						<div>
							<span class="font-medium">Age:</span>
							<span class="ml-2">52</span>
						</div>
						<div>
							<span class="font-medium">Height:</span>
							<span class="ml-2">4'5"</span>
						</div>
						<div>
							<span class="font-medium">Weight:</span>
							<span class="ml-2">165 lbs</span>
						</div>
						<div>
							<span class="font-medium">Eyes:</span>
							<span class="ml-2">Brown</span>
						</div>
					</div>
				</div>

				<Separator />

				<div>
					<h2 class="text-sm font-semibold mb-2">Personality</h2>
					<div class="space-y-2">
						<Card class="p-3">
							<h3 class="text-xs font-semibold mb-1">Personality Traits</h3>
							<p class="text-xs">I'm always polite and respectful. I face problems head-on.</p>
						</Card>
						<Card class="p-3">
							<h3 class="text-xs font-semibold mb-1">Ideals</h3>
							<p class="text-xs">Greater Good. It is each person's responsibility to make the most happiness for the whole tribe.</p>
						</Card>
						<Card class="p-3">
							<h3 class="text-xs font-semibold mb-1">Bonds</h3>
							<p class="text-xs">I would still lay down my life for the people I served with.</p>
						</Card>
						<Card class="p-3">
							<h3 class="text-xs font-semibold mb-1">Flaws</h3>
							<p class="text-xs">I made a terrible mistake in battle that cost many lives—and I would do anything to keep that mistake secret.</p>
						</Card>
					</div>
				</div>

				<Separator />

				<div>
					<h2 class="text-sm font-semibold mb-2">Backstory</h2>
					<Card class="p-3">
						<p class="text-xs">
							Thorin Ironforge served in the mountain guard for thirty years, defending his clan's stronghold from goblin incursions and protecting trade caravans through the treacherous passes. After a devastating battle where tactical errors led to significant casualties, he retired from active military service, though guilt still weighs heavily on his conscience. Now he seeks redemption through acts of heroism, traveling the land to protect those who cannot protect themselves.
						</p>
					</Card>
				</div>
			</Tabs.Content>

			<!-- Notes Tab -->
			<Tabs.Content value="notes" class="flex-1 p-4">
				<div class="h-full flex flex-col">
					<h2 class="text-sm font-semibold mb-2">Session Notes</h2>
					<Card class="flex-1 p-3">
						<textarea 
							class="w-full h-full resize-none bg-transparent outline-none text-xs" 
							placeholder="Take notes during your session here..."
						>Session 1: Met the party at the Prancing Pony tavern. Accepted quest to investigate missing traders.

Session 2: Discovered goblin camp in the forest. Rescued merchants. Found strange magical artifact.

Session 3: Traveled to Waterdeep to research the artifact...</textarea>
					</Card>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
