import { describe, expect, it } from "vitest";
import { attackHandler } from "../modules/combat/services/combatService.js";
import { createInitialState } from "../modules/core/state.js";
import { resolveVisibleContext } from "../modules/map/services/movementService.js";

describe("combat module", () => {
  it("produces damage events when attacking visible enemies", () => {
    const state = {
      ...createInitialState("test"),
      roomId: "old-road"
    };
    const context = {
      visible: resolveVisibleContext(state),
      random: Math.random,
      now: Date.now
    };

    const result = attackHandler(state, { verb: "attack", object: "shambler" } as any, context);
    const damageEvent = result.events.find((evt) => evt.kind === "Damage");
    expect(damageEvent).toBeDefined();
    expect(result.resultText).toMatch(/strike/i);
  });
});

