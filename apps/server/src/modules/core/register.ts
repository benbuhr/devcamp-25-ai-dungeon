import { Registry } from "./contracts.js";
import { createHelpHandler } from "./verbs/help.js";

export const registerCoreModule = (registry: Registry) => {
  registry.register({
    verb: "help",
    module: "core",
    handler: createHelpHandler(registry)
  });
};



