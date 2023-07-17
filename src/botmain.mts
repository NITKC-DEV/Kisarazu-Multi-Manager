import {Client, GatewayIntentBits, Partials, Collection, Events} from "discord.js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import cron from "node-cron";

dotenv.config();
import "date-utils";

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
import {config} from "./environmentConfig.mjs";
import {configPath} from "./environmentConfig.mjs";

//関数読み込み
import * as TxtEasterEgg from "./functions/TxtEasterEgg.mjs";
import * as birthday from "./functions/birthday.mjs";
import * as dashboard from "./functions/dashboard.mjs";
import * as timetable from "./functions/ttGeneration.mjs";
import * as system from "./functions/logsystem.mjs";
import * as genshin from "./functions/genshin.mjs";
import * as db from "./functions/db.mjs";
import * as weather from "./functions/weather.mjs";
import * as guildData from "./functions/guildDataSet.mjs";
import {ID_NODATA} from "./functions/guildDataSet.mjs";
import * as CreateChannel from "./functions/CCFunc.mjs";
import * as mode from "./functions/statusAndMode.mjs";
import * as statusAndMode from "./functions/statusAndMode.mjs";
import * as help from "./functions/help.mjs";
import {fileURLToPath} from "url";
import esMain from "es-main";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
//スラッシュコマンド登録
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.mjs'));

client.commands = new Collection();

export default client.commands;
client.once("ready", async() => {
    await mode.maintenance(true);
    await mode.status(2,"BOT起動処理");
    for(const file of commandFiles) {
        const filePath = `file://${path.join(commandsPath, file)}`;
        await import(filePath).then((command) => {
            const defaults = command.default;
            for (const commandData of defaults) {
                client.commands.set(commandData.data.name, commandData);
            }
        })
    }
    await weather.update(); //天気更新
    await CreateChannel.dataCheck();
    // @ts-ignore 引数足りない
    await system.log("Ready!");
    if(config.maintenanceMode){
        await statusAndMode.status(2,"BOTメンテナンス");
    }
    else{
        await mode.maintenance(false);
        await mode.status(0,"BOT起動完了");
    }
});

/*command処理*/
client.on("interactionCreate", async (interaction: any) => {
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
        let guild,channel;
        if(!interaction.guildId) {
            guild = {name:"ダイレクトメッセージ",id:"---"};
            channel = {name:"---",id:"---"};
        }
        else{
            guild = client.guilds.cache.get(interaction.guildId) ?? (await client.guilds.fetch(interaction.guildId));
            channel = client.channels.cache.get(interaction.channelId) ?? (await client.channels.fetch(interaction.channelId));
        }
        // @ts-ignore channelがnullになる場合がある
        await system.log(`コマンド名:${command.data.name}\`\`\`\nギルド　　：${guild.name}\n(ID:${guild.id})\n\nチャンネル：${channel.name}\n(ID:${channel.id})\n\nユーザ　　：${interaction.user.username}#${interaction.user.discriminator}\n(ID:${interaction.user.id})\`\`\``, "SlashCommand");
        try {
            await command.execute(interaction);
        }
        catch(error) {
            // @ts-ignore channelがnullになる場合がある
            await system.error(`スラッシュコマンド実行時エラー : ${command.data.name}\n\`\`\`\nギルド　　：${guild.name}\n(ID:${guild.id})\n\nチャンネル：${channel.name}\n(ID:${channel.id})\n\nユーザ　　：${interaction.user.username}#${interaction.user.discriminator}\n(ID:${interaction.user.id})\`\`\``, error);
            try {
                await interaction.reply({content: 'おっと、想定外の事態が起きちゃった。[Issue](https://github.com/NITKC-DEV/Kisarazu-Multi-Manager/issues)に連絡してくれ。', ephemeral: true});
            }
            catch {
                try{
                    await interaction.editReply({
                        content: 'おっと、想定外の事態が起きちゃった。[Issue](https://github.com/NITKC-DEV/Kisarazu-Multi-Manager/issues)に連絡してくれ。',
                        ephemeral: true
                    });
                }
                catch{} //edit先が消えてる可能性を考えてtryに入れる
            }
        }
    }
    else {
        await interaction.reply({
            content: '現在メンテナンスモード中につき、BOTは無効化されています。\nメンテナンスの詳細は各サーバーのアナウンスチャンネルをご覧ください。',
            ephemeral: true
        });
        const interactionTypeName = ["Ping","ApplicationCommand","MessageComponent","ApplicationCommandAutocomplete","ModalSubmit"];
        let guild,channel;
        if(!interaction.guildId) {
            guild = {name:"ダイレクトメッセージ",id:"---"};
            channel = {name:"---",id:"---"};
        }
        else{
            guild = client.guilds.cache.get(interaction.guildId) ?? (await client.guilds.fetch(interaction.guildId));
            channel = client.channels.cache.get(interaction.channelId) ?? (await client.channels.fetch(interaction.channelId));
        }
        // @ts-ignore channelがnullになる場合がある
        await system.log(`メンテナンスモードにつき${interactionTypeName[interaction.type-1]}をブロックしました。\`\`\`\nギルド　　：${guild.name}\n(ID:${guild.id})\n\nチャンネル：${channel.name}\n(ID:${channel.id})\n\nユーザ　　：${interaction.user.username}#${interaction.user.discriminator}\n(ID:${interaction.user.id})\`\`\``, `${interactionTypeName[interaction.type-1]}をブロック`);
    }
});

