import {
  SessionId,
  SessionStore,
  StoreSnapshot
} from "../../shared/index.js";
import { StoreConfig } from "../core/store.js";

const DEFAULT_MAX_EVENTS = 50;

interface InternalSnapshot extends StoreSnapshot {
  updatedAt: number;
}

export const createMemoryStore = (
  config: StoreConfig
): SessionStore & { prune: (now?: number) => void; size: () => number } => {
  const ttlMs = config.ttlMs;
  const maxSessions = config.maxSessions;
  const bySession = new Map<SessionId, InternalSnapshot>();

  const trimEvents = (events: StoreSnapshot["events"]) => {
    if (events.length <= DEFAULT_MAX_EVENTS) {
      return events;
    }
    return events.slice(events.length - DEFAULT_MAX_EVENTS);
  };

  const prune = (now: number = Date.now()) => {
    if (ttlMs > 0) {
      for (const [sessionId, snapshot] of bySession) {
        if (now - snapshot.updatedAt > ttlMs) {
          bySession.delete(sessionId);
        }
      }
    }
    if (maxSessions > 0 && bySession.size > maxSessions) {
      const toRemove = bySession.size - maxSessions;
      const entries = Array.from(bySession.entries()).sort(
        (a, b) => a[1].updatedAt - b[1].updatedAt
      );
      for (let i = 0; i < toRemove; i += 1) {
        const [sessionId] = entries[i];
        bySession.delete(sessionId);
      }
    }
  };

  return {
    upsert(sessionId, snapshot) {
      const trimmedEvents = trimEvents(snapshot.events);
      bySession.set(sessionId, {
        ...snapshot,
        events: trimmedEvents,
        updatedAt: Date.now()
      });
      prune();
    },
    get(sessionId) {
      const existing = bySession.get(sessionId);
      if (!existing) {
        return undefined;
      }
      return { ...existing, events: [...existing.events] };
    },
    delete(sessionId) {
      bySession.delete(sessionId);
    },
    prune(now: number = Date.now()) {
      prune(now);
    },
    size() {
      return bySession.size;
    }
  };
};

