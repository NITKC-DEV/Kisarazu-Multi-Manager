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
const db = require('./db.js');
const system = require("./logsystem.js");
exports.func = function func() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const date = new Date();
        const data = yield db.find("main", "birthday", {
            month: String(date.getMonth() + 1),
            day: String(date.getDate())
        });
        for (let i = 0; i < data.length; i++) {
            let special = "";
            const old = date.getFullYear() - data[i].year;
            if (old < 0) {
                special = "...どうやって登録を...?";
            }
            else if (old === 0) {
                special = "今日この世に生まれてくるのか、おめでとう！";
            }
            else if (old === 9) {
                special = "1/2成人おめでとう！";
            }
            else if (old === 18) {
                special = "そして成人おめでとう！";
            }
            else if (old === 20) {
                special = "ついに二十歳、おめでとう！";
            }
            const guild = yield db.find("main", "guildData", { guild: String(data[i].guild) });
            if (guild.length > 0 && guild[0].main !== undefined) {
                try {
                    const channel = ((_a = client.channels.cache.get(guild[0].main)) !== null && _a !== void 0 ? _a : yield client.channels.fetch(guild[0].main));
                    yield channel.send(`<@!${data[i].user}>さん、${date.getFullYear() - data[i].year}歳の誕生日おめでとう！\n${special}`);
                }
                catch (_b) { }
            }
        }
        yield system.log('誕生日お祝い！');
    });
};
