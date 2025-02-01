const mcData = require('minecraft-data')('1.20');
const logger = require('../bot')
var _mineBlockFailCount = 0
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
        count: count,
    });
    if (blocks.length === 0 || !blocks) {
        bot.chat(`No ${name} nearby, please explore first`);
        _mineBlockFailCount++;
        if (_mineBlockFailCount > 10) {
            throw new Error(
                "mineBlock failed too many times, make sure you explore before calling mineBlock"
            );
        }
        return;
    }
    const targets = [];
    for (let i = 0; i < blocks.length; i++) {
        targets.push(bot.blockAt(blocks[i]));
    }
    try {
        await bot.collectBlock.collect(targets, {
            ignoreNoPath: true,
            timeout: 1000,
        });
    } catch (error) {
        _mineBlockFailCount++;
        if (_mineBlockFailCount > 10) {
            throw new Error(
                "mineBlock failed too many times, make sure you explore before calling mineBlock"
            );
        }
    }
    
    bot.chat(`/w @s mined ${count}x ${name} `);
    logger.info(`mined ${count}x ${name}`)
}

module.exports = { mineBlock };