const {EmbedBuilder} = require("discord.js");
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
        for(let i = 0; i < data[0].timetable.length; i++){
            const subject = await db.find("main","syllabusData",{subject_id:`${grade}${department}${data[0].timetable[i].name}`});
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

            field.push({
                name:subject[0].title,
                value:`\`\`\`${professor}授業場所：${subject[0].room}${comment}\`\`\``
            })
        }
        field.push({
            name:"授業時間・備考",
            value:`\`\`\`1-2限：08:50 - 10:25\n3-4限：10:35 - 12:10\n5-6限：13:00 - 14:35\n7-8限：14:45 - 16:15\`\`\``
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