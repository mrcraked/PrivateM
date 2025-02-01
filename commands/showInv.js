module.exports = {
    data: {
      name: 'showinv',
      description: 'Displays the bot\'s current inventory',
      usage: '!showInventory'
    },
    execute(bot, args) {
      if (!bot.inventory) {
        return 'Inventory not available.';
      }
  
      const items = bot.inventory.items(); // Get the inventory items
      if (items.length === 0) {
        return 'Inventory is empty.';
      }
  
      let inventoryOutput = 'Bot Inventory:\n';
      items.forEach(item => {
        inventoryOutput += `- ${item.name}: ${item.count}\n`;
      });
  
      return inventoryOutput.trim(); // Remove extra whitespace at the end
    }
  };
  