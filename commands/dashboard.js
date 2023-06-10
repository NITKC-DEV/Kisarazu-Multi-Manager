const { SlashCommandBuilder, EmbedBuilder} = require('discord.js')
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
                if(interaction.guild === undefined || interaction.guild === null){
                    await interaction.editReply({ content: 'サーバー情報が取得できませんでした。DMで実行している などの原因が考えられます。', ephemeral: true });
                    system.warn("ダッシュボードギルド情報取得エラー発生(DMの可能性あり)");
                    await interaction.reply({ content: 'サーバー情報が取得できませんでした。DMで実行している などの原因が考えられます。', ephemeral: true });
                }
                else{
                    const embed = await dashboard.generation(interaction.guild)
                    await interaction.editReply({ embeds: [embed] });
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
                const reply = await interaction.deferReply()
                let replyOptions;
                if(interaction.guild === undefined || interaction.guild === null){
                    await interaction.editReply({ content: 'サーバー情報が取得できませんでした。DMで実行している などの原因が考えられます。', ephemeral: true });
                    system.warn("ダッシュボードギルド情報取得エラー発生(DMの可能性あり)");
                    return;
                }
                let data = await db.find("main","guildData",{guild:String(interaction.guildId),board:{$nin:["0000000000000000000"]}}); /*自動更新対象のボードがあるかどうか確認*/
                if(data.length > 0){
                    const reply = await interaction.editReply("このサーバーには既に自動更新のダッシュボードが存在します。\n現在の自動更新を止めて新たに生成する場合は:o:を、操作をキャンセルする場合は:x:をリアクションしてください。");
                    await reply.react('⭕');
                    await reply.react('❌');
                    let flag = -1;

                    await reply.awaitReactions({ filter: reaction => reaction.emoji.name === '⭕' || reaction.emoji.name === '❌', max: 1 })
                        .then(collected => {
                            if(reply.reactions.cache.at(0).count === 2){
                                flag = 0;
                            }
                            else if(reply.reactions.cache.at(1).count === 2){
                                flag = 1;
                            }
                        })
                    await reply.reactions.removeAll();
                    if(flag === 0){
                        await interaction.editReply("生成中...")
                        const embed = await dashboard.generation(interaction.guild);
                        const board = await interaction.channel.send({ embeds: [embed] });
                        await db.update("main","guildData",{guild:String(interaction.guildId)}, {
                            $set:{
                                guild: String(interaction.guildId),
                                boardChannel: String(interaction.channelId),
                                board: String(board.id)
                            }
                        })

                        replyOptions=time=>{return{content: 'ダッシュボードを生成し、自動更新を有効にしました。\n(このメッセージは'+time+'秒後に自動で削除されます)', ephemeral:true};};
                    }
                    else if(flag === 1){
                        await reply.reactions.removeAll();
                        replyOptions=time=>{return{content: '生成をキャンセルしました。\n(このメッセージは'+time+'秒後に自動で削除されます)', ephemeral:true};};
                    }
                }
                else{
                    data = await db.find("main","guildData",{guild:String(interaction.guildId)}); /*guildData作成済みかどうか確認*/
                    const embed = await dashboard.generation(interaction.guild);
                    const board = await interaction.channel.send({ embeds: [embed] });
                    if(data.length > 0){
                        await db.update("main","guildData",{guild:String(interaction.guildId)}, {
                            $set:{
                                guild: String(interaction.guildId),
                                boardChannel: String(interaction.channelId),
                                board: String(board.id)
                            }
                        });
                        replyOptions=time=>{return{content: 'ダッシュボードを生成し、自動更新を有効にしました。\n(このメッセージは'+time+'秒後に自動で削除されます)', ephemeral:true};};
                    }
                    else{
                        await db.insert("main","guildData",{
                            guild: String(interaction.guildId),
                            boardChannel: String(interaction.channelId),
                            board: String(board.id)
                        });
                        replyOptions=time=>{return{content: 'ダッシュボードを生成し、自動更新を有効にしました。GuildDataを登録していないようなので、/guilddataを使って登録してください。\n(このメッセージは'+time+'秒後に自動で削除されます)', ephemeral:true};};
                    }

                }
                await interaction.editReply(replyOptions(5));
                //5秒カウントダウンしたのちに返信を削除
                for(let i=5;i>0;i--){
                    await interaction.editReply(replyOptions(i));
                    await setTimeout(1000);
                }
                await interaction.deleteReply();
            },
        },
    ]