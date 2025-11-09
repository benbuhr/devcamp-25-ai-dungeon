import { Room } from "../../../shared/index.js";

export type RoomRole = "hub" | "entry" | "boss" | "normal";
export type RoomChain = "hub" | "chapel" | "well" | "monastery" | "orchard" | "road" | "misc";

export interface RoomTemplate
  extends Omit<Room, "exits"> {
  role?: RoomRole;
  chain?: RoomChain;
}

// Core world templates derived from the static map. Exits are assigned by the generator.
export const ROOM_TEMPLATES: Record<string, RoomTemplate> = {
  "graysong-square": {
    id: "graysong-square",
    name: "Graysong Square",
    description: "Rain-slick stones surround the silent chapel bell.",
    items: ["ember-1"],
    actors: ["villager-ida"],
    traits: ["safe", "hearth"],
    role: "hub",
    chain: "hub"
  },
  // Chapel chain
  "ember-chapel-nave": {
    id: "ember-chapel-nave",
    name: "Ember Chapel Nave",
    description: "Benches overturned; candles gutter in the draft.",
    items: ["ember-2"],
    actors: ["lantern-wisp-1"],
    traits: ["sanctified"],
    role: "entry",
    chain: "chapel"
  },
  "bell-tower": {
    id: "bell-tower",
    name: "Bell Tower",
    description: "The Great Bell hangs cracked; ropes fray in the night wind.",
    items: [],
    actors: [],
    traits: ["objective"],
    role: "normal",
    chain: "chapel"
  },
  "ember-chapel-crypt": {
    id: "ember-chapel-crypt",
    name: "Chapel Crypt",
    description: "Stone coffers line the walls. Bone chimes sway softly.",
    items: ["simple-key-crypt"],
    actors: ["husk-1", "husk-2"],
    traits: ["threat"],
    role: "normal",
    chain: "chapel"
  },
  "ember-chapel-depths": {
    id: "ember-chapel-depths",
    name: "Crypt Depths",
    description: "A sealed iron gate leads to the bellwraith's haunt.",
    items: ["bell-shard-one"],
    actors: ["bellwraith"],
    traits: ["boss"],
    role: "boss",
    chain: "chapel"
  },
  // Well chain
  "witchwell-approach": {
    id: "witchwell-approach",
    name: "Witchwell Approach",
    description: "Mist curls around moss altars. Water whispers beneath.",
    items: [],
    actors: ["gloom-wolf-1"],
    traits: ["threat"],
    role: "entry",
    chain: "well"
  },
  "witchwell-pool": {
    id: "witchwell-pool",
    name: "Witchwell Pool",
    description: "Black water circles a stone wellmouth lit by foxfire.",
    items: ["bell-shard-two"],
    actors: ["well-mother"],
    traits: ["boss"],
    role: "boss",
    chain: "well"
  },
  // Monastery chain
  "hollow-monastery-gate": {
    id: "hollow-monastery-gate",
    name: "Hollow Monastery Gate",
    description: "Cloister arches open onto a scriptoria of ash.",
    items: [],
    actors: ["chapel-guard-1"],
    traits: [],
    role: "entry",
    chain: "monastery"
  },
  "hollow-monastery-cloister": {
    id: "hollow-monastery-cloister",
    name: "Ashen Cloister",
    description: "Charred scrolls flutter like moths beneath broken arches.",
    items: ["ember-3"],
    actors: ["bonebinder-1"],
    traits: ["threat"],
    role: "normal",
    chain: "monastery"
  },
  "hollow-monastery-reliquary": {
    id: "hollow-monastery-reliquary",
    name: "Reliquary Vault",
    description: "Silver reliquaries lie toppled; altar light flickers.",
    items: ["bell-shard-three"],
    actors: ["prior-of-ash"],
    traits: ["boss"],
    role: "boss",
    chain: "monastery"
  },
  // Orchard chain
  "orchard-path": {
    id: "orchard-path",
    name: "Blackroot Orchard",
    description: "Twisted apple trees drip with black sap.",
    items: ["ward-candle-2"],
    actors: ["gloom-wolf-2"],
    traits: ["threat"],
    role: "entry",
    chain: "orchard"
  },
  "orchard-heart": {
    id: "orchard-heart",
    name: "Orchard Heart",
    description: "Roots knot around a pulsing blight at the grove's center.",
    items: ["bell-shard-four"],
    actors: ["orchard-heart"],
    traits: ["boss"],
    role: "boss",
    chain: "orchard"
  },
  // Road and village adjuncts
  "old-road": {
    id: "old-road",
    name: "Old Road",
    description: "A mud road lined with guttering braziers heads into the dark.",
    items: [],
    actors: ["shambler-1"],
    traits: ["threat"],
    role: "normal",
    chain: "road"
  },
  "mill-yard": {
    id: "mill-yard",
    name: "Mill Yard",
    description: "Abandoned sacks and a waterwheel creak in the dark rain.",
    items: [],
    actors: ["villager-bryn"],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "mill-loft": {
    id: "mill-loft",
    name: "Mill Loft",
    description: "Dusty grain bins and a broken lantern overlook the yard.",
    items: ["ward-candle-1"],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  // New empty flavor rooms to enrich exploration
  "rain-market": {
    id: "rain-market",
    name: "Rain Market",
    description: "Tarped stalls drip steadily; coins lie forgotten in puddles.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "charcoal-burn": {
    id: "charcoal-burn",
    name: "Charcoal Burn",
    description: "Smoldering mounds smoke beneath sod; the air tastes of cinder.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "sodden-stable": {
    id: "sodden-stable",
    name: "Sodden Stable",
    description: "Empty stalls, slick straw; a halter swings in the draft.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "collapsed-bridge": {
    id: "collapsed-bridge",
    name: "Collapsed Bridge",
    description: "A river runs black under broken stone and rope fronds.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "fog-lantern-pier": {
    id: "fog-lantern-pier",
    name: "Fog Lantern Pier",
    description: "Green lamps burn cold; tide-chimes clatter beneath the boards.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "ash-field": {
    id: "ash-field",
    name: "Ash Field",
    description: "Wind combs pale furrows; black stubble pricks through frost.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "clay-pits": {
    id: "clay-pits",
    name: "Clay Pits",
    description: "Slick pits rimmed with footmarks; a shovel half-swallowed.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "moss-hall": {
    id: "moss-hall",
    name: "Moss Hall",
    description: "A ruined manor furred with moss; candle niches gone dark.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "weathered-shrine": {
    id: "weathered-shrine",
    name: "Weathered Shrine",
    description: "Offerings turned to pulp; a hollow idol weeps rainwater.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  },
  "fallow-terrace": {
    id: "fallow-terrace",
    name: "Fallow Terrace",
    description: "Terraced plots gone to weeds; scarecrows bow to the wind.",
    items: [],
    actors: [],
    traits: [],
    role: "normal",
    chain: "misc"
  }
};



