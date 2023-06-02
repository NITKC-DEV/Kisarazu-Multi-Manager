const { SlashCommandBuilder, EmbedBuilder} = require('discord.js')
const fs = require("fs");
const {configPath} = require("../environmentConfig");
const dashboard = require('../functions/dashboard.js');
const db = require('../functions/db.js');
module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('dashboard')
                .setDescription('ダッシュボードを表示します'),

            async execute(interaction) {
                if(interaction.guild === undefined || interaction.guild === null){
                    await interaction.reply({ content: 'サーバー情報が取得できませんでした。DMで実行している などの原因が考えられます。', ephemeral: true });
                }
                else{
                    const embed = await dashboard.generation(interaction.guild)
                    await interaction.reply({ embeds: [embed] });
                }
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
                    db.updateDB(
                        "main","nextTest",{label:String(interaction.options.data[5].value)},
                        {
                            $set: {
                                year: String(interaction.options.data[0].value),
                                month1: String(interaction.options.data[1].value),
                                day1: String(interaction.options.data[2].value),
                                month2: String(interaction.options.data[3].value),
                                day2: String(interaction.options.data[4].value)
                            },
                        }
                    )

                    await interaction.reply({ content: `今年度${interaction.options.data[5].value}回目のテストを${interaction.options.data[0].value}年${interaction.options.data[1].value}月${interaction.options.data[2].value}日〜${interaction.options.data[3].value}月${interaction.options.data[4].value}日に設定しました`, ephemeral: true });
                }
                else{
                    await interaction.reply({content:"どっか〜ん　するから、1~4の中で指定してくれ", ephemeral: true })
                }

            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('auto-dashboard')
                .setDescription('自動更新されるダッシュボードを選択')
                .setDefaultMemberPermissions(1<<3)
                .addStringOption(option =>
                    option
                        .setName('ダッシュボードid')
                        .setDescription('メッセージIDを入力')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('チャンネルid')
                        .setDescription('チャンネルIDを入力')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('ギルドid')
                        .setDescription('ギルドIDを入力')
                        .setRequired(true)
                ),

            async execute(interaction) {
                const data = JSON.parse(fs.readFileSync(configPath, 'utf8'))  //ここで読み取り
                data.dashboard = [interaction.options.data[0].value,interaction.options.data[1].value,interaction.options.data[2].value]
                fs.writeFileSync(configPath, JSON.stringify(data,null ,"\t"))
                await interaction.reply({ content: `メッセージID:${data.dashboard[0]} を、自動更新ダッシュボードに設定しました。`, ephemeral: true });

            },
        },
    ]