import { RoomGraph, SessionId } from "../../../shared/index.js";
import { generateRoomGraph } from "./mapGen.js";

const SESSION_ROOM_GRAPH = new Map<SessionId, RoomGraph>();

export const getSessionRoomGraph = (sessionId: SessionId): RoomGraph => {
  const existing = SESSION_ROOM_GRAPH.get(sessionId);
  if (existing) {
    return existing;
  }
  const generated = generateRoomGraph(sessionId);
  SESSION_ROOM_GRAPH.set(sessionId, generated);
  return generated;
};



