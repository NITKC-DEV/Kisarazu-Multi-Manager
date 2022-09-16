const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports =
    [

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
