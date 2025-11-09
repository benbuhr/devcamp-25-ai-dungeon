import { Room, RoomGraph } from "../../../shared/index.js";
import { ROOM_TEMPLATES, RoomTemplate } from "../world/roomTemplates.js";

type Rng = () => number;

// Simple FNV-1a 32-bit hash to derive a seed from sessionId
const hash32 = (str: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
};

// Mulberry32 PRNG
export const createSeededRng = (sessionId: string): Rng => {
  let a = hash32(sessionId) || 0x9e3779b9; // non-zero fallback
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const DIRECTIONS = ["north", "south", "east", "west", "up", "down"] as const;
type Direction = (typeof DIRECTIONS)[number];
const OPPOSITE: Record<Direction, Direction> = {
  north: "south",
  south: "north",
  east: "west",
  west: "east",
  up: "down",
  down: "up"
};

const choice = <T>(rng: Rng, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const shuffle = <T>(rng: Rng, arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

interface WorkingRoom extends Omit<Room, "exits"> {
  exits: Record<string, string>;
}

const cloneFromTemplate = (tpl: RoomTemplate): WorkingRoom => ({
  id: tpl.id,
  name: tpl.name,
  description: tpl.description,
  items: [...tpl.items],
  actors: [...tpl.actors],
  traits: tpl.traits ? [...tpl.traits] : [],
  exits: {}
});

const addLink = (
  rooms: Record<string, WorkingRoom>,
  fromId: string,
  dir: Direction,
  toId: string
) => {
  rooms[fromId].exits[dir] = toId;
  rooms[toId].exits[OPPOSITE[dir]] = fromId;
};

const cardinalFreeDirections = (room: WorkingRoom): Direction[] =>
  (["north", "south", "east", "west"] as Direction[]).filter(
    (d) => room.exits[d] === undefined
  );

export const generateRoomGraph = (sessionId: string): RoomGraph => {
  const rng = createSeededRng(sessionId);

  // Prepare working set of rooms (no exits yet)
  const templates = { ...ROOM_TEMPLATES };
  const rooms: Record<string, WorkingRoom> = {};
  for (const tpl of Object.values(templates)) {
    rooms[tpl.id] = cloneFromTemplate(tpl);
  }

  // Helper to allocate an unused flavor room id list for sprinkling
  const flavorRoomIds = Object.values(templates)
    .filter((t) => t.chain === "misc")
    .map((t) => t.id);
  const takeFlavor = (): string | undefined => {
    if (flavorRoomIds.length === 0) return undefined;
    const idx = Math.floor(rng() * flavorRoomIds.length);
    return flavorRoomIds.splice(idx, 1)[0];
  };

  // 1) Build required chains with fixed vertical/horizontal semantics
  // Chapel verticals
  addLink(rooms, "ember-chapel-nave", "up", "bell-tower");
  addLink(rooms, "ember-chapel-nave", "down", "ember-chapel-crypt");
  addLink(rooms, "ember-chapel-crypt", "down", "ember-chapel-depths");
  // Well vertical
  addLink(rooms, "witchwell-approach", "down", "witchwell-pool");
  // Monastery linear (randomize left/right orientation)
  {
    const horiz: Direction = choice(rng, ["east", "west"]);
    addLink(rooms, "hollow-monastery-gate", horiz, "hollow-monastery-cloister");
    addLink(
      rooms,
      "hollow-monastery-cloister",
      horiz,
      "hollow-monastery-reliquary"
    );
  }
  // Orchard linear (randomize left/right)
  addLink(rooms, "orchard-path", choice(rng, ["east", "west"]), "orchard-heart");

  // 2) Connect village adjuncts (mill yard/loft)
  addLink(rooms, "mill-yard", "up", "mill-loft");

  // 3) Connect hub to zone entries with optional interposed empty rooms
  const hubId = "graysong-square";
  const zoneEntries = [
    "ember-chapel-nave",
    "hollow-monastery-gate",
    "orchard-path",
    "old-road"
  ];
  const hubDirs = shuffle(rng, ["north", "south", "east", "west"] as Direction[]);

  zoneEntries.forEach((entryId, index) => {
    const dir = hubDirs[index] as Direction;
    // Optionally interpose 0–2 flavor rooms between hub and entry
    const count = Math.floor(rng() * 3); // 0..2
    let previous = hubId;
    for (let i = 0; i < count; i++) {
      const flavorId = takeFlavor();
      if (!flavorId) break;
      addLink(rooms, previous, (i === 0 ? dir : choice(rng, cardinalFreeDirections(rooms[previous]) as Direction[])) || dir, flavorId);
      previous = flavorId;
    }
    // Connect last in chain to the entry using the intended hub direction if free, else any free cardinal
    const lastDir =
      cardinalFreeDirections(rooms[previous]).includes(dir)
        ? dir
        : (choice(rng, cardinalFreeDirections(rooms[previous])) ??
          (["north", "south", "east", "west"] as Direction[])[index % 4]);
    addLink(rooms, previous, lastDir, entryId);
  });

  // 4) Road links to well entry (randomize direction from road)
  {
    const roadDir: Direction = choice(rng, ["north", "south", "east", "west"]);
    addLink(rooms, "old-road", roadDir, "witchwell-approach");
  }

  // 5) Sprinkle remaining flavor rooms as side branches
  const candidateAttachIds = Object.keys(rooms).filter(
    (id) => !["bell-tower", "ember-chapel-depths", "witchwell-pool", "hollow-monastery-reliquary", "orchard-heart"].includes(id)
  );
  while (flavorRoomIds.length > 0) {
    const attachTo = choice(rng, candidateAttachIds);
    const free = cardinalFreeDirections(rooms[attachTo]);
    if (free.length === 0) {
      continue;
    }
    const flavorId = takeFlavor();
    if (!flavorId) break;
    addLink(rooms, attachTo, choice(rng, free), flavorId);
  }

  // 6) Ensure connectivity and boss reachability (simple sanity check)
  const reachable = new Set<string>();
  const queue: string[] = [hubId];
  reachable.add(hubId);
  while (queue.length) {
    const id = queue.shift()!;
    const exits = rooms[id].exits;
    for (const to of Object.values(exits)) {
      if (!reachable.has(to)) {
        reachable.add(to);
        queue.push(to);
      }
    }
  }
  const mustReach = [
    "ember-chapel-depths",
    "witchwell-pool",
    "hollow-monastery-reliquary",
    "orchard-heart"
  ];
  for (const target of mustReach) {
    if (!reachable.has(target)) {
      // In practice our construction should always be connected; throw for visibility in tests.
      throw new Error(`Generated map not connected to required target: ${target}`);
    }
  }

  // 7) Return in RoomGraph shape
  const out: Record<string, Room> = {};
  for (const [id, r] of Object.entries(rooms)) {
    out[id] = {
      id: r.id,
      name: r.name,
      description: r.description,
      exits: { ...r.exits },
      items: [...r.items],
      actors: [...r.actors],
      traits: r.traits ? [...r.traits] : []
    };
  }
  return { rooms: out };
};



