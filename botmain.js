const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    Events,
} = require('discord.js');
const timetableBuilder = require('./timetable/timetableUtils');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const CreateChannel = require("./functions/CreateChannel.js");
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
const Classes = require('./timetable/timetables.json');
const {configPath} = require("./environmentConfig");


//関数読み込み
const TxtEasterEgg = require('./functions/TxtEasterEgg.js');
const birthday = require('./functions/birthday.js');
const dashboard = require('./functions/dashboard.js');
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
client.once("ready", async() => {
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
    if(flag === 1) {
        if(!interaction.isCommand()) {
            return;
        }
        const command = interaction.client.commands.get(interaction.commandName);
        
        if(!command) return;
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
                const reply = await interaction.editReply({
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
})

/*誕生日通知*/
cron.schedule('0 0 * * *', () => {
    birthday.func();
    system.log('誕生日お祝い！');
});

/*原神デイリー通知*/
cron.schedule('0 5 * * *', () => {
    genshin.daily();
    system.log('デイリー通知送信完了');
});

/*天気キャッシュ取得*/
cron.schedule('5 5,11,17 * * *', async() => {
    await weather.update()
});


/*時間割*/
cron.schedule('0 20 * * 0,1,2,3,4', async() => {
    let dayOfWeek = new Date().getDay() + 1;
    //timetable == trueのとき
    let timetable = JSON.parse(await fs.promises.readFile(config.configPath, "utf-8")).timetable
    if(timetable === true) {
        (await (client.channels.cache.get(config.M) ?? await client.channels.fetch(config.M))
            .send({embeds: [timetableBuilder(Classes.M, dayOfWeek)]}));
        (await (client.channels.cache.get(config.E) ?? await client.channels.fetch(config.E))
            .send({embeds: [timetableBuilder(Classes.E, dayOfWeek)]}));
        (await (client.channels.cache.get(config.D) ?? await client.channels.fetch(config.D))
            .send({embeds: [timetableBuilder(Classes.D, dayOfWeek)]}));
        (await (client.channels.cache.get(config.J) ?? await client.channels.fetch(config.J))
            .send({embeds: [timetableBuilder(Classes.J, dayOfWeek)]}));
        (await (client.channels.cache.get(config.C) ?? await client.channels.fetch(config.C))
            .send({embeds: [timetableBuilder(Classes.C, dayOfWeek)]}));
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

cron.schedule('*/1  * * * *', async() => {
    
    const data = await db.find("main", "guildData", {board: {$nin: ["0000000000000000000"]}});
    if(data.length === 0) {
        system.warn("ダッシュボードの自動更新対象がありません。");
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