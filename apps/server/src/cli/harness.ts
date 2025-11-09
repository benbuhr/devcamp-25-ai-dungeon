#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { Command, VERBS } from "../shared/index.js";
import { createMemoryStore } from "../modules/store/memoryStore.js";
import {
  createDispatcher,
  createRegistry,
  createSessionManager
} from "../modules/core/index.js";
import { registerMapModule } from "../modules/map/index.js";
import { registerItemsModule } from "../modules/items/index.js";
import { registerCombatModule } from "../modules/combat/index.js";
import { resolveVisibleContext } from "../modules/map/services/movementService.js";
import { createNluService } from "../modules/nlu/nluService.js";

const argv = yargs(hideBin(process.argv))
  .option("text", { type: "string", describe: "Natural language text to parse" })
  .option("verb", { type: "string", describe: "Canonical verb to execute" })
  .option("object", { type: "string", describe: "Canonical object" })
  .option("preposition", { type: "string", describe: "Canonical preposition" })
  .option("target", { type: "string", describe: "Canonical target" })
  .option("session", { type: "string", describe: "Session id to reuse" })
  .help()
  .parseSync();

const store = createMemoryStore({ ttlMs: 30 * 60 * 1000, maxSessions: 100 });
const sessions = createSessionManager(store);

const registry = createRegistry();
registerMapModule(registry);
registerItemsModule(registry);
registerCombatModule(registry);

const dispatcher = createDispatcher(registry, resolveVisibleContext);
const nlu = createNluService();

const sessionId = argv.session ?? sessions.create();
let state = sessions.ensure(sessionId);

const command = await resolveCommand(argv, state);
const context = {
  visible: resolveVisibleContext(state),
  random: Math.random,
  now: Date.now
};

const result = dispatcher.dispatch(state, command, context);
state = sessions.update(sessionId, state, result.events);

console.log(`Session: ${sessionId}`);
console.log(`Command: ${JSON.stringify(command)}`);
console.log(`Result : ${result.resultText}`);
console.log("Events :", result.events);

async function resolveCommand(
  options: typeof argv,
  currentState: typeof state
): Promise<Command> {
  if (options.verb) {
    if (!VERBS.includes(options.verb as any)) {
      throw new Error(`Unknown verb "${options.verb}"`);
    }
    return {
      verb: options.verb as Command["verb"],
      object: options.object,
      preposition: options.preposition,
      target: options.target
    };
  }
  if (options.text) {
    const parsed = await nlu.parse({
      text: options.text,
      context: resolveVisibleContext(currentState),
      allowedVerbs: [...VERBS]
    });
    return parsed.canonical;
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const answer = await rl.question("Enter command text: ");
  rl.close();
  const parsed = await nlu.parse({
    text: answer,
    context: resolveVisibleContext(currentState),
    allowedVerbs: [...VERBS]
  });
  return parsed.canonical;
}

