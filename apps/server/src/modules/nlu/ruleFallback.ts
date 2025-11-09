import { Command, VERBS } from "../../shared/index.js";
import { ParseInput, ParsedCommand } from "./types.js";

const directionAliases: Record<string, string> = {
  north: "north",
  south: "south",
  east: "east",
  west: "west",
  up: "up",
  down: "down",
  forward: "north",
  back: "south",
  // shorthands
  n: "north",
  s: "south",
  e: "east",
  w: "west",
  u: "up",
  d: "down"
};

const verbKeywords: Array<{ verb: Command["verb"]; patterns: RegExp[] }> = [
  { verb: "look", patterns: [/^look\b/, /\blook around\b/, /\bstudy\b/, /\bexamine\b/] },
  { verb: "inventory", patterns: [/\binventory\b/, /\bbag\b/, /\bsatchel\b/] },
  {
    verb: "attack",
    patterns: [/\battack\b/, /\bhit\b/, /\bstrike\b/, /\bswing\b/, /\bfight\b/]
  },
  {
    verb: "take",
    patterns: [/\btake\b/, /\bgrab\b/, /\bpick up\b/, /\bpickup\b/, /\bget\b/, /\bscoop\b/]
  },
  {
    verb: "use",
    patterns: [/\buse\b/, /\blight\b/, /\bignite\b/, /\bconsume\b/, /\bdrink\b/]
  },
  {
    verb: "combine",
    patterns: [
      /\bcombine\b/,
      /\bassemble\b/,
      /\bforge\b/,
      /\bjoin\b/,
      /\bput together\b/,
      /\bpiece together\b/,
      /\breforge\b/
    ]
  },
  {
    verb: "equip",
    patterns: [/\bequip\b/, /\bwear\b/, /\bdon\b/, /\bwield\b/]
  },
  {
    verb: "unequip",
    patterns: [/\bunequip\b/, /\bremove\b/, /\bdoff\b/, /\bunwear\b/]
  },
  { verb: "stats", patterns: [/\bstats?\b/, /\bstatus\b/, /\bhealth\b/] },
  { verb: "pray", patterns: [/\bpray\b/, /\bkneel\b/, /\bbeseech\b/] },
  { verb: "go", patterns: [/\bgo\b/, /\bwalk\b/, /\brun\b/, /\bhead\b/] },
  { verb: "map", patterns: [/\bmap\b/, /\bworld map\b/, /\bshow map\b/] }
];

const sanitize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const splitWords = (text: string) => sanitize(text).split(" ").filter(Boolean);

export const ruleParse = (input: ParseInput): ParsedCommand => {
  const cleaned = sanitize(input.text);
  const words = splitWords(input.text);

  // direction-only input (e.g., "n", "south")
  const dirOnly = inferDirection(words);
  if (dirOnly.object && words.length === 1) {
    return finalize("go", cleaned, input, dirOnly, 0.95);
  }

  // direct verb match
  for (const entry of verbKeywords) {
    for (const pattern of entry.patterns) {
      if (pattern.test(cleaned)) {
        const extras =
          entry.verb === "go" ? inferDirection(words) : inferObject(words, input);
        const confidence = entry.verb === "go" && extras.object ? 0.95 : 0.92;
        return finalize(entry.verb, cleaned, input, extras, confidence);
      }
    }
  }

  // fallback: if first word matches allowed verbs
  const first = words[0];
  if (first && (VERBS as readonly string[]).includes(first)) {
    const extras =
      first === "go" ? inferDirection(words) : inferObject(words, input);
    return finalize(first as Command["verb"], cleaned, input, extras, 0.9);
  }

  return {
    canonical: { verb: "help" },
    confidence: 0.2,
    parser: "rule",
    rationale: "Fallback help command"
  };
};

const inferDirection = (words: string[]): { object?: string } => {
  for (const word of words) {
    if (directionAliases[word]) {
      return { object: directionAliases[word] };
    }
  }
  return {};
};

const inferObject = (words: string[], input: ParseInput): { object?: string } => {
  const joined = words.join(" ");
  for (const itemId of input.context.items) {
    if (joined.includes(itemId.toLowerCase())) {
      return { object: itemId };
    }
  }
  const loweredJoined = joined.toLowerCase();
  for (const actorId of input.context.actors) {
    const loweredId = actorId.toLowerCase();
    const stripped = loweredId.replace(/[-_]\d+$/, "");
    const spaced = loweredId.replace(/[-_]/g, " ");
    if (
      loweredJoined.includes(loweredId) ||
      loweredJoined.includes(spaced) ||
      loweredJoined.includes(stripped)
    ) {
      return { object: actorId };
    }
  }
  if (words.length > 1) {
    return { object: words.slice(1).join(" ") };
  }
  return {};
};

const finalize = (
  verb: Command["verb"],
  text: string,
  input: ParseInput,
  extras: { object?: string },
  confidence?: number
): ParsedCommand => {
  return {
    canonical: {
      verb,
      object: extras.object
    },
    confidence: confidence ?? (verb === "help" ? 0.3 : 0.8),
    parser: "rule",
    rationale: `Rule-based parse for "${text}"`
  };
};

