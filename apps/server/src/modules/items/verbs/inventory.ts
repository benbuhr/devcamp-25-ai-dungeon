import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import { getItemById } from "../data/items.js";

export const inventoryHandler: CommandHandler = (state) => {
  if (state.inventory.length === 0) {
    const message = "Your satchel is empty.";
    return {
      events: [Events.appendLog(message)],
      resultText: message
    };
  }

  const nameToQty = new Map<string, number>();
  for (const itemId of state.inventory) {
    const item = getItemById(itemId);
    nameToQty.set(item.name, (nameToQty.get(item.name) ?? 0) + 1);
  }
  const lines = [...nameToQty.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, qty]) => (qty > 1 ? `- ${name} ×${qty}` : `- ${name}`));

  const equippedEntries = Object.entries(state.equipment);
  if (equippedEntries.length > 0) {
    lines.push("Equipped:");
    for (const [slot, itemId] of equippedEntries) {
      const item = getItemById(itemId);
      lines.push(`  ${slot}: ${item.name}`);
    }
  }

  const message = `You carry:\n${lines.join("\n")}`;
  return {
    events: [Events.appendLog(message)],
    resultText: message
  };
};

