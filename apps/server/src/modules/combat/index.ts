import { Registry } from "../core/contracts.js";
import { attackHandler } from "./verbs/attack.js";

export const registerCombatModule = (registry: Registry) => {
  registry.register({
    verb: "attack",
    module: "combat",
    handler: attackHandler
  });
};

export * from "./data/enemies.js";

