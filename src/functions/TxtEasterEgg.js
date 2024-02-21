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
            const replyText = `単位くれないといたずらしちゃうぞ`;
            message.reply(replyText).catch(console.error);
        }
    }
    if (month === 0 && date === 1) {
        /* Happy NewYear! */

        if (message.content.match(/あけおめ/) || (message.content.match(/あけまして/) && message.content.match(/明けまして/))) {
            const replyText = `あけおめ！`;
            message.reply(replyText).catch(console.error);
        }
    }
};
