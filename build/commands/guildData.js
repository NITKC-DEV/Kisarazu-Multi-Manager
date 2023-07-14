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
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../functions/db.js');
const guildData = require('../functions/guildDataSet.js');
const { ID_NODATA } = require('../functions/guildDataSet.js');
const { setTimeout } = require("node:timers/promises");
module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('guilddata')
                .setDescription('サーバー情報を登録します。指定した引数以外は変更されません。詳細は/adminhelpを参照してください')
                .setDefaultMemberPermissions(1 << 3)
                .setDMPermission(false)
                .addIntegerOption(option => option
                .setName('学年')
                .setDescription('入学した年を西暦4桁で入力してください。')
                .setRequired(false)).addChannelOption(option => option
                .setName('アナウンスチャンネル')
                .setDescription('BOTのアナウンスをするときに使うチャンネルを指定してください。')
                .setRequired(false)).addChannelOption(option => option
                .setName('メインチャンネル')
                .setDescription('雑談等メインで使うチャンネルを指定してください。')
                .setRequired(false)).addChannelOption(option => option
                .setName('m科チャンネル')
                .setDescription('m科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption(option => option
                .setName('m科ロール')
                .setDescription('m科用ロールを指定してください。')
                .setRequired(false)).addChannelOption(option => option
                .setName('e科チャンネル')
                .setDescription('e科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption(option => option
                .setName('e科ロール')
                .setDescription('e科用ロールを指定してください。')
                .setRequired(false)).addChannelOption(option => option
                .setName('d科チャンネル')
                .setDescription('d科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption(option => option
                .setName('d科ロール')
                .setDescription('d科用ロールを指定してください。')
                .setRequired(false)).addChannelOption(option => option
                .setName('j科チャンネル')
                .setDescription('j科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption(option => option
                .setName('j科ロール')
                .setDescription('j科用ロールを指定してください。')
                .setRequired(false)).addChannelOption(option => option
                .setName('c科チャンネル')
                .setDescription('c科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption(option => option
                .setName('c科ロール')
                .setDescription('c科用ロールを指定してください。')
                .setRequired(false)),
            execute(interaction) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                return __awaiter(this, void 0, void 0, function* () {
                    yield interaction.deferReply({ ephemeral: true });
                    yield db.find("main", "guildData", { guild: String(interaction.guildId) });
                    const object = {
                        guild: interaction.guildId,
                        grade: interaction.options.getInteger("学年"),
                        announce: ((_a = interaction.options.getChannel("アナウンスチャンネル")) !== null && _a !== void 0 ? _a : { id: undefined }).id,
                        main: ((_b = interaction.options.getChannel("メインチャンネル")) !== null && _b !== void 0 ? _b : { id: undefined }).id,
                        mChannel: ((_c = interaction.options.getChannel("m科チャンネル")) !== null && _c !== void 0 ? _c : { id: undefined }).id,
                        mRole: ((_d = interaction.options.getRole("m科ロール")) !== null && _d !== void 0 ? _d : { id: undefined }).id,
                        eChannel: ((_e = interaction.options.getChannel("e科チャンネル")) !== null && _e !== void 0 ? _e : { id: undefined }).id,
                        eRole: ((_f = interaction.options.getRole("e科ロール")) !== null && _f !== void 0 ? _f : { id: undefined }).id,
                        dChannel: ((_g = interaction.options.getChannel("d科チャンネル")) !== null && _g !== void 0 ? _g : { id: undefined }).id,
                        dRole: ((_h = interaction.options.getRole("d科ロール")) !== null && _h !== void 0 ? _h : { id: undefined }).id,
                        jChannel: ((_j = interaction.options.getChannel("j科チャンネル")) !== null && _j !== void 0 ? _j : { id: undefined }).id,
                        jRole: ((_k = interaction.options.getRole("j科ロール")) !== null && _k !== void 0 ? _k : { id: undefined }).id,
                        cChannel: ((_l = interaction.options.getChannel("c科チャンネル")) !== null && _l !== void 0 ? _l : { id: undefined }).id,
                        cRole: ((_m = interaction.options.getRole("c科ロール")) !== null && _m !== void 0 ? _m : { id: undefined }).id
                    };
                    yield guildData.updateOrInsert(interaction.guildId, object);
                    const newData = yield db.find("main", "guildData", { guild: String(interaction.guildId) });
                    const date = new Date();
                    let description = "";
                    if (date.getFullYear() - interaction.options.getInteger("学年") < 0 || date.getFullYear() - interaction.options.getInteger("学年") > 5)
                        description = `\n\n学年の値が少しおかしいようです。\nこのサーバーは本当に今年${date.getFullYear() - interaction.options.getInteger("学年")}年生の集まりですか?\n学年オプションには入学した年を**「西暦で」**いれてください。`;
                    const embed = new EmbedBuilder()
                        .setColor(0x00A0EA)
                        .setTitle('GuildData')
                        .setAuthor({
                        name: "木更津22s統合管理BOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://github.com/NITKC-DEV/Kisarazu-Multi-Manager'
                    })
                        .setDescription(`GuildDataを更新しました。${description}`)
                        .addFields({
                        name: '全般',
                        value: `学年：${(newData[0].grade === ID_NODATA ? "未設定" : newData[0].grade + "年入学")}\nアナウンスチャンネル：${(newData[0].announce === ID_NODATA ? "未設定" : `<#${newData[0].announce}>`)}\nメインチャンネル：${(newData[0].main === ID_NODATA ? "未設定" : `<#${newData[0].main}>`)}`
                    }, {
                        name: 'M科',
                        value: `M科チャンネル：${(newData[0].mChannel === ID_NODATA ? "未設定" : `<#${newData[0].mChannel}>`)}\nM科ロール：${(newData[0].mRole === ID_NODATA ? "未設定" : `<@&${newData[0].mRole}>`)}`
                    }, {
                        name: 'E科',
                        value: `E科チャンネル：${(newData[0].eChannel === ID_NODATA ? "未設定" : `<#${newData[0].eChannel}>`)}\nE科ロール：${(newData[0].eRole === ID_NODATA ? "未設定" : `<@&${newData[0].eRole}>`)}`
                    }, {
                        name: 'D科',
                        value: `D科チャンネル：${(newData[0].dChannel === ID_NODATA ? "未設定" : `<#${newData[0].dChannel}>`)}\nD科ロール：${(newData[0].dRole === ID_NODATA ? "未設定" : `<@&${newData[0].dRole}>`)}`
                    }, {
                        name: 'J科',
                        value: `J科チャンネル：${(newData[0].jChannel === ID_NODATA ? "未設定" : `<#${newData[0].jChannel}>`)}\nJ科ロール：${(newData[0].jRole === ID_NODATA ? "未設定" : `<@&${newData[0].jRole}>`)}`
                    }, {
                        name: 'C科',
                        value: `C科チャンネル：${(newData[0].cChannel === ID_NODATA ? "未設定" : `<#${newData[0].cChannel}>`)}\nC科ロール：${(newData[0].cRole === ID_NODATA ? "未設定" : `<@&${newData[0].cRole}>`)}`
                    })
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC-DEV' });
                    yield interaction.editReply({ embeds: [embed], ephemeral: true });
                });
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('config-reset')
                .setDescription('サーバー情報をリセットします。詳細は/adminhelpを参照してください')
                .setDMPermission(false)
                .setDefaultMemberPermissions(1 << 3),
            execute(interaction) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield interaction.deferReply();
                    const reply = yield interaction.editReply("この操作を実行すると、時間割/天気定期通知機能のON/OFF以外のすべての設定が失われます。\n続行する場合は:o:を、操作をキャンセルする場合は:x:をリアクションしてください。");
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
                    let replyOptions;
                    if (flag === 0) {
                        yield interaction.editReply("削除中...");
                        yield guildData.reset(interaction.guildId);
                        replyOptions = time => { return { content: '削除しました。再度設定するには、/guilddataコマンドを使用してください。\n(このメッセージは' + time + '秒後に自動で削除されます)', ephemeral: true }; };
                    }
                    else if (flag === 1) {
                        yield reply.reactions.removeAll();
                        replyOptions = time => { return { content: '操作をキャンセルしました。\n(このメッセージは' + time + '秒後に自動で削除されます)', ephemeral: true }; };
                    }
                    yield interaction.editReply(replyOptions(5));
                    //5秒カウントダウンしたのちに返信を削除
                    for (let i = 5; i > 0; i--) {
                        yield interaction.editReply(replyOptions(i));
                        yield setTimeout(1000);
                    }
                    yield interaction.deleteReply();
                });
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('config')
                .setDMPermission(false)
                .setDescription('現在guildDateSystemに設定されている内容を表示します。詳細は/adminhelpを参照してください'),
            execute(interaction) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield interaction.deferReply();
                    const newData = yield db.find("main", "guildData", { guild: String(interaction.guildId) });
                    let dashboard, timetable, weather;
                    if (newData[0].board !== ID_NODATA) {
                        dashboard = `[ダッシュボード](https://discord.com/channels/${newData[0].guild}/${newData[0].boardChannel}/${newData[0].board})は自動更新として設定されています。`;
                    }
                    else {
                        dashboard = `ダッシュボードの自動更新は設定されていません。`;
                    }
                    if (newData[0].timetable === true) {
                        timetable = "時間割を定期的に通知します。";
                    }
                    else {
                        timetable = "時間割の定期通知は停止されています。";
                    }
                    if (newData[0].weather === true) {
                        weather = "千葉の天気予報を定期的に通知します。";
                    }
                    else {
                        weather = "天気予報の定期通知は停止されています。";
                    }
                    const embed = new EmbedBuilder()
                        .setColor(0x00A0EA)
                        .setTitle('ギルド情報')
                        .setAuthor({
                        name: "木更津22s統合管理BOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://github.com/NITKC-DEV/Kisarazu-Multi-Manager'
                    })
                        .setDescription('GuildDataSystemに登録されている情報一覧です。')
                        .addFields({
                        name: '全般',
                        value: `学年：${(newData[0].grade === ID_NODATA ? "未設定" : newData[0].grade + "年入学")}\nアナウンスチャンネル：${(newData[0].announce === ID_NODATA ? "未設定" : `<#${newData[0].announce}>`)}\nメインチャンネル：${(newData[0].main === ID_NODATA ? "未設定" : `<#${newData[0].main}>`)}`
                    }, {
                        name: 'M科',
                        value: `M科チャンネル：${(newData[0].mChannel === ID_NODATA ? "未設定" : `<#${newData[0].mChannel}>`)}\nM科ロール：${(newData[0].mRole === ID_NODATA ? "未設定" : `<@&${newData[0].mRole}>`)}`
                    }, {
                        name: 'E科',
                        value: `E科チャンネル：${(newData[0].eChannel === ID_NODATA ? "未設定" : `<#${newData[0].eChannel}>`)}\nE科ロール：${(newData[0].eRole === ID_NODATA ? "未設定" : `<@&${newData[0].eRole}>`)}`
                    }, {
                        name: 'D科',
                        value: `D科チャンネル：${(newData[0].dChannel === ID_NODATA ? "未設定" : `<#${newData[0].dChannel}>`)}\nD科ロール：${(newData[0].dRole === ID_NODATA ? "未設定" : `<@&${newData[0].dRole}>`)}`
                    }, {
                        name: 'J科',
                        value: `J科チャンネル：${(newData[0].jChannel === ID_NODATA ? "未設定" : `<#${newData[0].jChannel}>`)}\nJ科ロール：${(newData[0].jRole === ID_NODATA ? "未設定" : `<@&${newData[0].jRole}>`)}`
                    }, {
                        name: 'C科',
                        value: `C科チャンネル：${(newData[0].cChannel === ID_NODATA ? "未設定" : `<#${newData[0].cChannel}>`)}\nC科ロール：${(newData[0].cRole === ID_NODATA ? "未設定" : `<@&${newData[0].cRole}>`)}`
                    }, {
                        name: 'ダッシュボード',
                        value: dashboard,
                    }, {
                        name: '時間割定期通知',
                        value: timetable,
                    }, {
                        name: '天気定期通知',
                        value: weather,
                    })
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC-DEV' });
                    yield interaction.editReply({ embeds: [embed], ephemeral: true });
                });
            }
        }
    ];
