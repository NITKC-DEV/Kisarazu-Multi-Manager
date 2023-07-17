import {Client, GatewayIntentBits, Partials, TextChannel} from "discord.js";
import dotenv from "dotenv";
import cron from "node-cron"
import "date-utils";
import {MongoClient, ServerApiVersion} from "mongodb";
import * as config from "../env/config.json";
import * as devConfig from "../env/config.dev.json";
// @ts-ignore  cf. https://github.com/enquirer/enquirer/issues/135
import {Select} from "enquirer";

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
// @ts-ignore ファイル無いんだが()
import embed from "./announceText.js";

async function find(dbName: any, collectionName: any, filter: any) {
    const collection = dbClient.db(dbName).collection(collectionName);
    return await collection.find(filter).toArray()
}

let dbClient: any;
let sendTime = {
    noticeH: -1,
    noticeM: -1,
    startH: -1,
    startM: -1,
    endH: -1,
    endM: -1,
}

async function readUserInput(question: any) {
    const readline = await import("readline").then(readline => readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }));

    return new Promise((resolve) => {
        readline.question(question, (answer: any) => {
            resolve(answer);
            readline.close();
        });
    });
}

// @ts-ignore
async function run() {

    const mode = await new Select({
        name: 'mode',
        message: 'モードを選んでください',
        choices: ['通知テスト', 'メンテ告知&開始通知セット', '終了通知(1分後送信)',]
    }).run();

    switch (mode) {
        case '通知テスト': {
            dbClient = new MongoClient(devConfig.db, {serverApi: ServerApiVersion.v1});
            client.login(devConfig.token);
            console.log("すべての通知が1分後に送信されます");

            let date = new Date();
            date.setMinutes(date.getMinutes() +1 );
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
        case 'メンテ告知&開始通知セット':{
            dbClient = new MongoClient(config.db, {serverApi: ServerApiVersion.v1});
            client.login(config.token);
            // @ts-expect-error TS(2322): Type '{ noticeH: number; noticeM: number; startH: ... Remove this comment to see the full error message
            sendTime.startH =
            sendTime = {
                // @ts-expect-error TS(2345): Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
                noticeH: parseFloat(await readUserInput('メンテ告知時間(HH)を入力')),
                // @ts-expect-error TS(2345): Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
                noticeM: parseFloat(await readUserInput('メンテ告知時間(MM)を入力')),
                // @ts-expect-error TS(2345): Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
                startH: parseFloat(await readUserInput('メンテ開始時間(HH)を入力')),
                // @ts-expect-error TS(2345): Argument of type 'unknown' is not assignable to pa... Remove this comment to see the full error message
                startM: parseFloat(await readUserInput('メンテ開始時間(MM)を入力')),
                endH: -1,
                endM: -1,
            };
            console.log("設定した時間に通知を送信します")
            return;
        }
        case '終了通知(1分後送信)':{
            console.log("終了通知が1分後に送信されます");
            dbClient = new MongoClient(config.db, {serverApi: ServerApiVersion.v1});
            client.login(config.token);

            let date = new Date();
            date.setMinutes(date.getMinutes() +1 );
            sendTime.endH = date.getHours();
            sendTime.endM = date.getMinutes();
            return;
        }
        default:{
            process.exit(1);
        }

    }


}

cron.schedule('*/1  * * * *', async () => {

    const date = new Date();
    if(date.getHours() === sendTime.noticeH && date.getMinutes() === sendTime.noticeM){
        const data = await find("main","guildData",{announce:{$nin:["0000000000000000000"]}});
        for(let i = 0; i < data.length; i++) {
            (client.channels.cache.get(data[i].announce) as TextChannel).send("@everyone");
            (client.channels.cache.get(data[i].announce) as TextChannel).send({embeds: [embed.notice]});
        }
    }
    if(date.getHours() === sendTime.startH && date.getMinutes() === sendTime.startM){
        const data = await find("main","guildData",{announce:{$nin:["0000000000000000000"]}});
        for(let i = 0; i < data.length; i++) {
            (client.channels.cache.get(data[i].announce) as TextChannel).send("@everyone");
            (client.channels.cache.get(data[i].announce) as TextChannel).send({ embeds: [embed.start] });
        }
    }
    if(date.getHours() === sendTime.endH && date.getMinutes() === sendTime.endM){
        const data = await find("main","guildData",{announce:{$nin:["0000000000000000000"]}});
        for(let i = 0; i < data.length; i++) {
            (client.channels.cache.get(data[i].announce) as TextChannel).send("@everyone");
            (client.channels.cache.get(data[i].announce) as TextChannel).send({embeds: [embed.end] });
        }
    }

});




run().then(() => {
    console.log(sendTime)
})