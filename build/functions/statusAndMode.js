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
const fs = require("fs");
const { configPath } = require("../environmentConfig.js");
const system = require("./logsystem.js");
const statusAndMode = require("./statusAndMode.js");
const statusName = ['online', 'idle', 'dnd', 'invisible'];
/***
 * botのステータスを設定
 * @param status　[オンライン,退席中,取り込み中,オフライン]の位置で指定
 * @param presence ○○をプレイ中 のメッセージ
 * @returns {Promise<void>}
 */
exports.status = function func(status, presence = "") {
    return __awaiter(this, void 0, void 0, function* () {
        client.user.setPresence({
            activities: [{
                    name: presence
                }],
        });
        let statusData = status;
        if (statusData === 0) {
            const date = new Date();
            if (date.getHours() * 100 + date.getMinutes() >= 204 && date.getHours() * 100 + date.getMinutes() <= 509)
                statusData = 1;
        }
        client.user.setStatus(statusName[statusData]);
    });
};
/***
 * メンテナンスモードを切り替えます
 * @param mode Trueでメンテナンスモード
 * @returns {Promise<void>}
 */
exports.maintenance = function (mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config.maintenanceMode = mode;
        fs.writeFileSync(configPath, JSON.stringify(config, null, "\t"));
        yield system.warn(`メンテナンスモードを${config.maintenanceMode}にしました。`, "メンテナンスモード変更");
        if (mode) {
            yield statusAndMode.status(2, "BOTメンテナンス");
        }
        else {
            const date = new Date();
            let status = 0;
            if (date.getHours() * 100 + date.getMinutes() >= 204 && date.getHours() * 100 + date.getMinutes() <= 509)
                status = 1;
            yield statusAndMode.status(status, "メンテナンス完了");
        }
    });
};
