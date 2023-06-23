const {SlashCommandBuilder, StringSelectMenuBuilder,EmbedBuilder,ButtonBuilder,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,} = require('discord.js');
const  timetable  = require('../functions/ttGeneration.js');
const fs = require('fs');
const {configPath}=require("../environmentConfig");
const db = require('../functions/db.js');
const guildData = require('../functions/guildDataSet.js')
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


module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('timetable')
            .setDescription('指定した学科・曜日の時間割を送信します')
            .addStringOption(option =>
                option
                    .setName('曜日')
                    .setDescription('曜日を指定します。指定なければ次の学校の日になります。')
                    .setRequired(false)
                    .addChoices(
                        { name: '月曜日', value: '1' },
                        { name: '火曜日', value: '2' },
                        { name: '水曜日', value: '3' },
                        { name: '木曜日', value: '4' },
                        { name: '金曜日', value: '5' },
                    )
            )
            .addBooleanOption(option =>
                option
                    .setName('授業変更')
                    .setDescription('授業変更を反映させるかどうか指定します(デフォルト=true)')
                    .setRequired(false)
            )
            .addStringOption(option =>
                option
                    .setName('学科')
                    .setDescription('学科を指定します')
                    .setRequired(false)
                    .addChoices(
                        { name: 'M-機械工学科', value: '1' },
                        { name: 'E-電気電子工学科', value: '2' },
                        { name: 'D-電子制御工学科', value: '3' },
                        { name: 'J-情報工学科', value: '4' },
                        { name: 'C-環境都市工学科', value: '5' },
                    )
            )
            .addStringOption(option =>
                option
                    .setName('学年')
                    .setDescription('学年を指定します。')
                    .setRequired(false)
                    .addChoices(
                        { name: '1年生', value: '1' },
                        { name: '2年生', value: '2' },
                        { name: '3年生', value: '3' },
                        { name: '4年生', value: '4' },
                        { name: '5年生', value: '5' },
                    )
            ),

        async execute(interaction) {
            await interaction.deferReply();
            let dt = new Date();
            let dayOfWeek = dt.getDay();
            let hours = dt.getHours();
            if (interaction.options.getString('曜日') === '1') {
                dayOfWeek = 1;
            } else if (interaction.options.getString('曜日') === '2') {
                dayOfWeek = 2;
            } else if (interaction.options.getString('曜日') === '3') {
                dayOfWeek = 3;
            } else if (interaction.options.getString('曜日') === '4') {
                dayOfWeek = 4;
            } else if (interaction.options.getString('曜日') === '5') {
                dayOfWeek = 5;
            } else {
                if (hours >= 17) {
                    dayOfWeek += 1;
                }
                if (dayOfWeek === 6 || dayOfWeek === 7 || dayOfWeek === 0) {
                    dayOfWeek = 1;
                }
            }

            let department = interaction.options.getString('学科');
            if(department === undefined || department === null){
                const guildData = await db.find("main","guildData",{guild:String(interaction.guildId)});
                if(interaction.member._roles.includes(guildData[0].mRole))department = '1';
                else if(interaction.member._roles.includes(guildData[0].eRole))department = '2';
                else if(interaction.member._roles.includes(guildData[0].dRole))department = '3';
                else if(interaction.member._roles.includes(guildData[0].jRole))department = '4';
                else if(interaction.member._roles.includes(guildData[0].cRole))department = '5';
            }

            let grade = interaction.options.getString('学年');
            if(grade === undefined || grade === null){
                const guildData = await db.find("main","guildData",{guild:String(interaction.guildId)});
                grade = dt.getFullYear() - parseFloat(guildData[0].grade) + 1
            }

            if(isNaN(grade)){
                await interaction.editReply("このサーバーに学年情報が登録されていないため、学年オプションを省略できません。\n管理者に伝えて、guilddataコマンドで入学した年を登録してもらってください。");
            }
            else if(department === null){
                await interaction.editReply("あなたが学科ロールを付けていないか、このサーバーに学科ロールが登録されていないため、学科オプションを省略できません。\nサーバーでロールを付与してもらうか、管理者に伝えてguilddataコマンドで学科ロールを登録してもらってください。");
            }
            else{
                const embed = await timetable.generation(grade,department,String(dayOfWeek),interaction.options.getBoolean('授業変更') ?? true);
                if(embed === 0){
                    await interaction.editReply("指定したデータは未登録です。");
                }
                else if(embed === 1){

                }
                else{
                    await interaction.editReply({ embeds: [embed] });
                }
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('tt-switcher')
            .setDescription('時間割定期送信のON/OFFを切り替えます')
            .setDefaultMemberPermissions(1<<3)
            .addBooleanOption(option =>
                option
                    .setName('options')
                    .setDescription('定期実行の可否を指定します')
                    .setRequired(true)
            ),

        async execute(interaction) {
            await guildData.updateOrInsert(interaction.guildId,{timetable:interaction.options.data[0].value})
            await interaction.reply({ content: "時間割定期通知機能を" + interaction.options.data[0].value + "に設定しました", ephemeral: true });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('add-exception')
            .setDescription('授業変更、及び定期テスト等を登録します。')
            .setDefaultMemberPermissions(1<<3)
            .addStringOption(option =>
                option
                    .setName('モード')
                    .setDescription('モード選択')
                    .setRequired(true)
                    .addChoices(
                        { name: '定期テスト', value: '0' },
                        { name: '授業変更', value: '1' }
                    )
            )
            .addStringOption(option =>
                option
                    .setName('学科')
                    .setDescription('学科を指定します')
                    .setRequired(true)
                    .addChoices(
                        { name: 'M-機械工学科', value: '1' },
                        { name: 'E-電気電子工学科', value: '2' },
                        { name: 'D-電子制御工学科', value: '3' },
                        { name: 'J-情報工学科', value: '4' },
                        { name: 'C-環境都市工学科', value: '5' },
                    )
            )
            .addStringOption(option =>
                option
                    .setName('学年')
                    .setDescription('学年を指定します。')
                    .setRequired(true)
                    .addChoices(
                        { name: '1年生', value: '1' },
                        { name: '2年生', value: '2' },
                        { name: '3年生', value: '3' },
                        { name: '4年生', value: '4' },
                        { name: '5年生', value: '5' },
                    )
            )
            .addIntegerOption(option =>
                option
                    .setName('変更日')
                    .setDescription('授業変更する日を、月×100+日でいれてください。例)12月14日→1214')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('ベースの曜日')
                    .setDescription('変更日のデータがなかった場合にコピーする曜日を選択。')
                    .setRequired(true)
                    .addChoices(
                        { name: '月曜日', value: '1' },
                        { name: '火曜日', value: '2' },
                        { name: '水曜日', value: '3' },
                        { name: '木曜日', value: '4' },
                        { name: '金曜日', value: '5' },
                    )
            ),

        async execute(interaction) {
            let select = [];
            let defaultData = await db.find("main","timetableData",{grade:String(interaction.options.getString('学年')),department:String(interaction.options.getString('学科')),day:String(interaction.options.getInteger('変更日')) + '00'}); //変更日のキャッシュデータ
            if(defaultData[0] === undefined){
                defaultData = await db.find("main","timetableData",{grade:String(interaction.options.getString('学年')),department:String(interaction.options.getString('学科')),day:String(interaction.options.getInteger('変更日'))}); //変更日のデータ

                if(defaultData[0] === undefined){
                    defaultData = await db.find("main","timetableData",{grade:String(interaction.options.getString('学年')),department:String(interaction.options.getString('学科')),day:String(interaction.options.getString('曜日'))}); //指定したベースデータ
                    if(defaultData[0] === undefined){
                        let date = new Date();
                        let now = parseFloat(String(date.getMonth()) + String(date.getDate()));
                        if(now > parseFloat(interaction.options.getInteger('変更日'))){
                            date.setDate(date.getFullYear()+1); //来年なので1足す
                        }
                        

                        interaction.reply({content:"その学科・曜日のデータは登録されていません。", ephemeral: true});
                        return ;
                    }
                }
            }

            delete defaultData[0]._id;
            defaultData[0].day = String(interaction.options.getInteger('変更日')) + '00';
            await db.updateOrInsert("main","timetableData",{day:String(interaction.options.getInteger('変更日'))},defaultData[0]);

            const subject = await db.find("main","syllabusData",{subject_id:`${interaction.options.getString('学年')}${interaction.options.getString('学科')}`})

            let options=[];
            for(let i = 0;i<subject.length;i++){
                options.push({label: subject[i].title, value: subject[i].title});
            }


            if(interaction.options.getString('モード') === '1'){
                for(let i = 0; i < 4;i++){
                    select[i] = new StringSelectMenuBuilder()
                        .setCustomId(`${interaction.options.getString('学年')}${interaction.options.getString('学科')}${interaction.options.getString('曜日')}${interaction.options.getInteger('変更日')}changeTimetableSelectMenu${i}`)
                        .setPlaceholder(`${i*2+1}-${i*2+2}限目の教科を選択`)
                        .addOptions(
                            options
                        );
                }
            }
            else{
                for(let i = 0; i < 3;i++){
                    select[i] = new StringSelectMenuBuilder()
                        .setCustomId(`${interaction.options.getString('学年')}${interaction.options.getString('学科')}${interaction.options.getString('曜日')}${interaction.options.getInteger('変更日')}changeTimetableSelectMenu${i}`)
                        .setPlaceholder(`${i+1}コマ目の教科を選択`)
                        .addOptions(
                            options
                        );
                }
            }


            let subjects="";
            if(interaction.options.getString('モード') === '0'){
                for(let i=0;i<3;i++){
                    subjects += `${i+1}コマ目：` + defaultData[0].timetable[i].name + '\n';
                }
            }
            else{
                for(let i=0;i<defaultData[0].timetable.length;i++){
                    subjects += `${2*i+1}-${2*i+2}限：` + defaultData[0].timetable[i].name + '\n';
                }
            }


            const embed = new EmbedBuilder()
                .setColor(0x00A0EA)
                .setTitle(`授業変更・定期テスト登録 - ${departmentData[parseFloat(interaction.options.getString('学科'))-1].name}${interaction.options.getString('学年')}年 ${Math.floor(interaction.options.getInteger('変更日')/100)}月${Math.floor(interaction.options.getInteger('変更日')%100)}日`)
                .setAuthor({
                    name: "木更津高専統合管理BOT",
                    iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                    url: 'https://github.com/NITKC22s/bot-main'
                })
                .setDescription(`教科を選択してください。\n入力が終わったら、登録ボタンを押してください。`)
                .addFields({
                    name:`現在登録済みの時間割`,
                    value:`\`\`\`${subjects}\`\`\``
                })
                .setTimestamp()
                .setFooter({ text: 'Developed by NITKC22s server Admin' });

            const button = new ButtonBuilder({
                custom_id: `${interaction.options.getString('学年')}${interaction.options.getString('学科')}${interaction.options.getInteger('変更日')}changeTimetableButton${interaction.options.getString('モード')}`,
                style: 1,
                label: '登録！'
            });
            if(interaction.options.getString('モード') === '1'){
                await interaction.reply({ embeds:[embed],components: [{type:1,components:[select[0]]},{type:1,components:[select[1]]},{type:1,components:[select[2]]},{type:1,components:[select[3]]},{type:1,components:[button]}]});
            }
            else{
                await interaction.reply({ embeds:[embed],components: [{type:1,components:[select[0]]},{type:1,components:[select[1]]},{type:1,components:[select[2]]},{type:1,components:[button]}]});
            }
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('delete-exception')
            .setDescription('授業変更やテストのデータを削除します。')
            .setDefaultMemberPermissions(1<<3)
            .addStringOption(option =>
                option
                    .setName('学科')
                    .setDescription('学科を指定します')
                    .setRequired(true)
                    .addChoices(
                        { name: 'M-機械工学科', value: '1' },
                        { name: 'E-電気電子工学科', value: '2' },
                        { name: 'D-電子制御工学科', value: '3' },
                        { name: 'J-情報工学科', value: '4' },
                        { name: 'C-環境都市工学科', value: '5' },
                    )
            )
            .addStringOption(option =>
                option
                    .setName('学年')
                    .setDescription('学年を指定します。')
                    .setRequired(true)
                    .addChoices(
                        { name: '1年生', value: '1' },
                        { name: '2年生', value: '2' },
                        { name: '3年生', value: '3' },
                        { name: '4年生', value: '4' },
                        { name: '5年生', value: '5' },
                    )
            )
            .addIntegerOption(option =>
                option
                    .setName('削除日')
                    .setDescription('削除する日を、月×100+日でいれてください。例)12月14日→1214')
                    .setRequired(true)
            ),

        async execute(interaction) {
            await db.delete("main","timetableData",{grade:String(interaction.options.getString('学年')),department:String(interaction.options.getString('学科')),day:String(interaction.options.getInteger('削除日'))});
            await db.delete("main","timetableData",{grade:String(interaction.options.getString('学年')),department:String(interaction.options.getString('学科')),day:String(interaction.options.getInteger('削除日' + '00'))});
            let replyOptions=time=>{return{content: '削除しました。\n(このメッセージは'+time+'秒後に自動で削除されます)', ephemeral:true};};
            await interaction.reply(replyOptions(5));
            for(let i=5;i>0;i--){
                await interaction.editReply(replyOptions(i));
                await setTimeout(1000);
            }
            await interaction.deleteReply();
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('comment-timetable')
            .setDescription('特定の日にコメントを追加します。(明日からの1週間は曜日で指定可)')
            .addStringOption(option =>
                option
                    .setName('学科')
                    .setDescription('学科を指定します')
                    .setRequired(true)
                    .addChoices(
                        { name: 'M-機械工学科', value: '1' },
                        { name: 'E-電気電子工学科', value: '2' },
                        { name: 'D-電子制御工学科', value: '3' },
                        { name: 'J-情報工学科', value: '4' },
                        { name: 'C-環境都市工学科', value: '5' },
                    )
            )
            .addStringOption(option =>
                option
                    .setName('学年')
                    .setDescription('学年を指定します。')
                    .setRequired(true)
                    .addChoices(
                        { name: '1年生', value: '1' },
                        { name: '2年生', value: '2' },
                        { name: '3年生', value: '3' },
                        { name: '4年生', value: '4' },
                        { name: '5年生', value: '5' },
                    )
            )
            .addStringOption(option =>
                option
                    .setName('変更日')
                    .setDescription('明日~来週の今日までを曜日で指定します(それ以上は管理者限定)')
                    .setRequired(true)
                    .addChoices(
                        { name: '月曜日', value: '1' },
                        { name: '火曜日', value: '2' },
                        { name: '水曜日', value: '3' },
                        { name: '木曜日', value: '4' },
                        { name: '金曜日', value: '5' },
                    )
            ),

        async execute(interaction) {
            let nowDate = new Date();
            let nowDay = nowDate.getDay(); //今日
            let nextDay = parseFloat(interaction.options.getString('変更日')) - nowDay; //対象の曜日は何日後?
            if(0 >= nextDay){nextDay += 7}

            nowDate.setDate(nowDate.getDate() + nextDay);//対象の日を取得
            let date = (nowDate.getMonth()+1)*100 + nowDate.getDate();

            const grade = interaction.options.getString('学年');
            const department = interaction.options.getString('学科');
            let data = await db.find("main","timetableData",{grade: grade,department: department,day: String(date)});
            const defaultData = await db.find("main","timetableData",{grade: grade,department: department,day:interaction.options.getString('変更日')});
            if(data.length === 0){
                data = defaultData;
            }


            const modal = new ModalBuilder()
                .setCustomId(`${date}addCommentTimetableModal${grade}${department}`)
                .setTitle(`${departmentData[parseFloat(interaction.options.getString('学科'))-1].name}${interaction.options.getString('学年')}年${Math.floor(date/100)}月${Math.floor(date%100)}日`);

            for(let i = 0; i < data[0].timetable.length;i++){
                const input = new TextInputBuilder()
                    .setCustomId(`${date}addCommentTimetable${grade}${department}${i}`)
                    .setLabel(`${2*i+1}-${2*i+2}限目(${data[0].timetable[i].name})のコメントを登録(上書きされます)`)
                    .setRequired(false)
                    .setStyle(1);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
            }
            const input = new TextInputBuilder()
                .setCustomId(`${date}addCommentTimetable${grade}${department}5`)
                .setLabel(`${Math.floor(date/100)}月${Math.floor(date%100)}日の時間割にコメントを登録`)
                .setRequired(false)
                .setStyle(1);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
            const filter = (mInteraction) => mInteraction.customId === `${date}addCommentTimetableModal${grade}${department}`;

            interaction.awaitModalSubmit({ filter, time: 360000 })
                .then(async mInteraction => {
                    let inputTxt = [],comment;
                    for (let i = 0; i < data[0].timetable.length; i++) {
                        inputTxt[i] = mInteraction.fields.getTextInputValue(`${date}addCommentTimetable${grade}${department}${i}`);
                    }
                    comment = mInteraction.fields.getTextInputValue(`${date}addCommentTimetable${grade}${department}5`);


                    for(let i = 0; i < data[0].timetable.length;i++){
                        if(inputTxt[i]!=="" && inputTxt[i]!==undefined){
                            if(defaultData[0].timetable[i].comment === ""){
                                data[0].timetable[i].comment = defaultData[0].timetable[i].comment + `${inputTxt[i]}`;
                            }
                            else{
                                data[0].timetable[i].comment = defaultData[0].timetable[i].comment + `\n　　　　　${inputTxt[i]}`;
                            }
                        }
                    }
                    if(comment!=="" && comment!==undefined)data[0].comment = defaultData[0].comment + comment;
                    data[0].day = String(date);
                    delete data[0]._id;

                    await db.updateOrInsert("main","timetableData",{day:String(date)},data[0]);

                    let replyOptions=time=>{return{content: '登録しました。\n(このメッセージは'+time+'秒後に自動で削除されます)', ephemeral:true};};
                    await mInteraction.reply(replyOptions(5));
                    for(let i=5;i>0;i--){
                        await mInteraction.editReply(replyOptions(i));
                        await setTimeout(1000);
                    }
                    await mInteraction.deleteReply();
                })
        }
    }


]
