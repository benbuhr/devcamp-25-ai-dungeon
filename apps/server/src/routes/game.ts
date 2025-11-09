import { Router } from "express";
import { Dispatcher, SessionManager } from "../modules/core/index.js";
import { NLUService } from "../modules/nlu/index.js";
import {
  CommandRequestBody,
  createCommandProcessor
} from "../services/commandProcessor.js";
import { buildClientState } from "../services/clientState.js";

interface GameRouterDeps {
  sessions: SessionManager;
  dispatcher: Dispatcher;
  nlu: NLUService;
  executeThreshold: number;
  confirmThreshold: number;
}

const getSessionId = (req: any): string | undefined =>
  (req.headers["x-session-id"] as string | undefined) ??
  (req.body?.sessionId as string | undefined) ??
  (req.query?.sessionId as string | undefined);

export const createGameRouter = (deps: GameRouterDeps) => {
  const router = Router();

  router.get("/state", (req, res) => {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      res.status(400).json({ error: "Missing session identifier" });
      return;
    }
    const state = deps.sessions.ensure(sessionId);
    res.json({ state, client: buildClientState(state) });
  });

  const processor = createCommandProcessor({
    sessions: deps.sessions,
    dispatcher: deps.dispatcher,
    nlu: deps.nlu,
    executeThreshold: deps.executeThreshold,
    confirmThreshold: deps.confirmThreshold
  });

  router.post("/command", async (req, res) => {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      res.status(400).json({ error: "Missing session identifier" });
      return;
    }

    const body = req.body as CommandRequestBody;
    try {
      const response = await processor.execute(sessionId, body);
      if (response.error) {
        res.status(400).json({ error: response.error });
        return;
      }
      res.json(response);
    } catch (error) {
      console.error("[command] error", error);
      res.status(500).json({ error: "Failed to execute command" });
    }
  });

  return router;
};

