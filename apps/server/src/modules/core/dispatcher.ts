import { Command, CommandContext, Verb } from "../../shared/index.js";
import { Dispatcher, Registry, VisibilityResolver } from "./contracts.js";

export class UnknownCommandError extends Error {
  constructor(command: Command) {
    super(`Unknown command verb "${command.verb}"`);
    this.name = "UnknownCommandError";
  }
}

export const createDispatcher = (
  registry: Registry,
  resolveVisibility: VisibilityResolver
): Dispatcher => {
  return {
    dispatch(state, command, context) {
      if (state.stats.hp <= 0) {
        return {
          events: [],
          resultText:
            "You are fallen. The game is over. Use the restart prompt to begin anew."
        };
      }
      const enrichedContext: CommandContext = {
        ...context,
        visible: resolveVisibility(state)
      };

      const registration = registry.get(command.verb);
      if (!registration) {
        const helpReg = registry.get("help" as Verb);
        if (helpReg) {
          return helpReg.handler(state, { verb: "help" } as Command, enrichedContext);
        }
        const verbs = registry
          .all()
          .map((r) => r.verb)
          .sort();
        return {
          events: [],
          resultText: `Unknown command. Available commands: ${verbs.join(", ")}`
        };
      }

      return registration.handler(state, command, enrichedContext);
    }
  };
};

