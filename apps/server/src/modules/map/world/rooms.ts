import { RoomGraph } from "../../../shared/index.js";

export const ROOM_GRAPH: RoomGraph = {
  rooms: {
    "graysong-square": {
      id: "graysong-square",
      name: "Graysong Square",
      description: "Rain-slick stones surround the silent chapel bell.",
      exits: {
        north: "ember-chapel-nave",
        east: "mill-yard",
        south: "old-road"
      },
      items: ["ember-1"],
      actors: ["villager-ida"],
      traits: ["safe", "hearth"]
    },
    "mill-yard": {
      id: "mill-yard",
      name: "Mill Yard",
      description: "Abandoned sacks and a waterwheel creak in the dark rain.",
      exits: {
        west: "graysong-square",
        up: "mill-loft"
      },
      items: [],
      actors: ["villager-bryn"],
      traits: []
    },
    "mill-loft": {
      id: "mill-loft",
      name: "Mill Loft",
      description: "Dusty grain bins and a broken lantern overlook the yard.",
      exits: {
        down: "mill-yard"
      },
      items: ["ward-candle-1"],
      actors: [],
      traits: []
    },
    "old-road": {
      id: "old-road",
      name: "Old Road",
      description: "A mud road lined with guttering braziers heads south.",
      exits: {
        north: "graysong-square",
        south: "witchwell-approach",
        east: "orchard-path"
      },
      items: [],
      actors: ["shambler-1"],
      traits: ["threat"]
    },
    "ember-chapel-nave": {
      id: "ember-chapel-nave",
      name: "Ember Chapel Nave",
      description: "Benches overturned; candles gutter in the draft.",
      exits: {
        south: "graysong-square",
        up: "bell-tower",
        down: "ember-chapel-crypt",
        east: "hollow-monastery-gate"
      },
      items: ["ember-2"],
      actors: ["lantern-wisp-1"],
      traits: ["sanctified"]
    },
    "bell-tower": {
      id: "bell-tower",
      name: "Bell Tower",
      description: "The Great Bell hangs cracked; ropes fray in the night wind.",
      exits: {
        down: "ember-chapel-nave"
      },
      items: [],
      actors: [],
      traits: ["objective"]
    },
    "ember-chapel-crypt": {
      id: "ember-chapel-crypt",
      name: "Chapel Crypt",
      description: "Stone coffers line the walls. Bone chimes sway softly.",
      exits: {
        up: "ember-chapel-nave",
        down: "ember-chapel-depths"
      },
      items: ["simple-key-crypt"],
      actors: ["husk-1", "husk-2"],
      traits: ["threat"]
    },
    "ember-chapel-depths": {
      id: "ember-chapel-depths",
      name: "Crypt Depths",
      description: "A sealed iron gate leads to the bellwraith's haunt.",
      exits: {
        up: "ember-chapel-crypt"
      },
      items: ["bell-shard-one"],
      actors: ["bellwraith"],
      traits: ["boss"]
    },
    "witchwell-approach": {
      id: "witchwell-approach",
      name: "Witchwell Approach",
      description: "Mist curls around moss altars. Water whispers beneath.",
      exits: {
        north: "old-road",
        down: "witchwell-pool"
      },
      items: [],
      actors: ["gloom-wolf-1"],
      traits: ["threat"]
    },
    "witchwell-pool": {
      id: "witchwell-pool",
      name: "Witchwell Pool",
      description: "Black water circles a stone wellmouth lit by foxfire.",
      exits: {
        up: "witchwell-approach"
      },
      items: ["bell-shard-two"],
      actors: ["well-mother"],
      traits: ["boss"]
    },
    "hollow-monastery-gate": {
      id: "hollow-monastery-gate",
      name: "Hollow Monastery Gate",
      description: "Cloister arches open onto a scriptoria of ash.",
      exits: {
        west: "ember-chapel-nave",
        east: "hollow-monastery-cloister"
      },
      items: [],
      actors: ["chapel-guard-1"],
      traits: []
    },
    "hollow-monastery-cloister": {
      id: "hollow-monastery-cloister",
      name: "Ashen Cloister",
      description: "Charred scrolls flutter like moths beneath broken arches.",
      exits: {
        west: "hollow-monastery-gate",
        east: "hollow-monastery-reliquary"
      },
      items: ["ember-3"],
      actors: ["bonebinder-1"],
      traits: ["threat"]
    },
    "hollow-monastery-reliquary": {
      id: "hollow-monastery-reliquary",
      name: "Reliquary Vault",
      description: "Silver reliquaries lie toppled; altar light flickers.",
      exits: {
        west: "hollow-monastery-cloister"
      },
      items: ["bell-shard-three"],
      actors: ["prior-of-ash"],
      traits: ["boss"]
    },
    "orchard-path": {
      id: "orchard-path",
      name: "Blackroot Orchard",
      description: "Twisted apple trees drip with black sap.",
      exits: {
        west: "old-road",
        east: "orchard-heart"
      },
      items: ["ward-candle-2"],
      actors: ["gloom-wolf-2"],
      traits: ["threat"]
    },
    "orchard-heart": {
      id: "orchard-heart",
      name: "Orchard Heart",
      description: "Roots knot around a pulsing blight at the grove's center.",
      exits: {
        west: "orchard-path"
      },
      items: ["bell-shard-four"],
      actors: ["orchard-heart"],
      traits: ["boss"]
    }
  }
};

