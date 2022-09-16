const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const config = process.env.NODE_ENV == "production" ? require('./config.json') : require('./config.dev.json')
console.log(config)
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    for (let i = 0; i < command.length; i++) {

        commands.push(command[i].data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(config.token);

/*rest.put(Routes.applicationCommands(config.client), { body: commands })
    .then(data => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);*/

/*rest.put(Routes.applicationGuildCommands(config.client, config.server), { body: [] })
    .then(() => console.log('Successfully deleted all guild commands.'))
    .catch(console.error);*/
/*
rest.put(Routes.applicationGuildCommands(config.client,"1004598980291866694"), { body: [] })
    .then(() => console.log('Successfully deleted application command'))
    .catch(console.error);*/
const { prompt, Select ,MultiSelect,Toggle } = require('enquirer');

async function run() {
    const data = await rest.get(Routes.applicationCommands(config.client, config.server))
    console.log("---コマンド一覧---")
    for (const command of data) {
        console.log(`/${command.name}`)
        console.log(`  ID:${command.id}`)
        console.log(`  ${command.description}`)
    }
    console.log("----------------")

    const mode = await new Select({
        name: 'mode',
        message: 'モードを選んでください',
        choices: ['登録(更新)', '削除', '終了',]
    }).run();
    if (mode=='終了'){
        return
    }

    switch (mode) {
        case '登録(更新)': {
            console.log("---追加コマンド---")
            for (const filterElement of commands.filter(v => !data.map(e => e.name).includes(v.name))) {
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
               await rest.put(Routes.applicationCommands(config.client), { body: commands })
                    .then(data => console.log(`${data.length} 個のアプリケーション コマンドが正常に登録されました。`))
                    .catch(console.error);
            }

            break
        }
        case '削除': {
            const selected = await new MultiSelect({
                name: 'value',
                message: '対象のコマンドを<space>で選択、<a>で全選択、<i>で反転',
                choices: data.map(e=>({name:"/"+e.name,value:e.id}))
            }).run();
            for (const selectedElement of selected) {
               await rest.delete(Routes.applicationCommand(config.client, selectedElement.id))
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

run().then(r => {

})
