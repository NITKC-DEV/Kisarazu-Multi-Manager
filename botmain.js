const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, SlashCommandBuilder, Events,Message,ActionRowBuilder,StringSelectMenuBuilder} = require('discord.js');
const config = require('./environmentConfig')
let ccconfig=require("./CCConfig.json");
const timetableBuilder  = require('./timetable/timetableUtils');
const Classes = require('./timetable/timetables.json');

const TxtEasterEgg = require('./functions/TxtEasterEgg.js');
const genshin = require('./functions/genshin.js');
const ryoshoku = require('./functions/ryoshoku.js')

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
require('date-utils');
require("./package.json");
dotenv.config();
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
    genshin.func(client.channels.cache.get(config.daily));
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

//寮食前半後半通知
cron.schedule('28 7 1 * *', () => {
    if(config.ryoshoku){
        ryoshoku.ryoshokuNotice(client.channels.cache.get(config.ryou));
    }
});


client.login(config.token);
