export interface Npc {
  id: string;
  name: string;
  dialogue: string[];
}

export const NPCS: Record<string, Npc> = {
  "villager-ida": {
    id: "villager-ida",
    name: "Ida the Warden-Candle",
    dialogue: [
      "Keep the embers close, Warden. Night-snakes lurk whenever the bell is silent.",
      "The bell cracked the night the Wardens fell. Bring back its voice and we all might sleep again."
    ]
  },
  "villager-bryn": {
    id: "villager-bryn",
    name: "Bryn the Miller",
    dialogue: [
      "The millstones stopped when the river turned black. I hear whispers from the well at dusk.",
      "Take this warning: the Orchard Heart roots itself deeper each night."
    ]
  }
};

export const getNpcById = (id: string) => NPCS[id];

