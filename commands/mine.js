const { mineBlock } = require("../skills/mineblocadv");
const { exploreUntil } = require("../skills/explore");
const { Vec3 } = require("vec3");

const mcData = require('minecraft-data')('1.20');
module.exports = {
  data: {
    name: "mine",
    description: "mine Item that you ask & automatically gather and find",
    usage: "!mine <Item Name> <count>",
  },
  async execute(bot, args) {
    // Ensure arguments are provided
    if (!args.length) {
      return "Error: No item name provided!";
    }
    
    // Extract item name from args
    // All but the last argument
    const itemName = args[0].toLowerCase();
    const count = args[1] ? parseInt(args[1]) : 1;

    const blockByName = mcData.blocksByName[itemName];
    const blocks = bot.findBlocks({
      matching: [blockByName.id],
      maxDistance: 32,
    });

    if (!blocks) {
      bot.chat("/w @s No block nearby. Exploring...");
      await exploreUntil(bot, new Vec3(1, 0, 1), 60, () => {
        const foundblock = bot.findBlock({
          matching: [blockByName.id],
          maxDistance: 32,
        });
        return foundblock;
      });
    }
    try {
      await mineBlock(bot, itemName, count);
    } catch (error) {
      console.error("Error during crafting:", error);
    }
    return `trying to mine ${itemName}`;
  },
};
