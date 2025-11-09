import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import { findItemInRoom, formatItemName } from "../services/inventoryService.js";
import { getEnemy } from "../../combat/data/enemies.js";

export const takeHandler: CommandHandler = (state, command, context) => {
  const hostilePresent = context.visible.actors.some((id) => Boolean(getEnemy(id)));
  if (hostilePresent) {
    return {
      events: [],
      resultText: "A hostile presence keeps you from scavenging."
    };
  }
  const match = findItemInRoom(state, command.object ?? command.target);
  if (!match) {
    return {
      events: [],
      resultText: "There is nothing like that to take."
    };
  }

  if (match.taken) {
    return {
      events: [],
      resultText: "You already claimed that."
    };
  }

  const itemName = formatItemName(match.item);
  const events = [
    Events.giveItem(match.id),
    Events.setFlag(`item:taken:${match.id}`, true),
    Events.appendLog(`You take the ${itemName}.`)
  ];

  return {
    events,
    resultText: `You take the ${itemName}.`
  };
};

