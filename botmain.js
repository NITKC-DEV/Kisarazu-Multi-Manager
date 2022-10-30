const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder} = require('discord.js');
const config = process.env.NODE_ENV === "development" ? require('./config.dev.json') : require('./config.json')
const TxtEasterEgg = require('./functions/TxtEasterEgg.js');
const dotenv = require('dotenv');
const path = require('path')
const fs = require('fs')
const cron = require('node-cron');
require('date-utils');
dotenv.config()
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
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

/*TxtEasterEgg*/
client.on('messageCreate', message => {
    TxtEasterEgg.func(message);
})


/*自習室BOT実験(VCに参加したら通知)*/
client.on("voiceStateUpdate",  (oldState, newState) => {
    if(newState && oldState){

        //newState関係
        console.log(`NEW:userid   : ${newState.id}`);       //ユーザID
        console.log(`NEW:channelid: ${newState.channelID}`);//チャンネルID、nullならdisconnect
        console.log(`NEW:guildid  : ${newState.guild.id}`); //ギルドID

        //oldState関係
        console.log(`OLD:userid   : ${oldState.id}`);       //ユーザID
        console.log(`OLD:channelid: ${oldState.channelID}`);//チャンネルID、nullならconnect
        console.log(`OLD:guildid  : ${oldState.guild.id}`); //ギルドID

        if(oldState.channelID===newState.channelID){
            //ここはミュートなどの動作を行ったときに発火する場所
            concole.log(`other`);
        }
        if(oldState.channelID===null && newState.channelID != null){
            //ここはconnectしたときに発火する場所
            concole.log(`connect`);
        }
    }
    if(oldState.channelID !=null && newState.channelID === null){
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
    client.channels.cache.get(config.daily).send({embeds: [daily]})
    let dt = new Date();
    let dayofweek = dt.getDay();
    let date = dt.getDate();
    if(dayofweek===1){ /*月曜日*/
        const monday = {
            color: 0x27668D,
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
        client.channels.cache.get(config.daily).send({embeds: [monday]})
    }

    if(dayofweek===4){ /*木曜日*/
        const thursday = {
            color: 0x27668D,
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
        client.channels.cache.get(config.daily).send({embeds: [thursday]})
    }

    if(dayofweek===5){ /*金曜日*/
        const friday = {
            color: 0x27668D,
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
        client.channels.cache.get(config.daily).send({embeds: [friday]})
    }

    if(dayofweek===6){ /*土曜日*/
        const saturday = {
            color: 0x27668D,
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
        client.channels.cache.get(config.daily).send({embeds: [saturday]})
    }
    if(date%3===0){ /*3の倍数の日*/
        const multiple = {
            color: 0x27668D,
            title: 'アイテム購入リセット',
            description: '博来・長順以外の★4以上の食べ物、食材、素材、特産品購入がリセットされました\n\n',
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [multiple]})
    }
    if(date%3===1){ /*3の倍数+1の日*/
        const multiple2 = {
            color: 0x27668D,
            title: 'アイテム購入リセット',
            description: '博来・長順の★4以上の食べ物、食材、素材、特産品購入がリセットされました\n\n',
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [multiple2]})
    }

    if(date===1){ /*毎月1日*/
        const first = {
            color: 0x27668D,
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
        client.channels.cache.get(config.daily).send({embeds: [first]})
    }
    if(date===16){ /*毎月16日*/
        const sixteenth = {
            color: 0x27668D,
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
        client.channels.cache.get(config.daily).send({embeds: [sixteenth]})
    }

    console.log('デイリー通知送信完了')
});

/*時間割送信*/
let m,e,d,j,c;
cron.schedule('0 20 * * 0', () => {
    m = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle('機械工学科 時間割')
        .setAuthor({
            name: "木更津22s統合管理BOT",
            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
            url: 'https://discord.gg/mwyC8PTcXa'
        })
        .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください\n')
        .addFields(
            [
                {
                    name: "──────────\n**基礎数学Ⅱ**",
                    value: '担当教員：関口 昌由 \n授業場所：1年機械工学科教室\n──────────',
                },
                {
                    name: '**工学実験ⅠB**',
                    value: '担当教員：小田 功・高橋 美喜男\n　　　　　松井 翔太 \n授業場所：実習工場\n──────────',
                },
                {
                    name: '**図学製図Ⅱ**',
                    value: '担当教員：松井 翔太 \n授業場所：1年機械工学科教室\n──────────',
                },
                {
                    name: '**課題学習時間**',
                    value: '授業場所：**1年機械工学科教室**ほか\n──────────',
                },

            ]
        )
        .setTimestamp()
        .setFooter({text: 'Developed by NITKC22s server Admin'});
    e = new EmbedBuilder()
        .setColor(0xD64E5A)
        .setTitle('電気電子工学科 時間割')
        .setAuthor({
            name: "木更津22s統合管理bot",
            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
            url: 'https://discord.gg/mwyC8PTcXa'
        })
        .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
        .addFields(
            [
                {
                    name: '──────────\n**基礎数学Ⅱ**',
                    value: '担当教員：鈴木 道治 \n授業場所：1年電気電子工学科教室\n──────────',
                },
                {
                    name: '**空きコマ**',
                    value: '時間割上では、3,4時間目は空きコマになっています。\n──────────',
                },
                {
                    name: '**英語ⅠB**',
                    value: '担当教員：岩崎 洋一・小川 祐輔 \n授業場所：1年電気電子工学科教室\n──────────',
                },
                {
                    name: '**課題学習時間**',
                    value: '授業場所：1年電気電子工学科教室ほか\n──────────',
                },

            ]
        )
        .setTimestamp()
        .setFooter({text: 'Developed by NITKC22s server Admin'});

    d = new EmbedBuilder()
        .setColor(0x865DC0)
        .setTitle('電子制御工学科 時間割')
        .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
        .setAuthor({
            name: "木更津22s統合管理bot",
            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
            url: 'https://discord.gg/mwyC8PTcXa'
        })
        .addFields(
            [
                {
                    name: '──────────\n**基礎数学Ⅱ**',
                    value: '担当教員：阿部 孝之 \n授業場所：1年電子制御工学科教室\n──────────',
                },
                {
                    name: '**英語ⅡB**',
                    value: '担当教員：瀬川 直美 \n授業場所：特別教室\n──────────',
                },
                {
                    name: '**物理学Ⅰ**',
                    value: '担当教員：高谷 博史 \n授業場所：1年電子制御工学科教室\n──────────',
                },
                {
                    name: '**課題学習時間**',
                    value: '授業場所：1年電子制御工学科教室ほか\n──────────',
                },

            ]
        )
        .setTimestamp()
        .setFooter({text: 'Developed by NITKC22s server Admin'});
    j = new EmbedBuilder()
        .setColor(0xCAAB0D)
        .setTitle('情報工学科 時間割')
        .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
        .setAuthor({
            name: "木更津22s統合管理bot",
            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
            url: 'https://discord.gg/mwyC8PTcXa'
        })
        .addFields(
            [
                {
                    name: '──────────\n**物理学Ⅰ**',
                    value: '担当教員：高谷 博史 \n授業場所：1年情報工学科教室\n──────────',
                },
                {
                    name: '**英語ⅠB**',
                    value: '担当教員：小川 祐輔 \n授業場所：1年情報工学科教室\n──────────',
                },
                {
                    name: '**基礎数学Ⅲ**',
                    value: '担当教員：阿部 孝之 \n授業場所：1年情報工学科教室\n──────────',
                },
                {
                    name: '**課題学習時間**',
                    value: '授業場所：1年情報工学科教室ほか\n──────────',
                },

            ]
        )
        .setTimestamp()
        .setFooter({text: 'Developed by NITKC22s server Admin'});
    c = new EmbedBuilder()
        .setColor(0x1E9B50)
        .setTitle('環境都市工学科 時間割')
        .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
        .setAuthor({
            name: "木更津22s統合管理bot",
            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
            url: 'https://discord.gg/mwyC8PTcXa'
        })
        .addFields(
            [
                {
                    name: '──────────\n**英語ⅡB**',
                    value: '担当教員：瀬川 直美 \n授業場所：特別教室\n──────────',
                },
                {
                    name: '**基礎数学Ⅲ**',
                    value: '担当教員：阿部 孝之 \n授業場所：1年環境都市工学科教室\n──────────',
                },
                {
                    name: '**基礎数学Ⅱ**',
                    value: '担当教員：佐野 照和 \n授業場所：1年環境都市工学科教室\n──────────',
                },
                {
                    name: '**課題学習時間**',
                    value: '授業場所：1年環境都市学科教室ほか\n──────────',
                },

            ]
        )
        .setTimestamp()
        .setFooter({text: 'Developed by NITKC22s server Admin'});
    });

    cron.schedule('0 20 * * 1', () => {


        m = new EmbedBuilder()
            .setColor(0x00A0EA)
            .setTitle('機械工学科 時間割')
            .setAuthor({
                name: "木更津22s統合管理BOT",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**地理B**',
                        value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　高石 憲明 \n授業場所：1年機械工学科教室\n──────────',
                    },
                    {
                        name: '**物理学Ⅰ**',
                        value:'担当教員：高谷 博史 \n授業場所：1年機械工学科教室\n──────────',
                    },
                    {
                        name: '**技術者入門Ⅱ**',
                        value:'担当教員：板垣 貴喜・内田 洋彰\n　　　　　小田 　功・歸山 智治\n　　　　　松井 翔太\n──────────',
                    },


                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        e = new EmbedBuilder()
            .setColor(0xD64E5A)
            .setTitle('電気電子工学科 時間割')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**物理学Ⅰ**',
                        value:'担当教員：高谷 博史 \n授業場所：1年電気電子工学科教室\n──────────',
                    },
                    {
                        name: '**基礎化学ⅠB**',
                        value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                    },
                    {
                        name: '**技術者入門Ⅱ**',
                        value:'担当教員：小原 翔馬・水越 彰仁 \n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        d = new EmbedBuilder()
            .setColor(0x865DC0)
            .setTitle('電子制御工学科 時間割')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**電子計算機Ⅰ**\n',
                        value:'担当教員：沢口 義人 \n授業場所：1年電子制御工学科教室\n──────────',
                    },
                    {
                        name: '**技術者入門Ⅱ**',
                        value:'担当教員：沢口 義人・奥山 彫夢\n──────────',
                    },
                    {
                        name: '**技術者入門Ⅱ**',
                        value:'担当教員：沢口 義人・奥山 彫夢\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        j = new EmbedBuilder()
            .setColor(0xCAAB0D)
            .setTitle('情報工学科 時間割')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**実験実習ⅠB**',
                        value:'担当教員：米村 恵一・能城 沙織 \n授業場所：情報工学科回路実験室\n──────────',
                    },
                    {
                        name: '**コンピュータ入門Ⅱ**',
                        value:'担当教員：丸山 真佐夫・吉澤 陽介 \n授業場所：情報工学科計算機演習室\n──────────',
                    },
                    {
                        name: '**技術者入門Ⅱ**',
                        value:'担当教員：米村 恵一・和田 州平\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        c = new EmbedBuilder()
            .setColor(0x1E9B50)
            .setTitle('環境都市工学科 時間割')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**基礎数学Ⅱ**',
                        value:'担当教員：佐野 照和 \n授業場所：1年環境都市工学科教室\n──────────',
                    },
                    {
                        name: '**空きコマ**',
                        value:'時間割上では、3,4時間目は空きコマになっています。\n──────────',
                    },
                    {
                        name: '**技術者入門Ⅱ**',
                        value:'担当教員：石川 雅朗\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});

    });
    cron.schedule('0 20 * * 2', () => {
                m = new EmbedBuilder()
            .setColor(0x00A0EA)
            .setTitle('機械工学科 時間割')
            .setAuthor({
                name: "木更津22s統合管理BOT",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .setDescription('水曜日の時間割です。\n ※休講や、授業変更等がある可能性があります。各自で確認してください')
            .addFields(
                [
                    {
                        name: '──────────\n**美術**',
                        value:'担当教員：加藤 達彦・馬場 喜久 \n授業場所：第6講義室\n──────────',
                    },
                    {
                        name: '**保健体育ⅠB**',
                        value:'担当教員：坂田 洋満・篠村 朋樹　\n授業場所：体育館・グラウンド他ほか\n──────────',
                    },
                    {
                        name: '**英語ⅠB**',
                        value:'担当教員：岩崎 洋一・小川 祐輔 \n授業場所：1年機械工学科教室\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年機械工学科教室ほか\n──────────',
                    },

                ]
            )
                .setTimestamp()
                .setFooter({text: 'Developed by NITKC22s server Admin'});
        e = new EmbedBuilder()
            .setColor(0xD64E5A)
            .setTitle('電気電子工学科 時間割')
            .setDescription('水曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**ディジタル回路Ⅰ**',
                        value:'担当教員：若葉 陽一 \n授業場所：1年電気電子工学科教室\n──────────',
                    },
                    {
                        name: '**基礎数学Ⅱ**',
                        value:'担当教員：鈴木 道治 \n授業場所：1年電気電子工学科教室\n──────────',
                    },
                    {
                        name: '**保健体育ⅠB**',
                        value:'担当教員：坂田 洋満・篠村 朋樹 \n授業場所：体育館・グラウンドほか\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年電気電子工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        d = new EmbedBuilder()
            .setColor(0x865DC0)
            .setTitle('電子制御工学科 時間割')
            .setDescription('水曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**保健体育ⅠB**',
                        value:'担当教員：坂田 洋満,篠村 朋樹 \n授業場所：体育館・グラウンドほか\n──────────',
                    },
                    {
                        name: '**美術**',
                        value:'担当教員：加藤 達彦,馬場 喜久 \n授業場所：第6講義室\n──────────',
                    },
                    {
                        name: '**基礎化学ⅠB**',
                        value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年電子制御工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        j = new EmbedBuilder()
            .setColor(0xCAAB0D)
            .setTitle('情報工学科 時間割')
            .setDescription('水曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**基礎数学Ⅱ**',
                        value:'担当教員：山下 哲 \n授業場所：1年情報工学科教室\n──────────',
                    },
                    {
                        name: '**国語ⅠB**',
                        value:'担当教員：加田 謙一郎 \n授業場所：1年情報工学科教室\n──────────',
                    },
                    {
                        name: '**美術**',
                        value:'担当教員：加藤 達彦・馬場 喜久 \n授業場所：第6講義室\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年情報工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        c = new EmbedBuilder()
            .setColor(0x1E9B50)
            .setTitle('環境都市工学科 時間割')
            .setDescription('水曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**測量学Ⅰ**',
                        value:'担当教員：島﨑 彦人 \n授業場所：1年環境都市工学科教室\n──────────',
                    },
                    {
                        name: '**基礎化学ⅠB**',
                        value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                    },
                    {
                        name: '**国語ⅠB**',
                        value:'担当教員：加田 謙一郎 \n授業場所：1年環境都市工学科教室\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年環境都市学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({ text: 'Developed by NITKC22s server Admin' });

    });
    cron.schedule('0 20 * * 3', () => {
            m = new EmbedBuilder()
            .setColor(0x00A0EA)
            .setTitle('機械工学科 時間割')
            .setAuthor({
                name: "木更津22s統合管理BOT",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .setDescription('木曜日の時間割です。\n ※休講や、授業変更等がある可能性があります。各自で確認してください')
            .addFields(
                [
                    {
                        name: '──────────\n**国語ⅠB**',
                        value:'担当教員：加田 謙一郎 \n授業場所：1年機械工学科教室\n──────────',
                    },
                    {
                        name: '**基礎数学Ⅱ**',
                        value:'担当教員：関口 昌由 \n授業場所：1年機械工学科教室\n──────────',
                    },
                    {
                        name: '**情報処理Ⅱ**',
                        value:'担当教員：伊藤 裕一・青葉 知弥 \n授業場所：ネットワーク情報センター\n──────────',
                    },
                    {
                        name: '**HR**',
                        value:'授業場所：1年機械工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        e = new EmbedBuilder()
            .setColor(0xD64E5A)
            .setTitle('電気電子工学科 時間割')
            .setDescription('木曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**基礎数学Ⅲ**',
                        value:'担当教員：阿部 孝之 \n授業場所：1年電気電子工学科教室\n──────────',
                    },
                    {
                        name: '**電気電子工学入門**',
                        value:'担当教員：谷井 宏成 \n授業場所：1年電気電子工学科教室\n──────────',
                    },
                    {
                        name: '**国語ⅠB**',
                        value:'担当教員：加田 謙一郎   \n授業場所：1年電気電子工学科教室\n──────────',
                    },
                    {
                        name: '**HR**',
                        value:'授業場所：1年電気電子工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        d = new EmbedBuilder()
            .setColor(0x865DC0)
            .setTitle('電子制御工学科 時間割')
            .setDescription('木曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**英語ⅠB**',
                        value:'担当教員：岩崎 洋一・小川 祐輔 \n授業場所：1年電子制御工学科教室\n──────────',
                    },
                    {
                        name: '**国語ⅠB**',
                        value:'担当教員：加田 謙一郎 \n授業場所：1年電子制御工学科教室\n──────────',
                    },
                    {
                        name: '**基礎数学Ⅱ**',
                        value:'担当教員：阿部 孝之 \n授業場所：1年電子制御工学科教室\n──────────',
                    },
                    {
                        name: '**HR**',
                        value:'授業場所：1年電子制御工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        j = new EmbedBuilder()
            .setColor(0xCAAB0D)
            .setTitle('情報工学科 時間割')
            .setDescription('木曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**英語ⅡB**',
                        value:'担当教員：瀬川 直美　\n授業場所：特別教室\n──────────',
                    },
                    {
                        name: '**基礎化学ⅠB**',
                        value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                    },
                    {
                        name: '**コンピュータ演習Ⅱ**',
                        value:'担当教員：米村 恵一・和田 州平 \n授業場所：情報工学科回路実験室\n──────────',
                    },
                    {
                        name: '**HR**',
                        value:'授業場所：1年情報工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        c = new EmbedBuilder()
            .setColor(0x1E9B50)
            .setTitle('環境都市工学科 時間割')
            .setDescription('木曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**物理学Ⅰ**',
                        value:'担当教員：高谷 博史 \n授業場所：特別教室\n──────────',
                    },
                    {
                        name: '**空きコマ**',
                        value:'時間割上では、3,4時間目は空きコマになっています。\n──────────',
                    },
                    {
                        name: '**英語ⅠB**',
                        value:'担当教員：岩崎 洋一・小川 祐輔 \n授業場所：1年環境都市工学科教室\n──────────',
                    },
                    {
                        name: '**HR**',
                        value:'授業場所：1年環境都市学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({ text: 'Developed by NITKC22s server Admin' });

    });
    cron.schedule('0 20 * * 4', () => {
        timetable = new EmbedBuilder()
            .setColor(0x00A0EA)
            .setTitle('明日(金曜日)の時間割')
            .setDescription('金曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
        m = new EmbedBuilder()
            .setColor(0x00A0EA)
            .setTitle('機械工学科 時間割')
            .setAuthor({
                name: "木更津22s統合管理BOT",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .setDescription('金曜日の時間割です。\n ※休講や、授業変更等がある可能性があります。各自で確認してください')
            .addFields(
                [
                    {
                        name: '──────────\n**英語ⅡB**',
                        value:'担当教員：瀬川 直美 \n授業場所：特別教室\n──────────',
                    },
                    {
                        name: '**基礎化学ⅠB**',
                        value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                    },
                    {
                        name: '**基礎数学Ⅲ**',
                        value:'担当教員：阿部 孝之 \n授業場所：第一講義室\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年機械工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        e = new EmbedBuilder()
            .setColor(0xD64E5A)
            .setTitle('電気電子工学科 時間割')
            .setDescription('金曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**地理B**',
                        value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　高石 憲明 \n授業場所：1年電気電子工学科教室\n──────────',
                    },
                    {
                        name: '**英語ⅡB**',
                        value:'担当教員：瀬川 直美 \n授業場所：特別教室\n──────────',
                    },
                    {
                        name: '**プログラミングⅠ**',
                        value:'担当教員：飯田 聡子 \n授業場所：ネットワーク情報センター\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年電気電子工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        d = new EmbedBuilder()
            .setColor(0x865DC0)
            .setTitle('電子制御工学科 時間割')
            .setDescription('金曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**機械制御入門Ⅱ**',
                        value:'担当教員：沢口 義人　\n授業場所：1年電子制御工学科教室\n──────────',
                    },
                    {
                        name: '**地理B**',
                        value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　川元 豊和 \n授業場所：1年電子制御工学科教室\n──────────',
                    },
                    {
                        name: '**基礎数学Ⅲ**',
                        value:'担当教員：阿部 孝之 \n授業場所：第一講義室\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年電子制御工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        j = new EmbedBuilder()
            .setColor(0xCAAB0D)
            .setTitle('情報工学科 時間割')
            .setDescription('金曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**保健体育ⅠB**',
                        value:'担当教員：坂田 洋満・篠村 朋樹 \n授業場所：グラウンド・体育館ほか\n──────────',
                    },
                    {
                        name: '**基礎数学Ⅱ**',
                        value:'担当教員：山下 哲 \n授業場所：1年情報工学科教室\n──────────',
                    },
                    {
                        name: '**地理B**',
                        value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　川元 豊和 \n授業場所：1年情報工学科教室\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年情報工学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({text: 'Developed by NITKC22s server Admin'});
        c = new EmbedBuilder()
            .setColor(0x1E9B50)
            .setTitle('環境都市工学科 時間割')
            .setDescription('金曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
            .setAuthor({
                name: "木更津22s統合管理bot",
                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                url: 'https://discord.gg/mwyC8PTcXa'
            })
            .addFields(
                [
                    {
                        name: '──────────\n**地理B**',
                        value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　川元 豊和 \n授業場所：特別教室\n──────────',
                    },
                    {
                        name: '**保健体育ⅠB**',
                        value:'担当教員：坂田 洋満・篠村 朋樹 \n授業場所：体育館・グラウンドほか\n──────────',
                    },
                    {
                        name: '**力学基礎**',
                        value:'担当教員：大久保 努 \n授業場所：環境都市工学科都市創造実験室\n──────────',
                    },
                    {
                        name: '**課題学習時間**',
                        value:'授業場所：1年環境都市学科教室ほか\n──────────',
                    },

                ]
            )
            .setTimestamp()
            .setFooter({ text: 'Developed by NITKC22s server Admin' });

    });
cron.schedule('0 20 * * 0,1,2,3,4', async () => {
    (await (client.channels.cache.get(config.M) ?? await client.channels.fetch(id)).send({ embeds: [m] }));
    (await (client.channels.cache.get(config.E) ?? await client.channels.fetch(id)).send({ embeds: [e] }));
    (await (client.channels.cache.get(config.D) ?? await client.channels.fetch(id)).send({ embeds: [d] }));
    (await (client.channels.cache.get(config.J) ?? await client.channels.fetch(id)).send({ embeds: [j] }));
    (await (client.channels.cache.get(config.C) ?? await client.channels.fetch(id)).send({ embeds: [c] }));
});


client.login(config.token);
