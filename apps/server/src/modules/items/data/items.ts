import { Item } from "../../../shared/index.js";

export type ItemId = string;

export const ITEMS: Record<ItemId, Item> = {
  "ember-1": {
    id: "ember-1",
    name: "Loose Ember",
    description: "A palm-sized ember that glows with soft heat.",
    tier: "common",
    tags: ["consumable"],
    ward: 1
  },
  "ember-2": {
    id: "ember-2",
    name: "Warm Ember",
    description: "An ember taken from the chapel brazier.",
    tier: "common",
    tags: ["consumable"],
    ward: 1
  },
  "ember-3": {
    id: "ember-3",
    name: "Ashen Ember",
    description: "A spark salvaged from the monastery cloister.",
    tier: "common",
    tags: ["consumable"],
    ward: 1
  },
  "ward-candle-1": {
    id: "ward-candle-1",
    name: "Ward Candle",
    description: "A beeswax candle infused with chapel ash.",
    tier: "common",
    tags: ["consumable", "ward"],
    ward: 2
  },
  "ward-candle-2": {
    id: "ward-candle-2",
    name: "Ward Candle",
    description: "A candle recovered from the orchard shrine.",
    tier: "common",
    tags: ["consumable", "ward"],
    ward: 2
  },
  "simple-key-crypt": {
    id: "simple-key-crypt",
    name: "Crypt Key",
    description: "A simple iron key with bone-charm teeth.",
    tier: "common",
    tags: ["key"]
  },
  "embersteel-knife": {
    id: "embersteel-knife",
    name: "Embersteel Knife",
    description: "Short blade forged to hold heat against husks.",
    slot: "hand",
    power: 2,
    tier: "common",
    tags: ["weapon"]
  },
  "tempered-maul": {
    id: "tempered-maul",
    name: "Tempered Maul",
    description: "Heavy hammer ringed with warding sigils.",
    slot: "hand",
    power: 4,
    tier: "tempered",
    tags: ["weapon"]
  },
  "consecrated-visor": {
    id: "consecrated-visor",
    name: "Consecrated Visor",
    description: "Polished helm that glows faintly in darkness.",
    slot: "head",
    ward: 5,
    tier: "consecrated",
    tags: ["armor"]
  },
  "reliquary-band": {
    id: "reliquary-band",
    name: "Reliquary Band",
    description: "Silver band set with holy ash.",
    slot: "trinket",
    power: 2,
    ward: 2,
    tier: "relic",
    tags: ["trinket"]
  },
  "bell-shard-one": {
    id: "bell-shard-one",
    name: "Bell Shard I",
    description: "A cracked fragment of the Great Bell.",
    tier: "relic",
    tags: ["quest"]
  },
  "bell-shard-two": {
    id: "bell-shard-two",
    name: "Bell Shard II",
    description: "Another shard humming with distant tolls.",
    tier: "relic",
    tags: ["quest"]
  },
  "bell-shard-three": {
    id: "bell-shard-three",
    name: "Bell Shard III",
    description: "A shard etched with warding glyphs.",
    tier: "relic",
    tags: ["quest"]
  },
  "bell-shard-four": {
    id: "bell-shard-four",
    name: "Bell Shard IV",
    description: "The final shard, its edge warm with light.",
    tier: "relic",
    tags: ["quest"]
  },
  "bell-clapper": {
    id: "bell-clapper",
    name: "Forged Bell Clapper",
    description: "Forged from four shards; pulses with slow light.",
    tier: "relic",
    tags: ["quest"]
  }
};

export const getItemById = (itemId: ItemId): Item => {
  const item = ITEMS[itemId];
  if (!item) {
    throw new Error(`Unknown item id "${itemId}"`);
  }
  return item;
};

