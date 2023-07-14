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
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const cron = require('node-cron');
require('date-utils');
const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require("../env/config.json");
const devConfig = require("./config.dev.json");
const readline = require('readline');
const { Select } = require("enquirer");
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
/*埋め込みメッセージ受け取り*/
const embed = require("./announceText.js");
function find(dbName, collectionName, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const collection = dbClient.db(dbName).collection(collectionName);
        return yield collection.find(filter).toArray();
    });
}
let dbClient;
let sendTime = {
    noticeH: -1,
    noticeM: -1,
    startH: -1,
    startM: -1,
    endH: -1,
    endM: -1,
};
function readUserInput(question) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve, reject) => {
        readline.question(question, (answer) => {
            resolve(answer);
            readline.close();
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const mode = yield new Select({
            name: 'mode',
            message: 'モードを選んでください',
            choices: ['通知テスト', 'メンテ告知&開始通知セット', '終了通知(1分後送信)',]
        }).run();
        switch (mode) {
            case '通知テスト': {
                dbClient = new MongoClient(devConfig.db, { serverApi: ServerApiVersion.v1 });
                client.login(devConfig.token);
                console.log("すべての通知が1分後に送信されます");
                let date = new Date();
                date.setMinutes(date.getMinutes() + 1);
                sendTime = {
                    noticeH: date.getHours(),
                    noticeM: date.getMinutes(),
                    startH: date.getHours(),
                    startM: date.getMinutes(),
                    endH: date.getHours(),
                    endM: date.getMinutes(),
                };
                return;
            }
            case 'メンテ告知&開始通知セット': {
                dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
                client.login(config.token);
                sendTime.startH =
                    sendTime = {
                        noticeH: parseFloat(yield readUserInput('メンテ告知時間(HH)を入力')),
                        noticeM: parseFloat(yield readUserInput('メンテ告知時間(MM)を入力')),
                        startH: parseFloat(yield readUserInput('メンテ開始時間(HH)を入力')),
                        startM: parseFloat(yield readUserInput('メンテ開始時間(MM)を入力')),
                        endH: -1,
                        endM: -1,
                    };
                console.log("設定した時間に通知を送信します");
                return;
            }
            case '終了通知(1分後送信)': {
                console.log("終了通知が1分後に送信されます");
                dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
                client.login(config.token);
                let date = new Date();
                date.setMinutes(date.getMinutes() + 1);
                sendTime.endH = date.getHours();
                sendTime.endM = date.getMinutes();
                return;
            }
            default: {
                process.exit(1);
            }
        }
    });
}
cron.schedule('*/1  * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    if (date.getHours() === sendTime.noticeH && date.getMinutes() === sendTime.noticeM) {
        const data = yield find("main", "guildData", { announce: { $nin: ["0000000000000000000"] } });
        for (let i = 0; i < data.length; i++) {
            client.channels.cache.get(data[i].announce).send("@everyone");
            client.channels.cache.get(data[i].announce).send({ embeds: [embed.notice] });
        }
    }
    if (date.getHours() === sendTime.startH && date.getMinutes() === sendTime.startM) {
        const data = yield find("main", "guildData", { announce: { $nin: ["0000000000000000000"] } });
        for (let i = 0; i < data.length; i++) {
            client.channels.cache.get(data[i].announce).send("@everyone");
            client.channels.cache.get(data[i].announce).send({ embeds: [embed.start] });
        }
    }
    if (date.getHours() === sendTime.endH && date.getMinutes() === sendTime.endM) {
        const data = yield find("main", "guildData", { announce: { $nin: ["0000000000000000000"] } });
        for (let i = 0; i < data.length; i++) {
            client.channels.cache.get(data[i].announce).send("@everyone");
            client.channels.cache.get(data[i].announce).send({ embeds: [embed.end] });
        }
    }
}));
run().then(() => {
    console.log(sendTime);
});
