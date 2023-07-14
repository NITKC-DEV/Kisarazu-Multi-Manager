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
const ID_NODATA = "0000000000000000000";
exports.ID_NODATA = ID_NODATA;
/***
 * Objectテンプレ
 {
            grade: ,
            announce: ,
            main: ,
            mChannel: ,
            mRole: ,
            eChannel: ,
            eRole: ,
            dChannel: ,
            dRole: ,
            jChannel: ,
            jRole: ,
            cChannel: ,
            cRole: ,
            boardChannel: ,
            board: ,
            timetable: ,
            weather: ,
            weatherChannel:
 }

 更新したい内容のみで良いので、valueに更新後のデータを入れる。guildは不要
 timetableとweatherがbool、それ以外はstringかint
 設定されていないときは、文字列型でID_NODATAとする
 * */
/***
 * GuildDataを更新または新規作成する
 * @param guild guildID
 * @param object 更新データ。guildDataSet.jsにテンプレあり
 * @returns {Promise<void>}
 */
exports.updateOrInsert = function func(guild, object = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield db.find("main", "guildData", { guild: String(guild) });
        if (data.length > 0) {
            yield db.update("main", "guildData", { guild: String(guild) }, {
                $set: {
                    grade: String((_a = object.grade) !== null && _a !== void 0 ? _a : data[0].grade),
                    announce: String((_b = object.announce) !== null && _b !== void 0 ? _b : data[0].announce),
                    main: String((_c = object.main) !== null && _c !== void 0 ? _c : data[0].main),
                    mChannel: String((_d = object.mChannel) !== null && _d !== void 0 ? _d : data[0].mChannel),
                    mRole: String((_e = object.mRole) !== null && _e !== void 0 ? _e : data[0].mRole),
                    eChannel: String((_f = object.eChannel) !== null && _f !== void 0 ? _f : data[0].eChannel),
                    eRole: String((_g = object.eRole) !== null && _g !== void 0 ? _g : data[0].eRole),
                    dChannel: String((_h = object.dChannel) !== null && _h !== void 0 ? _h : data[0].dChannel),
                    dRole: String((_j = object.dRole) !== null && _j !== void 0 ? _j : data[0].dRole),
                    jChannel: String((_k = object.jChannel) !== null && _k !== void 0 ? _k : data[0].jChannel),
                    jRole: String((_l = object.jRole) !== null && _l !== void 0 ? _l : data[0].jRole),
                    cChannel: String((_m = object.cChannel) !== null && _m !== void 0 ? _m : data[0].cChannel),
                    cRole: String((_o = object.cRole) !== null && _o !== void 0 ? _o : data[0].cRole),
                    boardChannel: String((_p = object.boardChannel) !== null && _p !== void 0 ? _p : data[0].boardChannel),
                    board: String((_q = object.board) !== null && _q !== void 0 ? _q : data[0].board),
                    timetable: (_r = object.timetable) !== null && _r !== void 0 ? _r : data[0].timetable,
                    weather: (_s = object.weather) !== null && _s !== void 0 ? _s : data[0].weather,
                    weatherChannel: String((_t = object.weatherChannel) !== null && _t !== void 0 ? _t : data[0].weatherChannel)
                }
            });
        }
        else {
            yield db.insert("main", "guildData", {
                guild: String(guild),
                grade: String((_u = object.grade) !== null && _u !== void 0 ? _u : ID_NODATA),
                announce: String((_v = object.announce) !== null && _v !== void 0 ? _v : ID_NODATA),
                main: String((_w = object.main) !== null && _w !== void 0 ? _w : ID_NODATA),
                mChannel: String((_x = object.mChannel) !== null && _x !== void 0 ? _x : ID_NODATA),
                mRole: String((_y = object.mRole) !== null && _y !== void 0 ? _y : ID_NODATA),
                eChannel: String((_z = object.eChannel) !== null && _z !== void 0 ? _z : ID_NODATA),
                eRole: String((_0 = object.eRole) !== null && _0 !== void 0 ? _0 : ID_NODATA),
                dChannel: String((_1 = object.dChannel) !== null && _1 !== void 0 ? _1 : ID_NODATA),
                dRole: String((_2 = object.dRole) !== null && _2 !== void 0 ? _2 : ID_NODATA),
                jChannel: String((_3 = object.jChannel) !== null && _3 !== void 0 ? _3 : ID_NODATA),
                jRole: String((_4 = object.jRole) !== null && _4 !== void 0 ? _4 : ID_NODATA),
                cChannel: String((_5 = object.cChannel) !== null && _5 !== void 0 ? _5 : ID_NODATA),
                cRole: String((_6 = object.cRole) !== null && _6 !== void 0 ? _6 : ID_NODATA),
                boardChannel: String((_7 = object.boardChannel) !== null && _7 !== void 0 ? _7 : ID_NODATA),
                board: String((_8 = object.board) !== null && _8 !== void 0 ? _8 : ID_NODATA),
                timetable: (_9 = object.timetable) !== null && _9 !== void 0 ? _9 : true,
                weather: (_10 = object.weather) !== null && _10 !== void 0 ? _10 : true,
                weatherChannel: String((_11 = object.weatherChannel) !== null && _11 !== void 0 ? _11 : ID_NODATA)
            });
        }
    });
};
/***
 * GuildDataをリセットする(timetable、dashboardは除外)
 * @param guild guildID
 * @returns {Promise<void>}
 */
exports.reset = function func(guild) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield db.find("main", "guildData", { guild: String(guild) });
        if (data.length > 0) {
            yield db.update("main", "guildData", { guild: String(guild) }, {
                $set: {
                    guild: String(guild),
                    grade: ID_NODATA,
                    announce: ID_NODATA,
                    main: ID_NODATA,
                    mChannel: ID_NODATA,
                    mRole: ID_NODATA,
                    eChannel: ID_NODATA,
                    eRole: ID_NODATA,
                    dChannel: ID_NODATA,
                    dRole: ID_NODATA,
                    jChannel: ID_NODATA,
                    jRole: ID_NODATA,
                    cChannel: ID_NODATA,
                    cRole: ID_NODATA,
                }
            });
        }
    });
};
/***
 * BOTが参加してないGuildのデータを削除
 * @returns {Promise<void>}
 */
exports.checkGuild = function func() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield db.find("main", "guildData", {});
        for (let i = 0; i < data.length; i++) {
            try {
                yield client.guilds.fetch(data[i].guild);
            }
            catch (err) {
                if (err.code === 10004) { //guildがないよエラーならギルド削除
                    yield db.delete("main", "guildData", { guild: data[i].guild });
                }
            }
        }
    });
};
