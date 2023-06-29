const {EmbedBuilder} = require("discord.js");
const config = require("../environmentConfig");

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
    if(mode){
        await statusAndMode.status(2,"BOTメンテナンス");
    }
    else{
        await statusAndMode.status(0,"メンテナンス完了");
    }
}