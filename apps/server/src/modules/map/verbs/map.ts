import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";

export const mapHandler: CommandHandler = (_state, _command, _context) => {
  // The frontend will display the graphical map via the dialog
  // This handler just acknowledges the command
  const message = "The world map opens before you.";
  
  return {
    events: [Events.appendLog(message)],
    resultText: message
  };
};

