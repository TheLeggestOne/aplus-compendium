const mockPaladinAerindel = {
  id: "aerindel",
  name: "Aerindel Dawnsworn",
  classes: [{ class: "paladin", level: 5, subclass: "Oath of Devotion", hitDie: "d10" }],
  race: "Aasimar",
  subrace: "Protector",
  background: "Soldier",
  alignment: "lawful-good",
  experience: 6500,
  proficiencyBonus: 3,
  inspiration: false,
  abilityScores: {
    strength: 18,
    dexterity: 10,
    constitution: 14,
    intelligence: 10,
    wisdom: 13,
    charisma: 16
  },
  savingThrows: {
    strength: { proficient: false, modifier: 4 },
    dexterity: { proficient: false, modifier: 0 },
    constitution: { proficient: false, modifier: 2 },
    intelligence: { proficient: false, modifier: 0 },
    wisdom: { proficient: true, modifier: 4 },
    charisma: { proficient: true, modifier: 6 }
  },
  skills: {
    acrobatics: { proficiency: "none", modifier: 0 },
    "animal-handling": { proficiency: "none", modifier: 1 },
    arcana: { proficiency: "none", modifier: 0 },
    athletics: { proficiency: "proficient", modifier: 7 },
    deception: { proficiency: "none", modifier: 3 },
    history: { proficiency: "none", modifier: 0 },
    insight: { proficiency: "proficient", modifier: 4 },
    intimidation: { proficiency: "proficient", modifier: 6 },
    investigation: { proficiency: "none", modifier: 0 },
    medicine: { proficiency: "none", modifier: 1 },
    nature: { proficiency: "none", modifier: 0 },
    perception: { proficiency: "proficient", modifier: 4 },
    performance: { proficiency: "none", modifier: 3 },
    persuasion: { proficiency: "proficient", modifier: 6 },
    religion: { proficiency: "proficient", modifier: 3 },
    "sleight-of-hand": { proficiency: "none", modifier: 0 },
    stealth: { proficiency: "none", modifier: 0 },
    survival: { proficiency: "none", modifier: 1 }
  },
  combat: {
    maxHitPoints: 44,
    currentHitPoints: 44,
    temporaryHitPoints: 0,
    armorClass: 20,
    initiative: 0,
    speed: 30,
    hitDicePools: [{ dieType: "d10", total: 5, used: 0 }],
    deathSaves: { successes: 0, failures: 0 }
  },
  spellcasting: {
    ability: { abilityScore: "charisma", spellSaveDC: 14, spellAttackBonus: 6 },
    slots: [
      { level: 1, total: 4, used: 0 },
      { level: 2, total: 2, used: 0 }
    ],
    cantrips: [],
    spellsKnown: [
      {
        id: "bless",
        name: "Bless",
        level: 1,
        school: "enchantment",
        castingTime: "1 action",
        range: "30 feet",
        components: { verbal: true, somatic: true, material: true, materialDescription: "a sprinkling of holy water" },
        duration: "Up to 1 minute",
        concentration: true,
        ritual: false,
        description: "You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.",
        prepared: true
      },
      {
        id: "cure-wounds",
        name: "Cure Wounds",
        level: 1,
        school: "evocation",
        castingTime: "1 action",
        range: "Touch",
        components: { verbal: true, somatic: true, material: false },
        duration: "Instantaneous",
        concentration: false,
        ritual: false,
        description: "A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",
        prepared: true
      },
      {
        id: "divine-favor",
        name: "Divine Favor",
        level: 1,
        school: "evocation",
        castingTime: "1 bonus action",
        range: "Self",
        components: { verbal: true, somatic: true, material: false },
        duration: "Up to 1 minute",
        concentration: true,
        ritual: false,
        description: "Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.",
        prepared: true
      },
      {
        id: "shield-of-faith",
        name: "Shield of Faith",
        level: 1,
        school: "abjuration",
        castingTime: "1 bonus action",
        range: "60 feet",
        components: { verbal: true, somatic: true, material: true, materialDescription: "a small parchment with a bit of holy text" },
        duration: "Up to 10 minutes",
        concentration: true,
        ritual: false,
        description: "A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration.",
        prepared: true
      },
      {
        id: "sanctuary",
        name: "Sanctuary",
        level: 1,
        school: "abjuration",
        castingTime: "1 bonus action",
        range: "30 feet",
        components: { verbal: true, somatic: true, material: true, materialDescription: "a small silver mirror" },
        duration: "1 minute",
        concentration: false,
        ritual: false,
        description: "You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a Wisdom saving throw.",
        prepared: true
      },
      {
        id: "aid",
        name: "Aid",
        level: 2,
        school: "abjuration",
        castingTime: "1 action",
        range: "30 feet",
        components: { verbal: true, somatic: true, material: true, materialDescription: "a tiny strip of white cloth" },
        duration: "8 hours",
        concentration: false,
        ritual: false,
        description: "Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target's hit point maximum and current hit points increase by 5 for the duration.",
        prepared: true
      },
      {
        id: "lesser-restoration",
        name: "Lesser Restoration",
        level: 2,
        school: "abjuration",
        castingTime: "1 action",
        range: "Touch",
        components: { verbal: true, somatic: true, material: false },
        duration: "Instantaneous",
        concentration: false,
        ritual: false,
        description: "You touch a creature and can end either one disease or one condition afflicting it. The condition can be blinded, deafened, paralyzed, or poisoned.",
        prepared: true
      }
    ]
  },
  weapons: [
    {
      id: "longsword",
      name: "Longsword",
      quantity: 1,
      weight: 3,
      category: "martial-melee",
      damageDice: "1d8",
      damageType: "slashing",
      properties: ["versatile"],
      attackBonus: 7,
      damageBonus: 4,
      abilityUsed: "strength",
      versatileDamageDice: "1d10",
      dieType: "d8"
    },
    {
      id: "handaxe-1",
      name: "Handaxe",
      quantity: 2,
      weight: 2,
      category: "simple-melee",
      damageDice: "1d6",
      damageType: "slashing",
      properties: ["light", "thrown"],
      attackBonus: 7,
      damageBonus: 4,
      abilityUsed: "strength",
      range: { normal: 20, long: 60 },
      dieType: "d6"
    }
  ],
  armor: [
    {
      id: "plate",
      name: "Plate Armor",
      quantity: 1,
      weight: 65,
      category: "heavy",
      baseArmorClass: 18,
      strengthRequirement: 15,
      stealthDisadvantage: true,
      equipped: true,
      rarity: "common"
    },
    {
      id: "shield",
      name: "Shield",
      quantity: 1,
      weight: 6,
      category: "shield",
      baseArmorClass: 2,
      stealthDisadvantage: false,
      equipped: true,
      rarity: "common"
    }
  ],
  equipment: [
    { id: "holy-symbol", name: "Holy Symbol (Amulet)", quantity: 1, weight: 1, description: "A silver amulet bearing the symbol of the Morninglord." },
    { id: "healing-potion", name: "Potion of Healing", quantity: 2, weight: 0.5, rarity: "common", description: "Regain 2d4+2 HP when you drink this potion." },
    { id: "adventurers-pack", name: "Adventurer's Pack", quantity: 1, weight: 59, description: "Includes a backpack, bedroll, 2 costumes, 5 candles, 5 days rations, a waterskin, and 50ft hempen rope." },
    { id: "chain-mail-spare", name: "Chain Mail (spare)", quantity: 1, weight: 55 }
  ],
  currency: { platinum: 1, gold: 47, electrum: 0, silver: 12, copper: 5 },
  features: [
    {
      id: "divine-sense",
      name: "Divine Sense",
      source: "Paladin 1",
      sourceType: "class",
      description: "The presence of strong evil registers on your senses like a noxious odor, and powerful good rings like heavenly music in your ears. As an action, you can open your awareness to detect such forces. Until the end of your next turn, you know the location of any celestial, fiend, or undead within 60 feet of you that is not behind total cover. You know the type of any being whose presence you sense, but not its identity.",
      uses: { current: 4, maximum: 4, resetOn: "long" }
    },
    {
      id: "lay-on-hands",
      name: "Lay on Hands",
      source: "Paladin 1",
      sourceType: "class",
      description: "Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. With that pool, you can restore a total of 25 hit points. As an action, you can touch a creature and draw power from the pool to restore a number of hit points to that creature, up to the maximum amount remaining in your pool.",
      uses: { current: 25, maximum: 25, resetOn: "long" }
    },
    {
      id: "divine-smite",
      name: "Divine Smite",
      source: "Paladin 2",
      sourceType: "class",
      description: "When you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage to the target, in addition to the weapon's damage. The extra damage is 2d8 for a 1st-level spell slot, plus 1d8 for each spell level higher than 1st, to a maximum of 5d8. The damage increases by 1d8 if the target is an undead or a fiend."
    },
    {
      id: "channel-divinity-sacred-weapon",
      name: "Channel Divinity: Sacred Weapon",
      source: "Oath of Devotion 3",
      sourceType: "subclass",
      description: "As an action, you can imbue one weapon that you are holding with positive energy, using your Channel Divinity. For 1 minute, you add your Charisma modifier (+3) to attack rolls made with that weapon. The weapon also emits bright light in a 20-foot radius and dim light 20 feet beyond that.",
      uses: { current: 1, maximum: 1, resetOn: "short" }
    },
    {
      id: "channel-divinity-turn-unholy",
      name: "Channel Divinity: Turn the Unholy",
      source: "Oath of Devotion 3",
      sourceType: "subclass",
      description: "As an action, you present your holy symbol and speak a prayer censuring fiends and undead, using your Channel Divinity. Each fiend or undead that can see or hear you within 30 feet of you must make a Wisdom saving throw (DC 14). If the creature fails its saving throw, it is turned for 1 minute or until it takes damage."
    },
    {
      id: "extra-attack",
      name: "Extra Attack",
      source: "Paladin 5",
      sourceType: "class",
      description: "Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn."
    },
    {
      id: "aura-of-protection",
      name: "Aura of Protection",
      source: "Paladin 6",
      sourceType: "class",
      description: "Starting at 6th level, whenever you or a friendly creature within 10 feet of you must make a saving throw, the creature gains a bonus to the saving throw equal to your Charisma modifier (+3). You must be conscious to grant this bonus. Note: This aura activates at level 6 — Aerindel is level 5 and doesn't yet have this ability."
    },
    {
      id: "radiant-soul",
      name: "Radiant Soul",
      source: "Aasimar (Protector)",
      sourceType: "race",
      description: "Starting at 3rd level, you can use your action to unleash the divine energy within yourself, causing your eyes to glimmer and two luminous, incorporeal wings to sprout from your back. Your transformation lasts for 1 minute or until you end it as a bonus action. During it, you have a flying speed of 30 feet, and once on each of your turns, you can deal extra radiant damage to one target equal to your level (5).",
      uses: { current: 1, maximum: 1, resetOn: "long" }
    },
    {
      id: "celestial-resistance",
      name: "Celestial Resistance",
      source: "Aasimar",
      sourceType: "race",
      description: "You have resistance to necrotic damage and radiant damage."
    },
    {
      id: "healing-hands",
      name: "Healing Hands",
      source: "Aasimar",
      sourceType: "race",
      description: "As an action, you can touch a creature and cause it to regain a number of hit points equal to your level (5). Once you use this trait, you can't use it again until you finish a long rest.",
      uses: { current: 1, maximum: 1, resetOn: "long" }
    },
    {
      id: "military-rank",
      name: "Military Rank",
      source: "Background: Soldier",
      sourceType: "background",
      description: "You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence, and they defer to you if they are of a lower rank. You can invoke your rank to exert influence over other soldiers and requisition simple equipment or horses for temporary use."
    }
  ],
  appearance: {
    age: "28",
    height: `6'2"`,
    weight: "195 lbs",
    eyes: "Silver (glowing faintly)",
    skin: "Pale gold with faint luminescence",
    hair: "White"
  },
  narrative: {
    personalityTraits: ["I face problems head-on. A simple, direct solution is the best path to success."],
    ideals: ["Greater Good. Our lot is to lay down our lives in defense of others."],
    bonds: ["I'll never forget the crushing defeat my company suffered or the enemies who dealt it."],
    flaws: ["I have little respect for anyone who is not a proven warrior."]
  }
};
export {
  mockPaladinAerindel as m
};
