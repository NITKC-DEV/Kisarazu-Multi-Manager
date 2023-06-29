const { Client, GatewayIntentBits, Partials, Collection, Events} = require('discord.js');
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
const config = require('./environmentConfig.js')
const {configPath} = require("./environmentConfig.js");

//関数読み込み
const TxtEasterEgg = require('./functions/TxtEasterEgg.js');
const birthday = require('./functions/birthday.js');
const dashboard = require('./functions/dashboard.js');
const timetable = require('./functions/ttGeneration.js');
const system = require('./functions/logsystem.js');
const genshin = require('./functions/genshin.js');
const db = require('./functions/db.js');
const weather = require('./functions/weather.js');
const guildData = require("./functions/guildDataSet.js");
const {ID_NODATA} = require("./functions/guildDataSet.js");
const CreateChannel = require("./functions/CCFunc.js");
const mode = require("./functions/status&mode.js");

//スラッシュコマンド登録
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
module.exports = client.commands;
client.once("ready", async() => {
    await mode.status(2,"BOT起動処理");
    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        for(let i = 0; i < command.length; i++) {
            client.commands.set(command[i].data.name, command[i]);
        }
    }
    await weather.update(); //天気更新
    await CreateChannel.dataCheck();
    await system.log("Ready!");
    await mode.status(0,"BOT起動完了");
});

/*command処理*/
client.on("interactionCreate", async(interaction) => {
    let flag = 0;
    if(JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
        for(let i = 0; i < config.sugoiTsuyoiHitotachi.length; i++) {
            if(config.sugoiTsuyoiHitotachi[i] === interaction.user.id) flag = 1;
        }
    }
    else {
        flag = 1;
    }

    if(flag === 1){
        if (!interaction.isCommand()) {
            return;
        }
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;
        await system.log(command.data.name, "SlashCommand");
        try {
            await command.execute(interaction);
        }
        catch(error) {
            await system.error("スラッシュコマンド実行時エラー : " + command.data.name, error);
            try {
                await interaction.reply({content: 'おっと、想定外の事態が起きちゃった。管理者に連絡してくれ。', ephemeral: true});
            }
            catch {
                await interaction.editReply({
                    content: 'おっと、想定外の事態が起きちゃった。管理者に連絡してくれ。',
                    ephemeral: true
                });
                //await reply.reactions.removeAll();
                //なんかエラー吐くのでとりあえずコメントアウト
            }
        }
    }
    else {
        await interaction.reply({
            content: '現在メンテナンスモード中につき、BOTは無効化されています。\nメンテナンスの詳細は各サーバーのアナウンスチャンネルをご覧ください。',
            ephemeral: true
        });
        const interactionTypeName = ["Ping","ApplicationCommand","MessageComponent","ApplicationCommandAutocomplete","ModalSubmit"];
        await system.log(`メンテナンスモードにつき${interactionTypeName[interaction.type-1]}をブロックしました。`, `${interactionTypeName[interaction.type-1]}をブロック`);
    }
});

