import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import { describeRoom } from "../services/movementService.js";

export const lookHandler: CommandHandler = (state) => {
  const description = describeRoom(state);
  return {
    events: [Events.appendLog(description)],
    resultText: description
  };
};

