import { GameState, Stats } from "../../../shared/index.js";
import { getItemById } from "../data/items.js";

export const computeEffectiveStats = (state: GameState): Stats => {
  const derived: Stats = { ...state.stats };

  for (const itemId of Object.values(state.equipment)) {
    if (!itemId) continue;
    const item = getItemById(itemId);
    if (typeof item.power === "number") {
      derived.power += item.power;
    }
    if (typeof item.ward === "number") {
      derived.ward += item.ward;
    }
  }

  // Apply single-attack temporary buffs from recently used consumables
  for (const [flag, active] of Object.entries(state.flags)) {
    if (!active) continue;
    if (flag.startsWith("use:temp:item:")) {
      const itemId = flag.slice("use:temp:item:".length);
      try {
        const item = getItemById(itemId);
        if (typeof item.power === "number") {
          derived.power += item.power;
        }
        if (typeof item.ward === "number") {
          derived.ward += item.ward;
        }
      } catch {
        // ignore unknown item ids in flags
      }
    }
  }

  return derived;
};

