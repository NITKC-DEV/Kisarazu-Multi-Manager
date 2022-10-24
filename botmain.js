const  timetableBuilder  = require('./timetable/timetableUtils');
const  Classes = require('./timetable/timetables.json');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const config = process.env.NODE_ENV === "development" ? require('./config.dev.json') : require('./config.json')
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

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
module.exports = client.commands


/*スラッシュコマンド登録*/
client.once("ready", async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        for (let i = 0; i < command.length; i++) {
            client.commands.set(command[i].data.name, command[i]);
        }

    }
    console.log("Ready!");
});

/*実際の動作*/
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;
    console.log(command)
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

/*自習室BOT実験(VCに参加したら通知)*/
client.on("voiceStateUpdate", (oldState, newState) => {
    if (newState && oldState) {

        //newState関係
        console.log(`NEW:userid   : ${newState.id}`);       //ユーザID
        console.log(`NEW:channelid: ${newState.channelID}`);//チャンネルID、nullならdisconnect
        console.log(`NEW:guildid  : ${newState.guild.id}`); //ギルドID

        //oldState関係
        console.log(`OLD:userid   : ${oldState.id}`);       //ユーザID
        console.log(`OLD:channelid: ${oldState.channelID}`);//チャンネルID、nullならconnect
        console.log(`OLD:guildid  : ${oldState.guild.id}`); //ギルドID

        if (oldState.channelID === newState.channelID) {
            //ここはミュートなどの動作を行ったときに発火する場所
            concole.log(`other`);
        }
        if (oldState.channelID === null && newState.channelID != null) {
            //ここはconnectしたときに発火する場所
            concole.log(`connect`);
        }
    }
    if (oldState.channelID != null && newState.channelID === null) {
        //ここはdisconnectしたときに発火する場所
        console.log(`disconnect`);
    }
});


