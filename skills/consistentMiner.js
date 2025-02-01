function plugin(bot) {
  let listener = function () {
    // There is an entity at our cursor (blocking the cursor) - stop breaking (Ignore "dropped items" as you can interact through them)
    if (bot.entityAtCursor() && bot.entityAtCursor().name !== "item") {
      if (bot.targetDigBlock) bot.stopDigging();
      return;
    }

    let blockAtCursor = bot.blockAtCursor();
    if (!blockAtCursor) return;

    // The block at the cursor has changed, stop digging
    if (
      blockAtCursor &&
      bot.targetDigBlock &&
      !blockAtCursor.position.equals(bot.targetDigBlock.position)
    ) {
      return bot.stopDigging();
    }

    // The tool in our hand has changed/broken (Ignore durability if it's changed -1)
    if (
      bot.heldItem &&
      bot.heldItem !== bot.consistentMiner.heldItem &&
      bot.heldItem.durabilityUsed !==
        bot.consistentMiner.heldItem.durabilityUsed + 1
    ) {
      bot.consistentMiner.heldItem = bot.heldItem;
      if (bot.targetDigBlock) return bot.stopDigging();
    }

    // The bot is already digging, cycle to keep running "safety checks"
    if (bot.targetDigBlock) return;
    bot
      .dig(
        bot.blockAtCursor(),
        bot.consistentMiner.opts.forceLook,
        bot.consistentMiner.opts.digFace
      )
      .catch((e) => e);
  };

  bot.consistentMiner = {
    opts: {
      forceLook: "ignore",
      digFace: "raycast",
    },
    heldItem: null,
    running: false,
    start: function () {
      if (this.running)
        return console.log(
          "The consistentMiner is already running, the listener cannot be registered twice."
        );
      this.running = true;
      bot.on("physicsTick", listener);
    },
    stop: function () {
      this.running = false;
      bot.off("physicsTick", listener);
    },
  };
}

module.exports = { plugin };
