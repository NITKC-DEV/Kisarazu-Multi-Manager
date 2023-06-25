const db = require('../functions/db.js');
const config = require("../environmentConfig");
const system = require("./logsystem");

exports.func = async function func(message) {
    const date = new Date();
    const data = await db.find("main", "birthday", {
        month: String(date.getMonth()+1),
        day: String(date.getDate())
    });

    for(let i = 0; i < data.length; i++){
        let special = "";
        let old = date.getFullYear() - data[i].year;
        if(old < 0){
            special = "...どうやって登録を...?"
        }
        else if(old === 0){
            special = "今日この世に生まれてくるのか、おめでとう！"
        }
        else if(old === 9){
            special = "1/2成人おめでとう！"
        }
        else if(old === 18){
            special = "そして成人おめでとう！"
        }
        else if(old === 20){
            special = "ついに二十歳、おめでとう！"
        }
        const guild = await db.find("main","guildData",{guild:String(data[i].guild)});
        if(guild.length > 0 && guild[0].main !== undefined){
            client.channels.cache.get(guild[0].main).send(`<@!${data[i].user}>さん、${date.getFullYear() - data[i].year}歳の誕生日おめでとう！\n${special}`);
        }
    }
    await system.log('誕生日お祝い！');
}