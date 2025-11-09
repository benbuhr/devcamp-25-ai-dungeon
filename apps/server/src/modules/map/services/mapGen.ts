import { Room, RoomGraph } from "../../../shared/index.js";
import { ROOM_TEMPLATES, RoomTemplate } from "../world/roomTemplates.js";

type Rng = () => number;

// Simple FNV-1a 32-bit hash to derive a seed from sessionId
const hash32 = (str: string): number => {
  if (!str || str.length === 0) {
    return 0x9e3779b9; // Return a non-zero fallback for empty/undefined strings
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
};

// Mulberry32 PRNG
export const createSeededRng = (sessionId: string): Rng => {
  // Ensure sessionId is a valid string
  const validSessionId = sessionId || "default";
  let a = hash32(validSessionId) || 0x9e3779b9; // non-zero fallback
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

const allFreeDirections = (room: WorkingRoom): Direction[] =>
  DIRECTIONS.filter((d) => room.exits[d] === undefined);

// Check if a room is reachable from a start room using BFS
const isReachable = (
  rooms: Record<string, WorkingRoom>,
  startId: string,
  targetId: string
): boolean => {
  const visited = new Set<string>();
  const queue: string[] = [startId];
  visited.add(startId);
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (id === targetId) return true;
    const exits = rooms[id].exits;
    for (const to of Object.values(exits)) {
      if (!visited.has(to)) {
        visited.add(to);
        queue.push(to);
      }
    }
  }
  return false;
};

// Find all rooms reachable from a start room
const findReachable = (
  rooms: Record<string, WorkingRoom>,
  startId: string
): Set<string> => {
  const reachable = new Set<string>();
  const queue: string[] = [startId];
  reachable.add(startId);
  while (queue.length > 0) {
    const id = queue.shift()!;
    const exits = rooms[id].exits;
    for (const to of Object.values(exits)) {
      if (!reachable.has(to)) {
        reachable.add(to);
        queue.push(to);
      }
    }
  }
  return reachable;
};

// Map of boss rooms to their chain entry points (for repair purposes)
const BOSS_TO_ENTRY: Record<string, string> = {
  "ember-chapel-depths": "ember-chapel-nave",
  "witchwell-pool": "witchwell-approach",
  "hollow-monastery-reliquary": "hollow-monastery-gate",
  "orchard-heart": "orchard-path"
};

// Repair connectivity by finding an alternative path to connect a disconnected room
const repairConnectivity = (
  rooms: Record<string, WorkingRoom>,
  rng: Rng,
  hubId: string,
  targetId: string,
  reachableRooms: Set<string>
): boolean => {
  // For boss rooms, try to repair at the chain entry point first
  const entryPoint = BOSS_TO_ENTRY[targetId];
  if (entryPoint && entryPoint !== targetId) {
    // Check if entry point is reachable
    if (!reachableRooms.has(entryPoint)) {
      // Try to repair entry point first
      const entryRoom = rooms[entryPoint];
      const entryFree = allFreeDirections(entryRoom);
      
      if (entryFree.length > 0) {
        // Try to connect entry point to a reachable room
        for (const reachableId of reachableRooms) {
          if (reachableId === entryPoint) continue;
          const reachableRoom = rooms[reachableId];
          const reachableFree = allFreeDirections(reachableRoom);
          
          // Try to find compatible directions
          for (const entryDir of entryFree) {
            const oppositeDir = OPPOSITE[entryDir];
            if (reachableFree.includes(oppositeDir)) {
              addLink(rooms, entryPoint, entryDir, reachableId);
              return true;
            }
          }
        }
      }
    }
  }
  
  // Try to connect the target directly to any reachable room
  const targetRoom = rooms[targetId];
  const targetFree = allFreeDirections(targetRoom);
  
  if (targetFree.length === 0) {
    return false; // Target room has no free exits
  }

  // Try to find a reachable room that has a free exit in the opposite direction
  for (const reachableId of reachableRooms) {
    if (reachableId === targetId) continue;
    const reachableRoom = rooms[reachableId];
    const reachableFree = allFreeDirections(reachableRoom);
    
    // Try to find compatible directions
    for (const targetDir of targetFree) {
      const oppositeDir = OPPOSITE[targetDir];
      if (reachableFree.includes(oppositeDir)) {
        addLink(rooms, targetId, targetDir, reachableId);
        return true;
      }
    }
  }
  
  return false;
};

export const generateRoomGraph = (sessionId: string): RoomGraph => {
  // Ensure sessionId is valid
  const validSessionId = sessionId || "default";
  const rng = createSeededRng(validSessionId);
  const MAX_RETRIES = 10;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
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
          // Check if previous room has free directions before adding flavor room
          const freeDirs = cardinalFreeDirections(rooms[previous]);
          if (freeDirs.length === 0) {
            // No free directions, skip adding more flavor rooms
            break;
          }
          
          const flavorId = takeFlavor();
          if (!flavorId) break;
          
          // Use the hub direction for first flavor room, or pick a free direction
          const useDir = i === 0 && freeDirs.includes(dir) 
            ? dir 
            : freeDirs.length > 0 
              ? choice(rng, freeDirs)
              : dir;
          
          addLink(rooms, previous, useDir, flavorId);
          previous = flavorId;
        }
        
        // Connect last in chain to the entry
        // First, check if entry room has a free direction for the opposite
        const entryRoom = rooms[entryId];
        const entryFree = cardinalFreeDirections(entryRoom);
        const prevFree = cardinalFreeDirections(rooms[previous]);
        
        // Determine the best direction to use
        let lastDir: Direction;
        if (prevFree.includes(dir) && entryFree.includes(OPPOSITE[dir])) {
          // Preferred direction is available on both sides
          lastDir = dir;
        } else if (prevFree.length > 0 && entryFree.length > 0) {
          // Find a compatible direction
          const compatible = prevFree.filter(d => entryFree.includes(OPPOSITE[d]));
          if (compatible.length > 0) {
            lastDir = choice(rng, compatible);
          } else {
            // Use any free direction from previous, entry will use opposite
            lastDir = choice(rng, prevFree);
          }
        } else if (prevFree.length > 0) {
          // Previous has free directions, use one
          lastDir = choice(rng, prevFree);
        } else if (entryFree.length > 0) {
          // Only entry has free directions, use the opposite
          lastDir = OPPOSITE[choice(rng, entryFree)];
        } else {
          // Fallback: use vertical directions if available
          const prevAllFree = allFreeDirections(rooms[previous]);
          const entryAllFree = allFreeDirections(entryRoom);
          const compatibleAll = prevAllFree.filter(d => entryAllFree.includes(OPPOSITE[d]));
          if (compatibleAll.length > 0) {
            lastDir = choice(rng, compatibleAll);
          } else {
            // Last resort: use a hardcoded direction (shouldn't happen in practice)
            lastDir = (["north", "south", "east", "west"] as Direction[])[index % 4];
          }
        }
        
        addLink(rooms, previous, lastDir, entryId);
      });

      // 4) Road links to well entry (randomize direction from road)
      {
        const roadRoom = rooms["old-road"];
        const roadFree = cardinalFreeDirections(roadRoom);
        const wellRoom = rooms["witchwell-approach"];
        const wellFree = cardinalFreeDirections(wellRoom);
        
        if (roadFree.length > 0 && wellFree.length > 0) {
          // Find compatible directions
          const compatible = roadFree.filter(d => wellFree.includes(OPPOSITE[d]));
          if (compatible.length > 0) {
            const roadDir = choice(rng, compatible);
            addLink(rooms, "old-road", roadDir, "witchwell-approach");
          } else {
            // Use any free direction from road
            const roadDir = choice(rng, roadFree);
            addLink(rooms, "old-road", roadDir, "witchwell-approach");
          }
        } else if (roadFree.length > 0) {
          // Road has free directions
          const roadDir = choice(rng, roadFree);
          addLink(rooms, "old-road", roadDir, "witchwell-approach");
        } else {
          // Use all directions (including vertical)
          const roadAllFree = allFreeDirections(roadRoom);
          const wellAllFree = allFreeDirections(wellRoom);
          const compatibleAll = roadAllFree.filter(d => wellAllFree.includes(OPPOSITE[d]));
          if (compatibleAll.length > 0) {
            const roadDir = choice(rng, compatibleAll);
            addLink(rooms, "old-road", roadDir, "witchwell-approach");
          }
        }
      }

      // 5) Sprinkle remaining flavor rooms as side branches
      const candidateAttachIds = Object.keys(rooms).filter(
        (id) => !["bell-tower", "ember-chapel-depths", "witchwell-pool", "hollow-monastery-reliquary", "orchard-heart"].includes(id)
      );
      while (flavorRoomIds.length > 0) {
        const attachTo = choice(rng, candidateAttachIds);
        const free = cardinalFreeDirections(rooms[attachTo]);
        if (free.length === 0) {
          // Remove this candidate if it has no free directions
          const idx = candidateAttachIds.indexOf(attachTo);
          if (idx > -1) {
            candidateAttachIds.splice(idx, 1);
          }
          if (candidateAttachIds.length === 0) {
            break; // No more candidates
          }
          continue;
        }
        const flavorId = takeFlavor();
        if (!flavorId) break;
        addLink(rooms, attachTo, choice(rng, free), flavorId);
      }

      // 6) Ensure connectivity and boss reachability with repair mechanism
      const mustReach = [
        "ember-chapel-depths",
        "witchwell-pool",
        "hollow-monastery-reliquary",
        "orchard-heart"
      ];
      
      // Check connectivity
      let reachable = findReachable(rooms, hubId);
      let needsRepair = false;
      const disconnected: string[] = [];
      
      for (const target of mustReach) {
        if (!reachable.has(target)) {
          disconnected.push(target);
          needsRepair = true;
        }
      }
      
      // Attempt to repair disconnected rooms
      if (needsRepair) {
        for (const target of disconnected) {
          const repaired = repairConnectivity(rooms, rng, hubId, target, reachable);
          if (repaired) {
            // Recalculate reachability
            reachable = findReachable(rooms, hubId);
          }
        }
        
        // Final check after repair attempts
        reachable = findReachable(rooms, hubId);
        const stillDisconnected: string[] = [];
        for (const target of mustReach) {
          if (!reachable.has(target)) {
            stillDisconnected.push(target);
          }
        }
        
        if (stillDisconnected.length > 0) {
          // If repair failed and we have retries left, try again
          if (attempt < MAX_RETRIES - 1) {
            continue; // Retry generation
          }
          // Last attempt failed, throw error with details
          throw new Error(
            `Generated map not connected to required targets after ${MAX_RETRIES} attempts: ${stillDisconnected.join(", ")}. ` +
            `Session ID: ${validSessionId}. ` +
            `This indicates a bug in map generation logic.`
          );
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
    } catch (error) {
      // If this is the last attempt, rethrow the error
      if (attempt === MAX_RETRIES - 1) {
        throw error;
      }
      // Otherwise, continue to next attempt
      continue;
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw new Error(`Failed to generate valid map after ${MAX_RETRIES} attempts for session: ${validSessionId}`);
};



