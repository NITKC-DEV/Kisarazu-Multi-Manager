const { SlashCommandBuilder, EmbedBuilder , version} = require('discord.js');
const packageVer = require('../package.json');
const {setTimeout} = require ("node:timers/promises");
require('date-utils');


module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('help')
                .setDescription('このBOTのヘルプを表示します'),
            async execute(interaction) {
                const commands = require('../botmain')
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('ヘルプ')
                    .setAuthor({
                        name: "木更津22s統合管理BOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://github.com/NITKC22s/bot-main'
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
        {
            data: new SlashCommandBuilder()
                .setName('about')
                .setDescription('このBOTの概要を表示します'),
            async execute(interaction) {
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('NITKC統合管理BOT概要')
                    .setAuthor({
                        name: "木更津22s統合管理BOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://github.com/NITKC22s/bot-main'
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
                                value: '開発は、このサーバーの管理者4人([kokastar](https://github.com/starkoka)、[NXVZBGBFBEN](https://github.com/NXVZBGBFBEN)、[naotiki](https://github.com/naotiki)、[KouRo](https://github.com/Kou-Ro))で行っています',
                            },
                            {
                                name: '搭載機能',
                                value: '[Genshin-timer Discord BOT v2.1.1](https://github.com/starkoka/Genshin-Timer)\n時間割通知/閲覧機能\nチャンネル作成機能\nシークレットメッセージ機能\nダッシュボード機能\npingコマンド機能',
                            },
                            {
                                name: 'ソースコード',
                                value: 'このBOTはオープンソースとなっています。以下のリンクより見ることが可能です。\n・[木更津22s統合管理bot](https://github.com/NITKC22s/bot-main)\n・[Genshin-timer](https://github.com/starkoka/Genshin-Timer)',
                            },
                            {
                                name: '実行環境',
                                value: 'node.js v' + process.versions.node + `\n discord.js v` + version,

                            },
                        ]
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC22s server Admin' });
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('ping')
                .setDescription('このBOTのpingを測定します'),
            async execute(interaction) {
                await interaction.reply( `Ping : ${interaction.client.ws.ping}ms` );
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('secret-msg')
                .setDescription('実行したチャンネルにbotが代理で送信します')
                .addStringOption(option =>
                    option
                        .setName('メッセージ')
                        .setDescription('送りたいメッセージを入れます')
                        .setRequired(false)
                ).addAttachmentOption(option =>
                    option
                        .setName('添付ファイル1')
                        .setDescription('添付するファイルをアップロードします')
                        .setRequired(false)
                ).addAttachmentOption(option =>
                    option
                        .setName('添付ファイル2')
                        .setDescription('添付するファイルをアップロードします')
                        .setRequired(false)
                ).addAttachmentOption(option =>
                    option
                        .setName('添付ファイル3')
                        .setDescription('添付するファイルをアップロードします')
                        .setRequired(false)
                ),

            async execute (interaction)
            {
                let receivedMsg = interaction.options.getString ('メッセージ');
                const attachedFile1 = interaction.options.getAttachment ('添付ファイル1');
                const attachedFile2 = interaction.options.getAttachment ('添付ファイル2');
                const attachedFile3 = interaction.options.getAttachment ('添付ファイル3');
                const channelName = interaction.guild.channels.cache.get (interaction.channelId).name;
                const date = new Date();
                const currentTime = date.toFormat('YYYY年 MM/DD HH24:MI:SS');
                let sendingMsg='';
                
                
                //ロールメンション時パーミッション確認と除外処理
                if(!interaction.memberPermissions.has(1n<<17n))
                {
                    const roleMentions= receivedMsg.match(/(?<!\\)<@&\d+>/g);
                    if(roleMentions)
                    {
                        for(const roleMention of roleMentions)
                        {
                            const role = interaction.guild.roles.cache.find(readRole=>readRole.id===roleMention.match(/\d+/)[0]);
                            if(role&&!role.mentionable)
                            {
                                receivedMsg=receivedMsg.replace(roleMention,"@"+role.name);
                            }

                        }
                    }
                    const everyoneMention=receivedMsg.search(/@everyone/);
                    if(everyoneMention!=-1)
                    {
                        const rg=new RegExp("(?<!`)@everyone(?<!`)","g");
                        receivedMsg=receivedMsg.replace(rg,"\`@everyone\`\0");
                    }
                    const hereMention = receivedMsg.search(/@here/);
                    if(hereMention!=-1)
                    {
                        const rg=new RegExp("(?<!`)@here(?<!`)","g");
                        receivedMsg=receivedMsg.replace(rg,"\`@here\`\0");
                    }
                }
                
                //改行とバクスラのエスケープ処理
                if(receivedMsg)for(let i=0;i<receivedMsg.length;i++)
                {
                    if (receivedMsg[i] === '\\')
                    {
                        switch (receivedMsg[i + 1])
                        {
                            case '\\':
                                sendingMsg += '\\';
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
                if(sendingMsg.length >2000)
                {
                    await interaction.reply({content:"2000文字を超える内容は送信できません",ephemeral:true,});
                    return;
                }

                const attachFiles = [attachedFile1, attachedFile2, attachedFile3].filter(file=>file);
                for(let attachment of attachFiles)
                {
                    if(attachment.size>8388608)
                    {
                        await interaction.reply({content:"サイズが8MBを超えるファイルは添付できません。通常のメッセージであれば25MBまでなら添付することができます。",ephemeral:true});
                        return;
                    }
                }
                /***
                 * Interaction[Edit]ReplyOptions型のメッセージ内容を設定する
                 * @param time 返信が削除されるまでの残り時間
                 * @returns {{ephemeral: boolean, content: string}} メッセージと本人にしか表示させない構成でオブジェクトを返す
                 */
                const replyOptions=time=>{return{content: channelName + 'にメッセージを代理で送信します\n(このメッセージは'+time+'秒後に自動で削除されます)', ephemeral:true};};
                await interaction.reply (replyOptions(5));
                
                if (sendingMsg) console.log ("Send a message: " + sendingMsg + "\nby " + interaction.user.username + "#" + interaction.user.discriminator + " in " + channelName + " at " + currentTime + "\n");
                if (attachFiles) for (const file of attachFiles) console.log ("Send a file: " + file.url + "\nby " + interaction.user.username + "#" + interaction.user.discriminator + " in " + channelName + " at " + currentTime + "\n");
                if (sendingMsg||attachFiles[0])interaction.guild.channels.cache.get (interaction.channelId).send ({content: sendingMsg,files: attachFiles});

                //5秒カウントダウンしたのちに返信を削除
                for(let i=5;i>0;i--)
                {
                    await interaction.editReply(replyOptions(i));
                    await setTimeout(1000);
                }
                await interaction.deleteReply();
            },
        }
    ]
