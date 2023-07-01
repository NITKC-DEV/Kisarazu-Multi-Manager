const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder,EmbedBuilder, ActionRowBuilder} = require("discord.js");
const helpText = require("./helpText.json");



exports.adminHelpSend = async function func(user) {
    const embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(`管理者向けヘルプ`)
        .setAuthor({
            name: "木更津高専統合管理BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/NITKC-DEV/Kisarazu-Multi-Manager'
        })
        .setDescription("木更津高専統合管理BOTをご利用いただきありがとうございます。\n管理者向けのヘルプでは、主に以下に記載した管理者向けのBOTの情報や機能についての説明があります。\n\n下のセレクトメニューから内容を選ぶことで、ヘルプが読めます。\n")
        .setTimestamp()
        .setFooter({ text: 'Developed by NITKC-DEV' });

    const select = new StringSelectMenuBuilder()
        .setCustomId('adminHelp')
        .setPlaceholder('読みたいページを選択')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('管理者向けコマンドについて')
                .setDescription('管理者向けコマンドの一覧です。')
                .setValue('0'),
            new StringSelectMenuOptionBuilder()
                .setLabel('このBOTの運営とサポートについて')
                .setDescription('BOTの運営とサポートについてです。運営情報や、不具合・要望などはここから。')
                .setValue('1'),
        );

    const row = new ActionRowBuilder()
        .addComponents(select);

    await user.send({embeds: [embed],components: [row]});
}

exports.adminHelpDisplay = async function func(interaction) {
    let page = parseFloat(interaction.values[0]);
    let newEmbed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle('管理者向けヘルプ')
        .setAuthor({
            name: "木更津高専統合管理BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/NITKC-DEV/Kisarazu-Multi-Manager'
        })
        .setDescription(helpText.admin[page].description)
        .addFields(helpText.admin[page].field)
        .setTimestamp()
        .setFooter({ text: 'Developed by NITKC-DEV' });
    await interaction.update({embeds: [newEmbed]});
}