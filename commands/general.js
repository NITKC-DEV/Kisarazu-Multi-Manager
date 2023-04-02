const { SlashCommandBuilder, EmbedBuilder , version } = require('discord.js')
const packageVer = require('../package.json')
const fs = require("fs");
const {configPath} = require("../environmentConfig");

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
                .setName('dashboard')
                .setDescription('ダッシュボードを表示します')
                .setDefaultMemberPermissions(1<<3),
            async execute(interaction) {
                const date = new Date();
                const time = date.toFormat('YYYY年 MM月DD日 HH24:MI:SS')
                const members = await interaction.guild.members.fetch({ withPresences: true });
                const user = members.filter(member => member.user.bot === false).size;
                const online = members.filter(member => member.presence && member.presence.status !== "offline" && member.user.bot === false).size;
                const botOnline = members.filter(member => member.presence && member.presence.status !== "offline" && member.user.bot === true).size;


                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('NIT,Kisarazu College 22s ダッシュボード')
                    .setAuthor({
                        name: "木更津22s統合管理BOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://github.com/NITKC22s/bot-main'
                    })
                    .addFields(
                        [
                            {
                                name: '更新時刻',
                                value: `\`\`\`${time}\`\`\``,
                            },
                            {
                                name: 'サーバーの人数',
                                value: `\`\`\`参加人数${user}人　/　現在オンライン${online}人\`\`\``,
                            },
                            {
                                name: 'BOT台数',
                                value: `\`\`\`導入台数${interaction.guild.memberCount - user}台 / 稼働中${botOnline}台\`\`\``,
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
                .setName('next-test')
                .setDescription('次のテストを設定します。')
                .setDefaultMemberPermissions(1<<3)
                .addIntegerOption(option =>
                        option
                            .setName('年')
                            .setDescription('テストが実施される年を入力')
                            .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('開始月')
                        .setDescription('テストが開始される月を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('開始日')
                        .setDescription('テストが開始される日を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('終了月')
                        .setDescription('テストが終了する月を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('終了日')
                        .setDescription('テストが終了する日を入力')
                        .setRequired(true)
                ),


            async execute(interaction) {
                const date = JSON.parse(fs.readFileSync(configPath, 'utf8'))  //ここで読み取り
                date.nextTest = [
                    interaction.options.data[0].value,
                    interaction.options.data[1].value,
                    interaction.options.data[2].value,
                    interaction.options.data[3].value,
                    interaction.options.data[4].value
                ]
                fs.writeFileSync(configPath, JSON.stringify(date,null ,"\t")) //ここで書き出し
                await interaction.reply({ content: `次のテストを${date.nextTest[0]}年${date.nextTest[1]}月${date.nextTest[2]}日〜${date.nextTest[3]}月${date.nextTest[4]}日に設定しました`, ephemeral: true });
            },
        },
    ]
