const system = require('../functions/logsystem.js');
const db = require('../functions/db.js');

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
 設定されていないときは、文字列型で"0000000000000000000"とする
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
            grade: String(object.grade ?? "0000000000000000000"),
            announce: String(object.announce ?? "0000000000000000000"),
            main: String(object.main ?? "0000000000000000000"),
            mChannel: String(object.mChannel ?? "0000000000000000000"),
            mRole: String(object.mRole ?? "0000000000000000000"),
            eChannel: String(object.eChannel ?? "0000000000000000000"),
            eRole: String(object.eRole ?? "0000000000000000000"),
            dChannel: String(object.dChannel ?? "0000000000000000000"),
            dRole: String(object.dRole ?? "0000000000000000000"),
            jChannel: String(object.jChannel ?? "0000000000000000000"),
            jRole: String(object.jRole ?? "0000000000000000000"),
            cChannel: String(object.cChannel ?? "0000000000000000000"),
            cRole: String(object.cRole ?? "0000000000000000000"),
            boardChannel: String(object.boardChannel ?? "0000000000000000000"),
            board: String(object.board ?? "0000000000000000000"),
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
                grade: "0000000000000000000",
                announce: "0000000000000000000",
                main: "0000000000000000000",
                mChannel: "0000000000000000000",
                mRole: "0000000000000000000",
                eChannel: "0000000000000000000",
                eRole: "0000000000000000000",
                dChannel: "0000000000000000000",
                dRole: "0000000000000000000",
                jChannel: "0000000000000000000",
                jRole: "0000000000000000000",
                cChannel: "0000000000000000000",
                cRole: "0000000000000000000",
            }
        });
    }
}

