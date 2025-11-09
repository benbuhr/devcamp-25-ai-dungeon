import { describe, expect, it } from "vitest";
import { createNluService } from "../modules/nlu/nluService.js";
import { createInitialState } from "../modules/core/state.js";
import { resolveVisibleContext } from "../modules/map/services/movementService.js";
import { VERBS } from "../shared/index.js";

const nlu = createNluService();

describe("NLU golden cases", () => {
  const state = createInitialState("test");

  it("parses attack phrasing", async () => {
    const result = await nlu.parse({
      text: "I swing my sword at the husk",
      context: resolveVisibleContext({
        ...state,
        roomId: "ember-chapel-crypt"
      }),
      allowedVerbs: [...VERBS]
    });
    expect(result.canonical.verb).toBe("attack");
    expect(result.canonical.object?.toLowerCase()).toContain("husk");
  });

  it("parses movement phrasing", async () => {
    const result = await nlu.parse({
      text: "Head north toward the chapel",
      context: resolveVisibleContext(state),
      allowedVerbs: [...VERBS]
    });
    expect(result.canonical.verb).toBe("go");
    expect(result.canonical.object).toBe("north");
  });

  it("parses inventory requests", async () => {
    const result = await nlu.parse({
      text: "Check my bag",
      context: resolveVisibleContext(state),
      allowedVerbs: [...VERBS]
    });
    expect(result.canonical.verb).toBe("inventory");
  });
});

