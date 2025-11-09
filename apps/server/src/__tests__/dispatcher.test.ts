import { describe, expect, it } from "vitest";
import { createInitialState } from "../modules/core/state.js";
import { createRegistry } from "../modules/core/registry.js";
import { createDispatcher } from "../modules/core/dispatcher.js";
import { resolveVisibleContext } from "../modules/map/services/movementService.js";
import { registerMapModule } from "../modules/map/index.js";

describe("dispatcher", () => {
  it("routes verbs to registered handlers", () => {
    const registry = createRegistry();
    registerMapModule(registry);
    const dispatcher = createDispatcher(registry, resolveVisibleContext);
    const state = createInitialState("test");

    const result = dispatcher.dispatch(state, { verb: "look" }, {
      visible: resolveVisibleContext(state),
      random: Math.random,
      now: Date.now
    });

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.resultText).toMatch(/Graysong Square/);
  });
});

