import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";

const PRAYER_RESPONSES: Record<string, string> = {
  "graysong-square":
    "You bow your head. The silent bell thirsts for its shards.",
  "ember-chapel-nave":
    "The chapel hums. A whisper says: descend and face the Bellwraith.",
  "witchwell-approach":
    "Cold water answers: cleanse the well and the shard will shine.",
  "hollow-monastery-gate":
    "Ashy wind encircles you: light the cloister braziers before the Prior falls.",
  "orchard-path":
    "Roots twist beneath your feet. Burn the knots to expose the Heart."
};

export const prayHandler: CommandHandler = (state, _cmd, context) => {
  const usedKey = `pray:used:${state.roomId}`;
  if (state.flags[usedKey]) {
    const msg = "You have already prayed here; the embers offer no more.";
    return {
      events: [Events.appendLog(msg)],
      resultText: msg
    };
  }
  const healed = Math.floor(context.random() * 4) + 1;
  const omen =
    PRAYER_RESPONSES[state.roomId] ??
    "Your prayer fades into the Night with no answer.";
  const msg = `${omen} Warmth mends your wounds (+${healed} HP).`;
  return {
    events: [
      Events.playerHeal(healed),
      Events.setFlag(usedKey, true),
      Events.appendLog(msg)
    ],
    resultText: msg
  };
};

