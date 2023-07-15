// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'configPath... Remove this comment to see the full error message
const {configPath} = require("../environmentConfig");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'system'.
const system = require("./logsystem.js");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'statusAndM... Remove this comment to see the full error message
const statusAndMode = require("./statusAndMode.js");

const statusName = ['online','idle','dnd','invisible'];

/***
 * botのステータスを設定
 * @param status　[オンライン,退席中,取り込み中,オフライン]の位置で指定
 * @param presence ○○をプレイ中 のメッセージ
 * @returns {Promise<void>}
 */
exports.status = async function func(status: any,presence="") {
    client.user.setPresence({
        activities: [{
            name: presence
        }],
    });
    let statusData = status;
    if(statusData === 0){
        const date = new Date();
        if(date.getHours()*100+date.getMinutes()>=204 && date.getHours()*100+date.getMinutes()<=509)statusData=1;
    }
    client.user.setStatus(statusName[statusData]);
}

/***
 * メンテナンスモードを切り替えます
 * @param mode Trueでメンテナンスモード
 * @returns {Promise<void>}
 */
exports.maintenance = async function (mode: any){
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.maintenanceMode = mode;
    fs.writeFileSync(configPath, JSON.stringify(config,null ,"\t"));
    await system.warn(`メンテナンスモードを${config.maintenanceMode}にしました。`,"メンテナンスモード変更");

    if(mode){
        await statusAndMode.status(2,"BOTメンテナンス");
    }
    else{
        const date = new Date();
        let status=0;
        if(date.getHours()*100+date.getMinutes()>=204 && date.getHours()*100+date.getMinutes()<=509)status=1;
        await statusAndMode.status(status,"メンテナンス完了");
    }
}