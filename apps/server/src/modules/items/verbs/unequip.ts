import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import { ItemSlot } from "../../../shared/index.js";
import { getItemById } from "../data/items.js";

const ALL_SLOTS: ItemSlot[] = ["hand", "offhand", "head", "chest", "trinket"];

export const unequipHandler: CommandHandler = (state, command) => {
  const raw = (command.object ?? command.target)?.toLowerCase();

  let slot: ItemSlot | undefined;
  if (raw && (ALL_SLOTS as readonly string[]).includes(raw)) {
    slot = raw as ItemSlot;
  } else if (raw) {
    // Try to match by equipped item name
    for (const s of ALL_SLOTS) {
      const id = state.equipment[s];
      if (!id) continue;
      const item = getItemById(id);
      const name = item.name.toLowerCase();
      if (name.includes(raw)) {
        slot = s;
        break;
      }
    }
  }

  if (!slot) {
    return {
      events: [],
      resultText: "What would you like to unequip?"
    };
  }

  const equippedId = state.equipment[slot];
  if (!equippedId) {
    return {
      events: [],
      resultText: "You have nothing equipped there."
    };
  }

  const item = getItemById(equippedId);
  const resultText = `You unequip the ${item.name}.`;
  return {
    events: [Events.unequip(slot), Events.appendLog(resultText)],
    resultText
  };
};