//StringSelectMenu受け取り
client.on(Events.InteractionCreate, async (interaction: any) => {
    if(interaction.isStringSelectMenu()) {
        let flag = 0;
        if(JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
            for(let i = 0; i < config.sugoiTsuyoiHitotachi.length; i++) {
                if(config.sugoiTsuyoiHitotachi[i] === interaction.user.id) flag = 1;
            }
        }
        else {
            flag = 1;
        }
        if(flag === 0) return;

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
        else if (interaction.customId === "adminHelp"){
            await help.adminHelpDisplay(interaction);
        }
        else if (interaction.customId === "help"){
            await help.helpDisplay(interaction);
        }
    }
});

//Button入力受け取り
client.on(Events.InteractionCreate, async (interaction: any) => {
    if (!interaction.isButton()) return;
    let flag = 0;
    if(JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
        for(let i = 0; i < config.sugoiTsuyoiHitotachi.length; i++) {
            if(config.sugoiTsuyoiHitotachi[i] === interaction.user.id) flag = 1;
        }
    }
    else {
        flag = 1;
    }
    if(flag === 0) return;

    //timetable用 customIDに引数を埋め込むため、一致で検索
    if((interaction.customId.match(/changeTimetableButton/) ?? {index:false}).index > 0){
        await timetable.showNewTimetableModal(interaction);
    }
});

//チャンネル(カテゴリ)削除検知
client.on(Events.ChannelDelete,async (channel: any) => {
    if(channel.type===0){
        await CreateChannel.removeDeletedChannelData(channel);
    }
    else if(channel.type===4){
        await CreateChannel.removeDeletedCategoryData(channel);
    }
});

//チャンネル(カテゴリ)情報変更検知
client.on(Events.ChannelUpdate,async (channel: any) => {
    if(channel.type===0) {
        await CreateChannel.updateChannelData(channel);
    }
    else if(channel.type===4){
        await CreateChannel.updateCategoryData(channel);
    }
});

//ロール削除検知
client.on(Events.GuildRoleDelete,async (role: any) => {
    await CreateChannel.removeDeletedRoleData(role);
});

//ロール情報変更検知
client.on(Events.GuildRoleUpdate, async (role: any) => {
    await CreateChannel.updateRoleData(role);
});

client.on(Events.GuildCreate,async (guild: any) => {
    await guildData.updateOrInsert(guild.id);
});

//ギルド削除(退出)検知
client.on(Events.GuildDelete,async (guild: any) => {
    await CreateChannel.deleteGuildData(guild);
    await guildData.checkGuild();
});

/*TxtEasterEgg*/
client.on('messageCreate', (message: any) => {
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

/*ステータス更新*/
cron.schedule('* * * * *', async () => {
    if(JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === false) {
        const date = new Date();
        const time = Math.floor(date.getTime() / 1000 / 60)%6
        switch(time){
            case 1:
                await mode.status(0,`ヘルプ：/help`);
                break;
            case 2:
                await mode.status(0,`時間割：/timetable`);
                break;
            case 3:
                await mode.status(0,`天気：/weather`);
                break;
            case 4:
                await mode.status(0,`匿名投稿：/secret-msg`);
                break;
            case 5:
                await mode.status(0,`チャンネル作成：/create-channel`);
                break;
            default:
                await mode.status(0,`導入数：${client.guilds.cache.size}サーバー`);
        }
    }

});

/*誕生日通知とGuildDataチェック、時間割変更データチェック*/
cron.schedule('0 0 * * *', async () => {
    await birthday.func();
    await weather.update();
    await weather.catcheUpdate();
});

/*メンテナンスモード*/
cron.schedule('59 4 * * *', async () => {
    await mode.maintenance(true);
    await guildData.checkGuild();
    await timetable.deleteData();
    await mode.maintenance(false);
});

/*原神デイリー通知*/
cron.schedule('0 5 * * *', async () => {
    // @ts-ignore 引数が足りない
    await genshin.daily();
    // @ts-ignore 引数が足りない
    await system.log('デイリー通知送信完了');
});

/*天気キャッシュ取得*/
cron.schedule('5 5,11,17 * * *', async () => {
    await weather.update();
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
// @ts-ignore
                try{if(embed[0]!==0 && guildData[i].mChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].mChannel) ?? (await client.channels.fetch(guildData[i].mChannel))).send({embeds:[embed[0]]})}catch{}
// @ts-ignore
                try{if(embed[1]!==0 && guildData[i].eChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].eChannel) ?? (await client.channels.fetch(guildData[i].eChannel))).send({embeds:[embed[1]]})}catch{}
