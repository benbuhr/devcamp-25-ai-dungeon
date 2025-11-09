import { CommandHandler, Registry } from "../contracts.js";

export const createHelpHandler = (registry: Registry): CommandHandler => {
  return (_state, _cmd, context) => {
    const verbs = registry
      .all()
      .map((r) => r.verb)
      .sort();
    const exits = context.visible.exits;
    const parts = [
      `Available commands: ${verbs.join(", ")}`,
      exits.length ? `Exits: ${exits.join(", ")} (short: n,s,e,w,u,d)` : ""
    ].filter(Boolean);
    return {
      events: [],
      resultText: parts.join("\n")
    };
  };
};



