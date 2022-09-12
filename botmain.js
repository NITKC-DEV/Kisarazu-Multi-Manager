const { Client, Intents, GatewayIntentBits, Partials} = require('discord.js');
const config = require('./config.json');
const dotenv = require('dotenv');

dotenv.config();
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel],
});


/*スラッシュコマンド登録*/
client.once("ready", async () => {
    const data = [{
        name: "help",
        description: "このBOTのヘルプを表示します",
    },{
        name:"about",
        description: "このBOTの概要を表示します"
    }
    ];
    await client.application.commands.set(data, config.server);
    console.log("Ready!");
});

/*実際の動作*/
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    if (interaction.commandName === 'help') {
        const help = {
            color: 0x00A0EA,
            title: 'ヘルプ',
            author: {
                icon_url: 'https://www.kisarazu.ac.jp/wp-content/uploads/2015/01/symbolmark_5cm-300x297.jpg',
                url: 'https://discord.gg/mwyC8PTcXa',
            },
            description: '現在実装されているコマンド一覧です\n\n',
            fields: [
                {
                    name: '​\n/help',
                    value: 'ヘルプを表示します\n',
                },
                {
                    name: '​\n/about',
                    value: 'このBOTの概要を表示します\n',
                },
                {
                    name: '​\n/genshintimer',
                    value: 'このBOTに搭載されている機能「genshin-timer」の概要を表示します。\n',
                },
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Developed by NITKC22s server Admin',
            },
        };
        await interaction.reply({ embeds: [help] });

    }
    if (interaction.commandName === 'about') {
        const help = {
            color: 0x00A0EA,
            title: 'NITKC統合管理BOT概要',
            author: {
                icon_url: 'https://www.kisarazu.ac.jp/wp-content/uploads/2015/01/symbolmark_5cm-300x297.jpg',
                url: 'https://discord.gg/mwyC8PTcXa',
            },
            description: 'このbotの概要を紹介します\n\n',
            fields: [
                {
                  name: '​\nバージョン情報',
                  value: 'v1.0.1 ',
                },
                {
                    name: '​\n開発者',
                    value: '開発は、このサーバーの管理者3人([kokastar](https://github.com/starkoka)、[NXVZBGB FBEN](https://github.com/NXVZBGBFBEN)、[naotiki](https://github.com/naotiki))で行っています\n',
                },
                {
                    name: '​\n搭載機能',
                    value: '[Genshin-timer Discord BOT v1.0.0](https://github.com/starkoka/Genshin-Timer)\n',
                },
                {
                    name: '​\nソースコード',
                    value: '一部のソースコードはオープンソースとなっています。以下のリンクより参照してください。\n・[Genshin-timer](https://github.com/starkoka/Genshin-Timer)\n',
                },
                {
                    name: '​\n実行環境',
                    value: 'node.js v18.9.0\ndiscord.js v14.3.0\n',
                },

            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Developed by NITKC22s server Admin',
            },
        };
        await interaction.reply({ embeds: [help] });

    }
});
client.login(config.token);