//StringSelectMenu受け取り
client.on(Events.InteractionCreate, async interaction => {
    if(interaction.isStringSelectMenu()) {
        if(interaction.customId === "createChannel") {
            await CreateChannel.createChannel(interaction);
        }
        else if(interaction.customId === "createRole") {
            await CreateChannel.createRole(interaction);
        }
        else if(interaction.customId === "removeCategory") {
            await CreateChannel.removeCategory(interaction);
        }
        else if(interaction.customId === "selectDelete") {
            await CreateChannel.selectDelete(interaction);
        }
        //timetable用 customIDに引数を埋め込むため、一致で検索
        else if((interaction.customId.match(/changeTimetableSelectMenu/) ?? {index:false}).index > 0){
            await timetable.setNewTimetableData(interaction);
        }
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

//チャンネル(カテゴリ)削除検知
client.on(Events.ChannelDelete,async channel=>{
    if(channel.type===0){
        await CreateChannel.removeDeletedChannelData(channel);
    }
    else if(channel.type===4){
        await CreateChannel.removeDeletedCategoryData(channel);
    }
});

//チャンネル(カテゴリ)情報変更検知
client.on(Events.ChannelUpdate,async channel=>{
    if(channel.type===0) {
        await CreateChannel.updateChannelData(channel);
    }
    else if(channel.type===4){
        await CreateChannel.updateCategoryData(channel);
    }
});

//ロール削除検知
client.on(Events.GuildRoleDelete,async role => {
    await CreateChannel.removeDeletedRoleData(role);
});

//ロール情報変更検知
client.on(Events.GuildRoleUpdate, async role => {
    await CreateChannel.updateRoleData(role);
});

//ギルド削除(退出)検知
client.on(Events.GuildDelete,async guild =>{
    await CreateChannel.deleteGuildData(guild);
});

/*TxtEasterEgg*/
client.on('messageCreate', message => {
    /*メンテナンスモード*/
    let flag = 0;
    if(JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
        for(let i = 0; i < config.sugoiTsuyoiHitotachi.length; i++) {
            if(config.sugoiTsuyoiHitotachi[i] === message.author.id) flag = 1;
        }
        if(config.client === message.author.id) {
            flag = 1;
        }
    }
    else {
        flag = 1;
    }
    
    if(flag !== 0) {
        TxtEasterEgg.func(message);
    }
});



/*メンテナンスモード*/
cron.schedule('59 4 * * *', async () => {
    await guildData.checkGuild();
    await timetable.deleteData();
});

/*原神デイリー通知*/
cron.schedule('0 5 * * *', async () => {
    await genshin.daily();
    await system.log('デイリー通知送信完了');
});

/*天気キャッシュ取得*/
cron.schedule('5 5,11 * * *', async () => {
    await weather.update();
});

cron.schedule('5 17 * * *', async () => {
    await weather.update();
    await weather.catcheUpdate();
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
            const embed = [];
            if(0 < grade && grade < 6 ){
                for(let j= 0;j < 5; j++){
                    embed[j] = await timetable.generation(String(grade),String(j+1),String(dayOfWeek+1),true);
                }
                try{if(embed[0]!==0 && guildData[i].mChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].mChannel) ?? await client.channels.fetch(guildData[i].mChannel)).send({embeds:[embed[0]]})}catch{}
                try{if(embed[1]!==0 && guildData[i].eChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].eChannel) ?? await client.channels.fetch(guildData[i].eChannel)).send({embeds:[embed[1]]})}catch{}
                try{if(embed[2]!==0 && guildData[i].dChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].dChannel) ?? await client.channels.fetch(guildData[i].dChannel)).send({embeds:[embed[2]]})}catch{}
                try{if(embed[3]!==0 && guildData[i].jChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].jChannel) ?? await client.channels.fetch(guildData[i].jChannel)).send({embeds:[embed[3]]})}catch{}
                try{if(embed[4]!==0 && guildData[i].cChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].cChannel) ?? await client.channels.fetch(guildData[i].cChannel)).send({embeds:[embed[4]]})}catch{}
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
cron.schedule('15 17 * * *', async() => {
    const embed = await weather.generationDay(1);
    const data = await db.find("main", "guildData", {main: {$nin: [ID_NODATA]}});
    for(let i = 0; i < data.length; i++) {
        if(data[i].weather) {
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
    for(let i = 0; i < data.length; i++) {
        let flag = 0;
        if(JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
            if(config.devServer === data[i].guild) {
                flag = 1;
            }
        }
        else {
            flag = 1;
        }
        
        if(flag === 1) {
            const dashboardGuild = client.guilds.cache.get(data[i].guild); /*ギルド情報取得*/
            const channel = client.channels.cache.get(data[i].boardChannel); /*チャンネル情報取得*/
            const newEmbed = await dashboard.generation(dashboardGuild); /*フィールド生成*/
            channel.messages.fetch(data[i].board)
                .then((dashboard) => {
                    dashboard.edit({embeds: [newEmbed]});
                })
                .catch(async(error) => {
                    await system.error(`メッセージID ${data[i].board} のダッシュボードを取得できませんでした`, error);
                    await db.update("main", "guildData", {channel: data[i].channel}, {
                        $set: {
                            boardChannel: "0000000000000000000",
                            board: "0000000000000000000"
                        }
                    });
                });
        }
    }
});

if(require.main === module) {
    client.login(config.token);
}
