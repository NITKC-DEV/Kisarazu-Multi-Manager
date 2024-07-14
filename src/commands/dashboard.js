const {setTimeout} = require("node:timers/promises");

const {SlashCommandBuilder} = require("discord.js");

const dashboard = require("../functions/dashboard.js");
const db = require("../functions/db.js");

module.exports = [
    {
        data: new SlashCommandBuilder().setName("dashboard").setDMPermission(false).setDescription("ダッシュボードを表示します"),

        async execute(interaction) {
            await interaction.deferReply();
            const embed = await dashboard.generation(interaction.guild);
            await interaction.editReply({embeds: [embed]});
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName("next-test")
            .setDescription("次のテストを設定します。")
            .setDefaultMemberPermissions(1 << 3)
            .setDMPermission(false)
            .addIntegerOption(option => option.setName("年").setDescription("テストが実施される年を入力").setRequired(true))
            .addIntegerOption(option => option.setName("開始月").setDescription("テストが開始される月を入力").setRequired(true))
            .addIntegerOption(option => option.setName("開始日").setDescription("テストが開始される日を入力").setRequired(true))
            .addIntegerOption(option => option.setName("終了月").setDescription("テストが終了する月を入力").setRequired(true))
            .addIntegerOption(option => option.setName("終了日").setDescription("テストが終了する日を入力").setRequired(true))
            .addIntegerOption(option => option.setName("テスト回").setDescription("何回後のテストか入力(1~4)").setRequired(true)),

        async execute(interaction) {
            if (interaction.options.data[5].value > 0 && interaction.options.data[5].value < 5) {
                await interaction.deferReply({ephemeral: true});
                await db.update(
                    "main",
                    "nextTest",
                    {label: String(interaction.options.data[5].value)},
                    {
                        $set: {
                            year: String(interaction.options.data[0].value),
                            month1: String(interaction.options.data[1].value),
                            day1: String(interaction.options.data[2].value),
                            month2: String(interaction.options.data[3].value),
                            day2: String(interaction.options.data[4].value),
                        },
                    },
                );
                await interaction.editReply({
                    content: `今年度${interaction.options.data[5].value}回目のテストを${interaction.options.data[0].value}年${interaction.options.data[1].value}月${interaction.options.data[2].value}日〜${interaction.options.data[3].value}月${interaction.options.data[4].value}日に設定しました`,
                });
            } else {
                await interaction.reply({content: "どっか〜んするから、1~4の中で指定してくれ", ephemeral: true});
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName("auto-dashboard")
            .setDescription("自動更新されるダッシュボードを生成")
            .setDMPermission(false)
            .setDefaultMemberPermissions(1 << 3),

        async execute(interaction) {
            await interaction.deferReply();
            let replyOptions;
            let data = await db.find("main", "guildData", {
                guild: interaction.guildId,
                board: {$nin: ["0000000000000000000"]},
            }); /* 自動更新対象のボードがあるかどうか確認 */
            if (data.length > 0) {
                const reply = await interaction.editReply(
                    "このサーバーには既に自動更新のダッシュボードが存在します。\n新たに生成するボードに自動更新を変更する場合は:o:を、操作をキャンセルする場合は:x:を1分以内にリアクションしてください。",
                );
                await reply.react("⭕");
                await reply.react("❌");

                const otherReact = [0, 0];
                await setTimeout(100);

                const generate = async () => {
                    await reply.reactions.removeAll();
                    await interaction.editReply("生成中...");
                    const embed = await dashboard.generation(interaction.guild);
                    const board = await interaction.channel.send({embeds: [embed]});
                    await db.update(
                        "main",
                        "guildData",
                        {guild: interaction.guildId},
                        {
                            $set: {
                                guild: interaction.guildId,
                                boardChannel: interaction.channelId,
                                board: String(board.id),
                            },
                        },
                    );

                    replyOptions = time => ({
                        content: `ダッシュボードを生成し、自動更新を有効にしました。\n(このメッセージは${time}秒後に自動で削除されます。)`,
                        ephemeral: true,
                    });
                };

                const cancel = async () => {
                    await reply.reactions.removeAll();
                    replyOptions = time => ({
                        content: `生成をキャンセルしました。\n(このメッセージは${time}秒後に自動で削除されます。)`,
                        ephemeral: true,
                    });
                };

                await (async function loop() {
                    await reply
                        .awaitReactions({
                            filter: reaction => reaction.emoji.name === "⭕" || reaction.emoji.name === "❌",
                            max: 1,
                            time: 60_000,
                        })
                        .then(async () => {
                            if (reply.reactions.cache.at(0).count === 2 + otherReact[0]) {
                                if (reply.reactions.cache.at(0).users.cache.at(1 + otherReact[0]).id === interaction.user.id) {
                                    await generate();
                                } else {
                                    otherReact[0] += 1;
                                    await loop();
                                }
                            } else if (reply.reactions.cache.at(1).count === 2 + otherReact[1]) {
                                if (reply.reactions.cache.at(1).users.cache.at(1 + otherReact[1]).id === interaction.user.id) {
                                    await cancel();
                                } else {
                                    otherReact[1] += 1;
                                    await loop();
                                }
                            } else {
                                await cancel();
                            }
                        });
                })();
            } else {
                data = await db.find("main", "guildData", {guild: interaction.guildId}); /* guildData作成済みかどうか確認 */
                const embed = await dashboard.generation(interaction.guild);
                const board = await interaction.channel.send({embeds: [embed]});
                if (data.length > 0) {
                    await db.update(
                        "main",
                        "guildData",
                        {guild: interaction.guildId},
                        {
                            $set: {
                                guild: interaction.guildId,
                                boardChannel: interaction.channelId,
                                board: String(board.id),
                            },
                        },
                    );
                    replyOptions = time => ({
                        content: `ダッシュボードを生成し、自動更新を有効にしました。\n(このメッセージは${time}秒後に自動で削除されます。)`,
                        ephemeral: true,
                    });
                } else {
                    await db.insert("main", "guildData", {
                        guild: interaction.guildId,
                        boardChannel: interaction.channelId,
                        board: String(board.id),
                    });
                    replyOptions = time => ({
                        content: `ダッシュボードを生成し、自動更新を有効にしました。GuildDataを登録していないようなので、/guilddataを使って登録してください。\n(このメッセージは${time}秒後に自動で削除されます)。`,
                        ephemeral: true,
                    });
                }
            }
            await interaction.editReply(replyOptions(5));
            // 5秒カウントダウンしたのちに返信を削除
            for (let i = 5; i > 0; i--) {
                await interaction.editReply(replyOptions(i));
                await setTimeout(1000);
            }
            await interaction.deleteReply();
        },
    },
];
