import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import {
  findItemInInventory,
  formatItemName,
  slotFromItem
} from "../services/inventoryService.js";

export const equipHandler: CommandHandler = (state, command) => {
  const match = findItemInInventory(state, command.object ?? command.target);
  if (!match) {
    return {
      events: [],
      resultText: "You do not carry that."
    };
  }
  const slot = slotFromItem(match.item);
  if (!slot) {
    return {
      events: [],
      resultText: "You cannot equip that."
    };
  }

  const alreadyEquipped = state.equipment[slot];
  const itemName = formatItemName(match.item);
  const events = [Events.equip(slot, match.id)];

  if (alreadyEquipped && alreadyEquipped !== match.id) {
    events.push(
      Events.appendLog(
        `You swap your ${slot} gear for the ${itemName}.`
      )
    );
  } else {
    events.push(Events.appendLog(`You equip the ${itemName}.`));
  }

  return {
    events,
    resultText: `You equip the ${itemName}.`
  };
};

