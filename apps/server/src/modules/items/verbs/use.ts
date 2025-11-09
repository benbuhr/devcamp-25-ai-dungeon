import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import {
  findItemInInventory,
  formatItemName
} from "../services/inventoryService.js";
import { getItemById } from "../data/items.js";

export const useHandler: CommandHandler = (state, command) => {
  const rawQuery = command.object ?? command.target;
  let match = findItemInInventory(state, rawQuery);
  if (!match) {
    return {
      events: [],
      resultText: "You do not have that item."
    };
  }

  // If the matched item is not consumable, attempt to find a consumable that better matches
  const query = (rawQuery ?? "").toLowerCase();
  const tags0 = match.item.tags ?? [];
  if (!tags0.includes("consumable") && query) {
    // Prefer exact id or exact name match among consumables
    const candidates = state.inventory
      .map((id) => ({ id, item: getItemById(id) }))
      .filter(({ item }) => (item.tags ?? []).includes("consumable"));
    const exactName = candidates.find(
      ({ item }) => item.name.toLowerCase() === query
    );
    const exactId = candidates.find(({ id }) => id.toLowerCase() === query);
    const wholeWord = candidates.find(({ item }) =>
      item.name.toLowerCase().split(/\s+/).includes(query)
    );
    const substring = candidates.find(({ item }) =>
      item.name.toLowerCase().includes(query)
    );
    const better = exactId ?? exactName ?? wholeWord ?? substring;
    if (better) {
      match = { id: better.id, item: better.item };
    }
  }

  // Special case: using any bell shard attempts to combine all shards
  if (match.id.startsWith("bell-shard-")) {
    const shards = ["bell-shard-one", "bell-shard-two", "bell-shard-three", "bell-shard-four"];
    const present = new Set(state.inventory);
    const owned = shards.filter((id) => present.has(id));
    const count = owned.length;

    if (count < shards.length) {
      const message =
        count === 0
          ? "You have no bell shards to combine."
          : `You have ${count}/4 bell shards. Keep searching.`;
      return {
        events: [Events.appendLog(message)],
        resultText: message
      };
    }

    const events = [];
    for (const id of shards) {
      events.push(Events.removeItem(id));
    }
    events.push(Events.giveItem("bell-clapper"));
    events.push(
      Events.appendLog(
        "You press the shards together. Lines of heat stitch them closed. The clapper is made whole."
      )
    );
    events.push(Events.setFlag("game:victory", true));
    return {
      events,
      resultText:
        "The shards fuse with a resonant hum. The clapper is whole once more — you have won."
    };
  }

  const itemName = formatItemName(match.item);
  const tags = match.item.tags ?? [];

  if (!tags.includes("consumable")) {
    return {
      events: [],
      resultText: `The ${itemName} cannot be used that way.`
    };
  }

  // Consume item: apply a single-attack temporary buff via flag; stats revert after next attack
  const events = [
    Events.removeItem(match.id),
    Events.appendLog(`You use the ${itemName}.`),
    Events.setFlag(`use:temp:item:${match.id}`, true)
  ];

  return {
    events,
    resultText: `You use the ${itemName}.`
  };
};

