import {
  CommandHandler,
  CommandResult
} from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import { computeEffectiveStats } from "../../items/services/statService.js";
import { getEnemy } from "../data/enemies.js";
import { playerDamageAgainst, enemyDamageAgainst } from "./damageModel.js";
import { rollLoot } from "../../items/data/lootTables.js";
import { getItemById } from "../../items/data/items.js";

const formatEnemyName = (enemyName: string) => enemyName;

export const attackHandler: CommandHandler = (state, command, context) => {
  const targetName = command.object ?? command.target ?? "";
  const visible = context.visible.actors;

  const enemyId =
    targetName.length > 0
      ? visible.find((id) => id.toLowerCase().includes(targetName.toLowerCase()))
      : visible[0];

  if (!enemyId) {
    return {
      events: [],
      resultText: "There is nothing here to attack."
    };
  }

  const enemy = getEnemy(enemyId);
  if (!enemy) {
    return {
      events: [],
      resultText: "You cannot harm that."
    };
  }

  const existingEncounter =
    state.encounter && state.encounter.enemyId === enemyId ? state.encounter : null;
  const startingEnemyHp = existingEncounter?.enemyHp ?? enemy.stats.hp;
  const wasNewEncounter = !existingEncounter;

  const effectiveStats = computeEffectiveStats(state);
  const damageToEnemy = playerDamageAgainst(effectiveStats, enemy);
  const remainingEnemyHp = Math.max(0, startingEnemyHp - damageToEnemy);

  const events: CommandResult["events"] = [];
  const messages: string[] = [];

  if (wasNewEncounter) {
    events.push(
      Events.updateEncounter({
        enemyId: enemy.id,
        enemyHp: startingEnemyHp,
        status: "active",
        initiative: "player"
      })
    );
    messages.push(`You engage ${formatEnemyName(enemy.name)}!`);
  }

  events.push(Events.damage(enemy.id, damageToEnemy));
  messages.push(`You strike ${enemy.name} for ${damageToEnemy} damage.`);

  // After player's attack, clear any single-attack temporary buffs
  for (const [flag, active] of Object.entries(state.flags)) {
    if (active && flag.startsWith("use:temp:item:")) {
      events.push(Events.setFlag(flag, false));
    }
  }

  if (remainingEnemyHp <= 0) {
    events.push(
      Events.defeat(enemy.id),
      Events.setFlag(`enemy:defeated:${enemy.id}`, true),
      Events.updateEncounter({
        enemyHp: 0,
        status: "victory"
      }),
      Events.appendLog(`${enemy.name} collapses into ash.`)
    );
    messages.push(`${enemy.name} collapses into ash.`);

    const loot = rollLoot(enemy.lootTableId, context.random);
    if (loot.length > 0) {
      for (const itemId of loot) {
        const item = getItemById(itemId);
        events.push(Events.giveItem(itemId));
        events.push(Events.appendLog(`You recover ${item.name}.`));
        messages.push(`You recover ${item.name}.`);
      }
    }
  } else {
    const wardAuraActive = Boolean(state.flags["ward:aura"]);
    const damageToPlayer = enemyDamageAgainst(enemy, effectiveStats, wardAuraActive);
    if (damageToPlayer > 0) {
      events.push(Events.playerDamage(damageToPlayer));
      messages.push(`${enemy.name} strikes you for ${damageToPlayer} damage.`);
      const remainingPlayerHp = Math.max(0, state.stats.hp - damageToPlayer);
      if (remainingPlayerHp <= 0) {
        events.push(
          Events.playerDefeated(),
          Events.updateEncounter({
            status: "defeat"
          }),
          Events.appendLog("You fall as the Night closes in.")
        );
        messages.push("You fall as the Night closes in.");
      } else {
        events.push(
          Events.updateEncounter({
            enemyHp: remainingEnemyHp,
            status: "active",
            initiative: "enemy"
          })
        );
      }
    } else {
      messages.push(`${enemy.name}'s blow glances off your wards.`);
      events.push(
        Events.updateEncounter({
          enemyHp: remainingEnemyHp,
          status: "active",
          initiative: "enemy"
        })
      );
    }
  }

  return {
    events,
    resultText: messages.join(" ")
  };
};

