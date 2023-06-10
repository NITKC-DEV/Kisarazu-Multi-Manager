const { SlashCommandBuilder,ActionRowBuilder,StringSelectMenuBuilder}=require("discord.js");
let ccconfig=require("../CCConfig.json");
const fs=require("fs");
const system = require('../functions/logsystem.js');



//ここから先の[]が"../botmain.js/スラッシュコマンド登録"にてcommandsに代入
module.exports=
    [
        {
            //スラッシュコマンドの定義
            data:new SlashCommandBuilder()
                .setName("create-chan")
                .setDescription("チャンネルの作成")
                //チャンネル名を入力 -> string
                .addStringOption(option =>
                    option
                        .setName("チャンネル名")
                        .setDescription("作成するチャンネル名を指定します")
                        .setRequired(true)
                ),

            //"../botmain.js-l42"より、スラッシュコマンド実行時の情報"interaction"を"interactionCopy"にコピー
            async execute(interactionCopy) {
                if (interactionCopy.guildId!==null) {
                    if (ccconfig.guilds.find (guild => guild.ID === interactionCopy.guildId) && ccconfig.guilds.find (guild => guild.ID === interactionCopy.guildId).categories.length >= 1) {
                        //カテゴリ選択用SelectMenu作成
                        const selectCategory = new ActionRowBuilder ()
                            .addComponents (
                                new StringSelectMenuBuilder ()
                                    .setPlaceholder ("カテゴリを選択")
                                    .setCustomId ("selectCat")
                                    .addOptions (
                                        ...ccconfig.guilds.find (server => server.ID === interactionCopy.guild.id).categories.map (category => ({
                                            label: category.name,
                                            value: category.ID
                                        }))
                                    )
                            )
                        
                        //SlashCommandからチャンネル名を受け取り
                        let channelName = interactionCopy.options.getString ("チャンネル名");
                        //スペースがあると都合が悪くてチャンネルもどうせスペース使えないのでスペースをハイフンに置き換え
                        let channelNameSpaceChanged = channelName.replace (" ", "-");
                        while (channelName !== channelNameSpaceChanged) {
                            channelName = channelName.replace (" ", "-");
                            channelNameSpaceChanged = channelNameSpaceChanged.replace (" ", "-");
                        }
                        
                        await interactionCopy.reply ({
                            content: channelNameSpaceChanged + " を作成するカテゴリを指定してください。",
                            components: [selectCategory],
                            ephemeral: true
                        });
                    }
                    else await interactionCopy.reply ({
                        content: "このサーバーでは/createchanが許可されているカテゴリがありません。\n管理者権限を持つ人が/addcategoryを実行することで/createchanが有効になります。",
                        ephemeral: true
                    });
                    
                }
                else
                {
                    interactionCopy.reply("このコマンドはサーバーでのみ実行できます");
                }
            }
        },
        {
            //カテゴリ登録用スラッシュコマンド
            data: new SlashCommandBuilder ()
                .setName ("add-category")
                .setDescription ("/CreateChanによってチャンネルの作成ができるカテゴリにこのカテゴリを追加します")
                .addNumberOption (option =>
                    option
                        .setName ("ロールの追加を許可")
                        .setDescription ("/CreateChanによって作成されたチャンネルに対応するメンション用のロールの作成を許可するかどうかを指定します")
                        .setRequired (true)
                        .addChoices
                        (
                            {name: "許可する", value: 1},
                            {name: "許可しない", value: 0}
                        )
                )
                .setDefaultMemberPermissions(1<<3),
        
            async execute (interactionCopy) {
                if (interactionCopy.guildId !== null) {
                    let serverIndex;
                    let categoryIndex;
                    
                    //CCConfig.jsonにギルドのプロファイルがあればその位置を返し、なければ新規作成
                    for (let i = 0; i < ccconfig.guilds.length; i++) {
                        if (interactionCopy.guild.id === ccconfig.guilds[i].ID) {
                            serverIndex = i;
                            break;
                        }
                        if (i === ccconfig.guilds.length - 1) {
                            ccconfig.guilds[ccconfig.guilds.length] =
                                {
                                    ID: interactionCopy.guild.id,
                                    categories: [{
                                        ID: "0000000000000000000",
                                        name: "キャンセル",
                                        allowRole: false,
                                        channels: []
                                    }]
                                };
                            serverIndex = i + 1;
                            break;
                        }
                    }
                    
                    //CCConfig.jsonにカテゴリのプロファイルがあればすでに登録されている旨を返し、なければ登録
                    for (let i = 0; i < ccconfig.guilds[serverIndex].categories.length; i++) {
                        if (interactionCopy.channel.parentId === ccconfig.guilds[serverIndex].categories[i].ID) {
                            categoryIndex = i;
                            await interactionCopy.reply ({content: "このカテゴリはすでに追加されています", ephemeral: true});
                            return;
                        }
                        if (i === ccconfig.guilds[serverIndex].categories.length - 1) {
                            ccconfig.guilds[serverIndex].categories[ccconfig.guilds[serverIndex].categories.length] =
                                {
                                    ID: interactionCopy.channel.parentId,
                                    name: interactionCopy.channel.parent.name,
                                    allowRole: Boolean (interactionCopy.options.getNumber ("ロールの追加を許可")),
                                    channels: [{
                                        ID: "",
                                        name: "",
                                        creatorId: "0000000000000000000",
                                        createTime: 0,
                                        thereRole: false,
                                        roleID: "0000000000000000000",
                                        roleName: ""
                                    }]
                                };
                            categoryIndex = i + 1;
                            break;
                        }
                    }
                    
                    //jsonに書き込み
                    const ccjson = JSON.stringify (ccconfig);
                    try {
                        fs.writeFileSync ("CCConfig.json", ccjson, "utf8");
                    }
                    catch (e) {
                        console.log (e);
                        await interactionCopy.reply ({content: "データの保存に失敗しました\nやり直してください", ephemeral: true});
                        return;
                    }
                    
                    await interactionCopy.reply ({content: "追加しました", ephemeral: true});
                }
                else
                {
                    interactionCopy.reply("このコマンドはサーバーでのみ実行できます");
                }
            }
        },
        {
            data: new SlashCommandBuilder ()
                .setName("remove-category")
                .setDescription ("/addchategoryによって登録されたカテゴリの登録を解除します")
                .setDefaultMemberPermissions(1<<3)
                .addStringOption(option =>
                    option
                        .setName("チャンネルとロールの削除")
                        .setDescription("カテゴリ削除時に/createchanによって作成されたチャンネルとロールを削除しますか？")
                        .setRequired(true)
                        .addChoices(
                            {name:"削除する",value:"/t"},
                            {name:"削除しない",value:"/f"}
                        )
                ),
            
            async execute(interactionCopy) {
                if (interactionCopy.guildId !== null) {
                    if (ccconfig.guilds.find (guild => guild.ID === interactionCopy.guildId) && ccconfig.guilds.find (guild => guild.ID === interactionCopy.guildId).categories.length >= 1) {//ActionRowBuilder作成
                        let DCR = interactionCopy.options.getString ("チャンネルとロールの削除");
                        const selectCategory = new ActionRowBuilder ()
                            .addComponents (
                                new StringSelectMenuBuilder ()
                                    .setPlaceholder ("カテゴリを選択")
                                    .setCustomId ("remCat")
                                    .addOptions (
                                        {label: "全てのカテゴリを削除する", value: "ALL" + DCR},
                                        ...ccconfig.guilds.find (server => server.ID === interactionCopy.guild.id).categories.map (category => ({
                                            label: category.name,
                                            value: category.ID + DCR
                                        }))
                                    )
                            )
                        
                        await interactionCopy.reply ({
                            content: "削除するカテゴリを指定してください。",
                            components: [selectCategory],
                            ephemeral: true
                        });
                    }
                    else await interactionCopy.reply ({
                        content: "このサーバーには登録されているカテゴリがありません。\n/addcategoryを実行することでカテゴリが追加されます。",
                        ephemeral: true
                    });
                }
                else
                {
                    interactionCopy.reply("このコマンドはサーバーでのみ実行できます");
                }
            }
        }
    ]