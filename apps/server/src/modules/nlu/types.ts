import { Command, VisibleContext } from "../../shared/index.js";

export interface ParseInput {
  text: string;
  context: VisibleContext;
  allowedVerbs: Command["verb"][];
}

export interface ParsedCommand {
  canonical: Command;
  confidence: number;
  parser: "llm" | "rule";
  rationale?: string;
}

export interface NLUService {
  parse(input: ParseInput): Promise<ParsedCommand>;
}

