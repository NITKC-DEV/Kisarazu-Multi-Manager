import fs from "node:fs";
import path from "path";
import {REST} from "@discordjs/rest";
import {Routes} from "discord.js";
import {config} from "./environmentConfig.mjs";
import {fileURLToPath} from "url";
import {createRequire} from "module";
const require = createRequire(import.meta.url);
console.log(config);

// ./commands/ ディレクトリ内を探索
const commands: any = [];
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, 'commands');
//.jsを検索
const commandFiles = fs.readdirSync(commandsPath).filter((file: any) => file.endsWith('.mjs'));
for (const file of commandFiles) {//ファイルの数だけ
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    for (let i = 0; i < command.length; i++) {
        //各コマンドを配列にぶちこむ
        commands.push(command[i].data.toJSON());
    }
}

// Discord API通信準備 トークン設定
const rest = new REST({ version: '10' }).setToken(config.token);
const { Select, MultiSelect, Toggle } = require("enquirer");

async function run() {
    //GETで現在登録されているのを取得
    const data = await rest.get(Routes.applicationCommands(config.client));
    console.log("---コマンド一覧---")
    // @ts-ignore dataが返すundefined型に敗北した．誰かたすけて
    for (const command of data) {
        console.log(`/${command.name}`)
        console.log(`  ID:${command.id}`)
        console.log(`  ${command.description}`)
    }
    console.log("----------------")

    const mode = await new Select({
        name: 'mode',
        message: 'モードを選んでください',
        choices: ['登録(更新)', '削除', 'キャンセル',]
    }).run();
    if (mode==='キャンセル'){
        return
    }

    switch (mode) {
        case '登録(更新)': {
            console.log("---追加コマンド---")
            //差分を確認
            // @ts-expect-error TS(7006): Parameter 'v' implicitly has an 'any' type.
            for (const filterElement of commands.filter(v => !data.map((e: any) => e.name).includes(v.name))) {
                console.log(`/${filterElement.name}`)
                console.log(`  ${filterElement.description}`)
            }
            const prompt = await new Toggle({
                message: '続行しますか？',
                initial:true,
                enabled: 'はい',
                disabled: 'いいえ'
            }).run();
            if (prompt){
                // PUTで上書き すべてcommandsの内容に
                await rest.put(Routes.applicationCommands(config.client), { body: commands })
                    .then((data: any) => console.log(`${data.length} 個のアプリケーション コマンドが正常に登録されました。`))
                    .catch(console.error);
            }

            break
        }
        case '削除': {
            const selected = await new MultiSelect({
                name: 'value',
                message: '対象のコマンドを<space>で選択、<a>で全選択、<i>で反転',
                // @ts-ignore dataが返すundefined型に敗北した．誰かたすけて
                choices: data.map((e: any) => ({
                    name:"/"+e.name,
                    value:e.id
                })),
                result(commands: any) {
                    return  Object.entries(this.map(commands));
                }
            }).run();
            for (const selectedElement of selected) {
                console.log(selectedElement)
               await rest.delete(Routes.applicationCommand(config.client, selectedElement[1]))
                    .then(() => console.log(`アプリケーション コマンド"${selectedElement.name}"が正常に削除されました`))
                    .catch(console.error);
            }
            break
        }
        default: {
            return
        }
    }
}

run().then(() => {

})