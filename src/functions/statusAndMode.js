const fs = require("fs");

const {client} = require("../botmain.js");
const {configPath} = require("../environmentConfig.js");

const system = require("./logsystem.js");

const statusName = ["online", "idle", "dnd", "invisible"];

/**
 * botのステータスを設定
 * @param status 指定の位置は[オンライン,退席中,取り込み中,オフライン]
 * @param presence ○○をプレイ中 のメッセージ
 * @returns {Promise<void>}
 */
exports.status = async function func(status, presence = "") {
    client.user.setPresence({
        activities: [
            {
                name: presence,
            },
        ],
    });
    let statusData = status;
    if (statusData === 0) {
        const date = new Date();
        if (date.getHours() * 100 + date.getMinutes() >= 204 && date.getHours() * 100 + date.getMinutes() <= 509) {
            statusData = 1;
        }
    }
    client.user.setStatus(statusName[statusData]);
};

/**
 * メンテナンスモードを切り替えます
 * @param mode Trueでメンテナンスモード
 * @returns {Promise<void>}
 */
exports.maintenance = async function func(mode) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.maintenanceMode = mode;
    fs.writeFileSync(configPath, JSON.stringify(config, null, "\t"));
    await system.warn(`メンテナンスモードを${config.maintenanceMode}にしました。`, "メンテナンスモード変更");

    if (mode) {
        await exports.status(2, "BOTメンテナンス");
    } else {
        const date = new Date();
        let status = 0;
        if (date.getHours() * 100 + date.getMinutes() >= 204 && date.getHours() * 100 + date.getMinutes() <= 509) {
            status = 1;
        }
        await exports.status(status, "メンテナンス完了");
    }
};