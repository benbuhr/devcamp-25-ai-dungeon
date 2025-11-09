import { describe, expect, it } from "vitest";
import { takeHandler } from "../modules/items/verbs/take.js";
import { inventoryHandler } from "../modules/items/verbs/inventory.js";
import { createInitialState } from "../modules/core/state.js";
import { applyEvents } from "../modules/core/reducer.js";

describe("items module", () => {
  it("allows taking items from the room once", () => {
    let state = createInitialState("test");
    const { events, resultText } = takeHandler(state, { verb: "take", object: "ember" } as any);
    expect(events.length).toBeGreaterThan(0);
    state = applyEvents(state, events);
    expect(resultText).toMatch(/take/i);
    const second = takeHandler(state, { verb: "take", object: "ember" } as any);
    expect(second.resultText).toMatch(/already/i);
  });

  it("lists inventory contents", () => {
    let state = createInitialState("test");
    const { events } = takeHandler(state, { verb: "take", object: "ember" } as any);
    state = applyEvents(state, events);
    const summary = inventoryHandler(state);
    expect(summary.resultText).toMatch(/You carry/);
  });
});

