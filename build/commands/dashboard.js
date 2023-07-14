"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { SlashCommandBuilder } = require('discord.js');
const dashboard = require('../functions/dashboard.js');
const db = require('../functions/db.js');
const system = require("../functions/logsystem");
const { setTimeout } = require("node:timers/promises");
module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('dashboard')
                .setDMPermission(false)
                .setDescription('ダッシュボードを表示します'),
            execute(interaction) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield interaction.deferReply();
                    const embed = yield dashboard.generation(interaction.guild);
                    yield interaction.editReply({ embeds: [embed] });
                });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('next-test')
                .setDescription('次のテストを設定します。')
                .setDefaultMemberPermissions(1 << 3)
                .setDMPermission(false)
                .addIntegerOption(option => option
                .setName('年')
                .setDescription('テストが実施される年を入力')
                .setRequired(true))
                .addIntegerOption(option => option
                .setName('開始月')
                .setDescription('テストが開始される月を入力')
                .setRequired(true))
                .addIntegerOption(option => option
                .setName('開始日')
                .setDescription('テストが開始される日を入力')
                .setRequired(true))
                .addIntegerOption(option => option
                .setName('終了月')
                .setDescription('テストが終了する月を入力')
                .setRequired(true))
                .addIntegerOption(option => option
                .setName('終了日')
                .setDescription('テストが終了する日を入力')
                .setRequired(true))
                .addIntegerOption(option => option
                .setName('テスト回')
                .setDescription('何回後のテストか入力(1~4)')
                .setRequired(true)),
            execute(interaction) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (interaction.options.data[5].value > 0 && interaction.options.data[5].value < 5) {
                        yield interaction.deferReply({ ephemeral: true });
                        yield db.update("main", "nextTest", { label: String(interaction.options.data[5].value) }, {
                            $set: {
                                year: String(interaction.options.data[0].value),
                                month1: String(interaction.options.data[1].value),
                                day1: String(interaction.options.data[2].value),
                                month2: String(interaction.options.data[3].value),
                                day2: String(interaction.options.data[4].value)
                            },
                        });
                        yield interaction.editReply({ content: `今年度${interaction.options.data[5].value}回目のテストを${interaction.options.data[0].value}年${interaction.options.data[1].value}月${interaction.options.data[2].value}日〜${interaction.options.data[3].value}月${interaction.options.data[4].value}日に設定しました` });
                    }
                    else {
                        yield interaction.reply({ content: "どっか〜んするから、1~4の中で指定してくれ", ephemeral: true });
                    }
                });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('auto-dashboard')
                .setDescription('自動更新されるダッシュボードを生成')
                .setDMPermission(false)
                .setDefaultMemberPermissions(1 << 3),
            execute(interaction) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield interaction.deferReply();
                    let replyOptions;
                    let data = yield db.find("main", "guildData", { guild: interaction.guildId, board: { $nin: ["0000000000000000000"] } }); /*自動更新対象のボードがあるかどうか確認*/
                    if (data.length > 0) {
                        const reply = yield interaction.editReply("このサーバーには既に自動更新のダッシュボードが存在します。\n新たに生成するボードに自動更新を変更する場合は:o:を、操作をキャンセルする場合は:x:を1分以内にリアクションしてください。");
                        yield reply.react('⭕');
                        yield reply.react('❌');
                        let flag = -1;
                        const otherReact = [0, 0];
                        yield setTimeout(100);
                        while (flag === -1) {
                            yield reply.awaitReactions({ filter: reaction => reaction.emoji.name === '⭕' || reaction.emoji.name === '❌', max: 1, time: 60000 })
                                .then(() => {
                                if (reply.reactions.cache.at(0).count === 2 + otherReact[0]) {
                                    if (reply.reactions.cache.at(0).users.cache.at(1 + otherReact[0]).id === interaction.user.id) {
                                        flag = 0;
                                    }
                                    else {
                                        otherReact[0] += 1;
                                    }
                                }
                                else if (reply.reactions.cache.at(1).count === 2 + otherReact[1]) {
                                    if (reply.reactions.cache.at(1).users.cache.at(1 + otherReact[1]).id === interaction.user.id) {
                                        flag = 1;
                                    }
                                    else {
                                        otherReact[1] += 1;
                                    }
                                }
                                else {
                                    flag = 1;
                                }
                            });
                        }
                        yield reply.reactions.removeAll();
                        if (flag === 0) {
                            yield interaction.editReply("生成中...");
                            const embed = yield dashboard.generation(interaction.guild);
                            const board = yield interaction.channel.send({ embeds: [embed] });
                            yield db.update("main", "guildData", { guild: interaction.guildId }, {
                                $set: {
                                    guild: interaction.guildId,
                                    boardChannel: interaction.channelId,
                                    board: String(board.id)
                                }
                            });
                            replyOptions = time => { return { content: 'ダッシュボードを生成し、自動更新を有効にしました。\n(このメッセージは' + time + '秒後に自動で削除されます。)', ephemeral: true }; };
                        }
                        else if (flag === 1) {
                            yield reply.reactions.removeAll();
                            replyOptions = time => { return { content: '生成をキャンセルしました。\n(このメッセージは' + time + '秒後に自動で削除されます。)', ephemeral: true }; };
                        }
                    }
                    else {
                        data = yield db.find("main", "guildData", { guild: interaction.guildId }); /*guildData作成済みかどうか確認*/
                        const embed = yield dashboard.generation(interaction.guild);
                        const board = yield interaction.channel.send({ embeds: [embed] });
                        if (data.length > 0) {
                            yield db.update("main", "guildData", { guild: interaction.guildId }, {
                                $set: {
                                    guild: interaction.guildId,
                                    boardChannel: interaction.channelId,
                                    board: String(board.id)
                                }
                            });
                            replyOptions = time => { return { content: 'ダッシュボードを生成し、自動更新を有効にしました。\n(このメッセージは' + time + '秒後に自動で削除されます。)', ephemeral: true }; };
                        }
                        else {
                            yield db.insert("main", "guildData", {
                                guild: interaction.guildId,
                                boardChannel: interaction.channelId,
                                board: String(board.id)
                            });
                            replyOptions = time => { return { content: 'ダッシュボードを生成し、自動更新を有効にしました。GuildDataを登録していないようなので、/guilddataを使って登録してください。\n(このメッセージは' + time + '秒後に自動で削除されます)。', ephemeral: true }; };
                        }
                    }
                    yield interaction.editReply(replyOptions(5));
                    //5秒カウントダウンしたのちに返信を削除
                    for (let i = 5; i > 0; i--) {
                        yield interaction.editReply(replyOptions(i));
                        yield setTimeout(1000);
                    }
                    yield interaction.deleteReply();
                });
            },
        },
    ];
