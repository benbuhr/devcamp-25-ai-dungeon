import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import { describeRoom, attemptMove } from "../services/movementService.js";

export const goHandler: CommandHandler = (state, command) => {
  const direction = command.object ?? command.target;
  if (!direction) {
    return {
      events: [],
      resultText: "Which way do you want to go?"
    };
  }

  const move = attemptMove(state, direction);
  if (!move.ok || !move.to) {
    return {
      events: move.message ? [Events.appendLog(move.message)] : [],
      resultText: move.message ?? "You cannot go that way."
    };
  }

  const events = [
    Events.move(state.roomId, move.to),
    Events.appendLog(
      `You move ${direction.toLowerCase()} into ${describeRoom(state, move.to)}`
    )
  ];

  return {
    events,
    resultText: describeRoom(state, move.to)
  };
};

