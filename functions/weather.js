const {EmbedBuilder} = require("discord.js");
const db = require('../functions/db.js');
const axios = require("axios");
const system = require("./logsystem");

/*天気取得*/
async function getWeather() {
    const data = await db.find("main","weatherCache",{label: "最新の天気予報"});
    return data[0].response;
}

function hankaku2Zenkaku(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９ ．]/g, function(s) {
        if(s === '．'){return `.`;}
        else{return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);}
    });
}


exports.generationDay = async function func(day){
    const data = await getWeather();
    const weather = data.forecasts[day];
    const weatherCache = await db.find("main","weatherCache",{label: {$in:["0","1"]}});
    let fields,date = new Date(),color;
    date.setDate(date.getDate() + day );
    const time = date.toFormat('MM月DD日');

    const telop = data.forecasts[day].telop;
    if(telop.indexOf("雪")!== -1 || telop.indexOf("みぞれ")!== -1 || telop.indexOf("ひょう")!== -1 || telop.indexOf("あられ")!== -1){
        color = "76CCFF"
    }
    else if(telop.indexOf("雷") !== -1){
        color = "FFFC01"
    }
    else if(telop.indexOf("雨") !== -1 || telop.indexOf("霧") !== -1 && telop.indexOf("煙霧") === -1){
        color = "067CFA"
    }
    else if(telop.indexOf("晴") !== -1  && telop.indexOf("煙霧") === -1){
        color = "FAA401"
    }
    else{
        color = "77787B"
    }

    let annotation = "",filed
    if(day === 0){
        annotation = "発表データの関係で、気温は前日発表のデータを使用しています。";
        filed ={
            name: '概況',
            value: `\`\`\`　${data.description.text.replace("　","​")}\`\`\``,
        }
    }
    else if(day === 1){
        annotation = "概況は今日から明日にかけての天気になります。";
        filed ={
            name: '概況',
            value: `\`\`\`　${data.description.text.replace("　","​")}\`\`\``,
        }
    }
    else{
        filed ={
            name: '概況',
            value: `\`\`\`---\`\`\``,
        }
        annotation = "概況は明後日の天気に言及されないため表示していません。"
    }
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(`${weather.dateLabel}(${weather.date})の天気予報：${telop}`)
        .setAuthor({
            name: "木更津22s統合管理BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/NITKC-DEV/Kisarazu-Multi-Manager'
        })
        .setDescription(`${data.location.area}エリア ${data.location.prefecture}${data.location.district}-${data.location.city}の${weather.dateLabel}の天気の情報です。`)
        .addFields([
            filed,
            {
                name: '気温・風・波',
                value: `\`\`\`最高気温：${weatherCache[0].max}℃ | 最低気温：${weatherCache[0].min}℃\n\n${weather.detail.wind} 波${hankaku2Zenkaku(weather.detail.wave)}\`\`\``,
            },
            {
                name: '降水確率',
                value: `\`\`\`00時~06時：${weather.chanceOfRain.T00_06}\n06時~12時：${weather.chanceOfRain.T06_12}\n12時~18時：${weather.chanceOfRain.T12_18}\n18時~24時：${weather.chanceOfRain.T18_24}\`\`\``,
            },
            {
                name: 'データ詳細',
                value: `\`\`\`${data.publicTimeFormatted} ${data.publishingOffice}より発表\n\n注)${annotation}\`\`\``,

            }
        ])
        .setTimestamp()
        .setFooter({text: '気象庁 Japan Meteorological Agency  |  Developed by NITKC-DEV'});

}

exports.update = async function func() {
    let response;
    try {
        response = await axios.get('https://weather.tsukumijima.net/api/forecast/city/120010');
    } catch (error) {
        await system.error("天気を取得できませんでした");
        response = null;
    }

    if(response != null){
        await db.update("main", "weatherCache", {label: "最新の天気予報"}, {
            $set: {
                response: response.data
            }
        });
    }
}

exports.catcheUpdate = async function func() {
    const data = await db.find("main","weatherCache",{label:"最新の天気予報"});

    await db.update(  /*明日の天気のキャッシュを更新*/
        "main", "weatherCache", {label: "1"},
        {
            $set: {
                day: data[0].response.forecasts[1].date,
                max: data[0].response.forecasts[1].temperature.max.celsius ?? `---`,
                min: data[0].response.forecasts[1].temperature.min.celsius ?? `---`
            },
        }
    );
}