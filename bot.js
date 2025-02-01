const mineflayer = require("mineflayer");
const mineflayerViewer = require("prismarine-viewer").mineflayer;
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
const path = require("path");
const configx = require("./json/config.json");
const fs = require("fs");

let bot = null;
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.File({
      filename: path.join(__dirname, configx.logging.directory, "error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(__dirname, configx.logging.directory, "combined.log"),
      maxsize: configx.logging.maxSize,
      maxFiles: configx.logging.maxFiles,
    }),
  ],
});

const GeneratedPass = require("./json/GeneratedPass.json");

function createBot(config) {
  bot = mineflayer.createBot({
    host: config.minecraftServer.host,
    port: config.minecraftServer.port,
    username: config.bot.username,
    version: config.bot.version,
  });

  const { pathfinder } = require("mineflayer-pathfinder");
  const tool = require("mineflayer-tool").plugin;
  const collectBlock = require("mineflayer-collectblock").plugin;
  const pvp = require("mineflayer-pvp").plugin;
  //ticks
  bot.isfighting = false;

  bot.on("mount", () => {
    bot.dismount();
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(tool);
  bot.loadPlugin(collectBlock);
  bot.loadPlugin(pvp);

  bot.once("spawn", async () => {
    logger.info("Bot has spawned");
    if (config.Auto_auth.enabled) {
      const host = config.minecraftServer.host;
      let password = null;

      // Check if GeneratedPass is properly initialized
      if (!GeneratedPass.passwords) {
        GeneratedPass.passwords = [];
      }

      // Check if a password already exists for this host
      const existingHostConfig = GeneratedPass.passwords.find(
        (entry) => entry.host === host
      );

      if (existingHostConfig && existingHostConfig.password) {
        password = existingHostConfig.password;
      } else {
        // Generate a new password
        password = passGenerator(12);

        // Add or update the entry for this host
        const hostIndex = GeneratedPass.passwords.findIndex(
          (entry) => entry.host === host
        );

        if (hostIndex !== -1) {
          GeneratedPass.passwords[hostIndex] = { host, password };
        } else {
          GeneratedPass.passwords.push({ host, password });
        }

        // Send the password to the local server
        try {
          const response = await fetch("http://localhost:3000/generatedpass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ host, password }),
          });

          if (!response.ok) {
            logger.error(`Failed to send password: ${response.statusText}`);
          } else {
            logger.info("Password sent successfully to the server.");
          }
        } catch (error) {
          logger.error(`Error while sending password: ${error}`);
        }
      }

      // Perform authentication
      setTimeout(async () => {
        await bot.chat(`/register ${password} ${password}`);
        bot.chat(`/login ${password}`);
      }, 1000);
      logger.info("Authentication commands executed.");
    }
    await sleep(5000);
    bot.chat(
      '/tellraw @a ["",{"text":"[mcAdc]","color":"dark_red"},{"text":" Hallo Gw adalah Bot minecraft.","color":"yellow"},{"text":" "},{"text":"[klik disini]","color":"aqua","clickEvent":{"action":"open_url","value":"https://github.com/mrcraked?tab=repositories"}},{"text":" untuk mencoba"}]'
    );
    bot.chat("Gw di buat oleh EFRIGUS");
  });
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  bot.on("chat", (username, message) => {
    logger.info(`Chat: ${username}: ${message}`);
  });

  bot.on("error", (error) => {
    logger.error(`Bot error: ${error.message}`);
  });

  bot.on("kicked", (reason) => {
    logger.warn(`Bot was kicked: ${reason}`);
  });

  bot.once("spawn", () => {
    const mcData = require("minecraft-data")(bot.version);
    mcData.itemsByName["leather_cap"] = mcData.itemsByName["leather_helmet"];
    mcData.itemsByName["leather_tunic"] =
      mcData.itemsByName["leather_chestplate"];
    mcData.itemsByName["leather_pants"] =
      mcData.itemsByName["leather_leggings"];
    mcData.itemsByName["leather_boots"] = mcData.itemsByName["leather_boots"];
    mcData.itemsByName["lapis_lazuli_ore"] = mcData.itemsByName["lapis_ore"];
    mcData.blocksByName["lapis_lazuli_ore"] = mcData.blocksByName["lapis_ore"];
    const {
      Movements,
      goals: {
        Goal,
        GoalBlock,
        GoalNear,
        GoalXZ,
        GoalNearXZ,
        GoalY,
        GoalGetToBlock,
        GoalLookAtBlock,
        GoalBreakBlock,
        GoalCompositeAny,
        GoalCompositeAll,
        GoalInvert,
        GoalFollow,
        GoalPlaceBlock,
      },
      pathfinder,
      Move,
      ComputedPath,
      PartiallyComputedPath,
      XZCoordinates,
      XYZCoordinates,
      SafeBlock,
      GoalPlaceBlockOptions,
    } = require("mineflayer-pathfinder");

    // Set up pathfinder
    const movements = new Movements(bot, mcData);
    bot.pathfinder.setMovements(movements);

    mineflayerViewer(bot, { port: 3007, firstPerson: true });
  });

  bot.on("chat", async (username, message) => {
    if (message.startsWith("@TanyaChery")) {
      const sender = bot.players[username]?.entity;
      if (sender) {
        const distance = bot.entity.position.distanceTo(sender.position);
        if (distance < 10) {
          // Use `lookAt` to face the player
          await bot.lookAt(sender.position.offset(0, 1.6, 0), true); // Offset for the player's head
        }
      }
      try {
        // Extract the actual question by removing "@AskChery" from the message
        const query = message.replace("@TanyaChery", "").trim();
        // Call the LlmAnswer function with the extracted query
        const reply = await LlmAnswer(query, "user");

        // If a reply is received, send it as a response
        if (reply) {
          bot.chat(`cherry: ${reply}`);
        } else {
          throw new Error("No reply received from LlmAnswer");
        }
      } catch (error) {
        console.error("Error handling @TanyaChery message:", error);
        bot.chat(
          "cherry: Sorry, I encountered an error while processing your request."
        );
      }
    }
  });

  bot.on("health", async () => {
    let data = await getVariables();
    if (data.isfighting || data.isConstantMining) {
      return;
    } else {
      if (bot.food < 20) {
        eatBestFood(bot);
      }
    }
  });
  return bot;
}

function getBot() {
  return bot;
}

function stopBot() {
  if (bot) {
    if (bot.viewer) {
      bot.viewer.close();
    }
    bot.end();
    bot = null;
    logger.info("Bot stopped");
  }
}
const foodSaturation = {
  apple: 4.0,
  bread: 5.0,
  cooked_beef: 12.8,
  cooked_porkchop: 12.8,
  cooked_chicken: 7.2,
  cooked_mutton: 9.6,
  cooked_cod: 5.0,
  cooked_salmon: 9.6,
  baked_potato: 5.0,
  carrot: 4.8,
  golden_carrot: 14.4,
  pumpkin_pie: 8.0,
  cookie: 2.0,
  melon_slice: 1.2,
  beetroot_soup: 7.2,
  rabbit_stew: 12.0,
  cooked_rabbit: 10.0,
};

// List of poisonous or undesirable food
const poisonousFoodFilter = [
  "rotten_flesh",
  "spider_eye",
  "poisonous_potato",
  "pufferfish",
];

// Function to find the best food based on stock and saturation
function findBestFood(bot) {
  const foodItems = bot.inventory.items().filter((item) => {
    return (
      foodSaturation[item.name] && !poisonousFoodFilter.includes(item.name)
    );
  });

  // Sort by saturation first, then by quantity
  foodItems.sort((a, b) => {
    const saturationA = foodSaturation[a.name] || 0;
    const saturationB = foodSaturation[b.name] || 0;

    if (saturationA === saturationB) {
      return b.count - a.count; // If saturation is equal, prioritize the most stock
    }
    return saturationB - saturationA; // Prioritize highest saturation
  });

  return foodItems[0]; // Return the best food item
}
async function eatBestFood(bot) {
  const bestFood = findBestFood(bot);
  if (bestFood) {
    if (bot.food === 20) {
      return;
    }
    logger.info(`Eating: ${bestFood.name} (Count: ${bestFood.count})`);
    await bot.equip(bestFood, "hand", async (err) => {
      if (err) {
        console.log(`Error equipping food: ${err.message}`);
      }
    });

    await bot.consume((err) => {
      if (err) console.log(`Error eating food: ${err.message}`);
    });
  } else {
    logger.info("No edible food found in inventory!");
  }
}

function passGenerator(length = 8) {
  // Character sets for password generation
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Combine all character sets
  const allChars = lowercase + uppercase + numbers + symbols;

  // Ensure at least one character from each set
  let password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  // Fill the rest of the password with random characters
  for (let i = 4; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the password to randomize the placement of required characters
  return password.sort(() => Math.random() - 0.5).join("");
}
async function getVariables() {
  try {
    const response = await fetch("http://localhost:3000/variables", {
      method: "GET",
    });
    const data = await response.json();

    // Display the value of 'isfighting' specifically if it exists
    if (data) {
      return data;
    } else {
      throw new Error("No data received from server");
    }
  } catch (error) {
    console.error("Error fetching variables:", error);
  }
}

async function LlmAnswer(message, type) {
  try {
    const folderPath = path.join(__dirname, "json");
    // Define the file based on the type
    const fileName = type === "admin" ? "ChatAdmin.json" : "ChatHistory.json";
    console.log(fileName);
    const filePath = path.join(folderPath, fileName);
    // Load existing chat history from the JSON file
    let chatHistory = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      chatHistory = JSON.parse(data);
    }

    // Add the new message to the chat history
    chatHistory.push({ role: "user", content: message });

    // Prepare the API request body
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

    // Call the API
    const response = await fetch("https://api.arliai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ARLIAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    // Parse the API response
    const apiResponse = await response.json();
 
    // Extract the assistant's message
    const assistantMessage = apiResponse.choices[0].message.content;

    // Add the assistant's response to the chat history
    chatHistory.push({ role: "assistant", content: assistantMessage });
    // Save the updated chat history back to the JSON file
    fs.writeFileSync(filePath, JSON.stringify(chatHistory, null, 2));

    // Return the assistant's response
    return assistantMessage;
  } catch (error) {
    console.error("Error in LlmAnswer:", error);
    throw error;
  }
}

module.exports = { createBot, getBot, stopBot, logger, LlmAnswer };
