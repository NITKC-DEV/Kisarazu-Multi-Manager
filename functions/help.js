const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const system = require("./logsystem.js");

//helpTextの生成
const helpText = require("./helpText.json");
const adminTable = [];
for (let i = 0; i < helpText.admin.length; i++) {
    adminTable.push(
        new StringSelectMenuOptionBuilder()
            .setLabel(helpText.admin[i].value.title)
            .setDescription(helpText.admin[i].shortDescription)
            .setValue(String(i)),
    );
}
const helpTable = [];
for (let i = 0; i < helpText.help.length; i++) {
    helpTable.push(
        new StringSelectMenuOptionBuilder()
            .setLabel(helpText.help[i].value.title)
            .setDescription(helpText.help[i].shortDescription)
            .setValue(String(i)),
    );
}

exports.adminHelpSend = async function func(user) {
    const embed = new EmbedBuilder()
        .setColor(0x00a0ea)
        .setTitle(`管理者向けヘルプ`)
        .setAuthor({
            name: "木更津高専統合管理BOT",
            iconURL: "https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png",
            url: "https://github.com/NITKC-DEV/Kisarazu-Multi-Manager",
        })
        .setDescription(
            "木更津高専統合管理BOTをご利用いただきありがとうございます。\n管理者向けのヘルプでは、主に以下に記載した管理者向けのBOTの情報や機能についての説明があります。\n\n下のセレクトメニューから内容を選ぶことで、ヘルプを読めます。\n",
        )
        .setTimestamp()
        .setFooter({ text: "Developed by NITKC-DEV" });

    const select = new StringSelectMenuBuilder().setCustomId("adminHelp").setPlaceholder("読みたいページを選択").addOptions(adminTable);
    const row = new ActionRowBuilder().addComponents(select);

    try {
        await user.send({ embeds: [embed], components: [row] });
    } catch (error) {
        await system.error("DMを送れませんでした。ブロックされている等ユーザー側が原因の場合もあります。", error, "DirectMessageエラー");
    }
};

exports.adminHelpDisplay = async function func(interaction) {
    const page = parseFloat(interaction.values[0]);
    const newEmbed = new EmbedBuilder()
        .setColor(0x00a0ea)
        .setTitle(`管理者向けヘルプ - ${helpText.admin[page].value.title}`)
        .setAuthor({
            name: "木更津高専統合管理BOT",
            iconURL: "https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png",
            url: "https://github.com/NITKC-DEV/Kisarazu-Multi-Manager",
        })
        .setDescription(helpText.admin[page].value.description)
        .addFields(helpText.admin[page].value.field)
        .setTimestamp()
        .setFooter({ text: "Developed by NITKC-DEV" });
    try {
        await interaction.update({ embeds: [newEmbed] });
    } catch (error) {
        await system.error(
            "DMを編集できませんでした。ブロックされている等ユーザー側が原因の場合もあります。",
            error,
            "DirectMessageエラー",
        );
    }
};

exports.helpSend = async function func(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x00a0ea)
        .setTitle(`ヘルプ`)
        .setAuthor({
            name: "木更津高専統合管理BOT",
            iconURL: "https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png",
            url: "https://github.com/NITKC-DEV/Kisarazu-Multi-Manager",
        })
        .setDescription(
            "木更津高専統合管理BOTをご利用いただきありがとうございます。\nヘルプでは、このBOTの機能の使い方等を確認できます。\n\n下のセレクトメニューから内容を選ぶことで、ヘルプを読めます。\n",
        )
        .setTimestamp()
        .setFooter({ text: "Developed by NITKC-DEV" });

    const select = new StringSelectMenuBuilder().setCustomId("help").setPlaceholder("読みたいページを選択").addOptions(helpTable);
    const row = new ActionRowBuilder().addComponents(select);

    await interaction.reply({ embeds: [embed], components: [row] });
};

exports.helpDisplay = async function func(interaction) {
    const page = parseFloat(interaction.values[0]);
    const newEmbed = new EmbedBuilder()
        .setColor(0x00a0ea)
        .setTitle(`ヘルプ - ${helpText.help[page].value.title}`)
        .setAuthor({
            name: "木更津高専統合管理BOT",
            iconURL: "https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png",
            url: "https://github.com/NITKC-DEV/Kisarazu-Multi-Manager",
        })
        .setDescription(helpText.help[page].value.description)
        .addFields(helpText.help[page].value.field)
        .setTimestamp()
        .setFooter({ text: "Developed by NITKC-DEV" });
    await interaction.update({ embeds: [newEmbed] });
};
