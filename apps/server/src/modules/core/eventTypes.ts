import {
  Event,
  ItemSlot,
  EncounterState,
  Stats
} from "../../shared/index.js";

export type { Event };

export const Events = {
  move: (from: string, to: string): Event => ({
    kind: "Move",
    payload: { from, to }
  }),
  giveItem: (itemId: string): Event => ({
    kind: "GiveItem",
    payload: { itemId }
  }),
  removeItem: (itemId: string): Event => ({
    kind: "RemoveItem",
    payload: { itemId }
  }),
  equip: (slot: ItemSlot, itemId: string): Event => ({
    kind: "Equip",
    payload: { slot, itemId }
  }),
  unequip: (slot: ItemSlot): Event => ({
    kind: "Unequip",
    payload: { slot }
  }),
  damage: (targetId: string, amount: number): Event => ({
    kind: "Damage",
    payload: { targetId, amount }
  }),
  playerDamage: (amount: number): Event => ({
    kind: "PlayerDamage",
    payload: { amount }
  }),
  playerHeal: (amount: number): Event => ({
    kind: "PlayerHeal",
    payload: { amount }
  }),
  adjustStats: (delta: Partial<Stats>): Event => ({
    kind: "AdjustStats",
    payload: delta
  }),
  defeat: (enemyId: string): Event => ({
    kind: "Defeat",
    payload: { enemyId }
  }),
  playerDefeated: (): Event => ({
    kind: "PlayerDefeated"
  }),
  setFlag: (flag: string, value: boolean): Event => ({
    kind: "SetFlag",
    payload: { flag, value }
  }),
  appendLog: (entry: string): Event => ({
    kind: "AppendLog",
    payload: { entry }
  }),
  updateEncounter: (patch: Partial<EncounterState> | null): Event => ({
    kind: "UpdateEncounter",
    payload: patch
  })
} as const;

