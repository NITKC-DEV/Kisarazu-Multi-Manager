const { EmbedBuilder } =require('discord.js')


const tmp = new EmbedBuilder().setAuthor({
    name: "木更津高専統合管理BOT",
    iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
    url: 'https://github.com/NITKC22s/bot-main'
}).setFooter({ text: 'Developed by NITKC22s server Admin' });
const dayOfWeeks = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
module.exports = function timetableBuilder(classValue, dayOfWeek) {
    return tmp.setColor(classValue.color).setTitle(`${classValue.name} 時間割`)
        .setDescription(`${dayOfWeeks[dayOfWeek]}の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください`)
        .setFields(classValue.timetables[dayOfWeek-1]).setTimestamp().toJSON()
}
