// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'db'.
const db = require('./db.js');

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ID_NODATA'... Remove this comment to see the full error message
const ID_NODATA= "0000000000000000000";
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
exports.updateOrInsert = async function func(guild: any,object={}) {
    const data = await db.find("main","guildData",{guild: String(guild)});
    if(data.length > 0) {
        await db.update("main","guildData",{guild: String(guild)},{
            $set:{
                // @ts-expect-error TS(2339): Property 'grade' does not exist on type '{}'.
                grade: String(object.grade ?? data[0].grade),
                // @ts-expect-error TS(2339): Property 'announce' does not exist on type '{}'.
                announce: String(object.announce ?? data[0].announce),
                // @ts-expect-error TS(2339): Property 'main' does not exist on type '{}'.
                main: String(object.main ?? data[0].main),
                // @ts-expect-error TS(2339): Property 'mChannel' does not exist on type '{}'.
                mChannel: String(object.mChannel ?? data[0].mChannel),
                // @ts-expect-error TS(2339): Property 'mRole' does not exist on type '{}'.
                mRole: String(object.mRole ?? data[0].mRole),
                // @ts-expect-error TS(2339): Property 'eChannel' does not exist on type '{}'.
                eChannel: String(object.eChannel ?? data[0].eChannel),
                // @ts-expect-error TS(2339): Property 'eRole' does not exist on type '{}'.
                eRole: String(object.eRole ?? data[0].eRole),
                // @ts-expect-error TS(2339): Property 'dChannel' does not exist on type '{}'.
                dChannel: String(object.dChannel ?? data[0].dChannel),
                // @ts-expect-error TS(2339): Property 'dRole' does not exist on type '{}'.
                dRole: String(object.dRole ?? data[0].dRole),
                // @ts-expect-error TS(2339): Property 'jChannel' does not exist on type '{}'.
                jChannel: String(object.jChannel ?? data[0].jChannel),
                // @ts-expect-error TS(2339): Property 'jRole' does not exist on type '{}'.
                jRole: String(object.jRole ?? data[0].jRole),
                // @ts-expect-error TS(2339): Property 'cChannel' does not exist on type '{}'.
                cChannel: String(object.cChannel ?? data[0].cChannel),
                // @ts-expect-error TS(2339): Property 'cRole' does not exist on type '{}'.
                cRole: String(object.cRole ?? data[0].cRole),
                // @ts-expect-error TS(2339): Property 'boardChannel' does not exist on type '{}... Remove this comment to see the full error message
                boardChannel: String(object.boardChannel ?? data[0].boardChannel),
                // @ts-expect-error TS(2339): Property 'board' does not exist on type '{}'.
                board: String(object.board ?? data[0].board),
                // @ts-expect-error TS(2339): Property 'timetable' does not exist on type '{}'.
                timetable: object.timetable ?? data[0].timetable,
                // @ts-expect-error TS(2339): Property 'weather' does not exist on type '{}'.
                weather: object.weather ?? data[0].weather,
                // @ts-expect-error TS(2339): Property 'weatherChannel' does not exist on type '... Remove this comment to see the full error message
                weatherChannel: String(object.weatherChannel ?? data[0].weatherChannel)
            }
        });
    }
    else{
        await db.insert("main","guildData",{
            guild: String(guild),
            // @ts-expect-error TS(2339): Property 'grade' does not exist on type '{}'.
            grade: String(object.grade ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'announce' does not exist on type '{}'.
            announce: String(object.announce ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'main' does not exist on type '{}'.
            main: String(object.main ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'mChannel' does not exist on type '{}'.
            mChannel: String(object.mChannel ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'mRole' does not exist on type '{}'.
            mRole: String(object.mRole ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'eChannel' does not exist on type '{}'.
            eChannel: String(object.eChannel ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'eRole' does not exist on type '{}'.
            eRole: String(object.eRole ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'dChannel' does not exist on type '{}'.
            dChannel: String(object.dChannel ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'dRole' does not exist on type '{}'.
            dRole: String(object.dRole ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'jChannel' does not exist on type '{}'.
            jChannel: String(object.jChannel ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'jRole' does not exist on type '{}'.
            jRole: String(object.jRole ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'cChannel' does not exist on type '{}'.
            cChannel: String(object.cChannel ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'cRole' does not exist on type '{}'.
            cRole: String(object.cRole ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'boardChannel' does not exist on type '{}... Remove this comment to see the full error message
            boardChannel: String(object.boardChannel ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'board' does not exist on type '{}'.
            board: String(object.board ?? ID_NODATA),
            // @ts-expect-error TS(2339): Property 'timetable' does not exist on type '{}'.
            timetable: object.timetable ?? true,
            // @ts-expect-error TS(2339): Property 'weather' does not exist on type '{}'.
            weather: object.weather ?? true,
            // @ts-expect-error TS(2339): Property 'weatherChannel' does not exist on type '... Remove this comment to see the full error message
            weatherChannel: String(object.weatherChannel ?? ID_NODATA)
        });
    }
}


/***
 * GuildDataをリセットする(timetable、dashboardは除外)
 * @param guild guildID
 * @returns {Promise<void>}
 */
exports.reset = async function func(guild: any) {
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

/***
 * BOTが参加してないGuildのデータを削除
 * @returns {Promise<void>}
 */
exports.checkGuild = async function func() {
    const data = await db.find("main","guildData", {});
    for(let i=0;i<data.length;i++) {
        try{
            await client.guilds.fetch(data[i].guild);
        }
        catch(err){
            // @ts-expect-error TS(2571): Object is of type 'unknown'.
            if(err.code === 10004){ //guildがないよエラーならギルド削除
                await db.delete("main","guildData",{guild:data[i].guild});
            }
        }
    }
}
