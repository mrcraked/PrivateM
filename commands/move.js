const { pathfinder, goals } = require('mineflayer-pathfinder')
module.exports = {
  data: {
    name: 'move',
    description: 'Move in a direction using pathfinder',
    usage: '!move <forward|backward|left|right> [distance]'
  },
  execute(bot, args) {
    bot.loadPlugin(pathfinder)
    if (args.length < 1) return 'Usage: !move <forward|backward|left|right> [distance]';

    const direction = args[0].toLowerCase();
    const distance = args[1] ? parseInt(args[1]) : 1;
    if(distance > 1000 ?? distance < -1000){
      return "i can't reach this distance"
    }

    const movements = {
      forward: [0, 0, -1],
      f: [0, 0, -1],
      backward: [0, 0, 1],
      b: [0, 0, 1],
      left: [-1, 0, 0],
      l: [-1, 0, 0],
      right: [1, 0, 0],
      r: [1, 0, 0]
    };

    if (!movements[direction]) return 'Invalid direction';

    const [dx, dy, dz] = movements[direction];
    const currentPos = bot.entity.position;

    // Calculate the target position
    const targetPos = currentPos.offset(dx * distance, dy * distance, dz * distance);

    // Ensure the bot uses the pathfinder plugin
    if (!bot.pathfinder) {
      return 'Pathfinder plugin not initialized. Ensure mineflayer-pathfinder is loaded.';
    }

    // Move the bot to the target position
    bot.pathfinder.setGoal(new goals.GoalBlock(targetPos.x, targetPos.y, targetPos.z));
    return `Moving ${distance} blocks ${direction}`;
  }
};
