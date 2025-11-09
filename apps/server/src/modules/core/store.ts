import { SessionStore } from "../../shared/index.js";

export type { SessionStore };

export interface StoreConfig {
  ttlMs: number;
  maxSessions: number;
}

