// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setTimeout... Remove this comment to see the full error message
const {setTimeout} = require ("node:timers/promises");

/***
 * 返信し、time秒後に自動で削除する。
 * @param interaction 返信するinteraction
 * @param options メッセージのオブジェクト(contentの中の$time$を現在の残り時間に置き換える)
 * @param time 返信してから削除するまでの時間
*/
exports.autoDeleteEditReply = function(interaction: any,options: any,time: any) {
    (async()=> {
        for(let i = time; i > 0; i--) {
            const defaultContent = JSON.parse(JSON.stringify(options)).content;
            const sendingOptions = JSON.parse(JSON.stringify(options));
            sendingOptions.content = defaultContent.replace(/\$time\$/g, i);
            // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
            await setTimeout(1000);
            await interaction.editReply(sendingOptions);
        }
        await interaction.deleteReply();
    })();
}