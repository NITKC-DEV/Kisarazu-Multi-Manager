const { SlashCommandBuilder, EmbedBuilder , version, Client, GatewayIntentBits, Partials} = require('discord.js')
const fs = require("fs");
const {configPath} = require("../environmentConfig");

const dashboard = require('../functions/dashboard.js');

module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('dashboard')
                .setDescription('ダッシュボードを表示します'),

            async execute(interaction) {
                const embed = await dashboard.generation(interaction)
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('next-test')
                .setDescription('次のテストを設定します。')
                .setDefaultMemberPermissions(1<<3)
                .addIntegerOption(option =>
                    option
                        .setName('年')
                        .setDescription('テストが実施される年を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('開始月')
                        .setDescription('テストが開始される月を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('開始日')
                        .setDescription('テストが開始される日を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('終了月')
                        .setDescription('テストが終了する月を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('終了日')
                        .setDescription('テストが終了する日を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('四半期')
                        .setDescription('何番目のテストか入力(1~4)')
                        .setRequired(true)
                ),


            async execute(interaction) {
                if(interaction.options.data[5].value > 0 && interaction.options.data[5].value < 5){
                    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'))  //ここで読み取り
                    data.nextTest[interaction.options.data[5].value-1] = [
                        interaction.options.data[0].value,
                        interaction.options.data[1].value,
                        interaction.options.data[2].value,
                        interaction.options.data[3].value,
                        interaction.options.data[4].value
                    ]
                    fs.writeFileSync(configPath, JSON.stringify(data,null ,"\t")) //ここで書き出し
                    await interaction.reply({ content: `今年度${interaction.options.data[5].value}回目のテストを${data.nextTest[interaction.options.data[5].value-1][0]}年${data.nextTest[interaction.options.data[5].value-1][1]}月${data.nextTest[interaction.options.data[5].value-1][2]}日〜${data.nextTest[interaction.options.data[5].value-1][3]}月${data.nextTest[interaction.options.data[5].value-1][4]}日に設定しました`, ephemeral: true });
                }
                else{
                    await interaction.reply({content:"どっか〜ん　するから、1~4の中で指定してくれ", ephemeral: true })
                }

            },
        },
    ]