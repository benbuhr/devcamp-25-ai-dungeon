export interface LootEntry {
  itemId: string;
  weight: number;
  guaranteed?: boolean;
}

export interface LootTable {
  id: string;
  entries: LootEntry[];
}

export const LOOT_TABLES: Record<string, LootTable> = {
  "shambler-basic": {
    id: "shambler-basic",
    entries: [
      { itemId: "embersteel-knife", weight: 1 },
      { itemId: "ember-1", weight: 2, guaranteed: true }
    ]
  },
  "gloom-wolf": {
    id: "gloom-wolf",
    entries: [
      { itemId: "ember-2", weight: 1, guaranteed: true },
      { itemId: "ward-candle-2", weight: 1 }
    ]
  },
  "bellwraith": {
    id: "bellwraith",
    entries: [
      { itemId: "bell-shard-one", weight: 1, guaranteed: true },
      { itemId: "tempered-maul", weight: 1 }
    ]
  },
  "well-mother": {
    id: "well-mother",
    entries: [
      { itemId: "bell-shard-two", weight: 1, guaranteed: true },
      { itemId: "consecrated-visor", weight: 1 }
    ]
  },
  "prior-of-ash": {
    id: "prior-of-ash",
    entries: [
      { itemId: "bell-shard-three", weight: 1, guaranteed: true },
      { itemId: "reliquary-band", weight: 1 }
    ]
  },
  "orchard-heart": {
    id: "orchard-heart",
    entries: [
      { itemId: "bell-shard-four", weight: 1, guaranteed: true },
      { itemId: "ward-candle-1", weight: 1 }
    ]
  }
};

export const getLootTable = (lootTableId: string): LootTable | undefined =>
  LOOT_TABLES[lootTableId];

export const rollLoot = (
  lootTableId: string | undefined,
  random: () => number
): string[] => {
  if (!lootTableId) {
    return [];
  }
  const table = getLootTable(lootTableId);
  if (!table) {
    return [];
  }

  const guaranteed = table.entries
    .filter((entry) => entry.guaranteed)
    .map((entry) => entry.itemId);

  const weighted = table.entries.filter((entry) => !entry.guaranteed);
  if (weighted.length === 0) {
    return guaranteed;
  }

  const totalWeight = weighted.reduce((acc, entry) => acc + entry.weight, 0);
  const roll = random() * totalWeight;
  let cumulative = 0;
  for (const entry of weighted) {
    cumulative += entry.weight;
    if (roll <= cumulative) {
      return [...guaranteed, entry.itemId];
    }
  }
  return guaranteed;
};

