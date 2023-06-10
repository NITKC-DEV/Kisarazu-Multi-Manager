const system = require('../functions/logsystem.js');
const db = require('../functions/db.js');

const ID_NODATA= "0000000000000000000";
exports.ID_NODATA = ID_NODATA;

/***
* Objectテンプレ
 {
            guild: ,
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
            timetable:
 }

 更新したい内容のみで良いので、valueに更新後のデータを入れる。
 timetableのみbool、それ以外はstringかint
 設定されていないときは、文字列型でID_NODATAとする
* */


/***
 * GuildDataを更新または新規作成する
 * @param guild guildID
 * @param object 更新データ。guildDataSet.jsにテンプレあり
 */
exports.updateOrInsert = async function func(guild,object) {
    const data = await db.find("main","guildData",{guild: String(guild)});
    if(data.length > 0) {
        await db.update("main","guildData",{guild: String(guild)},{
            $set:{
                guild: String(object.guild),
                grade: String(object.grade ?? data[0].grade),
                announce: String(object.announce ?? data[0].announce),
                main: String(object.main ?? data[0].main),
                mChannel: String(object.mChannel ?? data[0].mChannel),
                mRole: String(object.mRole ?? data[0].mRole),
                eChannel: String(object.eChannel ?? data[0].eChannel),
                eRole: String(object.eRole ?? data[0].eRole),
                dChannel: String(object.dChannel ?? data[0].dChannel),
                dRole: String(object.dRole ?? data[0].dRole),
                jChannel: String(object.jChannel ?? data[0].jChannel),
                jRole: String(object.jRole ?? data[0].jRole),
                cChannel: String(object.cChannel ?? data[0].cChannel),
                cRole: String(object.cRole ?? data[0].cRole),
                boardChannel: String(object.boardChannel ?? data[0].boardChannel),
                board: String(object.board ?? data[0].board),
                timetable: object.board ?? data[0].timetable
            }
        });
    }
    else{
        await db.insert("main","guildData",{
            guild: String(object.guild),
            grade: String(object.grade ?? ID_NODATA),
            announce: String(object.announce ?? ID_NODATA),
            main: String(object.main ?? ID_NODATA),
            mChannel: String(object.mChannel ?? ID_NODATA),
            mRole: String(object.mRole ?? ID_NODATA),
            eChannel: String(object.eChannel ?? ID_NODATA),
            eRole: String(object.eRole ?? ID_NODATA),
            dChannel: String(object.dChannel ?? ID_NODATA),
            dRole: String(object.dRole ?? ID_NODATA),
            jChannel: String(object.jChannel ?? ID_NODATA),
            jRole: String(object.jRole ?? ID_NODATA),
            cChannel: String(object.cChannel ?? ID_NODATA),
            cRole: String(object.cRole ?? ID_NODATA),
            boardChannel: String(object.boardChannel ?? ID_NODATA),
            board: String(object.board ?? ID_NODATA),
            timetable: object.board ?? true
        });
    }
}


/***
 * GuildDataをリセットする(timetable、dashboardは除外)
 * @param guild guildID
 */
exports.reset = async function func(guild) {
    const data = await db.find("main","guildData",{guild: String(guild)});
    if(data.length > 0) {
        await db.update("main", "guildData", {guild: String(guild)}, {
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
}
