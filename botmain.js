const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder,  Events,ActionRowBuilder,StringSelectMenuBuilder} = require('discord.js');
const config = require('./environmentConfig')
let ccconfig=require("./CCConfig.json");
const timetableBuilder  = require('./timetable/timetableUtils');
const Classes = require('./timetable/timetables.json');
const TxtEasterEgg = require('./functions/TxtEasterEgg.js');
const dashboard = require('./functions/dashboard.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
require('date-utils');
const {configPath} = require("./environmentConfig");
dotenv.config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel],
});
module.exports.client=client;

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
module.exports = client.commands;


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
    console.log("SlashCommand : "+command.data.name);
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'おっと、想定外の事態が起きちゃった。管理者に連絡してくれ。', ephemeral: true });
    }
});

//SelectMenu受け取り
client.on(Events.InteractionCreate, async interaction =>
{
    if (!interaction.isStringSelectMenu()) return;

    // /createchanでのカテゴリ選択の受け取り
    if (interaction.customId === "selectCat")
    {
        //キャンセル受付
        if(interaction.values[0]==="0000000000000000000")
        {
            await interaction.update({content:"キャンセルされました", components: []});
        }
        //カテゴリ受付
        else
        {
            //チャンネル作成

            let newChannel=await interaction.guild.channels.create({name:interaction.message.content.split(" ")[0],parent:interaction.values[0],reason:"木更津22s統合管理BOTの操作により作成"});

            //作成チャンネル情報記録
            ccconfig.guilds.find(guild =>guild.ID===interaction.guild.id).categories.find(category => category.ID===interaction.values[0]).channels[ccconfig.guilds.find(guild =>guild.ID===interaction.guild.id).categories.find(category => category.ID===interaction.values[0]).channels.length]={ID:newChannel.id,name:newChannel.name,creatorID:interaction.user.id,createTime:Date.now()};

            //json書き込み
            const ccjson = JSON.stringify (ccconfig);
            try
            {
                fs.writeFileSync ("CCConfig.json", ccjson, "utf8");
            } catch (e)
            {
                console.log (e);
                await interaction.update({content:"データの保存に失敗しました\nやり直してください", components: []});
                return;
            }

            //ロール作成許可時にロール作成をするかを問うSelectMenu作成
            if(ccconfig.guilds.find(guild =>guild.ID===interaction.guild.id).categories.find(category => category.ID===interaction.values[0]).allowRole)
            {
                const mkRole=new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("mkRole")
                            .addOptions
                            (
                                {label:"作成する",value:interaction.values[0]+"/"+newChannel.id+"/1"},
                                {label:"作成しない",value:interaction.values[0]+"/"+newChannel.id+"/0"}
                            )
                    )

                await interaction.update({content:"このチャンネルに対応したロールを作成しますか？", components: [mkRole]});
            }
            else
            {
                interaction.update({content:"作成しました",components:[]});
            }
        }
    }
    //ロール作成受け取り
    if(interaction.customId==="mkRole")
    {
        //作成
        if(interaction.values[0].split("/")[2]==="1")
        {
            //ロール作成
            const newRole=await interaction.guild.roles.create({name:ccconfig.guilds.find(guild =>guild.ID===interaction.guild.id).categories.find(category => category.ID===interaction.values[0].split("/")[0]).channels.find(channel=>channel.ID===interaction.values[0].split("/")[1]).name,permissions:BigInt(0),mentionable:true,reason:"木更津22s統合管理BOTの操作により作成"});

            //作成ロール情報記録
            const newData={roleID:newRole.id,roleName:newRole.name};
            ccconfig.guilds.find(guild =>guild.ID===interaction.guild.id).categories.find(category => category.ID===interaction.values[0].split("/")[0]).channels.find(channel=>channel.ID===interaction.values[0].split("/")[1]).thereRole=true;
            ccconfig.guilds.find(guild =>guild.ID===interaction.guild.id).categories.find(category => category.ID===interaction.values[0].split("/")[0]).channels.find(channel=>channel.ID===interaction.values[0].split("/")[1]).roleID=newData.roleID;
            ccconfig.guilds.find(guild =>guild.ID===interaction.guild.id).categories.find(category => category.ID===interaction.values[0].split("/")[0]).channels.find(channel=>channel.ID===interaction.values[0].split("/")[1]).roleName=newData.roleName;

            //json記録
            const ccjson = JSON.stringify (ccconfig);
            try
            {
                fs.writeFileSync ("CCConfig.json", ccjson, "utf8");
            } catch (e)
            {
                console.log (e);
                const mkRole=new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId("mkRole")
                            .addOptions
                            (
                                {label:"作成する",value:interaction.values[0]+"/"+newChannel.id+"/1"},
                                {label:"作成しない",value:interaction.values[0]+"/"+newChannel.id+"/0"}
                            )
                    )
                await interaction.update({ content:"データの保存に失敗しました\nやり直してください\nこのチャンネルに対応したロールを作成しますか？", components: [mkRole]});
                return;
            }

            await interaction.update({ content:"ロールを作成して終了しました", components: []});
        }
        //作成しない
        else
        {
            //作成しなかったことを記録
            ccconfig.guilds.find(guild =>guild.ID===interaction.guild.id).categories.find(category => category.ID===interaction.values[0].split("/")[0]).channels.find(channel=>channel.ID===interaction.values[0].split("/")[1]).thereRole =false;

            //json記録
            const ccjson = JSON.stringify (ccconfig);
            try
            {
                fs.writeFileSync ("CCConfig.json", ccjson, "utf8");
            } catch (e)
            {
                console.log (e);
                const mkRole=new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId("mkRole")
                            .addOptions
                            (
                                {label:"作成する",value:interaction.values[0]+"/"+newChannel.id+"/1"},
                                {label:"作成しない",value:interaction.values[0]+"/"+newChannel.id+"/0"}
                            )
                    )
                await interaction.update({ content:"データの保存に失敗しました\nやり直してください\nこのチャンネルに対応したロールを作成しますか？", components: [mkRole]});
                return;
            }

            await interaction.update({ content:"ロールを作成せずに終了しました", components: []});
        }
    }
    //カテゴリ削除受け取り
    if(interaction.customId==="remCat")
    {
        //ccconfig内のguildsの実行ギルドのインデックスを取得
        let indGuild=-1;
        for(let i=0;i<ccconfig.guilds.length;i++)
        {
            if(ccconfig.guilds[1].ID===interaction.guild.id)indGuild=i;
        }
        if(indGuild===-1)
        {
            await interaction.update({ content:"このサーバーは登録されていません", components: []});
            return;
        }
        //全削除
        if(interaction.values[0].split("/")[0]==="ALL")
        {
            //チャンネルとロールの削除
            if(interaction.values[0].split("/")[1]==="t")
            {
                for(let i=1;i<ccconfig.guilds[indGuild].categories.length;i++)
                {
                    for(let j=1;j<ccconfig.guilds[indGuild].categories[i].channels.length;j++)
                    {
                        //エラー起きやすそうだからtry文
                        try
                        {
                            //チャンネル削除
                            await interaction.guild.channels.delete (ccconfig.guilds[indGuild].categories[i].channels[j].ID, "木更津22s統合管理BOTの操作により削除");
                            //対応ロール存在時にロール削除
                            if (ccconfig.guilds[indGuild].categories[i].channels[j].thereRole)
                            {
                                await interaction.guild.roles.delete (ccconfig.guilds[indGuild].categories[i].channels[j].roleID, "木更津22s統合管理BOTの操作により削除");
                            }
                        }
                        catch(e)
                        {
                            console.log(e);
                        }

                    }
                }
            }
            //ccconfigからカテゴリの情報を削除
            ccconfig.guilds[indGuild] =
                            {
                                ID: interaction.guild.id,
                                categories: [{ID:"0000000000000000000",name:"キャンセル",allowRole:false,channels:[]}]
                            };
            //jsonに書き込み
                const ccjson = JSON.stringify (ccconfig);
                try
                {
                    fs.writeFileSync ("CCConfig.json", ccjson, "utf8");
                } catch (e)
                {
                    console.log (e);
                    await interaction.update({content:"データの保存に失敗しました\nやり直してください",components:[]});
                    return;
                }

                await interaction.update({content:"削除しました",components:[]});
        }
        //キャンセル選択時
        else if(interaction.values[0].split("/")[0]==="0000000000000000000")
        {
            await interaction.update({content:"キャンセルされました",components:[]})
        }
        //個別削除時
        else
        {
            //選択されたカテゴリのインデックスを取得
            let indCategory=-1
            for(let i = 1; i <ccconfig.guilds[indGuild].categories.length; i++)
            {
                if(ccconfig.guilds[indGuild].categories[i].ID===interaction.values[0].split("/")[0])indCategory=i;
            }
            if(indCategory===-1)
            {
                await interaction.update ({content:"データエラーです\nやり直してください",components:[]});
                return;
            }

            //チャンネルとロールの削除時
            if(interaction.values[0].split("/")[1]==="t")
            {
                for(let i=1;i<ccconfig.guilds[indGuild].categories[indCategory].channels.length;i++)
                {
                    //エラー起きそうだから(以下略
                    try
                    {
                        //カテゴリ内のチャンネル削除
                        await interaction.guild.channels.delete (ccconfig.guilds[indGuild].categories[indCategory].channels[i].ID, "木更津22s統合管理BOTの操作により削除");
                        //対応するロールが存在するときにロールを削除
                        if (ccconfig.guilds[indGuild].categories[indCategory].channels[i].thereRole)
                        {
                            await interaction.guild.roles.delete (ccconfig.guilds[indGuild].categories[indCategory].channels[i].roleID, "木更津22s統合管理BOTの操作により削除");
                        }
                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                }
            }
            //ccconfigから当該カテゴリの情報をまるまる削除
            ccconfig.guilds[indGuild].categories.splice(indCategory,1);

            //jsonに書き込み
                const ccjson = JSON.stringify (ccconfig);
                try
                {
                    fs.writeFileSync ("CCConfig.json", ccjson, "utf8");
                } catch (e)
                {
                    console.log (e);
                    await interaction.update({content:"データの保存に失敗しました\nやり直してください",components:[]});
                    return;
                }

                await interaction.update({content:"削除しました",components:[]});
        }
    }
});

