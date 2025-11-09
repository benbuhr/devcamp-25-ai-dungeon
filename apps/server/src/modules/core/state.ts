import { GameState, SessionId, Stats } from "../../shared/index.js";

export const BASE_STATS: Stats = {
  hp: 10,
  power: 3,
  ward: 2
};

export const createInitialState = (sessionId: SessionId): GameState => ({
  sessionId,
  roomId: "graysong-square",
  inventory: [],
  equipment: {},
  stats: { ...BASE_STATS },
  flags: {},
  log: [],
  encounter: null
});