// @ts-ignore
                try{if(embed[2]!==0 && guildData[i].dChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].dChannel) ?? (await client.channels.fetch(guildData[i].dChannel))).send({embeds:[embed[2]]})}catch{}
// @ts-ignore
                try{if(embed[3]!==0 && guildData[i].jChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].jChannel) ?? (await client.channels.fetch(guildData[i].jChannel))).send({embeds:[embed[3]]})}catch{}
// @ts-ignore
                try{if(embed[4]!==0 && guildData[i].cChannel!==ID_NODATA)await (client.channels.cache.get(guildData[i].cChannel) ?? (await client.channels.fetch(guildData[i].cChannel))).send({embeds:[embed[4]]})}catch{}
            }
            else{
                try{
// @ts-ignore
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
cron.schedule('00 20 * * *', async() => {
    const embed = await weather.generationDay(1);
    const data = await db.find("main", "guildData", {weather: true});
    for(let i = 0; i < data.length; i++) {
        try{
// @ts-ignore
            const channel = (client.channels.cache.get(data[i].weatherChannel) ?? (await client.channels.fetch(data[i].weatherChannel)));
// @ts-ignore
            await channel.send({embeds: [embed]});
        }
        catch{}
    }
});

cron.schedule('*/1  * * * *', async () => {

    const data = await db.find("main","guildData",{board: {$nin:["0000000000000000000"]}});
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
        
        if(flag === 1 && data[i].boardChannel !== ID_NODATA) {
            let dashboardGuild: any;
            try{
                dashboardGuild = (client.guilds.cache.get(data[i].guild) ?? (await client.guilds.fetch(data[i].guild))); /*ギルド情報取得*/
                const channel = (client.channels.cache.get(data[i].boardChannel) ?? (await client.channels.fetch(data[i].boardChannel))); /*チャンネル情報取得*/
                const newEmbed = await dashboard.generation(dashboardGuild); /*フィールド生成*/
                if(newEmbed){
                    // @ts-ignore channelがnullになる場合がある
                    channel.messages.fetch(data[i].board)
                        .then(async (dashboard: any) => {
                            await dashboard.edit({embeds: [newEmbed]});
                        })
                        .catch(async (error: any) => {
                            if(error.code === 10008 || error.code === 10003){ //メッセージかチャンネルが不明
                                await system.error(`元メッセージ・チャンネル削除により${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードを取得できませんでした`, error);
                                await db.update("main", "guildData", {guild: data[i].guild}, {
                                    $set: {
                                        boardChannel: "0000000000000000000",
                                        board: "0000000000000000000"
                                    }
                                });
                            }
                            else{
                                await system.error(`${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードを何らかの理由で取得できませんでした`, error);
                            }

                        });
                }
                else{
                    await guildData.checkGuild();
                }
            }
            catch(error: any){
                if(error.code === 10008 || error.code === 10003){ //メッセージかチャンネルが不明
                    await system.error(`元メッセージ・チャンネル削除により${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードを取得できませんでした`, error);
                    await db.update("main", "guildData", {guild: data[i].guild}, {
                        $set: {
                            boardChannel: "0000000000000000000",
                            board: "0000000000000000000"
                        }
                    });
                }
                else if(error.code === 10004){
                    await system.error(`ギルド削除 または退出により${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードを取得できませんでした`, error);
                    await guildData.checkGuild();
                }
                else{
                    await system.error(`${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードがあるチャンネルを何らかの理由で取得できませんでした`, error);
                }
            }
        }
    }
});

if (esMain(import.meta)) {
    client.login(config.token);
} else {
    console.log("err")
}
