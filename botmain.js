const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder,  Events,ActionRowBuilder,StringSelectMenuBuilder} = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
dotenv.config();
require('date-utils');
global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Channel],
});

//configファイル読み込み
const config = require('./environmentConfig')
let ccconfig=require("./CCConfig.json");


//関数読み込み
const TxtEasterEgg = require('./functions/TxtEasterEgg.js');
const birthday = require('./functions/birthday.js');
const dashboard = require('./functions/dashboard.js');
const timetable = require('./functions/ttGeneration.js');
const system = require('./functions/logsystem.js');
const genshin = require('./functions/genshin.js');
const db = require('./functions/db.js');
const weather = require('./functions/weather.js');
const {ID_NODATA} = require("./functions/guildDataSet.js");



//スラッシュコマンド登録
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
module.exports = client.commands;
client.once("ready", async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        for (let i = 0; i < command.length; i++) {
            client.commands.set(command[i].data.name, command[i]);
        }

    }
    await system.log("Ready!");
    await weather.update(); //天気更新
});

/*command処理*/
client.on("interactionCreate", async (interaction) => {
    let flag = 0;
    if(JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
        for(let i = 0;i < config.sugoiTsuyoiHitotachi.length;i++){
            if(config.sugoiTsuyoiHitotachi[i]===interaction.user.id)flag = 1;
        }
    }
    else{
        flag = 1;
    }
    if(flag === 1){
        if (!interaction.isCommand()) {
            return;
        }
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;
        system.log(command.data.name,"SlashCommand");
        try {
            await command.execute(interaction);
        } catch (error) {
            await system.error("スラッシュコマンド実行時エラー : " + command.data.name,error);
            try{
                await interaction.reply({ content: 'おっと、想定外の事態が起きちゃった。管理者に連絡してくれ。', ephemeral: true });
            } catch{
                const reply = await interaction.editReply({ content: 'おっと、想定外の事態が起きちゃった。管理者に連絡してくれ。', ephemeral: true });
                await reply.reactions.removeAll()
            }
        }}
    else{
        await interaction.reply({ content: '現在メンテナンスモード中につき、BOTは無効化されています。\nメンテナンスの詳細は各サーバーのアナウンスチャンネルをご覧ください。', ephemeral: true });
    }
});

//Button入力受け取り
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    //timetable用 customIDに引数を埋め込むため、一致で検索
    if((interaction.customId.match(/changeTimetableButton/) ?? {index:false}).index > 0){
        await timetable.showNewTimetableModal(interaction);
    }
});

//SelectMenu受け取り
client.on(Events.InteractionCreate, async interaction =>{
    if (!interaction.isStringSelectMenu()) return;

    //timetable用 customIDに引数を埋め込むため、一致で検索
    if((interaction.customId.match(/changeTimetableSelectMenu/) ?? {index:false}).index > 0){
        await timetable.setNewTimetableData(interaction);
    }

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
                system.log (e);
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
                system.log (e);
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
                system.log (e);
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
        const indGuild=ccconfig.guilds.findIndex(guild=>guild.ID===interaction.guildId);
        //存在し得ないはず...念のため
        if(!indGuild)
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
                            system.log(e);
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
                system.log (e);
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
            const indCategory=ccconfig.guilds[indGuild].categories.findIndex(cat=>cat.ID===interaction.values[0].split("/")[0]);
            if(!indCategory)
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
                        system.log(e);
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
                system.log (e);
                await interaction.update({content:"データの保存に失敗しました\nやり直してください",components:[]});
                return;
            }

            await interaction.update({content:"削除しました",components:[]});
        }
    }
});

/*TxtEasterEgg*/
client.on('messageCreate', message => {
    /*メンテナンスモード*/
    let flag = 0;
    if(JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
        for(let i = 0;i < config.sugoiTsuyoiHitotachi.length;i++){
            if(config.sugoiTsuyoiHitotachi[i] === message.author.id)flag = 1;
        }
        if(config.client === message.author.id){
            flag = 1;
        }
    }
    else{
        flag = 1;
    }

    if(flag !== 0){
        TxtEasterEgg.func(message);
    }
})

/*誕生日通知*/
cron.schedule('0 0 * * *', async () => {
    await birthday.func();
    await system.log('誕生日お祝い！');
});

