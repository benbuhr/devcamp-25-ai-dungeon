export const VERBS = [
  "look",
  "go",
  "take",
  "use",
  "combine",
  "talk",
  "attack",
  "inventory",
  "help",
  "pray",
  "equip",
  "unequip",
  "stats",
  "map"
] as const;

export type Verb = (typeof VERBS)[number];

export type SessionId = string;

export interface Command {
  verb: Verb;
  object?: string;
  preposition?: string;
  target?: string;
}

export interface NLUResult {
  canonical: Command;
  confidence: number;
  parser: "llm" | "rule";
  rawText: string;
  rationale?: string;
}

export type ItemSlot = "hand" | "offhand" | "head" | "chest" | "trinket";

export type ItemTier = "common" | "tempered" | "consecrated" | "relic";

export interface Item {
  id: string;
  name: string;
  description: string;
  slot?: ItemSlot;
  power?: number;
  ward?: number;
  tier?: ItemTier;
  tags?: string[];
}

export interface Stats {
  hp: number;
  power: number;
  ward: number;
}

export type ActorKind = "player" | "enemy" | "npc";

export interface Actor {
  id: string;
  name: string;
  kind: ActorKind;
  stats: Stats;
  tags?: string[];
  lootTableId?: string;
  description?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  exits: Record<string, string>;
  items: string[];
  actors: string[];
  traits?: string[];
}

export interface GameState {
  sessionId: SessionId;
  roomId: string;
  inventory: string[];
  equipment: Partial<Record<ItemSlot, string>>;
  stats: Stats;
  flags: Record<string, boolean>;
  log: string[];
  encounter?: EncounterState | null;
}

export interface EncounterState {
  enemyId: string;
  enemyHp: number;
  initiative?: "player" | "enemy";
  status?: "active" | "victory" | "defeat";
}

export type Event =
  | { kind: "Move"; payload: { from: string; to: string } }
  | { kind: "GiveItem"; payload: { itemId: string } }
  | { kind: "RemoveItem"; payload: { itemId: string } }
  | { kind: "Equip"; payload: { slot: ItemSlot; itemId: string } }
  | { kind: "Unequip"; payload: { slot: ItemSlot } }
  | { kind: "Damage"; payload: { targetId: string; amount: number } }
  | { kind: "PlayerDamage"; payload: { amount: number } }
  | { kind: "PlayerHeal"; payload: { amount: number } }
  | { kind: "AdjustStats"; payload: Partial<Stats> }
  | { kind: "Defeat"; payload: { enemyId: string } }
  | { kind: "PlayerDefeated" }
  | { kind: "SetFlag"; payload: { flag: string; value: boolean } }
  | { kind: "AppendLog"; payload: { entry: string } }
  | { kind: "UpdateEncounter"; payload: Partial<EncounterState> | null };

export interface VisibleContext {
  room: {
    id: string;
    name: string;
    description: string;
  };
  exits: string[];
  items: string[];
  actors: string[];
  inventory: string[];
  equipment: Partial<Record<ItemSlot, string>>;
  flags: Record<string, boolean>;
}

export interface CommandContext {
  visible: VisibleContext;
  random: () => number;
  now: () => number;
}

export interface CommandResult {
  events: Event[];
  resultText: string;
}

export interface StoreSnapshot {
  state: GameState;
  events: Event[];
  updatedAt: number;
}

export interface SessionStore {
  upsert(sessionId: SessionId, snapshot: StoreSnapshot): void;
  get(sessionId: SessionId): StoreSnapshot | undefined;
  delete(sessionId: SessionId): void;
  prune(now?: number): void;
}

export interface RoomGraph {
  rooms: Record<string, Room>;
}

export interface InventoryGroup {
  name: string;
  quantity: number;
  equipable: boolean;
}

export interface EquippedView {
  slot: ItemSlot;
  itemId?: string;
  name?: string;
}

export interface StatsDelta {
  hp?: number;
  power?: number;
  ward?: number;
}

export interface ClientState {
  inventoryGroups: InventoryGroup[];
  equipment: EquippedView[];
  effectiveStats: Stats;
  statDelta?: StatsDelta;
  locationName?: string;
  exits?: string[];
  roomGraph?: RoomGraph;
  visibleActors?: VisibleActor[];
}

export interface VisibleActor {
  id: string;
  name: string;
  disposition: "friendly" | "hostile";
}


