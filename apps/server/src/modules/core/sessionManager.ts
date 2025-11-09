import crypto from "node:crypto";
import { Event, GameState, SessionId, SessionStore } from "../../shared/index.js";
import { applyEvents } from "./reducer.js";
import { createInitialState } from "./state.js";

export interface SessionManager {
  create(): SessionId;
  get(sessionId: SessionId): GameState | undefined;
  ensure(sessionId: SessionId): GameState;
  update(sessionId: SessionId, state: GameState, events: Event[]): GameState;
}

export const createSessionManager = (store: SessionStore): SessionManager => {
  const create = (): SessionId => {
    const sessionId = crypto.randomUUID();
    const state = createInitialState(sessionId);
    store.upsert(sessionId, { state, events: [], updatedAt: Date.now() });
    return sessionId;
  };

  const get = (sessionId: SessionId): GameState | undefined =>
    store.get(sessionId)?.state;

  const ensure = (sessionId: SessionId): GameState => {
    const existing = get(sessionId);
    if (existing) {
      return existing;
    }
    const state = createInitialState(sessionId);
    store.upsert(sessionId, { state, events: [], updatedAt: Date.now() });
    return state;
  };

  const update = (sessionId: SessionId, state: GameState, events: Event[]) => {
    const nextState = applyEvents(state, events);
    store.upsert(sessionId, {
      state: nextState,
      events,
      updatedAt: Date.now()
    });
    return nextState;
  };

  return {
    create,
    get,
    ensure,
    update
  };
};

