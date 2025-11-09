import { Router } from "express";
import { SessionManager } from "../modules/core/sessionManager.js";

export const createSessionRouter = (sessions: SessionManager) => {
  const router = Router();

  router.post("/", (_req, res) => {
    const sessionId = sessions.create();
    res.status(201).json({ sessionId });
  });

  return router;
};

