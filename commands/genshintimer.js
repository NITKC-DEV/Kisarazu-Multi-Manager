const { SlashCommandBuilder, EmbedBuilder, Client, GatewayIntentBits, Partials} = require('discord.js')
const config = process.env.NODE_ENV === "development" ? require('../config.dev.json') : require('../config.json')
const dotenv = require('dotenv');
const path = require('path')
const fs = require('fs')
const cron = require('node-cron');
require('date-utils');
dotenv.config();
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
});

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
        {data: new SlashCommandBuilder()
                .setName('jushi')
                .setDescription('樹脂が設定した量まで回復したら通知します')
                .addStringOption(option =>
                    option
                        .setName('現在')
                        .setDescription('現在の天然樹脂の数を入力します')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('通知量')
                        .setDescription('通知してほしい樹脂の数を入力します')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('次の回復')
                        .setDescription('現在の天然樹脂の数を入力します')
                        .setRequired(false)
                ),
                async execute(interaction) {
                let second
                if(interaction.options.getString("次の回復")===null){
                    second = (interaction.options.getString("通知量")-interaction.options.getString("現在"))*8
                }
                else{
                    second = (interaction.options.getString("通知量")-interaction.options.getString("現在"))*8-(8-interaction.options.getString("次の回復"))
                }
                second=second*60*1000
                setTimeout(function (){
                    const jushi = {
                        color: 0x27668D,
                        title: '樹脂回復通知',
                        author: {
                            name: 'Genshin-timer',
                            icon_url: 'https://pbs.twimg.com/media/FcdR7aIaIAE75Uu?format=png&name=large',
                            url: 'https://github.com/starkoka/Genshin-Timer',
                        },
                        description: `<@!${interaction.user.id}>さん、樹脂が${interaction.options.getString("通知量")}まで回復しました`,
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: 'Developed by @kokastar_studio',
                            icon_url: 'https://pbs.twimg.com/profile_images/1503219566478229506/0dkJeazd_400x400.jpg',
                        },
                    };
                    client.channels.cache.get(`${config.notice}`).send(`<@!${interaction.user.id}>`)
                    client.channels.cache.get(`${config.notice}`).send({ embeds: [jushi] })
                },second);
                const embed = {
                    color: 0x27668D,
                    title: '樹脂回復通知',
                    author: {
                        name: 'Genshin-timer',
                        icon_url: 'https://pbs.twimg.com/media/FcdR7aIaIAE75Uu?format=png&name=large',
                        url: 'https://github.com/starkoka/Genshin-Timer',
                    },
                    description: `<@!${interaction.user.id}>さん、樹脂が回復したらお知らせします。\n※次回回復までの時刻を指定してない場合、最大8分の誤差があります。`,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'Developed by @kokastar_studio',
                        icon_url: 'https://pbs.twimg.com/profile_images/1503219566478229506/0dkJeazd_400x400.jpg',
                    },
                };
                await interaction.reply({ embeds: [embed] })
            },},
    ]
