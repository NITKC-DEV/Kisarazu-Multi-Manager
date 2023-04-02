const { SlashCommandBuilder, EmbedBuilder , version, Client, GatewayIntentBits, Partials} = require('discord.js')
const packageVer = require('../package.json')
const fs = require("fs");
const {configPath} = require("../environmentConfig");

const moment = require('moment');
const commands = require("../botmain");
function monthsAndDaysBetween(startUnix, endUnix) {
    const startDate = moment.unix(startUnix);
    const endDate = moment.unix(endUnix);

    let monthDiff = endDate.diff(startDate, 'months');
    let dayDiff = endDate.diff(startDate, 'days') % 30;

    // Handle cases where end date is in a later month but has a lower day value
    if (endDate.date() < startDate.date()) {
        monthDiff -= 1;
        dayDiff = moment.duration(endDate.diff(startDate.clone().subtract(monthDiff, 'months'), 'days')).asDays();
    }

    return [monthDiff,dayDiff];
}

module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('help')
                .setDescription('このBOTのヘルプを表示します'),
            async execute(interaction) {
                const commands = require('../botmain')
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('ヘルプ')
                    .setAuthor({
                        name: "木更津22s統合管理BOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://github.com/NITKC22s/bot-main'
                    })
                    .setDescription('現在実装されているコマンド一覧です')
                    .addFields(
                        commands.map(e => ({ name: '/' + e.data.name, value: e.data.description }))
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC22s server Admin' });
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('about')
                .setDescription('このBOTの概要を表示します'),
            async execute(interaction) {
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('NITKC統合管理BOT概要')
                    .setAuthor({
                        name: "木更津22s統合管理BOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://github.com/NITKC22s/bot-main'
                    })
                    .setDescription('このbotの概要を紹介します')
                    .addFields(
                        [
                            {
                                name: 'バージョン情報',
                                value: 'v' + packageVer.version,
                            },
                            {
                                name: '開発者',
                                value: '開発は、このサーバーの管理者4人([kokastar](https://github.com/starkoka)、[NXVZBGBFBEN](https://github.com/NXVZBGBFBEN)、[naotiki](https://github.com/naotiki)、[KouRo](https://github.com/Kou-Ro))で行っています',
                            },
                            {
                                name: '搭載機能',
                                value: '[Genshin-timer Discord BOT v2.1.0](https://github.com/starkoka/Genshin-Timer)\n時間割通知/閲覧機能\nチャンネル作成機能\n',
                            },
                            {
                                name: 'ソースコード',
                                value: 'このBOTはオープンソースとなっています。以下のリンクより見ることが可能です。\n・[木更津22s統合管理bot](https://github.com/NITKC22s/bot-main)\n・[Genshin-timer](https://github.com/starkoka/Genshin-Timer)',
                            },
                            {
                                name: '実行環境',
                                value: 'node.js v18.9.0\ndiscord.js v' + version,

                            },
                        ]
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC22s server Admin' });
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('ping')
                .setDescription('このBOTのpingを測定します'),
            async execute(interaction) {
                await interaction.reply( `Ping : ${interaction.client.ws.ping}ms` );
            },
        },
    ]
