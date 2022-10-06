const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const commands = require("../botmain");

module.exports =[
    {
        data: new SlashCommandBuilder()
            .setName('timetable')
            .setDescription('指定した学科・曜日の時間割を送信します')
            .addStringOption(option =>
                option
                    .setName('学科')
                    .setDescription('学科を指定します')
                    .setRequired(true)
                    .addChoices(
                        {name:'M-機械工学科', value:'M'},
                        {name:'E-電気電子工学科', value:'E'},
                        {name:'D-電子制御工学科', value:'D'},
                        {name:'J-情報工学科', value:'J'},
                        {name:'C-環境都市工学科', value:'C'},
                    )
            )
            .addStringOption(option =>
                option
                    .setName('曜日')
                    .setDescription('曜日を指定します。指定なければ次の学校の日になります。')
                    .setRequired(false)
                    .addChoices(
                        {name:'月曜日', value:'1'},
                        {name:'火曜日', value:'2'},
                        {name:'水曜日', value:'3'},
                        {name:'木曜日', value:'4'},
                        {name:'金曜日', value:'5'},
                    )

            ),

        async execute(interaction) {
            let embed;
            if(interaction.options.getString('曜日')=='1'){
                if(interaction.options.getString('学科')=='M'){
                    embed = new EmbedBuilder()
                        .setColor(0x00A0EA)
                        .setTitle('機械工学科 時間割')
                        .setAuthor({
                            name: "木更津22s統合管理BOT",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setDescription('月曜日の時間割です。\n ※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .addFields(
                            [
                                {
                                    name: '基礎数学Ⅱ',
                                    value:'担当教員:関口 昌由 \n授業場所:1年機械工学科教室',
                                },
                                {
                                    name: '工学実験ⅠB',
                                    value:'担当教員:小田 功,高橋 美喜男,松井 翔太 \n授業場所:実習工場',
                                },
                                {
                                    name: '図学製図Ⅱ',
                                    value:'担当教員:松井 翔太 \n授業場所:1年機械工学科教室',
                                },
                                {
                                    name: '課題学習時間',
                                    value:'授業場所:1年機械工学科教室ほか ',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
            }
            else if(interaction.options.getString('曜日')=='2'){

            }
            else if(interaction.options.getString('曜日')=='3'){

            }
            else if(interaction.options.getString('曜日')=='4'){

            }
            else if(interaction.options.getString('曜日')=='5'){

            }
            else{

            }
            await interaction.reply({ embeds: [embed] });
        },
    },


]
