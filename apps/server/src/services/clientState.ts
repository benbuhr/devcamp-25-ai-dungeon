import {
  ClientState,
  EquippedView,
  GameState,
  InventoryGroup,
  ItemSlot,
  StatsDelta
} from "../shared/index.js";
import { getItemById } from "../modules/items/data/items.js";
import { computeEffectiveStats } from "../modules/items/services/statService.js";
import { getSessionRoomGraph } from "../modules/map/services/sessionRoomGraph.js";
import { getEnemy } from "../modules/combat/data/enemies.js";
import { getNpcById } from "../modules/map/world/npcs.js";

const ALL_SLOTS: ItemSlot[] = ["hand", "offhand", "head", "chest", "trinket"];

export interface BuildClientStateOptions {
  statDelta?: StatsDelta;
}

export const buildClientState = (
  state: GameState,
  options?: BuildClientStateOptions
): ClientState => {
  // Build counts of equipped items by id so we hide only as many from the satchel
  const equippedCountById = new Map<string, number>();
  for (const eqId of Object.values(state.equipment)) {
    if (!eqId) continue;
    equippedCountById.set(eqId, (equippedCountById.get(eqId) ?? 0) + 1);
  }
  const nameToGroup = new Map<string, InventoryGroup>();
  for (const itemId of state.inventory) {
    // Hide only up to the number of equipped copies for this item id
    const equippedRemaining = equippedCountById.get(itemId) ?? 0;
    if (equippedRemaining > 0) {
      equippedCountById.set(itemId, equippedRemaining - 1);
      continue;
    }
    const item = getItemById(itemId);
    const existing = nameToGroup.get(item.name);
    if (existing) {
      existing.quantity += 1;
      // once true, keep true
      existing.equipable = existing.equipable || Boolean(item.slot);
    } else {
      nameToGroup.set(item.name, {
        name: item.name,
        quantity: 1,
        equipable: Boolean(item.slot)
      });
    }
  }

  const inventoryGroups = Array.from(nameToGroup.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const equipment: EquippedView[] = ALL_SLOTS.map((slot) => {
    const equippedId = state.equipment[slot];
    if (!equippedId) {
      return { slot };
    }
    const item = getItemById(equippedId);
    return {
      slot,
      itemId: equippedId,
      name: item.name
    };
  });

  const effectiveStats = computeEffectiveStats(state);
  const graph = getSessionRoomGraph(state.sessionId);
  const room = graph.rooms[state.roomId];
  const visibleActors =
    room
      ? room.actors
          .filter((actorId) => !state.flags[`enemy:defeated:${actorId}`])
          .map((actorId) => {
            const humanize = (s: string) =>
              s
                .split(/[-_]/g)
                .filter(Boolean)
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
            const enemy = getEnemy(actorId);
            if (enemy) {
              return {
                id: enemy.id,
                name: enemy.name,
                disposition: "hostile" as const
              };
            }
            const npc = getNpcById(actorId);
            if (npc) {
              return {
                id: npc.id,
                name: npc.name,
                disposition: "friendly" as const
              };
            }
            // Unknown actors default to friendly label
            return {
              id: actorId,
              name: humanize(actorId),
              disposition: "friendly" as const
            };
          })
      : [];

  return {
    inventoryGroups,
    equipment,
    effectiveStats,
    statDelta: options?.statDelta,
    locationName: room?.name ?? state.roomId,
    exits: room ? Object.keys(room.exits) : [],
    roomGraph: graph,
    visibleActors
  };
};


