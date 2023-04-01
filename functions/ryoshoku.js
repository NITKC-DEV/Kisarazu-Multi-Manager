const {EmbedBuilder} = require("discord.js");
const config = require("../environmentConfig");
const client = require("discord.js");

exports.ryoshokuNotice = function func(sendChannel){
    let dt = new Date();
    let month = dt.getMonth();
    let embed
    if(month === 0 || month === 4 || month === 6 || month === 7 || month === 10 ){ //月は何故か-1する
        embed = new EmbedBuilder()
            .setColor(0x00A0EA)
            .setTitle('寮食・風呂入れ替え通知')
            .setAuthor({
                name: "木更津22s統合管理BOT",
                iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                url: 'https://github.com/NITKC22s/bot-main'
            })
            .setDescription('寮食・風呂の前半後半が入れ替わりました')
            .addFields(
                [
                    {
                        name: '前半',
                        value: 'Bグループ(環境都市工学科、情報工学科、電子制御工学科の半分)',
                    },
                    {
                        name: '後半',
                        value: 'Aグループ(機械工学科、電気電子工学科、電子制御工学科の半分)',

                    },
                ]
            )
            .setTimestamp()
            .setFooter({ text: 'Developed by NITKC22s server Admin' });
    }
    else if(month === 1 || month === 3 || month === 5 || month === 9 || month === 11 ){
        embed = new EmbedBuilder()
            .setColor(0x00A0EA)
            .setTitle('寮食・風呂入れ替え通知')
            .setAuthor({
                name: "木更津22s統合管理BOT",
                iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                url: 'https://github.com/NITKC22s/bot-main'
            })
            .setDescription('寮食・風呂の前半後半が入れ替わりました')
            .addFields(
                [
                    {
                        name: '前半',
                        value: 'Aグループ(機械工学科、電気電子工学科、電子制御工学科の半分)',
                    },
                    {
                        name: '後半',
                        value: 'Bグループ(環境都市工学科、情報工学科、電子制御工学科の半分)',

                    },
                ]
            )
            .setTimestamp()
            .setFooter({ text: 'Developed by NITKC22s server Admin' });
    }
    console.log("寮食通知")
    sendChannel.send("<@&"+ config.RyouRole[0] + ">" + "<@&"+ config.RyouRole[1] + ">")
    sendChannel.send({ embeds: [embed] })

}