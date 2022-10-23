import { EmbedBuilder } from 'discord.js'
import { dayOfWeeks } from '../botmain'

let tmp = new EmbedBuilder().setAuthor({
    name: "木更津22s統合管理BOT",
    iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
    url: 'https://discord.gg/mwyC8PTcXa'
}).setFooter({ text: 'Developed by NITKC22s server Admin' });

export function timetableBuilder(classValue, dayOfWeek) {
    return tmp.setColor(classValue.color).setTitle(`${classValue.name} 時間割`)
        .setDescription(`${dayOfWeeks[dayOfWeek]}の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください`)
        .addFields(classValue.timetables).setTimestamp().toJSON()
}
