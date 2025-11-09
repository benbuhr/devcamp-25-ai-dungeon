import { Command } from "../../shared/index.js";
import { getItemById } from "../items/data/items.js";
import { ruleParse } from "./ruleFallback.js";
import { NLUService, ParseInput, ParsedCommand } from "./types.js";

interface LLMProvider {
  parse(input: ParseInput): Promise<ParsedCommand | undefined>;
}

interface CacheEntry {
  result: ParsedCommand;
  expiresAt: number;
}

interface NLUOptions {
  provider?: LLMProvider;
  cacheTtlMs?: number;
}

const DEFAULT_CACHE_TTL = 60_000;

export const createNluService = (options: NLUOptions = {}): NLUService => {
  const cache = new Map<string, CacheEntry>();

  const cacheTtl = options.cacheTtlMs ?? DEFAULT_CACHE_TTL;
  const provider = options.provider;

  const buildCacheKey = (input: ParseInput) =>
    JSON.stringify({
      text: input.text.trim().toLowerCase(),
      room: input.context.room.id,
      exits: input.context.exits,
      actors: input.context.actors,
      items: input.context.items
    });

  const readCache = (key: string): ParsedCommand | undefined => {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      cache.delete(key);
      return undefined;
    }
    return entry.result;
  };

  const writeCache = (key: string, result: ParsedCommand) => {
    cache.set(key, {
      result,
      expiresAt: Date.now() + cacheTtl
    });
  };

  const service: NLUService = {
    async parse(input) {
      const key = buildCacheKey(input);
      const cached = readCache(key);
      if (cached) {
        return cached;
      }

      let parsed: ParsedCommand | undefined;

      if (provider) {
        try {
          parsed = await provider.parse(input);
        } catch (err) {
          console.warn("[nlu] provider error", err);
        }
      }

      if (!parsed) {
        parsed = ruleParse(input);
      }

      const validated = applyValidation(parsed, input);
      writeCache(key, validated);
      return validated;
    }
  };

  return service;
};

const applyValidation = (
  parsed: ParsedCommand,
  input: ParseInput
): ParsedCommand => {
  const normalizedVerb = parsed.canonical.verb;
  if (!input.allowedVerbs.includes(normalizedVerb)) {
    return toHelp(parsed, "Verb not allowed in current context");
  }

  if (!validateObjects(parsed.canonical, input)) {
    return toHelp(parsed, "Referenced object not present");
  }

  return parsed;
};

const toHelp = (parsed: ParsedCommand, rationale: string): ParsedCommand => ({
  canonical: { verb: "help" },
  confidence: Math.min(parsed.confidence, 0.3),
  parser: parsed.parser,
  rationale
});

const validateObjects = (command: Command, input: ParseInput): boolean => {
  switch (command.verb) {
    case "go":
      return command.object
        ? input.context.exits.includes(command.object.toLowerCase())
        : false;
    case "attack":
      return command.object
        ? input.context.actors.some((actorId) =>
            actorId.toLowerCase().includes(command.object!.toLowerCase())
          )
        : input.context.actors.length > 0;
    case "take":
    case "use":
    case "equip":
      if (!command.object) {
        return false;
      }
      {
        const query = command.object.toLowerCase();
        const queryHyphen = query.replace(/\s+/g, "-");
        const querySpaced = query.replace(/[-_]+/g, " ");
        return [...input.context.items, ...input.context.inventory].some((itemId) => {
          const id = itemId.toLowerCase();
          const idHyphen = id.replace(/\s+/g, "-");
          const idSpaced = id.replace(/[-_]+/g, " ");
          // Also match by item name
          let name = "";
          try {
            name = getItemById(itemId).name.toLowerCase();
          } catch {
            name = "";
          }
          const nameHyphen = name.replace(/\s+/g, "-");
          const nameSpaced = name.replace(/[-_]+/g, " ");
          return (
            id.includes(query) ||
            idSpaced.includes(query) ||
            id.includes(queryHyphen) ||
            idHyphen.includes(queryHyphen) ||
            idSpaced.includes(querySpaced) ||
            (name &&
              (name.includes(query) ||
                nameSpaced.includes(query) ||
                name.includes(queryHyphen) ||
                nameHyphen.includes(queryHyphen) ||
                nameSpaced.includes(querySpaced)))
          );
        });
      }
    default:
      return true;
  }
};

