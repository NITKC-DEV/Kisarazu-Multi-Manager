const {EmbedBuilder, Client, GatewayIntentBits, Partials} = require("discord.js");
const config = require("../environmentConfig");

exports.log = async function func(message,title) {
    console.log(`${title ?? "システムログ"} ----\n ${message.trim()}\n--------\n`);
    const embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(title ?? "システムログ")
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });

    const channel = await client.channels.fetch(config.logSystem)
    channel.send({embeds: [embed]})
}


exports.error = async function func(message,title) {
    console.error(`${title ?? "エラー"} ----\n ${message.trim()}\n--------\n`);
    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(title ?? "エラー")
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });
    const logChannel = await client.channels.fetch(config.logSystem)
    const errorChannel = await client.channels.fetch(config.errorSystem)

    logChannel.send({embeds: [embed]})
    errorChannel.send({embeds: [embed]})
}

