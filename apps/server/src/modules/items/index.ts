import { Registry } from "../core/contracts.js";
import { takeHandler } from "./verbs/take.js";
import { inventoryHandler } from "./verbs/inventory.js";
import { useHandler } from "./verbs/use.js";
import { equipHandler } from "./verbs/equip.js";
import { statsHandler } from "./verbs/stats.js";
import { unequipHandler } from "./verbs/unequip.js";
import { combineHandler } from "./verbs/combine.js";

export const registerItemsModule = (registry: Registry) => {
  registry.register({
    verb: "take",
    module: "items",
    handler: takeHandler
  });
  registry.register({
    verb: "inventory",
    module: "items",
    handler: inventoryHandler
  });
  registry.register({
    verb: "use",
    module: "items",
    handler: useHandler
  });
  registry.register({
    verb: "combine",
    module: "items",
    handler: combineHandler
  });
  registry.register({
    verb: "equip",
    module: "items",
    handler: equipHandler
  });
  registry.register({
    verb: "unequip",
    module: "items",
    handler: unequipHandler
  });
  registry.register({
    verb: "stats",
    module: "items",
    handler: statsHandler
  });
};

export * from "./data/items.js";
export * from "./data/lootTables.js";
export * from "./services/inventoryService.js";
export * from "./services/statService.js";

