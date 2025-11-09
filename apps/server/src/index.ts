import express from "express";
import cors from "cors";
import morgan from "morgan";
import pino from "pino";
import {
  createDispatcher,
  createRegistry,
  createSessionManager
} from "./modules/core/index.js";
  import { registerCoreModule } from "./modules/core/index.js";
import { registerMapModule } from "./modules/map/index.js";
import { registerItemsModule } from "./modules/items/index.js";
import { registerCombatModule } from "./modules/combat/index.js";
import { createMemoryStore } from "./modules/store/memoryStore.js";
import { resolveVisibleContext } from "./modules/map/services/movementService.js";
import { createNluService } from "./modules/nlu/nluService.js";
import { createSessionRouter } from "./routes/session.js";
import { createGameRouter } from "./routes/game.js";
import { createMcpRouter } from "./routes/mcp.js";

const logger = pino({ name: "ashen-vale-server" });

const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const CORS_ORIGINS = (process.env.CLIENT_ORIGINS ?? CORS_ORIGIN)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const MEMORY_TTL_MS = Number(process.env.SESSION_TTL_MS ?? 30 * 60 * 1000);
const MEMORY_MAX_SESSIONS = Number(process.env.SESSION_MAX ?? 500);
const NLU_EXECUTE_THRESHOLD = Number(process.env.NLU_EXECUTE_THRESHOLD ?? 0.8);
const NLU_CONFIRM_THRESHOLD = Number(process.env.NLU_CONFIRM_THRESHOLD ?? 0.5);

export const buildApp = () => {
  const app = express();
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (CORS_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
      allowedHeaders: ["Content-Type", "X-Session-Id"]
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));

  const store = createMemoryStore({
    ttlMs: MEMORY_TTL_MS,
    maxSessions: MEMORY_MAX_SESSIONS
  });
  const pruneInterval = setInterval(() => store.prune(), MEMORY_TTL_MS);
  if (typeof pruneInterval.unref === "function") {
    pruneInterval.unref();
  }

  const sessions = createSessionManager(store);

  const registry = createRegistry();
  registerCoreModule(registry);
  registerMapModule(registry);
  registerItemsModule(registry);
  registerCombatModule(registry);

  const dispatcher = createDispatcher(registry, resolveVisibleContext);
  const nlu = createNluService();

  app.use("/api/session", createSessionRouter(sessions));
  app.use(
    "/api",
    createGameRouter({
      sessions,
      dispatcher,
      nlu,
      executeThreshold: NLU_EXECUTE_THRESHOLD,
      confirmThreshold: NLU_CONFIRM_THRESHOLD
    })
  );
  app.use(
    "/mcp",
    createMcpRouter({
      sessions,
      dispatcher,
      nlu,
      executeThreshold: NLU_EXECUTE_THRESHOLD,
      confirmThreshold: NLU_CONFIRM_THRESHOLD
    })
  );

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  return app;
};

if (process.env.NODE_ENV !== "test") {
  const app = buildApp();
  app.listen(PORT, () => {
    logger.info(`Ashen Vale server listening on http://localhost:${PORT}`);
  });
}

