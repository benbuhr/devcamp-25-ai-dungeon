import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildApp } from "../index.js";

describe("MCP tools", () => {
  const app = buildApp();

  it("parses and executes commands via MCP endpoints", async () => {
    const sessionRes = await request(app).post("/api/session").send();
    expect(sessionRes.status).toBe(201);
    const sessionId = sessionRes.body.sessionId as string;
    expect(sessionId).toBeTruthy();

    const parseRes = await request(app)
      .post("/mcp/tool/game.parseCommand")
      .send({
        sessionId,
        text: "Head north toward the chapel"
      });

    expect(parseRes.status).toBe(200);
    expect(parseRes.body.canonical.verb).toBe("go");
    expect(parseRes.body.canonical.object).toBe("north");

    const executeRes = await request(app)
      .post("/mcp/tool/game.executeCommand")
      .send({
        sessionId,
        command: parseRes.body.canonical
      });

    expect(executeRes.status).toBe(200);
    expect(executeRes.body.state.roomId).toBe("ember-chapel-nave");
    expect(Array.isArray(executeRes.body.events)).toBe(true);
  });
});

