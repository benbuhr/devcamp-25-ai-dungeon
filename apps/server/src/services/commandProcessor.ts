import {
  Command,
  CommandContext,
  GameState,
  VERBS,
  NLUResult,
  ClientState,
  Stats
} from "../shared/index.js";
import { Dispatcher, SessionManager } from "../modules/core/index.js";
import { NLUService, ParsedCommand } from "../modules/nlu/index.js";
import { resolveVisibleContext } from "../modules/map/services/movementService.js";
import { buildClientState } from "./clientState.js";
import { computeEffectiveStats } from "../modules/items/services/statService.js";

export interface CommandProcessorDeps {
  sessions: SessionManager;
  dispatcher: Dispatcher;
  nlu: NLUService;
  executeThreshold: number;
  confirmThreshold: number;
}

export interface CommandRequestBody {
  text?: string;
  command?: Command;
  confirm?: boolean;
}

export interface CommandResponse {
  resultText?: string;
  events?: ReturnType<Dispatcher["dispatch"]>["events"];
  state?: GameState;
  nlu?: NLUResult;
  needsConfirm?: boolean;
  client?: ClientState;
  error?: string;
}

export const createCommandProcessor = (deps: CommandProcessorDeps) => {
  const resolveContext = (state: GameState): CommandContext => ({
    visible: resolveVisibleContext(state),
    random: Math.random,
    now: Date.now
  });

  const execute = async (
    sessionId: string,
    body: CommandRequestBody
  ): Promise<CommandResponse> => {
    if (!body.text && !body.command) {
      return { error: "Provide text or command payload" };
    }

    let state = deps.sessions.ensure(sessionId);
    const context = resolveContext(state);

    let canonical = body.command;
    let parsed: ParsedCommand | undefined;

    if (!canonical && body.text) {
      parsed = await deps.nlu.parse({
        text: body.text,
        context: context.visible,
        allowedVerbs: [...VERBS]
      });

      canonical = parsed.canonical;

      if (!body.confirm) {
        if (parsed.confidence < deps.confirmThreshold) {
          return {
            needsConfirm: true,
            nlu: {
              ...parsed,
              rawText: body.text
            }
          };
        }
        if (
          parsed.confidence >= deps.confirmThreshold &&
          parsed.confidence < deps.executeThreshold
        ) {
          return {
            needsConfirm: true,
            nlu: {
              ...parsed,
              rawText: body.text
            }
          };
        }
      }
    }

    if (!canonical) {
      return { error: "Unable to resolve command" };
    }

    const prevEffective: Stats = computeEffectiveStats(state);
    const result = deps.dispatcher.dispatch(state, canonical, context);
    state = deps.sessions.update(sessionId, state, result.events);

    let client: ClientState | undefined;
    let statDelta: Partial<Stats> | undefined;
    if (canonical.verb === "equip" || canonical.verb === "unequip" || canonical.verb === "use") {
      const nextEffective = computeEffectiveStats(state);
      statDelta = {
        hp: nextEffective.hp - prevEffective.hp || undefined,
        power: nextEffective.power - prevEffective.power || undefined,
        ward: nextEffective.ward - prevEffective.ward || undefined
      };
      client = buildClientState(state, { statDelta });
    } else {
      client = buildClientState(state);
    }

    return {
      resultText: result.resultText,
      events: result.events,
      state,
      client,
      nlu: body.text
        ? {
            ...(parsed ?? {
              canonical,
              confidence: 1,
              parser: body.command ? "rule" : "llm"
            }),
            rawText: body.text
          }
        : undefined
    };
  };

  return {
    execute
  };
};

