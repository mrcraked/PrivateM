
const { actionsdata } = require("./commandHandler");
const path = require("path");
const fs = require("fs");

let chatData = [];
let fileName = "AgentChat.json";
const folderPath = path.join(__dirname, "agent");
const chatPath = path.join(folderPath, fileName);

const SystemMessage = {
  role: "system",
  content: `You are a Minecraft assistant with predefined actions. Here is the list of actions you can choose from: constantmine: mine a block in front of the bot face (Usage: !mine <start | stop>), craft: Craft Item that you ask (Usage: !Craft <Item Name>), explore: Explore a specified direction and distance (Usage: !explore <x> <y> <z> [time]), find: find Players (Usage: !find [Name of entity or player]), mine: mine Item that you ask (Usage: !mine <Item Name>), move: Move in a direction using pathfinder (Usage: !move <forward|backward|left|right> [distance]), fight: fight the player you wish to fight (Usage: !fight <fight || stop> <player>), showinv: Displays the bot's current inventory (Usage: !showInventory)

  When the user asks for something, decide the appropriate action from the list & data from the user and return it as JSON in this format:
  {
    "reasons": "Your reason",
    "action": "<action_name>",
    "parameters": { <key>: <value> }
  }
  the bot is your digital body in the Minecraft server.
  the user will send you data including "bot & all player locations", "bot data", and "bot inventory" and Minecraft recipes.
  You must think based on the data. If the inventory doesn't have enough material or space, you will think with the predefined command to do.
  Example: when the user asks for mining diamond but the bot.inventory has no Iron_pickaxe and not enough items to craft it, then use !mine oak_log 5, craft it, and wait. Then the "bot" will return data "done task" and after that, you must think about what you will do next, like !craft Crafting_table and wait, then craft the items needed to achieve the first goal (diamond).
  If the user's request doesn't match any predefined actions, respond as an online female gamer known as (CherryExly), instead.`,
};

async function setAgent() {
  if (!fs.existsSync(chatPath)) {
    chatData.push(SystemMessage);
    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(chatPath, JSON.stringify(chatData, null, 2));
  }
}

async function updateDynamicData(bot) {
  const actionsList = await actionsdata();
  console.log(actionsList)
  const actionsMessage = {
    role: "system",
    content: `Available actions: ${actionsList.map(action => `${action.name}: ${action.description} (Usage: ${action.usage})`).join(', \n')}`,
  };

  function getInventory(bot) {
    return bot.inventory.items().map(item => {
      return {
        'item-name': item.name,
        stock: item.count,
        type: item.type,
      };
    });
  }

  const botInventory = {
    role: "system",
    content: `Bot's current inventory: ${JSON.stringify(getInventory(bot))}`,
  };

  const BotDetail = {
    role: "system",
    content: `bot information: ${JSON.stringify(getBotDetails(bot))}`,
  };

  chatData = chatData.filter(message => message.role !== "system" || message === SystemMessage);
  chatData.push(actionsMessage);
  chatData.push(botInventory);
  chatData.push(BotDetail);

  fs.writeFileSync(chatPath, JSON.stringify(chatData, null, 2));
}

function getBotDetails(bot) {
  const playerNames = Object.keys(bot.players);

  return {
    cord: {
      x: bot.entity.position.x,
      y: bot.entity.position.y,
      z: bot.entity.position.z,
    },
    health: bot.health,
    food: bot.food,
    botUsername: bot.username,
    playerNames: playerNames,
  };
}

async function brain(message, bot) {
  try {
    const folderPath = path.join(__dirname, "agent");
    const filePath = path.join(folderPath, fileName);
    let chatHistory = [];
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      chatHistory = JSON.parse(data);
    }

    chatHistory.push({ role: "user", content: message });

    const requestBody = JSON.stringify({
      model: "Mistral-Nemo-12B-Instruct-2407",
      messages: chatHistory,
      repetition_penalty: 1.1,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      max_tokens: 1024,
      stream: false,
    });

    const response = await fetch("https://api.arliai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ARLIAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    const apiResponse = await response.json();

    const assistantMessage = apiResponse.choices[0].message.content;

    chatHistory.push({ role: "assistant", content: assistantMessage });
    fs.writeFileSync(filePath, JSON.stringify(chatHistory, null, 2));

    return assistantMessage;
  } catch (error) {
    console.error("Error in LlmAnswer:", error);
    throw error;
  }
}

module.exports = { setAgent, brain , updateDynamicData};