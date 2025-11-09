import { Actor } from "../../../shared/index.js";

export interface Enemy extends Actor {
  ai?: "aggressive" | "defensive";
}

export const ENEMIES: Record<string, Enemy> = {
  "husk-1": {
    id: "husk-1",
    name: "Husk",
    kind: "enemy",
    stats: { hp: 4, power: 1, ward: 0 },
    lootTableId: "shambler-basic",
    description: "A shambling villager hollowed by Night."
  },
  "husk-2": {
    id: "husk-2",
    name: "Husk",
    kind: "enemy",
    stats: { hp: 4, power: 1, ward: 0 },
    lootTableId: "shambler-basic",
    description: "Another husk dragging broken chains."
  },
  "shambler-1": {
    id: "shambler-1",
    name: "Shambler",
    kind: "enemy",
    stats: { hp: 6, power: 2, ward: 0 },
    lootTableId: "shambler-basic",
    description: "A staggering corpse with a bell fragment in its chest."
  },
  "lantern-wisp-1": {
    id: "lantern-wisp-1",
    name: "Lantern Wisp",
    kind: "enemy",
    stats: { hp: 3, power: 1, ward: 1 },
    lootTableId: "shambler-basic",
    description: "A hovering light that drains warmth."
  },
  "gloom-wolf-1": {
    id: "gloom-wolf-1",
    name: "Gloom Wolf",
    kind: "enemy",
    stats: { hp: 7, power: 3, ward: 1 },
    lootTableId: "gloom-wolf",
    description: "A wolf wreathed in Night smoke."
  },
  "gloom-wolf-2": {
    id: "gloom-wolf-2",
    name: "Gloom Wolf",
    kind: "enemy",
    stats: { hp: 7, power: 3, ward: 1 },
    lootTableId: "gloom-wolf",
    description: "A wolf with sap-stained jaws."
  },
  "bellwraith": {
    id: "bellwraith",
    name: "The Bellwraith",
    kind: "enemy",
    stats: { hp: 14, power: 4, ward: 3 },
    lootTableId: "bellwraith",
    description: "A bound spirit wreathed in tolling light."
  },
  "well-mother": {
    id: "well-mother",
    name: "The Well-Mother",
    kind: "enemy",
    stats: { hp: 16, power: 4, ward: 2 },
    lootTableId: "well-mother",
    description: "Twisted caretaker of the flooded tunnels."
  },
  "prior-of-ash": {
    id: "prior-of-ash",
    name: "The Prior of Ash",
    kind: "enemy",
    stats: { hp: 18, power: 5, ward: 3 },
    lootTableId: "prior-of-ash",
    description: "Once head of the monastery, now ash and embers."
  },
  "orchard-heart": {
    id: "orchard-heart",
    name: "The Orchard Heart",
    kind: "enemy",
    stats: { hp: 20, power: 5, ward: 4 },
    lootTableId: "orchard-heart",
    description: "A blight core pulsing beneath twisted roots."
  }
};

export const getEnemy = (enemyId: string): Enemy | undefined => ENEMIES[enemyId];

