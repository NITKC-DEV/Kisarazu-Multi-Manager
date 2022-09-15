const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('help')
                .setDescription('このBOTのヘルプを表示します'),
            async execute(interaction) {
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('ヘルプ')
                    .setAuthor({
                        name: "\u200b",
                        iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                        url: 'https://discord.gg/mwyC8PTcXa'
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
                        name: "\u200b",
                        iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                        url: 'https://discord.gg/mwyC8PTcXa'
                    })
                    .setDescription('このbotの概要を紹介します')
                    .addFields(
                        [
                            {
                                name: 'バージョン情報',
                                value: 'v1.0.2 ',
                            },
                            {
                                name: '開発者',
                                value: '開発は、このサーバーの管理者3人([kokastar](https://github.com/starkoka)、[NXVZBGB FBEN](https://github.com/NXVZBGBFBEN)、[naotiki](https://github.com/naotiki))で行っています',
                            },
                            {
                                name: '搭載機能',
                                value: '[Genshin-timer Discord BOT v1.0.1](https://github.com/starkoka/Genshin-Timer)',
                            },
                            {
                                name: 'ソースコード',
                                value: '一部のソースコードはオープンソースとなっています。以下のリンクより参照してください。\n・[Genshin-timer](https://github.com/starkoka/Genshin-Timer)',
                            },
                            {
                                name: '実行環境',
                                value: 'node.js v18.9.0\ndiscord.js v14.3.0',
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
                .setName('genshintimer')
                .setDescription('About genshin-timer discord bot'),
            async execute(interaction) {
                const about = new EmbedBuilder()
                    .setColor(0x27668D)
                    .setTitle('About Genshin-timer Discord bot')
                    .setAuthor({
                        name: 'Genshin-timer',
                        icon_url: 'https://pbs.twimg.com/media/FcdR7aIaIAE75Uu?format=png&name=large',
                        url: 'https://github.com/starkoka/Genshin-Timer',
                    })
                    .setDescription('原神の様々な通知を行うことができるタイマーbotです\n\n')
                    .addFields(
                        [
                            {
                                name: '​\nデイリー通知機能',
                                value: 'デイリーミッションの更新や、週ボスの更新等をお知らせします。\n',
                            },
                            {
                                name: '​\nリポップ通知機能',
                                value: 'coming soon...\n',
                            },
                            {
                                name: '​\n樹脂回復通知機能',
                                value: 'coming soon...\n',
                            },
                        ],
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC22s server Admin' });
                await interaction.reply({ embeds: [about] });
            },
        },

    ]

;


const commands = require('../botmain')
