require("events").defaultMaxListeners = 20;
require('dotenv').config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fetch = require("node-fetch");
const { loadCommands, handleCommand } = require("./commandHandler");
const { createBot, getBot, stopBot, logger } = require("./bot");
const config = require("./json/config.json");
const path = require("path");
const fs = require("fs");
const app = express();

const server = http.createServer(app);
const io = socketIo(server);
module.exports = { io, server };

app.use(express.static("public"));
app.use(express.json());

// Load commands
loadCommands();
let bot = createBot(config);
//

//
function updateBotStatus() {
  const currentBot = getBot();
  if (currentBot && currentBot.entity) {
    io.emit("botStatus", {
      online: true,
      health: currentBot.health,
      food: currentBot.food,
      position: currentBot.entity.position,
    });
  } else {
    io.emit("botStatus", { online: false });
  }
}

async function updateServerStatus() {
  try {
    const response = await fetch(
      `https://api.mcsrvstat.us/2/${config.minecraftServer.host}`
    );
    const data = await response.json();
    io.emit("serverStatus", {
      online: data.online || "true",
      version: data.version,
      players: data.players,
    });
  } catch (error) {
    logger.error("Error fetching server status:", error);
  }
}

const logFilePath = path.join(__dirname, "logs", "combined.log");

// Route to display the log file
app.get("/logs", (req, res) => {
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the log file:", err);
      return res.status(500).send("Error reading the log file.");
    }
    res.type("text/plain").send(data);
  });
});
const os = require("os");

function getCPUUsage() {
  const cpus = os.cpus();

  // Calculate total CPU usage
  const totalUsage = cpus.map((cpu) => {
    const total =
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq;

    const used = cpu.times.user + cpu.times.nice + cpu.times.sys;

    return (used / total) * 100;
  });

  // Average across all cores
  const averageCPUUsage = totalUsage.reduce((a, b) => a + b, 0) / cpus.length;

  return {
    perCorePct: totalUsage.map((usage) => usage.toFixed(2)),
    averagePct: averageCPUUsage.toFixed(2),
    freeSpacePercent: ((os.freemem() / os.totalmem()) * 100).toFixed(2) + "%",
  };
}
function updateBotStats() {
  const used = process.memoryUsage();
  io.emit("botStats", {
    ram: Math.round((used.heapUsed / 1024 / 1024) * 100) / 100,
    uptime: process.uptime(),
    cpu: getCPUUsage().averagePct,
    spaces: getCPUUsage().freeSpacePercent,
  });
}

io.on("connection", (socket) => {
  logger.info("A user connected to the web console");
  updateBotStatus();
  updateServerStatus();
  updateBotStats();

  socket.on("command", async (command) => {
    logger.info(`Received command: ${command}`);
    io.emit("chat", { username: "Admin", message: `run ${command}` });

    if (command.startsWith("!")) {
      const [cmd, ...args] = command.slice(1).split(" ");
      const result = await handleCommand(getBot(), cmd, args);
      io.emit("commandResult", { command, result });
      io.emit("chat", { username: "Bot", message: result });
    } else if (command === "restartBot") {
      stopBot();
      const Newconfig = await newConfig();
      bot = createBot(Newconfig);
      io.emit("commandResult", { command, result: "Bot restarted" });
    } else if (command === "killWeb") {
      await io.emit("chat", { username: "Web", message: "byeee" });
      process.exit(0);
    } else if (command === "/cmdrefresh") {
      await io.emit("chat", { username: "bot", message: "refreshing cmd" });
      loadCommands();
    } else {
      getBot().chat(command);
    }
  });
  bot.on("spawn", () => {
    io.emit("chat", { username: "BotInfo", message: `bot has spawned` });
  });

  bot.on("chat", async (username, message) => {
      io.emit("chat", { username, message });
  });


  bot.on("error", (error) => {
    io.emit("chat", {
      username: "BotInfo",
      message: `Bot error: ${error.message}`,
    });
    io.emit("botError", {
      errorMessage: error.message,
    });
    bot.end();
  });

  bot.on("kicked", (reason) => {
    io.emit("chat", {
      username: "BotInfo",
      message: `Bot was kicked: ${reason}`,
    });
  });

  socket.on("disconnect", () => {
    logger.info("User disconnected from the web console");
  });
});

