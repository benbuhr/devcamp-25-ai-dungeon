import { Router } from "express";
import {
  Command,
  NLUResult,
  SessionId,
  VERBS
} from "../shared/index.js";
import { SessionManager, Dispatcher } from "../modules/core/index.js";
import { NLUService } from "../modules/nlu/index.js";
import { createCommandProcessor } from "../services/commandProcessor.js";
import { resolveVisibleContext } from "../modules/map/services/movementService.js";

interface McpDeps {
  sessions: SessionManager;
  dispatcher: Dispatcher;
  nlu: NLUService;
  executeThreshold: number;
  confirmThreshold: number;
}

const toolDefinitions = [
  {
    name: "game.parseCommand",
    description: "Normalize natural input to a single canonical command.",
    input_schema: {
      type: "object",
      properties: {
        sessionId: { type: "string" },
        text: { type: "string" }
      },
      required: ["sessionId", "text"]
    },
    output_schema: {
      type: "object",
      properties: {
        canonical: {
          type: "object",
          properties: {
            verb: { type: "string" },
            object: { type: "string" },
            preposition: { type: "string" },
            target: { type: "string" }
          },
          required: ["verb"]
        },
        confidence: { type: "number" },
        parser: { type: "string" }
      },
      required: ["canonical", "confidence", "parser"]
    }
  },
  {
    name: "game.executeCommand",
    description: "Validate and execute a canonical command against the engine.",
    input_schema: {
      type: "object",
      properties: {
        sessionId: { type: "string" },
        command: {
          type: "object",
          properties: {
            verb: { type: "string" },
            object: { type: "string" },
            preposition: { type: "string" },
            target: { type: "string" }
          },
          required: ["verb"]
        }
      },
      required: ["sessionId", "command"]
    },
    output_schema: {
      type: "object",
      properties: {
        resultText: { type: "string" },
        events: { type: "array", items: { type: "object" } },
        state: { type: "object" }
      },
      required: ["resultText", "events", "state"]
    }
  }
];

export const createMcpRouter = (deps: McpDeps) => {
  const router = Router();
  const processor = createCommandProcessor({
    sessions: deps.sessions,
    dispatcher: deps.dispatcher,
    nlu: deps.nlu,
    executeThreshold: deps.executeThreshold,
    confirmThreshold: deps.confirmThreshold
  });

  router.get("/tools", (_req, res) => {
    res.json({ tools: toolDefinitions });
  });

  router.post("/tool/game.parseCommand", async (req, res) => {
    const { sessionId, text } = req.body as { sessionId?: SessionId; text?: string };
    if (!sessionId || !text) {
      res.status(400).json({ error: "sessionId and text required" });
      return;
    }
    const state = deps.sessions.ensure(sessionId);
    const visible = resolveVisibleContext(state);
    try {
      const parsed = await deps.nlu.parse({
        text,
        context: visible,
        allowedVerbs: [...VERBS]
      });
      const result: NLUResult = {
        canonical: parsed.canonical,
        confidence: parsed.confidence,
        parser: parsed.parser,
        rawText: text,
        rationale: parsed.rationale
      };
      res.json(result);
    } catch (error) {
      console.error("[mcp.parse] error", error);
      res.status(500).json({ error: "Parse failure" });
    }
  });

  router.post("/tool/game.executeCommand", async (req, res) => {
    const { sessionId, command } = req.body as {
      sessionId?: SessionId;
      command?: Command;
    };
    if (!sessionId || !command) {
      res.status(400).json({ error: "sessionId and command required" });
      return;
    }
    try {
      const response = await processor.execute(sessionId, {
        command,
        confirm: true
      });
      if (response.error) {
        res.status(400).json({ error: response.error });
        return;
      }
      res.json(response);
    } catch (error) {
      console.error("[mcp.execute] error", error);
      res.status(500).json({ error: "Execute failure" });
    }
  });

  return router;
};

