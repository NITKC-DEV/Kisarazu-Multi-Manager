const readline = require("readline");

const {Client, GatewayIntentBits, Partials, EmbedBuilder} = require("discord.js");
const dotenv = require("dotenv");
const {Select} = require("enquirer");
const {MongoClient, ServerApiVersion} = require("mongodb");
const cron = require("node-cron");

require("date-utils");

dotenv.config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel],
});

/* 埋め込みメッセージ受け取り */
const embed = require("./announceText.js");
const devConfig = require("../../env/config.dev.json");
const config = require("../../env/config.json");

async function find(dbName, collectionName, filter) {
    const collection = dbClient.db(dbName).collection(collectionName);
    return await collection.find(filter).toArray();
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
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, reject) => {
        readline.question(question, answer => {
            resolve(answer);
            readline.close();
        });
    });
}

async function run() {
    const mode = await new Select({
        name: "mode",
        message: "モードを選んでください",
        choices: ["通知テスト", "メンテ告知&開始通知セット", "終了通知(1分後送信)"],
    }).run();

    switch (mode) {
        case "通知テスト": {
            dbClient = new MongoClient(devConfig.db, {serverApi: ServerApiVersion.v1});
            client.login(devConfig.token);
            console.log("すべての通知が1分後に送信されます");

            const date = new Date();
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
        case "メンテ告知&開始通知セット": {
            dbClient = new MongoClient(config.db, {serverApi: ServerApiVersion.v1});
            client.login(config.token);
            sendTime.startH = sendTime = {
                noticeH: parseFloat(await readUserInput("メンテ告知時間(HH)を入力")),
                noticeM: parseFloat(await readUserInput("メンテ告知時間(MM)を入力")),
                startH: parseFloat(await readUserInput("メンテ開始時間(HH)を入力")),
                startM: parseFloat(await readUserInput("メンテ開始時間(MM)を入力")),
                endH: -1,
                endM: -1,
            };
            console.log("設定した時間に通知を送信します");
            return;
        }
        case "終了通知(1分後送信)": {
            console.log("終了通知が1分後に送信されます");
            dbClient = new MongoClient(config.db, {serverApi: ServerApiVersion.v1});
            client.login(config.token);

            const date = new Date();
            date.setMinutes(date.getMinutes() + 1);
            sendTime.endH = date.getHours();
            sendTime.endM = date.getMinutes();
            return;
        }
        default: {
            process.exit(1);
        }
    }
}

cron.schedule("*/1  * * * *", async () => {
    const date = new Date();
    if (date.getHours() === sendTime.noticeH && date.getMinutes() === sendTime.noticeM) {
        const data = await find("main", "guildData", {announce: {$nin: ["0000000000000000000"]}});
        for (let i = 0; i < data.length; i++) {
            client.channels.cache.get(data[i].announce).send("@everyone");
            client.channels.cache.get(data[i].announce).send({embeds: [embed.notice]});
        }
    }
    if (date.getHours() === sendTime.startH && date.getMinutes() === sendTime.startM) {
        const data = await find("main", "guildData", {announce: {$nin: ["0000000000000000000"]}});
        for (let i = 0; i < data.length; i++) {
            client.channels.cache.get(data[i].announce).send("@everyone");
            client.channels.cache.get(data[i].announce).send({embeds: [embed.start]});
        }
    }
    if (date.getHours() === sendTime.endH && date.getMinutes() === sendTime.endM) {
        const data = await find("main", "guildData", {announce: {$nin: ["0000000000000000000"]}});
        for (let i = 0; i < data.length; i++) {
            client.channels.cache.get(data[i].announce).send("@everyone");
            client.channels.cache.get(data[i].announce).send({embeds: [embed.end]});
        }
    }
});

run().then(() => {
    console.log(sendTime);
});
