import { GameState, Item, ItemSlot } from "../../../shared/index.js";
import { getSessionRoomGraph } from "../../map/services/sessionRoomGraph.js";
import { getItemById } from "../data/items.js";

export interface ItemMatch {
  id: string;
  item: Item;
  taken?: boolean;
}

const normalize = (value: string) => value.toLowerCase();

const matches = (needle: string, haystack: string) =>
  normalize(haystack).includes(normalize(needle));

export const findItemInRoom = (
  state: GameState,
  rawQuery: string | undefined
): ItemMatch | undefined => {
  if (!rawQuery) {
    return undefined;
  }
  const graph = getSessionRoomGraph(state.sessionId);
  const room = graph.rooms[state.roomId];
  const query = normalize(rawQuery);

  const foundId = room.items.find((id) => {
    const item = getItemById(id);
    return (
      normalize(item.name) === query ||
      matches(query, item.name) ||
      normalize(id) === query
    );
  });

  if (!foundId) {
    return undefined;
  }
  return {
    id: foundId,
    item: getItemById(foundId),
    taken: Boolean(state.flags[`item:taken:${foundId}`])
  };
};

export const findItemInInventory = (
  state: GameState,
  rawQuery: string | undefined
): ItemMatch | undefined => {
  if (!rawQuery) {
    return undefined;
  }
  const query = normalize(rawQuery);
  const foundId = state.inventory.find((id) => {
    const item = getItemById(id);
    return (
      normalize(item.name) === query ||
      matches(query, item.name) ||
      normalize(id) === query
    );
  });
  if (!foundId) {
    return undefined;
  }
  return { id: foundId, item: getItemById(foundId) };
};

export const formatItemName = (item: Item) => item.name;

export const slotFromItem = (item: Item): ItemSlot | undefined => item.slot;

