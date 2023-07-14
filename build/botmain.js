"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { Client, GatewayIntentBits, Partials, Collection, Events } = require('discord.js');
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
const config = require('./environmentConfig.js');
const { configPath } = require("./environmentConfig.js");
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
const { ID_NODATA } = require("./functions/guildDataSet.js");
const CreateChannel = require("./functions/CCFunc.js");
const mode = require("./functions/statusAndMode.js");
const statusAndMode = require("./functions/statusAndMode.js");
const help = require("./functions/help.js");
//スラッシュコマンド登録
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
module.exports = client.commands;
client.once("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    yield mode.maintenance(true);
    yield mode.status(2, "BOT起動処理");
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        for (let i = 0; i < command.length; i++) {
            client.commands.set(command[i].data.name, command[i]);
        }
    }
    yield weather.update(); //天気更新
    yield CreateChannel.dataCheck();
    yield system.log("Ready!");
    if (config.maintenanceMode === true) {
        yield statusAndMode.status(2, "BOTメンテナンス");
    }
    else {
        yield mode.maintenance(false);
        yield mode.status(0, "BOT起動完了");
    }
}));
/*command処理*/
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let flag = 0;
    if (JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
        for (let i = 0; i < config.sugoiTsuyoiHitotachi.length; i++) {
            if (config.sugoiTsuyoiHitotachi[i] === interaction.user.id)
                flag = 1;
        }
    }
    else {
        flag = 1;
    }
    if (flag === 1) {
        if (!interaction.isCommand()) {
            return;
        }
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command)
            return;
        let guild, channel;
        if (!interaction.guildId) {
            guild = { name: "ダイレクトメッセージ", id: "---" };
            channel = { name: "---", id: "---" };
        }
        else {
            guild = (_a = client.guilds.cache.get(interaction.guildId)) !== null && _a !== void 0 ? _a : yield client.guilds.fetch(interaction.guildId);
            channel = (_b = client.channels.cache.get(interaction.channelId)) !== null && _b !== void 0 ? _b : yield client.channels.fetch(interaction.channelId);
        }
        yield system.log(`コマンド名:${command.data.name}\`\`\`\nギルド　　：${guild.name}\n(ID:${guild.id})\n\nチャンネル：${channel.name}\n(ID:${channel.id})\n\nユーザ　　：${interaction.user.username}#${interaction.user.discriminator}\n(ID:${interaction.user.id})\`\`\``, "SlashCommand");
        try {
            yield command.execute(interaction);
        }
        catch (error) {
            yield system.error(`スラッシュコマンド実行時エラー : ${command.data.name}\n\`\`\`\nギルド　　：${guild.name}\n(ID:${guild.id})\n\nチャンネル：${channel.name}\n(ID:${channel.id})\n\nユーザ　　：${interaction.user.username}#${interaction.user.discriminator}\n(ID:${interaction.user.id})\`\`\``, error);
            try {
                yield interaction.reply({ content: 'おっと、想定外の事態が起きちゃった。[Issue](https://github.com/NITKC-DEV/Kisarazu-Multi-Manager/issues)に連絡してくれ。', ephemeral: true });
            }
            catch (_e) {
                try {
                    yield interaction.editReply({
                        content: 'おっと、想定外の事態が起きちゃった。[Issue](https://github.com/NITKC-DEV/Kisarazu-Multi-Manager/issues)に連絡してくれ。',
                        ephemeral: true
                    });
                }
                catch (_f) { } //edit先が消えてる可能性を考えてtryに入れる
            }
        }
    }
    else {
        yield interaction.reply({
            content: '現在メンテナンスモード中につき、BOTは無効化されています。\nメンテナンスの詳細は各サーバーのアナウンスチャンネルをご覧ください。',
            ephemeral: true
        });
        const interactionTypeName = ["Ping", "ApplicationCommand", "MessageComponent", "ApplicationCommandAutocomplete", "ModalSubmit"];
        let guild, channel;
        if (!interaction.guildId) {
            guild = { name: "ダイレクトメッセージ", id: "---" };
            channel = { name: "---", id: "---" };
        }
        else {
            guild = (_c = client.guilds.cache.get(interaction.guildId)) !== null && _c !== void 0 ? _c : yield client.guilds.fetch(interaction.guildId);
            channel = (_d = client.channels.cache.get(interaction.channelId)) !== null && _d !== void 0 ? _d : yield client.channels.fetch(interaction.channelId);
        }
        yield system.log(`メンテナンスモードにつき${interactionTypeName[interaction.type - 1]}をブロックしました。\`\`\`\nギルド　　：${guild.name}\n(ID:${guild.id})\n\nチャンネル：${channel.name}\n(ID:${channel.id})\n\nユーザ　　：${interaction.user.username}#${interaction.user.discriminator}\n(ID:${interaction.user.id})\`\`\``, `${interactionTypeName[interaction.type - 1]}をブロック`);
    }
}));
//StringSelectMenu受け取り
client.on(Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    if (interaction.isStringSelectMenu()) {
        let flag = 0;
        if (JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
            for (let i = 0; i < config.sugoiTsuyoiHitotachi.length; i++) {
                if (config.sugoiTsuyoiHitotachi[i] === interaction.user.id)
                    flag = 1;
            }
        }
        else {
            flag = 1;
        }
        if (flag === 0)
            return;
        if (interaction.customId === "createChannel") {
            yield CreateChannel.createChannel(interaction);
        }
        else if (interaction.customId === "createRole") {
            yield CreateChannel.createRole(interaction);
        }
        else if (interaction.customId === "removeCategory") {
            yield CreateChannel.removeCategory(interaction);
        }
        else if (interaction.customId === "selectDelete") {
            yield CreateChannel.selectDelete(interaction);
        }
        //timetable用 customIDに引数を埋め込むため、一致で検索
        else if (((_g = interaction.customId.match(/changeTimetableSelectMenu/)) !== null && _g !== void 0 ? _g : { index: false }).index > 0) {
            yield timetable.setNewTimetableData(interaction);
        }
        else if (interaction.customId === "adminHelp") {
            yield help.adminHelpDisplay(interaction);
        }
        else if (interaction.customId === "help") {
            yield help.helpDisplay(interaction);
        }
    }
}));
//Button入力受け取り
client.on(Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    if (!interaction.isButton())
        return;
    let flag = 0;
    if (JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
        for (let i = 0; i < config.sugoiTsuyoiHitotachi.length; i++) {
            if (config.sugoiTsuyoiHitotachi[i] === interaction.user.id)
                flag = 1;
        }
    }
    else {
        flag = 1;
    }
    if (flag === 0)
        return;
    //timetable用 customIDに引数を埋め込むため、一致で検索
    if (((_h = interaction.customId.match(/changeTimetableButton/)) !== null && _h !== void 0 ? _h : { index: false }).index > 0) {
        yield timetable.showNewTimetableModal(interaction);
    }
}));
//チャンネル(カテゴリ)削除検知
client.on(Events.ChannelDelete, (channel) => __awaiter(void 0, void 0, void 0, function* () {
    if (channel.type === 0) {
        yield CreateChannel.removeDeletedChannelData(channel);
    }
    else if (channel.type === 4) {
        yield CreateChannel.removeDeletedCategoryData(channel);
    }
}));
//チャンネル(カテゴリ)情報変更検知
client.on(Events.ChannelUpdate, (channel) => __awaiter(void 0, void 0, void 0, function* () {
    if (channel.type === 0) {
        yield CreateChannel.updateChannelData(channel);
    }
    else if (channel.type === 4) {
        yield CreateChannel.updateCategoryData(channel);
    }
}));
//ロール削除検知
client.on(Events.GuildRoleDelete, (role) => __awaiter(void 0, void 0, void 0, function* () {
    yield CreateChannel.removeDeletedRoleData(role);
}));
//ロール情報変更検知
client.on(Events.GuildRoleUpdate, (role) => __awaiter(void 0, void 0, void 0, function* () {
    yield CreateChannel.updateRoleData(role);
}));
client.on(Events.GuildCreate, (guild) => __awaiter(void 0, void 0, void 0, function* () {
    yield guildData.updateOrInsert(guild.id);
}));
//ギルド削除(退出)検知
client.on(Events.GuildDelete, (guild) => __awaiter(void 0, void 0, void 0, function* () {
    yield CreateChannel.deleteGuildData(guild);
    yield guildData.checkGuild();
}));
/*TxtEasterEgg*/
client.on('messageCreate', message => {
    /*メンテナンスモード*/
    let flag = 0;
    if (JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
        for (let i = 0; i < config.sugoiTsuyoiHitotachi.length; i++) {
            if (config.sugoiTsuyoiHitotachi[i] === message.author.id)
                flag = 1;
        }
        if (config.client === message.author.id) {
            flag = 1;
        }
    }
    else {
        flag = 1;
    }
    if (flag !== 0) {
        TxtEasterEgg.func(message);
    }
});
/*ステータス更新*/
cron.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    if (JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === false) {
        const date = new Date();
        const time = Math.floor(date.getTime() / 1000 / 60) % 6;
        switch (time) {
            case 1:
                yield mode.status(0, `ヘルプ：/help`);
                break;
            case 2:
                yield mode.status(0, `時間割：/timetable`);
                break;
            case 3:
                yield mode.status(0, `天気：/weather`);
                break;
            case 4:
                yield mode.status(0, `匿名投稿：/secret-msg`);
                break;
            case 5:
                yield mode.status(0, `チャンネル作成：/create-channel`);
                break;
            default:
                yield mode.status(0, `導入数：${client.guilds.cache.size}サーバー`);
        }
    }
}));
/*誕生日通知とGuildDataチェック、時間割変更データチェック*/
cron.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    yield birthday.func();
    yield weather.update();
    yield weather.catcheUpdate();
}));
/*メンテナンスモード*/
cron.schedule('59 4 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    yield mode.maintenance(true);
    yield guildData.checkGuild();
    yield timetable.deleteData();
    yield mode.maintenance(false);
}));
/*原神デイリー通知*/
cron.schedule('0 5 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    yield genshin.daily();
    yield system.log('デイリー通知送信完了');
}));
/*天気キャッシュ取得*/
cron.schedule('5 5,11,17 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    yield weather.update();
}));
/*時間割*/
cron.schedule('0 20 * * 0,1,2,3,4', () => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l, _m, _o;
    const guildData = yield db.find("main", "guildData", {});
    const date = new Date();
    const year = date.getFullYear();
    const dayOfWeek = date.getDay();
    for (let i = 0; i < guildData.length; i++) {
        if (guildData[i].timetable === true) {
            const grade = year - parseFloat(guildData[i].grade) + 1;
            const embed = [];
            if (0 < grade && grade < 6) {
                for (let j = 0; j < 5; j++) {
                    embed[j] = yield timetable.generation(String(grade), String(j + 1), String(dayOfWeek + 1), true);
                }
                try {
                    if (embed[0] !== 0 && guildData[i].mChannel !== ID_NODATA)
                        yield ((_j = client.channels.cache.get(guildData[i].mChannel)) !== null && _j !== void 0 ? _j : yield client.channels.fetch(guildData[i].mChannel)).send({ embeds: [embed[0]] });
                }
                catch (_p) { }
                try {
                    if (embed[1] !== 0 && guildData[i].eChannel !== ID_NODATA)
                        yield ((_k = client.channels.cache.get(guildData[i].eChannel)) !== null && _k !== void 0 ? _k : yield client.channels.fetch(guildData[i].eChannel)).send({ embeds: [embed[1]] });
                }
                catch (_q) { }
                try {
                    if (embed[2] !== 0 && guildData[i].dChannel !== ID_NODATA)
                        yield ((_l = client.channels.cache.get(guildData[i].dChannel)) !== null && _l !== void 0 ? _l : yield client.channels.fetch(guildData[i].dChannel)).send({ embeds: [embed[2]] });
                }
                catch (_r) { }
                try {
                    if (embed[3] !== 0 && guildData[i].jChannel !== ID_NODATA)
                        yield ((_m = client.channels.cache.get(guildData[i].jChannel)) !== null && _m !== void 0 ? _m : yield client.channels.fetch(guildData[i].jChannel)).send({ embeds: [embed[3]] });
                }
                catch (_s) { }
                try {
                    if (embed[4] !== 0 && guildData[i].cChannel !== ID_NODATA)
                        yield ((_o = client.channels.cache.get(guildData[i].cChannel)) !== null && _o !== void 0 ? _o : yield client.channels.fetch(guildData[i].cChannel)).send({ embeds: [embed[4]] });
                }
                catch (_t) { }
            }
            else {
                try {
                    yield client.channels.cache.get(guildData[i].main).send("このサーバーの学年の設定をしていない、または正しくないため、時間割定期通知に失敗しました。" +
                        "\n設定していない場合は、管理者が/guildDataコマンドを使用して設定してください。" +
                        "\n設定している場合、学年ではなく「入学年」を西暦4ケタで入力しているかどうか確認してください。" +
                        "\n(この通知をOFFにするには、/tt-switcherコマンドを実行してください。)");
                }
                catch (_u) { }
            }
        }
    }
}));
/*天気*/
cron.schedule('00 20 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    var _v;
    const embed = yield weather.generationDay(1);
    const data = yield db.find("main", "guildData", { weather: true });
    for (let i = 0; i < data.length; i++) {
        try {
            const channel = ((_v = client.channels.cache.get(data[i].weatherChannel)) !== null && _v !== void 0 ? _v : yield client.channels.fetch(data[i].weatherChannel));
            yield channel.send({ embeds: [embed] });
        }
        catch (_w) { }
    }
}));
cron.schedule('*/1  * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    var _x, _y;
    const data = yield db.find("main", "guildData", { board: { $nin: ["0000000000000000000"] } });
    for (let i = 0; i < data.length; i++) {
        let flag = 0;
        if (JSON.parse(fs.readFileSync(configPath, 'utf8')).maintenanceMode === true) {
            if (config.devServer === data[i].guild) {
                flag = 1;
            }
        }
        else {
            flag = 1;
        }
        if (flag === 1 && data[i].boardChannel !== ID_NODATA) {
            let dashboardGuild;
            try {
                dashboardGuild = ((_x = client.guilds.cache.get(data[i].guild)) !== null && _x !== void 0 ? _x : yield client.guilds.fetch(data[i].guild)); /*ギルド情報取得*/
                const channel = ((_y = client.channels.cache.get(data[i].boardChannel)) !== null && _y !== void 0 ? _y : yield client.channels.fetch(data[i].boardChannel)); /*チャンネル情報取得*/
                const newEmbed = yield dashboard.generation(dashboardGuild); /*フィールド生成*/
                if (newEmbed) {
                    channel.messages.fetch(data[i].board)
                        .then((dashboard) => __awaiter(void 0, void 0, void 0, function* () {
                        yield dashboard.edit({ embeds: [newEmbed] });
                    }))
                        .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
                        if (error.code === 10008 || error.code === 10003) { //メッセージかチャンネルが不明
                            yield system.error(`元メッセージ・チャンネル削除により${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードを取得できませんでした`, error);
                            yield db.update("main", "guildData", { guild: data[i].guild }, {
                                $set: {
                                    boardChannel: "0000000000000000000",
                                    board: "0000000000000000000"
                                }
                            });
                        }
                        else {
                            yield system.error(`${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードを何らかの理由で取得できませんでした`, error);
                        }
                    }));
                }
                else {
                    yield guildData.checkGuild();
                }
            }
            catch (error) {
                if (error.code === 10008 || error.code === 10003) { //メッセージかチャンネルが不明
                    yield system.error(`元メッセージ・チャンネル削除により${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードを取得できませんでした`, error);
                    yield db.update("main", "guildData", { guild: data[i].guild }, {
                        $set: {
                            boardChannel: "0000000000000000000",
                            board: "0000000000000000000"
                        }
                    });
                }
                else if (error.code === 10004) {
                    yield system.error(`ギルド削除 または退出により${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードを取得できませんでした`, error);
                    yield guildData.checkGuild();
                }
                else {
                    yield system.error(`${dashboardGuild.name}(ID:${dashboardGuild.id}) のダッシュボードがあるチャンネルを何らかの理由で取得できませんでした`, error);
                }
            }
        }
    }
}));
if (require.main === module) {
    client.login(config.token);
}
