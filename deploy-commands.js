const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const config = process.env.NODE_ENV == "production" ? require('./config.json') : require('./config.dev.json')
console.log(config)
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    for (let i = 0; i < command.length; i++) {

        commands.push(command[i].data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(config.token);

rest.put(Routes.applicationCommands(config.client), { body: commands })
    .then(data => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);