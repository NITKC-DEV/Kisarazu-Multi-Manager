const {setTimeout} = require ("node:timers/promises");

/***
 * 返信し、time秒後に自動で削除する。
 * @param interaction 返信するinteraction
 * @param options メッセージのオブジェクト(contentの中の$time$を現在の残り時間に置き換える)
 * @param time 返信してから削除するまでの時間
 * @returns {Promise<void>} void(同期処理)
 */
exports.autoDeleteEditReply = async function(interaction,options,time) {
    for(time; time > 0; time--) {
        await setTimeout(1000);
        const defaultContent = JSON.parse(JSON.stringify(options)).content;
        const sendingOptions = JSON.parse(JSON.stringify(options));
        sendingOptions.content = defaultContent.replace(/\$time\$/g, time);
        await interaction.editReply(sendingOptions);
    }
    await interaction.deleteReply();
}