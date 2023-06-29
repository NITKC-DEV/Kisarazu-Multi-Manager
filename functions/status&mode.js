
const fs = require("fs");
const {configPath} = require("../environmentConfig");
const system = require("./logsystem");
const statusAndMode = require("./status&mode");

const statusName = ['online','idle','dnd','invisible'];

/***
 * botのステータスを設定
 * @param status　[オンライン,退席中,取り込み中,オフライン]の位置で指定
 * @param presence ○○をプレイ中 のメッセージ
 * @returns {Promise<void>}
 */
exports.status = async function func(status,presence="") {
    client.user.setPresence({
        activities: [{
            name: presence
        }],
    });
    client.user.setStatus(statusName[status]);
}

exports.maintenance = async function (mode){
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.maintenanceMode = mode;
    fs.writeFileSync(configPath, JSON.stringify(config,null ,"\t"));
    await system.warn(`メンテナンスモードを${config.maintenanceMode}にしました。`,"メンテナンスモード変更");

    if(mode){
        await statusAndMode.status(2,"BOTメンテナンス");
    }
    else{
        await statusAndMode.status(0,"メンテナンス完了");
    }
}