/*原神デイリー通知*/
cron.schedule('0 5 * * *', async () => {
    await genshin.daily();
    await system.log('デイリー通知送信完了');
});

/*天気キャッシュ取得*/
cron.schedule('5 5,11,17 * * *', async () => {
    await weather.update()
});


/*時間割*/
cron.schedule('0 20 * * 0,1,2,3,4', async () => {
    const guildData = await db.find("main","guildData",{});
    const date = new Date();
    const year = date.getFullYear();
    const dayOfWeek = date.getDay();

    for(let i = 0; i < guildData.length; i++){
        if(guildData[i].timetable === true){
            const grade = year - parseFloat(guildData[i].grade) + 1;
            let embed = [];
            if(0 < grade && grade < 6 ){
                for(let j= 0;j < 5; j++){
                    embed[j] = await timetable.generation(String(grade),String(j+1),String(dayOfWeek+1),true);
                }
                try{if(embed[0]!==0)await (client.channels.cache.get(guildData[i].mChannel) ?? await client.channels.fetch(guildData[i].mChannel)).send({embeds:[embed[0]]})}catch{}
                try{if(embed[1]!==0)await (client.channels.cache.get(guildData[i].eChannel) ?? await client.channels.fetch(guildData[i].eChannel)).send({embeds:[embed[1]]})}catch{}
                try{if(embed[2]!==0)await (client.channels.cache.get(guildData[i].dChannel) ?? await client.channels.fetch(guildData[i].dChannel)).send({embeds:[embed[2]]})}catch{}
                try{if(embed[3]!==0)await (client.channels.cache.get(guildData[i].jChannel) ?? await client.channels.fetch(guildData[i].jChannel)).send({embeds:[embed[3]]})}catch{}
                try{if(embed[4]!==0)await (client.channels.cache.get(guildData[i].cChannel) ?? await client.channels.fetch(guildData[i].cChannel)).send({embeds:[embed[4]]})}catch{}
            }
            else{
                try{
                    await client.channels.cache.get(guildData[i].main).send("このサーバーの学年の設定をしていない、または正しくないため、時間割定期通知に失敗しました。" +
                        "\n設定していない場合は、管理者が/guildDataコマンドを使用して設定してください。" +
                        "\n設定している場合、学年ではなく「入学年」を西暦4ケタで入力しているかどうか確認してください。" +
                        "\n(この通知をOFFにするには、/tt-switcherコマンドを実行してください。)")
                }
                catch{}
            }
        }
    }
});

/*天気*/
cron.schedule('15 17 * * *', async () => {
    const embed = await weather.generationDay(1);
    const data = await db.find("main","guildData",{main:{$nin:[ID_NODATA]}});
    for(let i = 0; i < data.length; i++) {
        if(data[i].weather){
            const channel = await client.channels.fetch(data[i].main);
            await channel.send({embeds: [embed]});
        }
    }
});

cron.schedule('*/1  * * * *', async () => {

    const data = await db.find("main","guildData",{board: {$nin:["0000000000000000000"]}});
    if(data.length === 0){
        await system.warn("ダッシュボードの自動更新対象がありません。");
    }
    for(let i=0;i<data.length;i++){
        let flag = 0;
        if(JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
            if(config.devServer === data[i].guild){
                flag = 1;
            }
        }
        else{
            flag = 1;
        }

        if(flag === 1){
            const dashboardGuild = client.guilds.cache.get(data[i].guild); /*ギルド情報取得*/
            const channel = client.channels.cache.get(data[i].boardChannel); /*チャンネル情報取得*/
            const newEmbed = await dashboard.generation(dashboardGuild); /*フィールド生成*/
            channel.messages.fetch(data[i].board)
                .then((dashboard) => {
                    dashboard.edit({embeds: [newEmbed]});
                })
                .catch(async (error) => {
                    await system.error(`メッセージID ${data[i].board} のダッシュボードを取得できませんでした`,error);
                    await db.update("main", "guildData", {channel: data[i].channel},{
                        $set:{
                            boardChannel: "0000000000000000000",
                            board: "0000000000000000000"
                        }});
                });
        }
    }

});

if (require.main === module){
    client.login(config.token);
}
