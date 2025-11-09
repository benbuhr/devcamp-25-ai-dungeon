import {
  Command,
  CommandContext,
  CommandResult,
  Event,
  GameState,
  SessionId,
  Verb,
  VisibleContext
} from "../../shared/index.js";

export type ModuleId = "core" | "map" | "items" | "combat";

export interface CommandRegistration {
  verb: Verb;
  module: ModuleId;
  handler: CommandHandler;
}

export type CommandHandler = (
  state: GameState,
  command: Command,
  context: CommandContext
) => CommandResult;

export interface VisibilityResolver {
  (state: GameState): VisibleContext;
}

export interface Registry {
  register(registration: CommandRegistration): void;
  get(verb: Verb): CommandRegistration | undefined;
  all(): CommandRegistration[];
}

export interface Dispatcher {
  dispatch(
    state: GameState,
    command: Command,
    context: CommandContext
  ): CommandResult;
}

export type Reducer = (state: GameState, event: Event) => GameState;

export interface StateRepository {
  save(sessionId: SessionId, state: GameState, events: Event[]): void;
  load(sessionId: SessionId): GameState | undefined;
}

