import type { Command } from "@ashen/shared";

export type ChatRole = "player" | "warden" | "system" | "flavor";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  meta?: string;
  timestamp: number;
}

export interface PendingConfirm {
  canonicalText: string;
  confidence: number;
  command: Command;
  rawText: string;
}