/*原神デイリー通知*/
cron.schedule('0 5 * * *', () => {
    const daily = {
        color: 0x27668D,
        title: 'デイリー更新',
        author: {
            name: 'Genshin-timer',
            icon_url: 'https://pbs.twimg.com/media/FcdR7aIaIAE75Uu?format=png&name=large',
            url: 'https://github.com/starkoka/Genshin-Timer',
        },
        description: 'デイリーが更新されました。忘れずに4つ+追加報酬を受け取りましょう\n\n',
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Developed by @kokastar_studio',
            icon_url: 'https://pbs.twimg.com/profile_images/1503219566478229506/0dkJeazd_400x400.jpg',
        },
    };
    client.channels.cache.get(config.daily).send({ embeds: [daily] })
    let dt = new Date();
    let dayofweek = dt.getDay();
    let date = dt.getDate();
    const genshinColor = 0x27668D;
    if (dayofweek === 1) { /*月曜日*/
        const monday = {
            color: genshinColor,
            title: '新しい週が始まりました',
            description: '新しい週が始まり、以下のものがリセットされました。\n\n',
            fields: [
                {
                    name: '​\n週ボスリセット',
                    value: 'トワリン、アンドリアス、タルタリア、若陀龍王、淑女、雷電将軍の報酬が再度受け取れるようになりました。\nまた、樹脂半減回数がリセットされました。',
                },
                {
                    name: '​\n評判任務更新',
                    value: 'モンド、璃月、稲妻、スメール各国の評判任務が更新されました。\n',
                },
                {
                    name: '​\n「緋紅の願い」リセット',
                    value: 'ドラゴンスパインのクエスト「緋紅の願い」が再挑戦できるようになりました。\n',
                },
                {
                    name: '​\nアイテム購入回数リセット',
                    value: '加工済み食材・洞天百貨宝貨・四方八方の網の購入回数がリセットされました。\n',
                },
                {
                    name: '​\n木材変転回数リセット',
                    value: '木材変転の上限回数がリセットされました。\n',
                },
                {
                    name: '​\n週間限定ギフトパック購入回数リセット',
                    value: '週間限定ギフトパックの購入上限回数がリセットされました。\n',
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({ embeds: [monday] })
    }

    if (dayofweek === 4) { /*木曜日*/
        const thursday = {
            color: genshinColor,
            title: '木曜日になりました',
            description: '木曜日になり、以下のものがリセットされました。\n\n',
            fields: [
                {
                    name: '​\n聖遺物購入回数リセット',
                    value: '聖遺物の購入回数上限がリセットされました',
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({ embeds: [thursday] })
    }

    if (dayofweek === 5) { /*金曜日*/
        const friday = {
            color: genshinColor,
            title: '金曜日になりました',
            description: '金曜日になり、以下のものがリセットされました。\n\n',
            fields: [
                {
                    name: '​\n「緋紅の願い」リセット',
                    value: 'ドラゴンスパインのクエスト「緋紅の願い」が再挑戦できるようになりました。\n',
                },
                {
                    name: '​\n周回する壺の精霊出現',
                    value: '自分の塵歌壺内で商品を購入可能になりました(日曜日まで)',
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({ embeds: [friday] })
    }

    if (dayofweek === 6) { /*土曜日*/
        const saturday = {
            color: genshinColor,
            title: '土曜日になりました',
            description: '土曜日になり、以下のものがリセットされました。\n\n',
            fields: [
                {
                    name: '​\n他人の壺の精霊で購入可能に',
                    value: '他人のの塵歌壺内で商品を購入可能になりました。(日曜日まで)',
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({ embeds: [saturday] })
    }
    if (date % 3 === 0) { /*3の倍数の日*/
        const multiple = {
            color: genshinColor,
            title: 'アイテム購入リセット',
            description: '博来・長順以外の★4以上の食べ物、食材、素材、特産品購入がリセットされました\n\n',
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({ embeds: [multiple] })
    }
    if (date % 3 === 1) { /*3の倍数+1の日*/
        const multiple2 = {
            color: genshinColor,
            title: 'アイテム購入リセット',
            description: '博来・長順の★4以上の食べ物、食材、素材、特産品購入がリセットされました\n\n',
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({ embeds: [multiple2] })
    }

    if (date === 1) { /*毎月1日*/
        const first = {
            color: genshinColor,
            title: '1日になりました',
            description: '月が変わり、以下のものがリセットされました。\n\n',
            fields: [
                {
                    name: '​\n螺旋リセット',
                    value: '螺旋9~12層がリセットされました。',
                },
                {
                    name: '​\nスター交換ラインナップ更新・リセット',
                    value: 'スターライト交換のラインナップが更新されました。\nまた、スターライト交換・スターダスト交換の購入回数上限がリセットされました。',
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({ embeds: [first] })
    }
    if (date === 16) { /*毎月16日*/
        const sixteenth = {
            color: genshinColor,
            title: '16日になりました',
            description: '月の後半に入り、以下のものがリセットされました。\n\n',
            fields: [
                {
                    name: '​\n螺旋リセット',
                    value: '螺旋9~12層がリセットされました。',
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({ embeds: [sixteenth] })
    }

    console.log('デイリー通知送信完了')
});


cron.schedule('0 20 * * 0,1,2,3,4', async () => {
    let dayOfWeek = new Date().getDay()+1;
    (await (client.channels.cache.get(config.M) ?? await client.channels.fetch(config.M))
        .send({ embeds: [timetableBuilder(Classes.M, dayOfWeek)] }));
    (await (client.channels.cache.get(config.E) ?? await client.channels.fetch(config.E))
        .send({ embeds: [timetableBuilder(Classes.E, dayOfWeek)] }));
    (await (client.channels.cache.get(config.D) ?? await client.channels.fetch(config.D))
        .send({ embeds: [timetableBuilder(Classes.D, dayOfWeek)] }));
    (await (client.channels.cache.get(config.J) ?? await client.channels.fetch(config.J))
        .send({ embeds: [timetableBuilder(Classes.J, dayOfWeek)] }));
    (await (client.channels.cache.get(config.C) ?? await client.channels.fetch(config.C))
        .send({ embeds: [timetableBuilder(Classes.C, dayOfWeek)] }));
});



client.login(config.token);