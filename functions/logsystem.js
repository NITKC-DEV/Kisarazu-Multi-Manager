const {EmbedBuilder, Client, GatewayIntentBits, Partials} = require("discord.js");
const config = require("../environmentConfig");
const client = require('../botmain.js').client;

exports.log = function func(message) {
    console.log(message);
    const embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });
    client.channels.cache.get("1092835771880325242").send({ embeds: [embed] })
}
