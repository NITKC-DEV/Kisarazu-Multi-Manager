const db = require('../functions/db.js');
const config = require("../environmentConfig");

exports.func = async function func(message) {
    const date = new Date();
    const data = await db.find("main", "birthday", {
        month: String(date.getMonth()+1),
        day: String(date.getDate())
    });

    for(let i = 0; i < data.length; i++){
        client.channels.cache.get(config.J).send(`<@!${data[i].user}>さん、誕生日おめでとう！`); //現状ギルド問わないのでこれ改修！
    }
}