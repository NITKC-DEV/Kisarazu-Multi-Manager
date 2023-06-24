const {EmbedBuilder, ActionRowBuilder, TextInputBuilder,ModalBuilder} = require("discord.js");
const db = require("./db.js");
const {setTimeout} = require("node:timers/promises");

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
const examTime = ["08:50 - 09:50\n","10:05 - 11:05\n","11:20 - 12:20\n"];

/***
 * 時間割データを生成する
 * @param grade 学年を1~5で指定
 * @param department 学科を1~5で指定
 * @param day 曜日を1~5で指定
 * @param change 授業変更を加味する場合はTrue(来週限定)
 * @returns {Promise<number|EmbedBuilder>}
 */
exports.generation = async function func(grade,department,day,change = true) {
    let data,dateText;
    if(change){
        let date = new Date();
        let nowDay = date.getDay(); //今日
        let nextDay = parseFloat(day) - nowDay; //対象の曜日は何日後?
        if(0 > nextDay){nextDay += 7}

        date.setDate(date.getDate() + nextDay);//対象の日を取得
        data = await db.find("main","timetableData",{grade:String(grade),department:String(department),day:String(date.getMonth()+1)+ String(date.getDate())});
        if(data.length === 0){
            data = await db.find("main","timetableData",{grade:String(grade),department:String(department),day:String(day)});
            dateText = `${dayName[parseFloat(day)-1]}曜日`
        }
        else{
            dateText = `${date.getMonth()+1}月${date.getDate()}日 (${dayName[parseFloat(day)-1]})`
        }
    }
    else{
         data = await db.find("main","timetableData",{grade:String(grade),department:String(department),day:String(day)});
         dateText = `${dayName[parseFloat(day)-1]}曜日`
    }

    if(data.length > 0){
        if(data[0].test){
            const siz = data[0].timetable.length;
            for(let i=siz-1; i>=0; i--){ //末尾の空きコマ削除
                if(data[0].timetable[i].name === "空きコマ"){
                    data[0].timetable.pop();
                }
                else{
                    break;
                }
            }
            if(data[0].timetable.length === 0){
                if(data[0].comment !== "")data[0].comment = "\n" + data[0].comment
                data[0].comment = "本日設定された試験はありません。" + data[0].comment
            }

            let field = [];
            for(let i = 0; i < data[0].timetable.length; i++){
                let comment = "";
                if(data[0].timetable[i].comment !== ""){
                    comment = `備考　　：${data[0].timetable[i].comment}`
                }

                let subjectComment;
                if(data[0].timetable[i].name === "空きコマ"){
                    subjectComment = "このコマに試験は設定されていません";
                }
                else{
                    subjectComment = examTime[i];
                }

                if(i <= 2){
                    if(comment !== ""){
                        field.push({
                            name:data[0].timetable[i].name,
                            value:`\`\`\`試験時間：${subjectComment}${comment}\`\`\``
                        })
                    }
                    else{
                        field.push({
                            name:data[0].timetable[i].name,
                            value:`\`\`\`試験時間：${subjectComment}\`\`\``
                        })
                    }
                }

            }
            if(data[0].comment !== ""){
                field.push({
                    name:"備考",
                    value:`\`\`\`${data[0].comment}\`\`\``
                })
            }


            return new EmbedBuilder()
                .setColor(departmentData[parseFloat(department)-1].color)
                .setTitle(`${departmentData[parseFloat(department)-1].name}${grade}年 ${data[0].day/100 | 0}月${data[0].day%100}日定期テスト時間割`)
                .setAuthor({
                    name: "木更津高専統合管理BOT",
                    iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                    url: 'https://github.com/NITKC22s/bot-main'
                })
                .setDescription(`${data[0].day/100 | 0}月${data[0].day%100}日の定期テスト時間割です。\n※教室やテスト日程に変更がある場合があります。`)
                .addFields(field)
                .setTimestamp()
                .setFooter({ text: 'Developed by NITKC22s server Admin' });
        }
        else{
            const siz = data[0].timetable.length;
            for(let i=siz-1; i>=0; i--){ //末尾の空きコマ削除
                if(data[0].timetable[i].name === "空きコマ"){
                    data[0].timetable.pop();
                }
                else{
                    break;
                }
            }
            if(data[0].timetable.length === 0){
                if(data[0].comment !== "")data[0].comment = "\n" + data[0].comment
                data[0].comment = "本日授業はありません。" + data[0].comment
            }

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
                .setTitle(`${departmentData[parseFloat(department)-1].name}${grade}年 ${dateText}の時間割`)
                .setAuthor({
                    name: "木更津高専統合管理BOT",
                    iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                    url: 'https://github.com/NITKC22s/bot-main'
                })
                .setDescription(`${dateText}の時間割です。\n※未登録の休講や授業変更等がある可能性があります。`)
                .addFields(field)
                .setTimestamp()
                .setFooter({ text: 'Developed by NITKC22s server Admin' });
        }
    }
    else{
        return 0;
    }
}




/***
 * 臨時時間割データを追加 or 生成
 * @param interaction セレクトメニューのinteraction
 * @returns {Promise<void>}
 */