/*TxtEasterEgg*/
client.on('messageCreate', message => {
    TxtEasterEgg.func(message);
})

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
                    value: '風魔龍・トワリン、アンドリアス、「公子」、若陀龍王、「淑女」、禍津御建鳴神命、七葉寂照秘密主の報酬が再度受け取れるようになりました。\nまた、樹脂半減回数がリセットされました。',
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
                {
                    name: '​\n七聖召喚ウィークリーゲスト対戦リセット',
                    value: '七聖召喚のウィークリーゲスト対戦がリセットされました\n',
                }
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
    //timetable == trueのとき
    let timetable = JSON.parse(await fs.promises.readFile(config.configPath, "utf-8")).timetable
    if(timetable === true) {
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
    }
});

cron.schedule('*/1  * * * *', async () => {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    const dashboardGuild = client.guilds.cache.get(data.dashboard[2]); /*ギルド情報取得*/
    const channel = client.channels.cache.get(data.dashboard[1]); /*チャンネル情報取得*/
    const field = await dashboard.generation(dashboardGuild); /*フィールド生成*/
    channel.messages.fetch(data.dashboard[0])
        .then((dashboard) => {
            const newEmbed = new EmbedBuilder()
                .setColor(0x00A0EA)
                .setTitle('NIT,Kisarazu College 22s ダッシュボード')
                .setAuthor({
                    name: "木更津22s統合管理BOT",
                    iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                    url: 'https://github.com/NITKC22s/bot-main'
                })
                .addFields(field)
                .setTimestamp()
                .setFooter({text: 'Developed by NITKC22s server Admin'});

            dashboard.edit({embeds: [newEmbed]});
        })
        .catch((error) => {
            console.error(`メッセージID ${messageId} のダッシュボードを取得できませんでした: ${error}`);
        });
});


client.login(config.token);
