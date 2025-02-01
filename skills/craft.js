const mcData = require('minecraft-data');

async function CraftItem(bot, name, amount) {
  amount = parseInt(amount, 10)
  const item = bot.registry.itemsByName[name]
  const craftingTableID = bot.registry.blocksByName.crafting_table.id

  const craftingTable = bot.findBlock({
    matching: craftingTableID
  })

  if (item) {
    const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]
    if (recipe) {
      bot.chat(`/w @s I can make ${name}`)
      try {
        await bot.craft(recipe, amount, craftingTable)
        //bot.chat(`did the recipe for ${name} ${amount} times`)
        return `did the recipe for ${name} ${amount} times`
      } catch (err) {
        //bot.chat(`error making ${name}`)
        return `error making ${name}, ${err.message}`
      }
    } else {
      //bot.chat(`/w @s I cannot make ${name}`)
      return 'i cannot make ${name}'
    }
  } else {
    //bot.chat(`unknown item: ${name}`)
    return `unknown item: ${name}`
  }
}
module.exports = { CraftItem };