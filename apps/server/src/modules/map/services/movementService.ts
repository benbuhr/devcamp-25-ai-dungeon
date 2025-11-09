import {
  GameState,
  VisibleContext,
  Room
} from "../../../shared/index.js";
import { getSessionRoomGraph } from "./sessionRoomGraph.js";

export const getRoom = (sessionId: string, roomId: string): Room => {
  const graph = getSessionRoomGraph(sessionId);
  const room = graph.rooms[roomId];
  if (!room) {
    throw new Error(`Unknown room id "${roomId}"`);
  }
  return room;
};

export const resolveExit = (
  sessionId: string,
  roomId: string,
  direction: string
): string | undefined => {
  const room = getRoom(sessionId, roomId);
  return room.exits[direction.toLowerCase()];
};

export const resolveVisibleContext = (state: GameState): VisibleContext => {
  const room = getRoom(state.sessionId, state.roomId);
  return {
    room: {
      id: room.id,
      name: room.name,
      description: room.description
    },
    exits: Object.keys(room.exits),
    items: room.items.filter((itemId) => !state.flags[`item:taken:${itemId}`]),
    actors: room.actors.filter((actorId) => !state.flags[`enemy:defeated:${actorId}`]),
    inventory: state.inventory,
    equipment: state.equipment,
    flags: state.flags
  };
};

export interface MoveResult {
  ok: boolean;
  to?: string;
  message?: string;
}

export const attemptMove = (
  state: GameState,
  direction: string
): MoveResult => {
  const normalizedDirection = normalizeDirection(direction);
  const targetRoomId = resolveExit(state.sessionId, state.roomId, normalizedDirection);
  if (!targetRoomId) {
    return {
      ok: false,
      message: `You cannot go ${normalizedDirection} from here.`
    };
  }
  return {
    ok: true,
    to: targetRoomId
  };
};

export const describeRoom = (state: GameState, roomId: string = state.roomId): string => {
  const room = getRoom(state.sessionId, roomId);
  const exits = Object.keys(room.exits);
  const exitList =
    exits.length === 0
      ? "No exits"
      : exits.length === 1
        ? `Exit: ${exits[0]}`
        : `Exits: ${exits.join(", ")}`;

  const visibleItems = room.items.filter((itemId) => !state.flags[`item:taken:${itemId}`]);
  const items =
    visibleItems.length > 0
      ? `Items: ${visibleItems.map((id) => formatName(id)).join(", ")}.`
      : "No items of note.";

  const visibleActors = room.actors.filter(
    (actorId) => !state.flags[`enemy:defeated:${actorId}`]
  );
  const actors =
    visibleActors.length > 0
      ? `Figures: ${visibleActors.map((id) => formatName(id)).join(", ")}.`
      : "";

  return `${room.name}. ${room.description} ${exitList}. ${items} ${actors}`.trim();
};

const formatName = (id: string): string =>
  id
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const DIRECTION_ALIASES: Record<string, string> = {
  north: "north",
  south: "south",
  east: "east",
  west: "west",
  up: "up",
  down: "down",
  forward: "north",
  back: "south",
  n: "north",
  s: "south",
  e: "east",
  w: "west",
  u: "up",
  d: "down"
};

const normalizeDirection = (input: string): string => {
  const key = input.toLowerCase();
  return DIRECTION_ALIASES[key] ?? key;
};

