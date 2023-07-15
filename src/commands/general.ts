const { SlashCommandBuilder, EmbedBuilder , version} = require('discord.js');
const packageVer = require('../../package.json');
const {setTimeout} = require ("node:timers/promises");
require('date-utils');
const system = require('../functions/logsystem.js');
const weather = require('../functions/weather.js');
const guildData = require('../functions/guildDataSet.js')
const db = require('../functions/db.js');
const fs = require("fs");
import {configPath} from "../environmentConfig.mjs";
const mode = require("../functions/statusAndMode.js");
const CreateChannel = require("../functions/CCFunc.js");
const help = require("../functions/help.js");
const {autoDeleteEditReply} = require("../functions/common.js");
const {ID_NODATA} = require("../functions/guildDataSet");


module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('help')
                .setDescription('このBOTのヘルプを表示します'),
            async execute(interaction: any) {
                await help.helpSend(interaction);
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('admin-help')
                .setDescription('管理者向けメニューをDMで表示します。')
                .setDefaultMemberPermissions(1<<3)
                .setDMPermission(false),
            async execute(interaction: any) {
                await interaction.reply({ content: "DMに管理者向けメニューを送信しました。受信できていない場合、以下に該当していないかどうかご確認ください。\n・このサーバー上の他のメンバーからのDMをOFFにしている\n・フレンドからのDMのみを許可している\n・このBOTをブロックしている", ephemeral: true });
                await help.adminHelpSend(interaction.user);
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('about')
                .setDescription('このBOTの概要を表示します'),
            async execute(interaction: any) {
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('NITKC統合管理BOT概要')
                    .setAuthor({
                        name: "木更津高専統合管理BOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://github.com/NITKC-DEV/Kisarazu-Multi-Manager'
                    })
                    .setDescription('このbotの概要を紹介します')
                    .addFields(
                        [
                            {
                                name: 'バージョン情報',
                                value: 'v' + packageVer.version,
                            },
                            {
                                name: '開発者',
                                value: 'NITKC-DEVの8人で開発しています。\nメンバーは以下のとおりです。\n・[kokastar](https://github.com/starkoka)\n・[Naotiki](https://github.com/naotiki)\n・[KouRo](https://github.com/Kou-Ro)\n・[NXVZBGBFBEN](https://github.com/NXVZBGBFBEN)\n・[doit^6p](https://github.com/c-6p)\n・[トコトコ](https://github.com/tokotoko9981)\n・[maikuradentetu](https://github.com/maikuradentetu)\n・[nairoki23](https://github.com/nairoki23)',
                            },
                            {
                                name:"ソースコード",
                                value:"このBOTは、オープンソースとなっています。[GitHub](https://github.com/NITKC-DEV/Kisarazu-Multi-Manager)にて公開されています。\n"
                            },
                            {
                                name:"バグの報告先",
                                value:"[Issue](https://github.com/NITKC-DEV/Kisarazu-Multi-Manager/issues)までお願いします。\nサポート等の詳細は/helpや/admin-helpを実行してください。\n"
                            },
                            {
                                name: '実行環境',
                                value: 'node.js v' + process.versions.node + `\n discord.js v` + version + `\n\nDocker v24.0.2\n MongoDB 6.0 Powered by Google Cloud`,

                            },
                        ]
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC-DEV' });
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('ping')
                .setDescription('このBOTのpingを測定します'),
            async execute(interaction: any) {
                await interaction.reply( `Ping : ${interaction.client.ws.ping}ms` );
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('sudo-maintenancemode')
                .setDescription('sugoi user do')
                .setDefaultMemberPermissions(1<<3)
                .setDMPermission(false)
                .addBooleanOption((option: any) => option
                .setName('option')
                .setDescription('True or False')
                .setRequired(true)
                ),
            async execute(interaction: any) {
                await interaction.deferReply();
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                let flag = 0;
                for(let i = 0;i < config.sugoiTsuyoiHitotachi.length;i++){
                    if(config.sugoiTsuyoiHitotachi[i]===interaction.user.id)flag = 1;
                }
                if(flag === 1){
                    const reply = await interaction.editReply("あなたはシステム管理者から通常の講習を受けたはずです。\nこれは通常、以下の3点に要約されます:\n    #1) 他人のプライバシーを尊重すること。\n    #2) タイプする前に考えること。\n    #3) 大いなる力には大いなる責任が伴うこと。");
                    await reply.react('⭕');
                    await reply.react('❌');

                    flag = 0;
                    await setTimeout(100);

                    await reply.awaitReactions({ filter: (reaction: any) => reaction.emoji.name === '⭕' || reaction.emoji.name === '❌', max: 1 })
                        .then(() => {
                            if(reply.reactions.cache.at(0).count === 2){
                                flag = 1;
                            }
                        })
                    await reply.reactions.removeAll();
                    if(flag === 1){
                        await mode.maintenance(interaction.options.getBoolean('option'));
                        await CreateChannel.dataCheck();
                        await interaction.editReply( `メンテナンスモードを${interaction.options.getBoolean('option')}にしました` );
                    }
                    else{
                        await interaction.editReply( `変更を取りやめました` );
                    }
                }
                else{
                    await interaction.editReply( `Permission denied : BOT開発者専用コマンドです` );
                }

            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('secret-msg')
                .setDescription('実行したチャンネルにbotが代理で送信します')
                .addStringOption((option: any) => option
                .setName('メッセージ')
                .setDescription('送りたいメッセージを入れます')
                .setRequired(false)
                ).addAttachmentOption((option: any) => option
                .setName('添付ファイル1')
                .setDescription('添付するファイルをアップロードします')
                .setRequired(false)
                ).addAttachmentOption((option: any) => option
                .setName('添付ファイル2')
                .setDescription('添付するファイルをアップロードします')
                .setRequired(false)
                ).addAttachmentOption((option: any) => option
                .setName('添付ファイル3')
                .setDescription('添付するファイルをアップロードします')
                .setRequired(false)
                ),

            async execute (interaction: any) {
                await interaction.deferReply({ephemeral: true});
                if(interaction.guild) {
                    let receivedMsg = interaction.options.getString('メッセージ');
                    const attachedFile1 = interaction.options.getAttachment('添付ファイル1');
                    const attachedFile2 = interaction.options.getAttachment('添付ファイル2');
                    const attachedFile3 = interaction.options.getAttachment('添付ファイル3');
                    const channelName = interaction.guild.channels.cache.get(interaction.channelId).name;
                    let sendingMsg = '';
                    
                    //ロールメンション時パーミッション確認と除外処理
                    if(!interaction.memberPermissions.has(1n << 17n)) {
                        const roleMentions = receivedMsg.match(/(?<!\\)<@&\d+>/g);
                        if(roleMentions) {
                            for(const roleMention of roleMentions) {
                                const role = interaction.guild.roles.cache.find((readRole: any) => readRole.id === roleMention.match(/\d+/)[0]);
                                if(role && !role.mentionable) {
                                    receivedMsg = receivedMsg.replace(roleMention, "@" + role.name);
                                }
                                
                            }
                        }
                        const everyoneMention = receivedMsg.search(/@everyone/);
                        if(everyoneMention !== -1) {
                            const rg = new RegExp("(?<!`)@everyone(?<!`)", "g");
                            receivedMsg = receivedMsg.replace(rg, "\`@everyone\`\0");
                        }
                        const hereMention = receivedMsg.search(/@here/);
                        if(hereMention !== -1) {
                            const rg = new RegExp("(?<!`)@here(?<!`)", "g");
                            receivedMsg = receivedMsg.replace(rg, "\`@here\`\0");
                        }
                    }
                    
                    //改行とバクスラのエスケープ処理
                    if(receivedMsg) for(let i = 0; i < receivedMsg.length; i++) {
                        if(receivedMsg[i] === '\\') {
                            switch(receivedMsg[i + 1]) {
                                case '\\':
                                    sendingMsg += '\\\\';
                                    i++;
                                    break;
                                case 'n':
                                    sendingMsg += '\n';
                                    i++;
                                    break;
                            }
                        }
                        else sendingMsg += receivedMsg[i];
                    }
                    
                    sendingMsg = sendingMsg.trim();
                    if(sendingMsg.length > 2000) {
                        await interaction.editReply({content: "2000文字を超える内容は送信できません", ephemeral: true,});
                        return;
                    }
                    
                    const attachFiles = [attachedFile1, attachedFile2, attachedFile3].filter(file => file);
                    for(const attachment of attachFiles) {
                        if(attachment.size > 26214400) {
                            await interaction.editReply({content: "サイズが25MBを超えるファイルは添付できません", ephemeral: true});
                            return;
                        }
                    }
                    
                    autoDeleteEditReply(interaction, {
                        content: channelName + 'にメッセージを代理で送信します\n(このメッセージは$time$秒後に自動で削除されます)',
                        ephemeral: true
                    }, 5);
                    if(sendingMsg) await system.log(sendingMsg + "\nin <#" + interaction.channelId + ">\n", interaction.user.username + "#" + interaction.user.discriminator + "によるシークレットメッセージ");
                    if(attachFiles) for(const file of attachFiles) await system.log(file.url + "\nin <#" + interaction.channelId + ">\n", interaction.user.username + "#" + interaction.user.discriminator + "によるシークレットファイル");
                    if(sendingMsg || attachFiles[0]) interaction.guild.channels.cache.get(interaction.channelId).send({
                        content: sendingMsg,
                        files: attachFiles
                    });
                }
                else{
                    await interaction.editReply({content:"このコマンドはサーバーでのみ実行できます",ephemeral:true});
                }
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('birthday')
                .setDescription('あなたの誕生日を登録します。登録するとその日に祝ってくれます。')
                .setDMPermission(false)
                .addIntegerOption((option: any) => option
                .setName('年')
                .setDescription('生まれた年をいれます')
                .setRequired(true)
                ).addIntegerOption((option: any) => option
                .setName('月')
                .setDescription('生まれた月をいれます')
                .setRequired(true)
                ).addIntegerOption((option: any) => option
                .setName('日')
                .setDescription('生まれた日をいれます')
                .setRequired(true)
                ),

            async execute (interaction: any) {
                await interaction.deferReply({ephemeral: true});
                const data = await db.find("main", "birthday", {
                    user: interaction.user.id,
                    guild: interaction.guildId
                });
                if(interaction.options.getInteger('月') > 0 && interaction.options.getInteger('月') < 13 && interaction.options.getInteger('日') > 0 && interaction.options.getInteger('日') < 32 && interaction.options.getInteger('年') ** 2 >= 0){
                    if(data.length > 0){
                        await db.update("main", "birthday", {
                            user: interaction.user.id,
                            guild: interaction.guildId
                        },{$set:{
                                "user": String(interaction.user.id),
                                "guild": String(interaction.guildId),
                                "year": String(interaction.options.getInteger('年')),
                                "month": String(interaction.options.getInteger('月')),
                                "day": String(interaction.options.getInteger('日')),
                            }});
                    }
                    else{
                        await db.insert("main", "birthday", {
                            "user": String(interaction.user.id),
                            "guild": String(interaction.guildId),
                            "year": String(interaction.options.getInteger('年')),
                            "month": String(interaction.options.getInteger('月')),
                            "day": String(interaction.options.getInteger('日')),
                        });
                    }
                    await interaction.editReply({ content: `このサーバーで誕生日を${interaction.options.getInteger('月')}月${interaction.options.getInteger('日')}日に設定しました。\n他のサーバーで通知してほしい場合は、そのサーバーでもう一度実行してください。`});
                }
                else{
                    await interaction.editReply({ content: "誕生日を正しい数字で設定してください。"});
                }
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('del-birthday')
                .setDMPermission(false)
                .setDescription('あなたの誕生日を削除します'),

            async execute (interaction: any) {
                await interaction.deferReply({ephemeral: true});
                const data = await db.find("main", "birthday", {
                    user: interaction.user.id,
                    guild: interaction.guildId
                });

                if(data.length > 0){
                    await db.delete("main", "birthday", {
                        user: interaction.user.id,
                        guild: interaction.guildId
                    });
                    await interaction.editReply({ content: "このサーバーでの通知を解除しました。\n他のサーバーでも通知を止めたい場合、そのサーバーで実行してください。"});
                }
                else{
                    await interaction.editReply({ content: "このサーバーではあなたの誕生日が設定されていません。\n通知を止めたいサーバーで実行してください。"});
                }
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('weather')
                .setDescription('その日の天気を取得します')
                .addIntegerOption((option: any) => option
                .setName('日にち')
                .setDescription('日にちを指定します。指定なければ今日の天気になります。')
                .setRequired(false)
                .addChoices(
                    { name: '今日', value: 0 },
                    { name: '明日', value: 1 },
                    { name: '明後日', value: 2 }
                )
                ),
            async execute (interaction: any) {
                const reply = await interaction.deferReply()
                let embed;
                if(interaction.options.getInteger('日にち') === undefined || interaction.options.getInteger('日にち') === null){
                    embed = await weather.generationDay(0);
                }
                else{
                    embed = await weather.generationDay(interaction.options.getInteger('日にち'));
                }
                await interaction.editReply({ embeds: [embed] });
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName('weather-switcher')
                .setDescription('天気定期送信のON/OFFを切り替えます')
                .setDefaultMemberPermissions(1<<3)
                .setDMPermission(false)
                .addBooleanOption((option: any) => option
                .setName('定期送信')
                .setDescription('定期実行のオンオフを指定します')
                .setRequired(true)
                )
                .addChannelOption((option: any) => option
                .setName('送信先')
                .setDescription('送信先を指定します。削除時は適当なチャンネルをいれてください。')
                .setRequired(true)
                ),

            async execute(interaction: any) {
                await interaction.deferReply({ephemeral: true});
                if(!interaction.options.getBoolean('定期送信')){
                    await guildData.updateOrInsert(interaction.guildId, {weather:interaction.options.getBoolean('定期送信')});
                    await interaction.editReply({ content: "天気定期通知機能を" + interaction.options.getBoolean('定期送信') + "に設定しました。"});
                }
                else if(interaction.options.getChannel('送信先').type === 0){
                    await guildData.updateOrInsert(interaction.guildId, {weather:interaction.options.getBoolean('定期送信'),weatherChannel:interaction.options.getChannel('送信先').id});
                    await interaction.editReply({ content: "天気定期通知機能を" + interaction.options.getBoolean('定期送信') + "に設定しました。"});
                }
                else{
                    await interaction.editReply({ content: "通常のチャンネルを指定してください"});
                }
            },
        },
    ]
