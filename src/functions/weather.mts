/** @format */

import { EmbedBuilder } from "@discordjs/builders";
import * as db from "./db.mjs";
import axios from "axios";
import * as system from "./logsystem.mjs";

/*天気取得*/
async function getWeather() {
    const data = await db.find("main", "weatherCache", { label: "最新の天気予報" });
    return data[0].response;
}

function zenkaku2Hankaku(str: any) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９ ．　海後]/g, function (s: any) {
        if (s === "．") return `.`;
        if (s === "　") return "";
        if (s === "海") return " 海";
        if (s === "後") return " 後";
        else {
            return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
        }
    });
}

export const generationDay = async function func(day: any) {
    const data = await getWeather();
    const weather = data.forecasts[day];
    const weatherCache = await db.find("main", "weatherCache", { label: { $in: ["0", "1"] } });
    const date = new Date();
    let color;
    date.setDate(date.getDate() + day);

    const telop = data.forecasts[day].telop;
    if (telop.indexOf("雪") !== -1 || telop.indexOf("みぞれ") !== -1 || telop.indexOf("ひょう") !== -1 || telop.indexOf("あられ") !== -1) {
        color = "76CCFF";
    } else if (telop.indexOf("雷") !== -1) {
        color = "FFFC01";
    } else if (telop.indexOf("雨") !== -1 || (telop.indexOf("霧") !== -1 && telop.indexOf("煙霧") === -1)) {
        color = "067CFA";
    } else if (telop.indexOf("晴") !== -1 && telop.indexOf("煙霧") === -1) {
        color = "FAA401";
    } else {
        color = "77787B";
    }

    let annotation = "",
        filed;

    if (day === 0 && date.getHours() * 100 + date.getMinutes() > 505) {
        annotation = "発表データの関係で、気温は前日発表のデータを使用しています。";
        filed = {
            name: "概況",
            value: `\`\`\`${zenkaku2Hankaku(data.description.text.replace(/[^\S\r\n]+/g, ""))}\`\`\``,
        };
    } else if (day === 0) {
        annotation = "発表データの関係で、気温は前日発表のデータを使用しています。\n本日の天気ではないため、概況は表示していません。";
        filed = {
            name: "概況",
            value: `\`\`\`---\`\`\``,
        };
    } else {
        annotation = "本日の天気ではないため、概況は表示していません。";
        filed = {
            name: "概況",
            value: `\`\`\`---\`\`\``,
        };
    }

    let temperature = `最高気温：${weather.temperature.max.celsius}℃ | 最低気温：${weather.temperature.min.celsius}℃`;
    if (day === 0) {
        temperature = `最高気温：${weatherCache[0].max}℃ | 最低気温：${weatherCache[0].min}℃`;
    }

    return (
        new EmbedBuilder()
            // @ts-ignore 引数の型が一致していない
            .setColor(color)
            .setTitle(`${weather.dateLabel}(${weather.date})の天気予報：${telop}`)
            .setAuthor({
                name: "木更津22s統合管理BOT",
                iconURL: "https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png",
                url: "https://github.com/NITKC-DEV/Kisarazu-Multi-Manager",
            })
            .setDescription(
                `${data.location.area}エリア ${data.location.prefecture}${data.location.district}-${data.location.city}の${weather.dateLabel}の天気の情報です。`,
            )
            .addFields([
                filed,
                {
                    name: "気温・風",
                    value: `\`\`\`${temperature}\n\n${zenkaku2Hankaku(weather.detail.wind)}\`\`\``,
                },
                {
                    name: "降水確率",
                    value: `\`\`\`00時~06時：${weather.chanceOfRain.T00_06}\n06時~12時：${weather.chanceOfRain.T06_12}\n12時~18時：${weather.chanceOfRain.T12_18}\n18時~24時：${weather.chanceOfRain.T18_24}\`\`\``,
                },
                {
                    name: "データ詳細",
                    value: `\`\`\`${data.publicTimeFormatted} ${data.publishingOffice}より発表\n\n注)${annotation}\`\`\``,
                },
            ])
            .setTimestamp()
            .setFooter({ text: "気象庁 Japan Meteorological Agency  |  Developed by NITKC-DEV" })
    );
};

export const update = async function func() {
    let response;
    try {
        response = await axios.get("https://weather.tsukumijima.net/api/forecast/city/120010");
    } catch (error) {
        await system.error("天気を取得できませんでした");
        response = null;
    }

    if (response != null) {
        await db.update(
            "main",
            "weatherCache",
            { label: "最新の天気予報" },
            {
                $set: {
                    response: response.data,
                },
            },
        );
    }
};

export const catcheUpdate = async function func() {
    const data = await db.find("main", "weatherCache", { label: "最新の天気予報" });
    const today = await db.find("main", "weatherCache", { label: "1" });
    if (data[0].response.forecasts[0].date !== today[0].day) {
        await db.update(
            "main",
            "weatherCache",
            { label: "0" },
            {
                $set: {
                    day: data[0].response.forecasts[0].date,
                    max: data[0].response.forecasts[0].temperature.max.celsius ?? `---`,
                    min: data[0].response.forecasts[0].temperature.min.celsius ?? `---`,
                },
            },
        );
    } else {
        await db.update(
            "main",
            "weatherCache",
            { label: "0" },
            {
                $set: {
                    day: today[0].day,
                    max: today[0].max ?? `---`,
                    min: today[0].min ?? `---`,
                },
            },
        );
    }

    await db.update(
        /*明日の天気のキャッシュを更新*/
        "main",
        "weatherCache",
        { label: "1" },
        {
            $set: {
                day: data[0].response.forecasts[1].date,
                max: data[0].response.forecasts[1].temperature.max.celsius ?? `---`,
                min: data[0].response.forecasts[1].temperature.min.celsius ?? `---`,
            },
        },
    );
};
