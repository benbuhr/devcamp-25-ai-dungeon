import { Event, GameState } from "../../shared/index.js";
import { BASE_STATS } from "./state.js";

const LOG_LIMIT = 50;

export const applyEvent = (state: GameState, event: Event): GameState => {
  switch (event.kind) {
    case "Move": {
      return {
        ...state,
        roomId: event.payload.to,
        encounter: null
      };
    }
    case "GiveItem": {
      return {
        ...state,
        inventory: [...state.inventory, event.payload.itemId]
      };
    }
    case "RemoveItem": {
      // Remove only a single occurrence of the itemId from inventory
      const targetId = event.payload.itemId;
      let removed = false;
      const nextInventory = state.inventory.filter((id) => {
        if (!removed && id === targetId) {
          removed = true;
          return false;
        }
        return true;
      });
      return {
        ...state,
        inventory: nextInventory
      };
    }
    case "Equip": {
      return {
        ...state,
        equipment: {
          ...state.equipment,
          [event.payload.slot]: event.payload.itemId
        }
      };
    }
    case "Unequip": {
      const rest = { ...state.equipment };
      delete rest[event.payload.slot];
      return {
        ...state,
        equipment: rest
      };
    }
    case "Damage": {
      if (!state.encounter || state.encounter.enemyId !== event.payload.targetId) {
        return state;
      }
      const nextEnemyHp = Math.max(0, state.encounter.enemyHp - event.payload.amount);
      return {
        ...state,
        encounter: {
          ...state.encounter,
          enemyHp: nextEnemyHp
        }
      };
    }
    case "PlayerDamage": {
      const nextHp = Math.max(0, state.stats.hp - event.payload.amount);
      return {
        ...state,
        stats: {
          ...state.stats,
          hp: nextHp
        }
      };
    }
    case "PlayerHeal": {
      const maxHp = BASE_STATS.hp;
      const nextHp = Math.min(maxHp, state.stats.hp + event.payload.amount);
      return {
        ...state,
        stats: {
          ...state.stats,
          hp: nextHp
        }
      };
    }
    case "AdjustStats": {
      const nextHp =
        typeof event.payload.hp === "number"
          ? Math.min(BASE_STATS.hp, Math.max(0, state.stats.hp + event.payload.hp))
          : state.stats.hp;
      const nextPower =
        typeof event.payload.power === "number"
          ? Math.max(0, state.stats.power + event.payload.power)
          : state.stats.power;
      const nextWard =
        typeof event.payload.ward === "number"
          ? Math.max(0, state.stats.ward + event.payload.ward)
          : state.stats.ward;
      return {
        ...state,
        stats: {
          ...state.stats,
          hp: nextHp,
          power: nextPower,
          ward: nextWard
        }
      };
    }
    case "Defeat": {
      if (!state.encounter || state.encounter.enemyId !== event.payload.enemyId) {
        return state;
      }
      return {
        ...state,
        encounter: {
          ...state.encounter,
          status: "victory",
          enemyHp: 0
        }
      };
    }
    case "PlayerDefeated": {
      if (!state.encounter) {
        return state;
      }
      return {
        ...state,
        encounter: {
          ...state.encounter,
          status: "defeat"
        }
      };
    }
    case "SetFlag": {
      return {
        ...state,
        flags: {
          ...state.flags,
          [event.payload.flag]: event.payload.value
        }
      };
    }
    case "AppendLog": {
      const nextLog = [...state.log, event.payload.entry];
      if (nextLog.length > LOG_LIMIT) {
        nextLog.splice(0, nextLog.length - LOG_LIMIT);
      }
      return {
        ...state,
        log: nextLog
      };
    }
    case "UpdateEncounter": {
      if (event.payload === null) {
        return { ...state, encounter: null };
      }
      const baseEncounter =
        state.encounter ?? {
          enemyId: "",
          enemyHp: 0,
          status: "active" as const
        };
      return {
        ...state,
        encounter: {
          ...baseEncounter,
          ...event.payload
        }
      };
    }
    default:
      return state;
  }
};

export const applyEvents = (state: GameState, events: Event[]): GameState =>
  events.reduce(applyEvent, state);

