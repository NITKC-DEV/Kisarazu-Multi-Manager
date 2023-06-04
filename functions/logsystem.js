const {EmbedBuilder, Client, GatewayIntentBits, Partials} = require("discord.js");
const config = require("../environmentConfig");

/***
 * ログをコンソールとdiscordに送信する
 * @param message ログの本文
 * @param title ログのタイトル。省略可
 */
exports.log = async function func(message,title) {
    console.log(`${title ?? "システムログ"} ----\n ${message.trim()}\n--------\n`);
    const embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(title ?? "システムログ")
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });

    const channel = await client.channels.fetch(config.logSystem);
    await channel.send({embeds: [embed]});
}

/***
 * エラーログをコンソールとdiscordに送信する
 * @param message エラーメッセージの本文
 * @param error エラーコード。error.stackが存在する場合にそれが送られる。省略可
 * @param title エラーメッセージのタイトル。省略可
 */
exports.error = async function func(message,error,title) {
    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(title ?? "エラー")
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Discord Log System' });
    const logChannel = await client.channels.fetch(config.logSystem);
    const errorChannel = await client.channels.fetch(config.errorSystem);

    await logChannel.send({embeds: [embed]});
    await errorChannel.send({embeds: [embed]});
    try{
        console.error(`${title ?? "エラー"} ----\n ${message.trim()}\n\n${error.stack}\n\n--------\n`);
        if(error.stack !== undefined && error.stack !== null){
            await logChannel.send(`\`\`\`\n${error.stack}\n\`\`\``);
            await errorChannel.send(`\`\`\`\n${error.stack}\n\`\`\``);
        }
    }
    catch{
        console.error(`${title ?? "エラー"} ----\n ${message.trim()}\n--------\n`);
    }
}

