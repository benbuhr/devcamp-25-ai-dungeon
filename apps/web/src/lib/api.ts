import { Command, GameState, NLUResult, ClientState } from "@ashen/shared";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.length > 0
    ? import.meta.env.VITE_API_BASE_URL
    : "";

const jsonHeaders = {
  "Content-Type": "application/json"
} as const;

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
};

interface SessionResponse {
  sessionId: string;
}

export interface CommandRequestBody {
  text?: string;
  command?: Command;
  confirm?: boolean;
}

export interface CommandResponse {
  resultText?: string;
  events?: unknown[];
  state?: GameState;
  nlu?: (NLUResult & { rawText?: string }) | undefined;
  needsConfirm?: boolean;
  client?: ClientState;
  error?: string;
}

export const createSession = async (): Promise<string> => {
  const res = await fetch(`${API_BASE}/api/session`, {
    method: "POST",
    headers: jsonHeaders
  });
  const body = await handleResponse<SessionResponse>(res);
  return body.sessionId;
};

export const fetchState = async (
  sessionId: string
): Promise<{ state: GameState; client?: ClientState }> => {
  const res = await fetch(`${API_BASE}/api/state`, {
    headers: {
      ...jsonHeaders,
      "X-Session-Id": sessionId
    }
  });
  return handleResponse<{ state: GameState; client?: ClientState }>(res);
};

export const sendCommand = async (
  sessionId: string,
  payload: CommandRequestBody
): Promise<CommandResponse> => {
  const res = await fetch(`${API_BASE}/api/command`, {
    method: "POST",
    headers: {
      ...jsonHeaders,
      "X-Session-Id": sessionId
    },
    body: JSON.stringify(payload)
  });
  return handleResponse<CommandResponse>(res);
};

