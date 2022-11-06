const { SlashCommandBuilder,ActionRowBuilder, Events, SelectMenuBuilder,PermissionFlagsBits}=require("discord.js");
const config = process.env.NODE_ENV === "development" ? require("../../bot-main-pullrequest/config.dev.json") : require("../config.json");
let ccconfig=require("../CCConfig.json");
const fs=require("fs");
const {client}=require("../botmain.js");



//ここから先の[]が"../botmain.js/スラッシュコマンド登録"にてcommandsに代入
module.exports=
    [
        {
            //スラッシュコマンドの定義
            data:new SlashCommandBuilder()
                .setName("createchan")
                .setDescription("チャンネルの作成")
                //チャンネル名を入力 -> string
                .addStringOption(option =>
                    option
                        .setName("チャンネル名")
                        .setDescription("作成するチャンネル名を指定します")
                        .setRequired(true)
                ),

            //"../botmain.js-l42"より、スラッシュコマンド実行時の情報"interaction"を"interactionCopy"にコピー
            async execute(interactionCopy)
            {
                //カテゴリ選択用SelectMenu作成
                const selectCategory=new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setPlaceholder("カテゴリを選択")
                            .setCustomId("selectCat")
                            .addOptions(
                                ...ccconfig.guilds.find(server => server.ID===interactionCopy.guild.id).categories.map(category =>({label:category.name,value:category.ID}))
                            )
                    )
                
                //SlashCommandからチャンネル名を受け取り
                let channelName=interactionCopy.options.getString("チャンネル名");
                //スペースがあると都合が悪くてチャンネルもどうせスペース使えないのでスペースをハイフンに置き換え
                let channelNameSpaceChanged=channelName.replace(" ","-");
                while(channelName!==channelNameSpaceChanged)
                {
                    channelName=channelName.replace(" ","-");
                    channelNameSpaceChanged=channelNameSpaceChanged.replace(" ","-");
                }
                
                await interactionCopy.reply({ content:channelNameSpaceChanged+" を作成するカテゴリを指定してください。", components: [selectCategory] ,ephemeral: true});
                
            }

        },
        {
            //カテゴリ登録用スラッシュコマンド
            data: new SlashCommandBuilder ()
                .setName ("addcategory")
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
        
            async execute (interactionCopy)
            {
                let serverIndex;
                let categoryIndex;
                
                //CCConfig.jsonにギルドのプロファイルがあればその位置を返し、なければ新規作成
                for (let i = 0; i < ccconfig.guilds.length; i++)
                {
                    if (interactionCopy.guild.id === ccconfig.guilds[i].ID)
                    {
                        serverIndex=i;
                        break;
                    }
                    if (i === ccconfig.guilds.length - 1)
                    {
                        ccconfig.guilds[ccconfig.guilds.length] =
                            {
                                ID: interactionCopy.guild.id,
                                categories: [{ID:"0000000000000000000",name:"キャンセル",allowRole:false,channels:[]}]};
                        serverIndex=i+1;
                        break;
                    }
                }
                
                //CCConfig.jsonにカテゴリのプロファイルがあればすでに登録されている旨を返し、なければ登録
                for(let i=0; i<ccconfig.guilds[serverIndex].categories.length; i++)
                {
                    if(interactionCopy.channel.parentId === ccconfig.guilds[serverIndex].categories[i].ID)
                    {
                        categoryIndex = i;
                        await interactionCopy.reply("このカテゴリはすでに追加されています");
                        return;
                    }
                    if(i===ccconfig.guilds[serverIndex].categories.length-1)
                    {
                        ccconfig.guilds[serverIndex].categories[ccconfig.guilds[serverIndex].categories.length]=
                            {
                                ID: interactionCopy.channel.parentId,
                                name: interactionCopy.channel.parent.name,
                                allowRole:Boolean(interactionCopy.options.getNumber ("ロールの追加を許可")),
                                channels:[{ID:"",name:"",creatorId: "0000000000000000000",createTime: 0 ,thereRole:false,roleID:"0000000000000000000",roleName:""}]
                            };
                        categoryIndex =i+1;
                        break;
                    }
                }
                
                //jsonに書き込み
                const ccjson = JSON.stringify (ccconfig, null, 2);
                try
                {
                    fs.writeFileSync ("CCConfig.json", ccjson, "utf8");
                } catch (e)
                {
                    console.log (e);
                }
                
                await interactionCopy.reply("追加しました");
            }
        }
    ]