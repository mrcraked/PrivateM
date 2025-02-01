const { Vec3 } = require("vec3");
const { exploreUntil } = require('../skills/explore');

module.exports = {
  data: {
    name: 'explore',
    description: 'Explore a specified direction and distance',
    usage: '!explore <x> <y> <z> [time]',
  },
  async execute(bot, args) {
    // Ensure arguments are provided
    if (args.length < 3) {
      return 'Error: Please provide x, y, and z coordinates!';
    }

    try {
      // Parse coordinates and optional time
      const x = parseInt(args[0], 10);
      const y = parseInt(args[1], 10);
      const z = parseInt(args[2], 10);
      const time = args.length > 3 ? parseInt(args[3], 10) : 60; // Default to 60 seconds if not specified

      // Validate coordinates
      if (isNaN(x) || isNaN(y) || isNaN(z)) {
        return 'Error: Invalid coordinates. Please provide numeric values.';
      }

      // Create Vec3 from coordinates
      const exploreDirection = new Vec3(x, y, z);

      // Call exploreUntil with bot, direction, and time
      await exploreUntil(bot, exploreDirection, time);

      return `Exploration complete: moved towards ${exploreDirection} for ${time} seconds.`;
    } catch (error) {
      console.error('Exploration error:', error);
      return `Exploration failed: ${error.message}`;
    }
  },
};