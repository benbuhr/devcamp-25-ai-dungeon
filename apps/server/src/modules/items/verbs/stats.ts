import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import { computeEffectiveStats } from "../services/statService.js";

export const statsHandler: CommandHandler = (state) => {
  const stats = computeEffectiveStats(state);
  const lines = [
    `Health: ${stats.hp}`,
    `Power: ${stats.power}`,
    `Ward: ${stats.ward}`
  ];
  const message = `Your current strength:\n${lines.join("\n")}`;
  return {
    events: [Events.appendLog(message)],
    resultText: message
  };
};