setInterval(() => {
  updateBotStatus();
  updateServerStatus();
  updateBotStats();
}, 5000);
//passwords

const folderPath = path.join(__dirname, 'json');
const passPath = path.join(folderPath, "GeneratedPass.json");

app.post("/generatedpass", (req, res) => {
  const { host, password } = req.body;

  if (!host || !password) {
    return res.status(400).send("Host and password are required.");
  }

  try {
    // Load the current GeneratedPass data
    let GeneratedPass = {};
    if (fs.existsSync(passPath)) {
      GeneratedPass = JSON.parse(fs.readFileSync(passPath, "utf-8"));
    }

    if (!GeneratedPass.passwords) {
      GeneratedPass.passwords = [];
    }

    // Add or update the entry for this host
    const hostIndex = GeneratedPass.passwords.findIndex(
      (entry) => entry.host === host
    );

    if (hostIndex !== -1) {
      GeneratedPass.passwords[hostIndex] = { host, password };
    } else {
      GeneratedPass.passwords.push({ host, password });
    }

    // Save the updated GeneratedPass to the JSON file
    fs.writeFileSync(passPath, JSON.stringify(GeneratedPass, null, 2));
    res.status(200).send("Password updated successfully.");
  } catch (error) {
    console.error(`Error updating passwords: ${error}`);
    res.status(500).send("Failed to update passwords.");
  }
});

const configFilePath = path.join(folderPath, "config.json");

// GET /config - Serve the config file
app.get("/config", (req, res) => {
  try {
    const configData = fs.readFileSync(configFilePath, "utf-8");
    res.status(200).json(JSON.parse(configData));
  } catch (error) {
    console.error("Error reading config file:", error);
    res.status(500).json({ error: "Unable to read config file" });
  }
});

// POST /config - Update the config file
app.post("/config", (req, res) => {
  try {
    const newConfigData = req.body;
    const currentConfig = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));

    // Merge new data into current config
    const updatedConfig = { ...currentConfig, ...newConfigData };

    // Write the updated config back to the file
    fs.writeFileSync(configFilePath, JSON.stringify(updatedConfig, null, 2));
    res
      .status(200)
      .json({ message: "Config updated successfully", config: updatedConfig });
  } catch (error) {
    console.error("Error updating config file:", error);
    res.status(500).json({ error: "Unable to update config file" });
  }
});

const VARIABLES_FILE = "variables.json";
const filePath = path.join(folderPath, VARIABLES_FILE);

// Function to read variables from the file
function readVariables() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}), "utf-8"); // Create an empty file if it doesn't exist
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading variables file:", error);
    return {};
  }
}

// Function to write variables to the file
function writeVariables(variables) {
  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify(variables, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing variables file:", error);
  }
}
app.get("/variables", (req, res) => {
  const variables = readVariables();
  res.json(variables);
});

// POST endpoint to add or update a variable
app.post("/variables", (req, res) => {
  const { key, bool } = req.body;

  if (typeof key !== "string" || typeof bool !== "boolean") {
    return res
      .status(400)
      .json({
        error:
          "Invalid input. Key must be a string, and bool must be a boolean.",
      });
  }

  const variables = readVariables();
  variables[key] = bool; // Update or add the key-value pair

  writeVariables(variables); // Save the updated variables back to the file
  res.json({ success: true, updated: { key, bool } });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`web started: "http://localhost:3000"`);
});

async function newConfig() {
  try {
    const response = await fetch("http://localhost:3000/config");
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const configs = await response.json();
    return configs; // Return fetched config
  } catch (error) {
    console.warn("Failed to fetch config, using default:", error.message);
    return config; // Return default config if fetch fails
  }
}
