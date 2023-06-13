const {EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, TextInputBuilder,ModalBuilder} = require("discord.js");
const db = require("./db.js");
const system = require("./logsystem.js");
const commands = require("../botmain");

const departmentData = [
    {
        name:"機械工学科",
        color: "00A0EA"
    },{
        name:"電気電子工学科",
        color: "D64E5A"
    },{
        name:"電子制御工学科",
        color: "865DC0"
    },{
        name:"情報工学科",
        color: "CAAB0D"
    },{
        name:"環境工学科",
        color: "1E9B50"
    }
];

const dayName = ["月","火","水","木","金"];

const time = ["1-2限：08:50 - 10:25\n","3-4限：10:35 - 12:10\n","5-6限：13:00 - 14:35\n","7-8限：14:45 - 16:15"];

/***
 * 時間割データを生成する
 * @param grade 学年を1~5で指定
 * @param department 学科を1~5で指定
 * @param day 曜日を1~5で指定
 * @param change 授業変更を加味する場合はTrue(来週限定)
 * @returns Embed(存在しない場合0、エラーの場合は-1)
 */
exports.generation = async function func(grade,department,day,change) {
    let data;
    if(change){

    }
    else{
         data = await db.find("main","timetableData",{grade:String(grade),department:String(department),day:String(day)});
    }

    if(data.length > 0){
        let field = [];
        let dailyComment="";
        for(let i = 0; i < data[0].timetable.length; i++){
            const subject = await db.find("main","syllabusData",{title:data[0].timetable[i].name,subject_id:`${grade}${department}`});
            let professor = "";
            if(0<subject[0].professor.length){
                professor += "担当教員："
            }

            for(let j=0;j<subject[0].professor.length;j++){
                professor += subject[0].professor[j];
                if(subject[0].professor[j+1] !== undefined){
                    if(j%2 === 0){
                        professor += "・";
                    }
                    else{
                        professor += "\n　　　　　";
                    }
                }
            }

            if(0<subject[0].professor.length){
                professor += "\n"
            }
            let comment = "";
            if(data[0].timetable[i].comment !== ""){
                comment = `\n備考　　：${data[0].timetable[i].comment}`
            }

            if(subject[0].title === "HR" || subject[0].title === "課題学習時間"){
                dailyComment += "7限  ：14:45 - 15:30\n"
            }
            else if(subject[0].title !== "空きコマ") {
                dailyComment += `${time[i]}`;
            }

            field.push({
                name:subject[0].title,
                value:`\`\`\`${professor}授業場所：${subject[0].room}${comment}\`\`\``
            })
        }
        if(data[0].comment !== ""){
            data[0].comment = "--------------------\n" + data[0].comment;
        }
        field.push({
            name:"授業時間・備考",
            value:`\`\`\`${dailyComment}${data[0].comment}\`\`\``
        })

        return new EmbedBuilder()
            .setColor(departmentData[parseFloat(department)-1].color)
            .setTitle(`${departmentData[parseFloat(department)-1].name}${grade}年 ${dayName[parseFloat(day)-1]}曜日の時間割`)
            .setAuthor({
                name: "木更津高専統合管理BOT",
                iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                url: 'https://github.com/NITKC22s/bot-main'
            })
            .setDescription(`${dayName[parseFloat(day)-1]}曜日の時間割です。\n※未登録の休講や授業変更等がある可能性があります。`)
            .addFields(field)
            .setTimestamp()
            .setFooter({ text: 'Developed by NITKC22s server Admin' });
    }
    else{
        return 0;
    }
}

/***
 * 臨時時間割データを追加 or 生成
 * @param interaction セレクトメニューのinteraction
 */

//カスタムID命名規則　${学年1ケタ}${学科1ケタ}${元データ曜日1ケタ}${変更日時4ケタ or 3ケタ文字列}add-exception${変更コマ(0~3)}
exports.addExceptionAdd = async function func(interaction) {
    const grade = interaction.customId[0];
    const department = interaction.customId[1];
    const day = interaction.customId[2];
    const period = interaction.customId.slice(-1);
    const date = interaction.customId.substring(3,interaction.customId.match(/add-exception/).index) + '0';

    let data = await db.find("main","timetableData",{grade:grade,department:department,day: date});
    if(data.length === 0){
        data = await db.find("main","timetableData",{grade:grade,department:department,day: day});
    }


    delete data[0]._id;
    data[0].day = date;
    data[0].timetable[parseInt(period)] = {name:interaction.values[0],comment:""};
    await db.updateOrInsert("main","timetableData",{day:date},data[0]);

}

/***
 * 臨時時間割データにコメントを追加
 * @param interaction ボタンのinteraction
 */
//カスタムID命名規則　${変更日時4ケタ or 3ケタ文字列}updateTimetable${テストモード可否}
exports.addExceptionUpdate = async function func(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(`授業変更・定期テスト登録`)
        .setAuthor({
            name: "木更津高専統合管理BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/NITKC22s/bot-main'
        })
        .setDescription('コメントを入力してください。。\n入力が終わったら、登録ボタンを押してください。')
        .setTimestamp()
        .setFooter({ text: 'Developed by NITKC22s server Admin' });
    const textInput = new TextInputBuilder({
        custom_id: interaction.customId.replace("addCommentTentativeTimetable","updateTimetable"),
        label: 'コメントを追加(例:〇〇のため、△△日の□□と授業入れ替え)',
        style: 1,
    });

    const channel = client.channels.cache.get(interaction.message.channelId);
    await channel.messages.fetch(interaction.message.id)
        .then((message) => {
            message.edit({ embeds:[embed],components: [{type:4,components:[textInput]}], ephemeral: true });
        })
}
// - ${departmentData[parseFloat(interaction.options.getString('学科'))-1].name}${interaction.options.getString('学年')}年 ${Math.floor(interaction.options.getInteger('変更日')/100)}月${Math.floor(interaction.options.getInteger('変更日')%100)}日`
/***
 * 臨時時間割データを登録
 * @param interaction ボタンのinteraction
 */
//カスタムID命名規則　${変更日時4ケタ or 3ケタ文字列}updateTimetable${テストモード可否}
/*
exports.addExceptionUpdate = async function func(interaction) {

}*/
