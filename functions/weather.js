const {EmbedBuilder} = require("discord.js");

/*天気取得*/
async function getWeather() {
    const data = await db.find("main","weatherCache",{label: "最新の天気予報"});
    return data[0].response;
}

exports.generationDay = async function func(day){
    const data = getWeather();
    const weather = data.forecasts[day].dateLabel;
    const weatherCache = await db.find("main","weatherCache",{label: {$in:["0","1"]}});
    let fields,date = new Date(),color;
    date.setDate(date.getDate() + day );
    const time = date.toFormat('MM月DD日');

    const telop = data.forecasts[day].telop
    if(telop.indexOf("雪")!== -1 || telop.indexOf("みぞれ")!== -1 || telop.indexOf("ひょう")!== -1 || telop.indexOf("あられ")!== -1){
        color = "0x76CCFF"
    }
    else if(telop.indexOf("雷") !== -1){
        color = "0xFFFC01"
    }
    else if(telop.indexOf("雨") !== -1 || telop.indexOf("霧") !== -1 && telop.indexOf("霧") === -1){
        color = "0x067CFA"
    }
    else if(telop.indexOf("晴") !== -1){
        color = "0xFAA401"
    }
    else{
        color = "0x77787B"
    }

    const temperature = ""
    if(day === 0){
        temperature = "\n\n※発表データの関係で前日のデータを使用"
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setAuthor({
            name: "木更津22s統合管理BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/NITKC22s/bot-main'
        })
        .setDescription(`${weather.dateLabel}(${weather.date})の天気予報：${telop}`)
        .addFields([
            {
                name: '天気',
                value: `\`\`\`${weather.detail.weather}\`\`\``,
            },
            {
                name: '概要',
                value: `\`\`\`${weather.description.bodyText}\`\`\``,
            },
            {
                name: '気温',
                value: `\`\`\`最高気温：${weatherCache[0].max}℃\n最低気温：${weatherCache[0].min}${temperature}\`\`\``,
            },
            {
                name: '降水確率',
                value: `\`\`\`0時~6時：${weather.datail.chanceOfRain.T00_06}\n6時~12時：${weather.datail.chanceOfRain.T06_12}\n12時~18時：${weather.datail.chanceOfRainT12_18}\n18時~24時：${weather.datail.chanceOfRain.T18_24}\n \`\`\``,
            },
            {
                name: '風',
                value: `\`\`\`${weather.detail.wind}\`\`\``,
            },
            {
                name: '波',
                value: `\`\`\`${weather.detail.wave}\`\`\``,
            },
            {
                name: '概要',
                value: `\`\`\`${weather}\`\`\``,

            }
        ])
        .setTimestamp()
        .setFooter({text: '気象庁 Japan Meteorological Agency | Developed by NITKC22s server Admin'});

}