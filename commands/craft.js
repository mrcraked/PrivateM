const {CraftItem} = require('../skills/craft')


module.exports = {
  data: {
    name: 'craft',
    description: 'Craft Item that you ask',
    usage: '!Craft <Item Name> <count>',
  },
  async execute(bot, args, ) {
    // Ensure arguments are provided
    if (!args.length) {
      return 'Error: No item name provided!'
    }

    // Extract item name from args
    const itemName = args[0].toLowerCase();; // All but the last argument
    const amount = args[args.length - 1]; // The last argument
    try {
      CraftItem(bot, itemName, amount);
    } catch (error) {
      console.error('Error during crafting:', error);
      return error;
    }
    
    return "trying to craft";
  },
};
