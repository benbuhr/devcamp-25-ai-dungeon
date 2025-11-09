import { describe, expect, it } from "vitest";
import {
  attemptMove,
  describeRoom
} from "../modules/map/services/movementService.js";
import { createInitialState } from "../modules/core/state.js";

describe("movement service", () => {
  const baseState = createInitialState("test");

  it("allows movement through valid exits", () => {
    const result = attemptMove(baseState, "north");
    expect(result.ok).toBe(true);
    expect(result.to).toBe("ember-chapel-nave");
  });

  it("rejects invalid exits", () => {
    const result = attemptMove(baseState, "west");
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/cannot go/i);
  });

  it("describes rooms with exits and items", () => {
    const text = describeRoom("graysong-square");
    expect(text).toMatch(/Graysong Square/);
    expect(text).toMatch(/Exits/);
  });
});

