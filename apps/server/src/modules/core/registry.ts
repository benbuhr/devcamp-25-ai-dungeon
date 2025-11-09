import { Verb } from "../../shared/index.js";
import {
  CommandRegistration,
  Registry
} from "./contracts.js";

export const createRegistry = (): Registry => {
  const byVerb = new Map<Verb, CommandRegistration>();

  return {
    register(registration: CommandRegistration) {
      if (byVerb.has(registration.verb)) {
        throw new Error(
          `Command verb "${registration.verb}" already registered by module "${byVerb.get(registration.verb)?.module}"`
        );
      }
      byVerb.set(registration.verb, registration);
    },
    get(verb: Verb) {
      return byVerb.get(verb);
    },
    all() {
      return Array.from(byVerb.values());
    }
  };
};

