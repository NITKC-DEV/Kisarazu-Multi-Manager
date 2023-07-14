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
const { EmbedBuilder } = require("discord.js");
const db = require('./db.js');
const axios = require("axios");
const system = require("./logsystem");
/*天気取得*/
function getWeather() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield db.find("main", "weatherCache", { label: "最新の天気予報" });
        return data[0].response;
    });
}
function zenkaku2Hankaku(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９ ．　海後]/g, function (s) {
        if (s === '．')
            return `.`;
        if (s === '　')
            return '';
        if (s === '海')
            return " 海";
        if (s === '後')
            return " 後";
        else {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        }
    });
}
exports.generationDay = function func(day) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getWeather();
        const weather = data.forecasts[day];
        const weatherCache = yield db.find("main", "weatherCache", { label: { $in: ["0", "1"] } });
        const date = new Date();
        let color;
        date.setDate(date.getDate() + day);
        const telop = data.forecasts[day].telop;
        if (telop.indexOf("雪") !== -1 || telop.indexOf("みぞれ") !== -1 || telop.indexOf("ひょう") !== -1 || telop.indexOf("あられ") !== -1) {
            color = "76CCFF";
        }
        else if (telop.indexOf("雷") !== -1) {
            color = "FFFC01";
        }
        else if (telop.indexOf("雨") !== -1 || telop.indexOf("霧") !== -1 && telop.indexOf("煙霧") === -1) {
            color = "067CFA";
        }
        else if (telop.indexOf("晴") !== -1 && telop.indexOf("煙霧") === -1) {
            color = "FAA401";
        }
        else {
            color = "77787B";
        }
        let annotation = "", filed;
        if (day === 0 && date.getHours() * 100 + date.getMinutes() > 505) {
            annotation = "発表データの関係で、気温は前日発表のデータを使用しています。";
            filed = {
                name: '概況',
                value: `\`\`\`${zenkaku2Hankaku(data.description.text.replace(/[^\S\r\n]+/g, ""))}\`\`\``,
            };
        }
        else if (day === 0) {
            annotation = "発表データの関係で、気温は前日発表のデータを使用しています。\n本日の天気ではないため、概況は表示していません。";
            filed = {
                name: '概況',
                value: `\`\`\`---\`\`\``,
            };
        }
        else {
            annotation = "本日の天気ではないため、概況は表示していません。";
            filed = {
                name: '概況',
                value: `\`\`\`---\`\`\``,
            };
        }
        let temperature = `最高気温：${weather.temperature.max.celsius}℃ | 最低気温：${weather.temperature.min.celsius}℃`;
        if (day === 0) {
            temperature = `最高気温：${weatherCache[0].max}℃ | 最低気温：${weatherCache[0].min}℃`;
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
                name: '気温・風',
                value: `\`\`\`${temperature}\n\n${zenkaku2Hankaku(weather.detail.wind)}\`\`\``,
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
            .setFooter({ text: '気象庁 Japan Meteorological Agency  |  Developed by NITKC-DEV' });
    });
};
exports.update = function func() {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield axios.get('https://weather.tsukumijima.net/api/forecast/city/120010');
        }
        catch (error) {
            yield system.error("天気を取得できませんでした");
            response = null;
        }
        if (response != null) {
            yield db.update("main", "weatherCache", { label: "最新の天気予報" }, {
                $set: {
                    response: response.data
                }
            });
        }
    });
};
exports.catcheUpdate = function func() {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield db.find("main", "weatherCache", { label: "最新の天気予報" });
        const today = yield db.find("main", "weatherCache", { label: "1" });
        if (data[0].response.forecasts[0].date !== today[0].day) {
            yield db.update("main", "weatherCache", { label: "0" }, {
                $set: {
                    day: data[0].response.forecasts[0].date,
                    max: (_a = data[0].response.forecasts[0].temperature.max.celsius) !== null && _a !== void 0 ? _a : `---`,
                    min: (_b = data[0].response.forecasts[0].temperature.min.celsius) !== null && _b !== void 0 ? _b : `---`
                },
            });
        }
        else {
            yield db.update("main", "weatherCache", { label: "0" }, {
                $set: {
                    day: today[0].day,
                    max: (_c = today[0].max) !== null && _c !== void 0 ? _c : `---`,
                    min: (_d = today[0].min) !== null && _d !== void 0 ? _d : `---`
                },
            });
        }
        yield db.update(/*明日の天気のキャッシュを更新*/ "main", "weatherCache", { label: "1" }, {
            $set: {
                day: data[0].response.forecasts[1].date,
                max: (_e = data[0].response.forecasts[1].temperature.max.celsius) !== null && _e !== void 0 ? _e : `---`,
                min: (_f = data[0].response.forecasts[1].temperature.min.celsius) !== null && _f !== void 0 ? _f : `---`
            },
        });
    });
};
