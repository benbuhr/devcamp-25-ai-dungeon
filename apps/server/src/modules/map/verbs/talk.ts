import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import { getNpcById } from "../world/npcs.js";

export const talkHandler: CommandHandler = (state, command, context) => {
  const targetId =
    command.object ??
    context.visible.actors.find((actorId) => actorId.startsWith("villager"));

  if (!targetId) {
    return {
      events: [],
      resultText: "No one here answers your words."
    };
  }

  const npc = getNpcById(targetId);
  if (!npc) {
    return {
      events: [],
      resultText: "Only the Night listens."
    };
  }

  const line = npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)];
  const message = `${npc.name} says: "${line}"`;

  return {
    events: [Events.appendLog(message)],
    resultText: message
  };
};