exports.setNewTimetableData = async function func(interaction) {
    //カスタムID命名規則　${学年1ケタ}${学科1ケタ}${元データ曜日1ケタ}${変更日時5ケタ or 4ケタ文字列}changeTimetableSelectMenu${テストモード識別(0/1)}${変更コマ(0~3)}
    await interaction.deferReply();

    const grade = interaction.customId[0];
    const department = interaction.customId[1];
    const day = interaction.customId[2];
    const mode = interaction.customId.slice(-2,-1);
    const period = interaction.customId.slice(-1);
    const date = interaction.customId.substring(3,interaction.customId.match(/changeTimetableSelectMenu/).index) + '00';

    let data = await db.find("main","timetableData",{grade:grade,department:department,day: date});
    if(data.length === 0){
        data = await db.find("main","timetableData",{grade:grade,department:department,day: interaction.customId.substring(3,interaction.customId.match(/changeTimetableSelectMenu/).index)});
        if(data.length === 0){
            data = await db.find("main","timetableData",{grade:grade,department:department,day: day});
        }
    }
    delete data[0]._id;
    data[0].day = date;
    data[0].timetable[parseInt(period)] = {name:interaction.values[0],comment:""};

    if(mode === "0" && data[0].timetable.length === 4){
        data[0].timetable.pop()
    }
    let subjects="";
    for(let i=0;i<data[0].timetable.length;i++){
        subjects += `${2*i+1}-${2*i+2}限：` + data[0].timetable[i].name + '\n';
    }

    const embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(`授業変更・定期テスト登録 - ${departmentData[parseFloat(department)-1].name}${grade}年 ${Math.floor(date/10000)}月${Math.floor(date%10000/100)}日`)
        .setAuthor({
            name: "木更津高専統合管理BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/NITKC22s/bot-main'
        })
        .setDescription(`教科を選択してください。\n\n入力が終わったら、登録ボタンを押してください`)
        .addFields({
            name:`現在選択済みの時間割`,
            value:`\`\`\`${subjects}\`\`\``
        })
        .setTimestamp()
        .setFooter({ text: 'Developed by NITKC22s server Admin' });

    const channel = client.channels.cache.get(interaction.message.channelId);
    channel.messages.fetch(interaction.message.id)
        .then((message) => {
            message.edit({embeds: [embed],comments: message.comments});
        })
        .catch(error => {

        });
    await db.updateOrInsert("main","timetableData",{day:date},data[0]);
    await interaction.deleteReply();


}

/***
 * 臨時時間割データにコメントを追加し本登録
 * @param interaction ボタンのinteraction
 * @returns {Promise<void>}
 */
exports.showNewTimetableModal = async function func(interaction) {
    //カスタムID命名規則　${学年1ケタ}${学科1ケタ}${変更日時5ケタ or 4ケタ文字列}changeTimetableButton${テストモード可否}
    const grade = interaction.customId[0];
    const department = interaction.customId[1];
    const mode = interaction.customId.slice(-1);
    const date = interaction.customId.substring(2,interaction.customId.match(/changeTimetableButton/).index);

    const data = await db.find("main","timetableData",{day:date + '00'});

    const modal = new ModalBuilder()
        .setCustomId(`${date}commentInputNewTimetableModal${grade}${department}`)
        .setTitle(`${Math.floor(date/100)}月${Math.floor(date%100)}日 - コメントを追加`);

    for(let i = 0; i < data[0].timetable.length;i++){
        const input = new TextInputBuilder()
            .setCustomId(`${date}commentInputNewTimetable${grade}${department}${i}`)
            .setLabel(`${2*i+1}-${2*i+2}限目(${data[0].timetable[i].name})のコメントを登録`)
            .setRequired(false)
            .setStyle(1);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
    }
    const input = new TextInputBuilder()
        .setCustomId(`${date}commentInputNewTimetable${grade}${department}5`)
        .setLabel(`${Math.floor(date/100)}月${Math.floor(date%100)}日の時間割にコメントを登録`)
        .setStyle(1);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
    const filter = (mInteraction) => mInteraction.customId === `${date}commentInputNewTimetableModal${grade}${department}`;

    interaction.awaitModalSubmit({ filter, time: 3600000 })
        .then(async mInteraction => {
            let inputTxt = [],comment;
            for (let i = 0; i < data[0].timetable.length; i++) {
                inputTxt[i] = mInteraction.fields.getTextInputValue(`${date}commentInputNewTimetable${grade}${department}${i}`);
            }
            comment = mInteraction.fields.getTextInputValue(`${date}commentInputNewTimetable${grade}${department}5`);


            for(let i = 0; i < data[0].timetable.length;i++){
                if(inputTxt[i]!=="" && inputTxt[i]!==undefined)data[0].timetable[i].comment = inputTxt[i];
            }
            data[0].comment = comment;
            data[0].day = date;
            if(mode === '0'){
                data[0].test = true;
            }
            else{
                data[0].test = false;
            }
            delete data[0]._id;
            await db.updateOrInsert("main","timetableData",{day:date},data[0]);
            await db.delete("main","timetableData",{day:date + '00'});
            const channel = client.channels.cache.get(interaction.message.channelId);
            channel.messages.fetch(interaction.message.id)
                .then((message) => {
                    message.delete();
                })
                .catch(error => {

                });
            let replyOptions=time=>{return{content: '登録しました。\n(このメッセージは'+time+'秒後に自動で削除されます)', ephemeral:true};};
            await mInteraction.reply(replyOptions(5));
            for(let i=5;i>0;i--){
                await mInteraction.editReply(replyOptions(i));
                await setTimeout(1000);
            }
            await mInteraction.deleteReply();


        })
        .catch(error => {
            const channel = client.channels.cache.get(interaction.message.channelId);
            channel.messages.fetch(interaction.message.id)
                .then((message) => {
                    message.delete();
                })
                .catch(error => {});
        })
}
