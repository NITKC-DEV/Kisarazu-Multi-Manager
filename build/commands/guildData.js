"use strict";
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'SlashComma... Remove this comment to see the full error message
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'db'.
const db = require('../functions/db.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'guildData'... Remove this comment to see the full error message
const guildData = require('../functions/guildDataSet.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'ID_NODATA'... Remove this comment to see the full error message
const { ID_NODATA } = require('../functions/guildDataSet.js');
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setTimeout... Remove this comment to see the full error message
const { setTimeout } = require("node:timers/promises");
module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('guilddata')
                .setDescription('サーバー情報を登録します。指定した引数以外は変更されません。詳細は/adminhelpを参照してください')
                .setDefaultMemberPermissions(1 << 3)
                .setDMPermission(false)
                .addIntegerOption((option) => option
                .setName('学年')
                .setDescription('入学した年を西暦4桁で入力してください。')
                .setRequired(false)).addChannelOption((option) => option
                .setName('アナウンスチャンネル')
                .setDescription('BOTのアナウンスをするときに使うチャンネルを指定してください。')
                .setRequired(false)).addChannelOption((option) => option
                .setName('メインチャンネル')
                .setDescription('雑談等メインで使うチャンネルを指定してください。')
                .setRequired(false)).addChannelOption((option) => option
                .setName('m科チャンネル')
                .setDescription('m科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption((option) => option
                .setName('m科ロール')
                .setDescription('m科用ロールを指定してください。')
                .setRequired(false)).addChannelOption((option) => option
                .setName('e科チャンネル')
                .setDescription('e科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption((option) => option
                .setName('e科ロール')
                .setDescription('e科用ロールを指定してください。')
                .setRequired(false)).addChannelOption((option) => option
                .setName('d科チャンネル')
                .setDescription('d科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption((option) => option
                .setName('d科ロール')
                .setDescription('d科用ロールを指定してください。')
                .setRequired(false)).addChannelOption((option) => option
                .setName('j科チャンネル')
                .setDescription('j科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption((option) => option
                .setName('j科ロール')
                .setDescription('j科用ロールを指定してください。')
                .setRequired(false)).addChannelOption((option) => option
                .setName('c科チャンネル')
                .setDescription('c科用チャンネルを指定してください。')
                .setRequired(false)).addRoleOption((option) => option
                .setName('c科ロール')
                .setDescription('c科用ロールを指定してください。')
                .setRequired(false)),
            async execute(interaction) {
                await interaction.deferReply({ ephemeral: true });
                await db.find("main", "guildData", { guild: String(interaction.guildId) });
                const object = {
                    guild: interaction.guildId,
                    grade: interaction.options.getInteger("学年"),
                    announce: (interaction.options.getChannel("アナウンスチャンネル") ?? { id: undefined }).id,
                    main: (interaction.options.getChannel("メインチャンネル") ?? { id: undefined }).id,
                    mChannel: (interaction.options.getChannel("m科チャンネル") ?? { id: undefined }).id,
                    mRole: (interaction.options.getRole("m科ロール") ?? { id: undefined }).id,
                    eChannel: (interaction.options.getChannel("e科チャンネル") ?? { id: undefined }).id,
                    eRole: (interaction.options.getRole("e科ロール") ?? { id: undefined }).id,
                    dChannel: (interaction.options.getChannel("d科チャンネル") ?? { id: undefined }).id,
                    dRole: (interaction.options.getRole("d科ロール") ?? { id: undefined }).id,
                    jChannel: (interaction.options.getChannel("j科チャンネル") ?? { id: undefined }).id,
                    jRole: (interaction.options.getRole("j科ロール") ?? { id: undefined }).id,
                    cChannel: (interaction.options.getChannel("c科チャンネル") ?? { id: undefined }).id,
                    cRole: (interaction.options.getRole("c科ロール") ?? { id: undefined }).id
                };
                await guildData.updateOrInsert(interaction.guildId, object);
                const newData = await db.find("main", "guildData", { guild: String(interaction.guildId) });
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
                await interaction.editReply({ embeds: [embed], ephemeral: true });
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('config-reset')
                .setDescription('サーバー情報をリセットします。詳細は/adminhelpを参照してください')
                .setDMPermission(false)
                .setDefaultMemberPermissions(1 << 3),
            async execute(interaction) {
                await interaction.deferReply();
                const reply = await interaction.editReply("この操作を実行すると、時間割/天気定期通知機能のON/OFF以外のすべての設定が失われます。\n続行する場合は:o:を、操作をキャンセルする場合は:x:をリアクションしてください。");
                await reply.react('⭕');
                await reply.react('❌');
                let flag = -1;
                const otherReact = [0, 0];
                // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
                await setTimeout(100);
                while (flag === -1) {
                    await reply.awaitReactions({ filter: (reaction) => reaction.emoji.name === '⭕' || reaction.emoji.name === '❌', max: 1, time: 60000 })
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
                await reply.reactions.removeAll();
                let replyOptions;
                if (flag === 0) {
                    await interaction.editReply("削除中...");
                    await guildData.reset(interaction.guildId);
                    replyOptions = (time) => { return { content: '削除しました。再度設定するには、/guilddataコマンドを使用してください。\n(このメッセージは' + time + '秒後に自動で削除されます)', ephemeral: true }; };
                }
                else if (flag === 1) {
                    await reply.reactions.removeAll();
                    replyOptions = (time) => { return { content: '操作をキャンセルしました。\n(このメッセージは' + time + '秒後に自動で削除されます)', ephemeral: true }; };
                }
                // @ts-expect-error TS(2722): Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
                await interaction.editReply(replyOptions(5));
                //5秒カウントダウンしたのちに返信を削除
                for (let i = 5; i > 0; i--) {
                    // @ts-expect-error TS(2722): Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
                    await interaction.editReply(replyOptions(i));
                    // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
                    await setTimeout(1000);
                }
                await interaction.deleteReply();
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('config')
                .setDMPermission(false)
                .setDescription('現在guildDateSystemに設定されている内容を表示します。詳細は/adminhelpを参照してください'),
            async execute(interaction) {
                await interaction.deferReply();
                const newData = await db.find("main", "guildData", { guild: String(interaction.guildId) });
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
                await interaction.editReply({ embeds: [embed], ephemeral: true });
            }
        }
    ];
