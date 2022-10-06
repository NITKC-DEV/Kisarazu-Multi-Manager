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
            const commands = require('../botmain')
            const embed = new EmbedBuilder()
                .setColor(0x00A0EA)
                .setTitle('ヘルプ')
                .setAuthor({
                    name: "\u200b",
                    iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                    url: 'https://discord.gg/mwyC8PTcXa'
                })
                .setDescription('現在実装されているコマンド一覧です')
                .addFields(
                    commands.map(e => ({ name: '/' + e.data.name, value: e.data.description }))
                )
                .setTimestamp()
                .setFooter({ text: 'Developed by NITKC22s server Admin' });
            await interaction.reply({ embeds: [embed] });
        },
    },


]
