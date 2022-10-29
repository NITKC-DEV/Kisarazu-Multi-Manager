/*メッセージに反応する系のイースターエッグ*/
exports.func = function func(message) {
    let dt = new Date();
    let month = dt.getMonth();
    let date = dt.getDate();
    if(message.author.bot){
        return;
    }

    if(month=== 9 && date===29){  /*Happy Halloween!*/

        if (message.content.match(/トリック/) && message.content.match(/オア/) && message.content.match(/トリート/)) {
            let channel = message.channel;
            let author = message.author.username;
            let reply_text = `単位くれないといたずらしちゃうぞ`;
            message.reply(reply_text)
                .then(message => console.log(`Sent message: ${reply_text}`))
                .catch(console.error);
        }
        else if (message.content.match(/トリック/) && message.content.match(/||/) && message.content.match(/トリート/)) {
            let channel = message.channel;
            let author = message.author.username;
            let reply_text = `ha?`;
            message.reply(reply_text)
                .then(message => console.log(`Sent message: ${reply_text}`))
                .catch(console.error);
        }
    }
}