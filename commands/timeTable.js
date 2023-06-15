const {SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, EmbedBuilder,ButtonBuilder,
    ModalBuilder,
    TextInputBuilder
} = require('discord.js');
const  timetable  = require('../functions/ttGeneration.js');
const Classes = require('../timetable/timetables.json');
const fs = require('fs');
const {configPath}=require("../environmentConfig");
const system = require('../functions/logsystem.js');
const db = require('../functions/db.js');
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
                const embed = await timetable.generation(grade,department,String(dayOfWeek),);
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
            const date = JSON.parse(fs.readFileSync(configPath, 'utf8'))  //ここで読み取り
            date.timetable = interaction.options.data[0].value
            fs.writeFileSync(configPath, JSON.stringify(date,null ,"\t")) //ここで書き出し
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
                    .setName('曜日')
                    .setDescription('元データとする曜日をいれてください。')
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
            const defaultData = await db.find("main","timetableData",{grade:String(interaction.options.getString('学年')),department:String(interaction.options.getString('学科')),day:String(interaction.options.getString('曜日'))});
            const subject = await db.find("main","syllabusData",{subject_id:`${interaction.options.getString('学年')}${interaction.options.getString('学科')}`})

            let options=[];
            for(let i = 0;i<subject.length;i++){
                options.push({label: subject[i].title, value: subject[i].title});
            }
            for(let i = 0; i < 4;i++){
                select[i] = new StringSelectMenuBuilder()
                    .setCustomId(`${interaction.options.getString('学年')}${interaction.options.getString('学科')}${interaction.options.getString('曜日')}${interaction.options.getInteger('変更日')}changeTimetableSelectMenu${i}`)
                    .setPlaceholder(`${i*2+1}-${i*2+2}限目の教科を選択(未選択時：${(defaultData[0].timetable[i] ?? {name:"授業なし"}).name})`)
                    .addOptions(
                        options
                    );
            }

            const embed = new EmbedBuilder()
                .setColor(0x00A0EA)
                .setTitle(`授業変更・定期テスト登録 - ${departmentData[parseFloat(interaction.options.getString('学科'))-1].name}${interaction.options.getString('学年')}年 ${Math.floor(interaction.options.getInteger('変更日')/100)}月${Math.floor(interaction.options.getInteger('変更日')%100)}日`)
                .setAuthor({
                    name: "木更津高専統合管理BOT",
                    iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                    url: 'https://github.com/NITKC22s/bot-main'
                })
                .setDescription('教科を選択してください。\n入力が終わったら、登録ボタンを押してください。')
                .setTimestamp()
                .setFooter({ text: 'Developed by NITKC22s server Admin' });

            const button = new ButtonBuilder({
                custom_id: `${interaction.options.getString('学年')}${interaction.options.getString('学科')}${interaction.options.getInteger('変更日')}changeTimetableButton${interaction.options.getInteger('授業変更')}`,
                style: 1,
                label: '登録！'
            });
            await interaction.reply({ embeds:[embed],components: [{type:1,components:[select[0]]},{type:1,components:[select[1]]},{type:1,components:[select[2]]},{type:1,components:[select[3]]},{type:1,components:[button]}]});
            /*
            メモ：時間割を完成させるまでは0 + 日付　で検索避けをしてエラー回避
            カスタムidの先頭に適当な文字をいれて、何限目の編集をしてるか取得できるように
            カスタムidの末尾に日付をいれて、いつの編集をしてるかをわかるように
             */
        }
    }


]
