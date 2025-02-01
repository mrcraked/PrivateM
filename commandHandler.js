const fs = require('fs');
const path = require('path');

const commands = new Map();
const actionsList = [];
function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

async function actionsdata() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      // Changed the condition to properly exclude 'chat' AND 'think'
      if (command.data.name !== 'chat' && command.data.name !== 'think') {
        actionsList.push(command.data);
      }
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  // Remove any existing 'chat' or 'think' commands that might already be in the list
  for (let i = actionsList.length - 1; i >= 0; i--) {
    if (actionsList[i].name === 'chat' || actionsList[i].name === 'think') {
      actionsList.splice(i, 1);
    }
  }
  
  return actionsList;
}

function handleCommand(bot, command, args) {
  const commandName = command.toLowerCase();
  if (commandName === 'help') {
    return listCommands();
  }
  if (commands.has(commandName)) {
    try {
      return commands.get(commandName).execute(bot, args,);
    } catch (error) {
      console.error(error);
      return `There was an error executing the ${commandName} command.`;
    }
  } else {
    return `Unknown command: ${command}`;
  }
}


function listCommands() {
  let helpText = 'Available commands:\n';
  commands.forEach(command => {
    helpText += `!${command.data.name}: ${command.data.description}\n  Usage: ${command.data.usage}\n\n`;
  });
  return helpText;
}

module.exports = { loadCommands, handleCommand, actionsdata };

