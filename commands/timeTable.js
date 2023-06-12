const { SlashCommandBuilder} = require('discord.js');
const  timetableBuilder  = require('../functions/ttGeneration.js');
const Classes = require('../timetable/timetables.json');
const fs = require('fs');
const {configPath}=require("../environmentConfig");
const system = require('../functions/logsystem.js');
const db = require('../functions/db.js');


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
            await interaction.deferReply()
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
                const embed = await timetableBuilder.generation(grade,department,String(dayOfWeek),);
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


]
