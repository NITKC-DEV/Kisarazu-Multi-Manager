/* メッセージに反応する系のイースターエッグ */
exports.func = function func(message) {
    const dt = new Date();
    const month = dt.getMonth();
    const date = dt.getDate();
    if (message.author.bot) {
        return;
    }

    if (month === 9 && date === 31) {
        /* Happy Halloween! */

        if (message.content.match(/トリック/) && message.content.match(/オア/) && message.content.match(/トリート/)) {
            const reply_text = `単位くれないといたずらしちゃうぞ`;
            message.reply(reply_text).catch(console.error);
        }
    }
    if (month === 0 && date === 1) {
        /* Happy NewYear! */

        if (message.content.match(/あけおめ/) || (message.content.match(/あけまして/) && message.content.match(/明けまして/))) {
            const reply_text = `あけおめ！`;
            message.reply(reply_text).catch(console.error);
        }
    }
};
