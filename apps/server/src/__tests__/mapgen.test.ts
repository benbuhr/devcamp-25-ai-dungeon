import { describe, it, expect } from "vitest";
import { getSessionRoomGraph } from "../modules/map/services/sessionRoomGraph.js";
import { createInitialState } from "../modules/core/state.js";
import { buildClientState } from "../services/clientState.js";

const bfsReachable = (graphId: string, startId: string, targetId: string): boolean => {
  const graph = getSessionRoomGraph(graphId);
  const seen = new Set<string>();
  const q: string[] = [startId];
  seen.add(startId);
  while (q.length) {
    const id = q.shift()!;
    if (id === targetId) return true;
    const room = graph.rooms[id];
    for (const next of Object.values(room.exits)) {
      if (!seen.has(next)) {
        seen.add(next);
        q.push(next);
      }
    }
  }
  return false;
};

describe("map generation", () => {
  it("is deterministic per session id", () => {
    const a1 = getSessionRoomGraph("seed-a");
    const a2 = getSessionRoomGraph("seed-a");
    const b1 = getSessionRoomGraph("seed-b");
    expect(JSON.stringify(a1)).toEqual(JSON.stringify(a2));
    expect(JSON.stringify(a1)).not.toEqual(JSON.stringify(b1));
  });

  it("connects start to all shard boss rooms", () => {
    const seed = "connectivity-seed";
    const bosses = [
      "ember-chapel-depths",
      "witchwell-pool",
      "hollow-monastery-reliquary",
      "orchard-heart"
    ];
    for (const boss of bosses) {
      expect(bfsReachable(seed, "graysong-square", boss)).toBe(true);
    }
  });

  it("places shard items in boss rooms", () => {
    const seed = "items-seed";
    const g = getSessionRoomGraph(seed);
    expect(g.rooms["ember-chapel-depths"].items).toContain("bell-shard-one");
    expect(g.rooms["witchwell-pool"].items).toContain("bell-shard-two");
    expect(g.rooms["hollow-monastery-reliquary"].items).toContain("bell-shard-three");
    expect(g.rooms["orchard-heart"].items).toContain("bell-shard-four");
  });

  it("client state exposes the per-session room graph", () => {
    const seed = "client-state-seed";
    const state = createInitialState(seed);
    const client = buildClientState(state);
    const graph = getSessionRoomGraph(seed);
    expect(client.roomGraph).toEqual(graph);
  });
});



