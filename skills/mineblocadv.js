const mcData = require("minecraft-data")("1.20");
const logger = require("../bot");
var _mineBlockFailCount = 0;
async function mineBlock(bot, name, count = 1) {
  // return if name is not string
  if (typeof name !== "string") {
    throw new Error(`name for mineBlock must be a string`);
  }
  if (typeof count !== "number") {
    throw new Error(`count for mineBlock must be a number`);
  }
  const blockByName = mcData.blocksByName[name];
  if (!blockByName) {
    throw new Error(`No block named ${name}`);
  }

  const blocks = bot.findBlocks({
    matching: [blockByName.id],
    maxDistance: 32,
    count: 128,
  });

  try {
    while (count > 0) {
      if (blocks) {
        const targets = [];
        for (let i = 0; i < blocks.length; i++) {
          targets.push(bot.blockAt(blocks[i]));
        }
        const distance = bot.entity.position.distanceTo(blocks.position);
        if (distance > 3) {
          await usePathfinding(bot, blocks.position);
        }

        try {
          const distance = bot.entity.position.distanceTo(block.position);

          if (distance > 4) {
            continue;
          }

          await bot.collectBlock.collect(targets, {
            ignoreNoPath: true,
            timeout: 1000,
          });
        } catch (error) {
          console.error(err);
          _mineBlockFailCount++;
          if (_mineBlockFailCount > 10) {
            throw new Error(
              "mineBlock failed too many times, make sure you explore before calling mineBlock"
            );
          }

          throw new Error(`Failed to mine ${blocks.name}`);
        }
      } else {
        throw new Error(`Could not find block: ${blocks}`);
      }
      count--;
      await sleep(100);
    }
  } catch (error) {
    console.error(`Error encountered: ${err.message}`);
    await sleep(1000); // Wait for 1 second before retrying
    mineBlock(bot,name,count)
  }
}

module.exports = { mineBlock };

async function usePathfinding(bot, location) {
  // await bot.pathfinder.goto(
  //   new GoalNear(location.x, location.y, location.z, 1)
  // );
  await bot.pathfinder.setGoal(
    new GoalNear(location.x, location.y, location.z, 1)
  );
  await sleep(1000);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
