import { Verb } from "../../shared/index.js";
import { Registry } from "../core/contracts.js";
import { goHandler } from "./verbs/go.js";
import { lookHandler } from "./verbs/look.js";
import { talkHandler } from "./verbs/talk.js";
import { prayHandler } from "./verbs/pray.js";
import { mapHandler } from "./verbs/map.js";

const MAP_VERBS: Array<
  [Verb, typeof goHandler | typeof lookHandler | typeof talkHandler | typeof prayHandler | typeof mapHandler]
> = [
  ["go", goHandler],
  ["look", lookHandler],
  ["talk", talkHandler],
  ["pray", prayHandler],
  ["map", mapHandler]
];

export const registerMapModule = (registry: Registry) => {
  for (const [verb, handler] of MAP_VERBS) {
    registry.register({
      verb,
      module: "map",
      handler
    });
  }
};

export * from "./services/movementService.js";

