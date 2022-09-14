const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')


module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('help')
                .setDescription('このBOTのヘルプを表示します'),
            async execute(interaction) {
                const exampleEmbed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('ヘルプ')
                    .setAuthor({ name:"\u200b",iconURL: 'https://www.kisarazu.ac.jp/wp-content/uploads/2015/01/symbolmark_5cm-300x297.jpg', url: 'https://discord.gg/mwyC8PTcXa' })
                    .setDescription('現在実装されているコマンド一覧です')
                    .addFields(
                        { name: '/help', value: 'ヘルプを表示します' },
                        { name: '/about', value: 'このBOTの概要を表示します', },
                        { name: '/genshintimer', value: 'このBOTに搭載されている機能「genshin-timer」の概要を表示します。',  },
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC22s server Admin'});
                await interaction.reply({embeds:[exampleEmbed]});
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('about')
                .setDescription('このBOTの概要を表示します'),
            async execute(interaction) {
                await interaction.reply('Pong!');
            },
        },
    ]

;