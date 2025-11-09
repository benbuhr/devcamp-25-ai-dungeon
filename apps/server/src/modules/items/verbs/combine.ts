import { CommandHandler } from "../../core/contracts.js";
import { Events } from "../../core/eventTypes.js";
import { getItemById } from "../data/items.js";

const SHARDS = ["bell-shard-one", "bell-shard-two", "bell-shard-three", "bell-shard-four"] as const;
const CLAPPER = "bell-clapper";

export const combineHandler: CommandHandler = (state) => {
  const present = new Set(state.inventory);
  const owned = SHARDS.filter((id) => present.has(id));
  const count = owned.length;

  if (count < SHARDS.length) {
    const message =
      count === 0
        ? "You have no bell shards to combine."
        : `You have ${count}/4 bell shards. Keep searching.`;
    return {
      events: [Events.appendLog(message)],
      resultText: message
    };
  }

  const events = [];

  // Remove each shard (note: current RemoveItem removes all instances of that id)
  for (const id of SHARDS) {
    events.push(Events.removeItem(id));
  }

  // Grant the clapper and mark victory
  events.push(Events.giveItem(CLAPPER));
  events.push(
    Events.appendLog(
      "You set each shard into place. Heat blooms, seams vanish. The Great Bell’s clapper is reforged."
    )
  );
  const clapper = getItemById(CLAPPER);
  events.push(Events.appendLog(`You hold ${clapper.name}. The Night recoils.`));
  events.push(Events.setFlag("game:victory", true));

  const resultText =
    "The shards fuse with a resonant hum. The clapper is whole once more — you have won.";

  return {
    events,
    resultText
  };
};



