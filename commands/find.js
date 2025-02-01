const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder');

module.exports = {
  data: {
    name: 'find',
    description: 'find Players',
    usage: '!find [Name of entity or player]',
  },
  execute(bot, args) {
    if (args.length < 1) return 'Usage: !find [Name of entity or player]';

    bot.loadPlugin(pathfinder);

    const playerName = args[0];
    const target = bot.players[playerName]?.entity;

    if (!target) {
      return `I don't see ${playerName}!`;
    }

    const { x: playerX, y: playerY, z: playerZ } = target.position;
    const defaultMove = new Movements(bot);

    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, 1)); // Adjust range if needed

    return `Now moving to ${playerName}...`;
  },
};
