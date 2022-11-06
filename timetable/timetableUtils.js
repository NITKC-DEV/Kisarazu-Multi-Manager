const { EmbedBuilder } =require('discord.js')


const tmp = new EmbedBuilder().setAuthor({
    name: "木更津22s統合管理BOT",
    iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
    url: 'https://discord.gg/mwyC8PTcXa'
}).setFooter({ text: 'Developed by NITKC22s server Admin' });
const dayOfWeeks = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
module.exports = function timetableBuilder(classValue, dayOfWeek) {
    return tmp.setColor(classValue.color).setTitle(`${classValue.name} 時間割`)
        .setDescription(`${dayOfWeeks[dayOfWeek]}の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください`)
        .setFields(classValue.timetables[dayOfWeek-1]).setTimestamp().toJSON()
}
