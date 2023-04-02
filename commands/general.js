const { Client,SlashCommandBuilder, EmbedBuilder , version, GatewayIntentBits, Partials} = require('discord.js')
const packageVer = require('../package.json')
const fs = require("fs");
const {configPath} = require("../environmentConfig");
const config = require("../environmentConfig");
require('date-utils');

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
                                value: '[Genshin-timer Discord BOT v2.1.0](https://github.com/starkoka/Genshin-Timer)\n時間割通知/閲覧機能\nチャンネル作成機能\n寮食・風呂入れ替え通知\n',
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
                .setName('secretmsg')
                .setDescription('実行したチャンネルにbotが代理で送信します')
                .addStringOption(option =>
                    option
                        .setName('メッセージ')
                        .setDescription('送りたいメッセージを入れます')
                        .setRequired(false)
                ).addAttachmentOption(option =>
                    option
                        .setName('添付ファイル1')
                        .setDescription('添付するファイルをアップロードします')
                        .setRequired(false)
                ).addAttachmentOption(option =>
                    option
                        .setName('添付ファイル2')
                        .setDescription('添付するファイルをアップロードします')
                        .setRequired(false)
                ).addAttachmentOption(option =>
                    option
                        .setName('添付ファイル3')
                        .setDescription('添付するファイルをアップロードします')
                        .setRequired(false)
                ),

            async execute(interaction) {
                let msg = interaction.options.getString('メッセージ');
                let attachedFile1=interaction.options.getAttachment('添付ファイル1');
                let attachedFile2=interaction.options.getAttachment('添付ファイル2');
                let attachedFile3=interaction.options.getAttachment('添付ファイル3');
                let channelName = interaction.guild.channels.cache.get(interaction.channelId).name;
                const date = new Date();
                const currentTime = date.toFormat('YYYY年 MM/DD HH24:MI:SS');

                await interaction.reply({ content: channelName + 'チャンネルにメッセージを代理で送信します。', ephemeral: true });
                //メッセージの中身があるときに実行
                if (msg)
                {
                    console.log ("Send a message: " + msg + "\nby " + interaction.user.username + "#" + interaction.user.discriminator + " in " + channelName + " at " + currentTime + "\n");
        
                    interaction.guild.channels.cache.get (interaction.channelId).send (msg);
                }
                //どれかのファイルに中身があるときに実行
                if(attachedFile1||attachedFile2||attachedFile3)
                {
                    let attachFiles=[attachedFile1,attachedFile2,attachedFile3];
                    console.log ("Send a file\nby " + interaction.user.username + "#" + interaction.user.discriminator + " in " + channelName + " at " + currentTime + "\n");
                    //filterがラムダ式で使えなかったので普通に関数を入れた
                    interaction.guild.channels.cache.get(interaction.channelId).send({files:attachFiles.filter(function (file) {if(file)return file;})});
                }
            },
        },
    ]
