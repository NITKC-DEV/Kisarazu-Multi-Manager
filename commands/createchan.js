const { SlashCommandBuilder,Guild}=require("discord.js");
const config = process.env.NODE_ENV === "development" ? require("../config.dev.json") : require("../config.json");
const ccconfig=require("../CCConfig.json");
const fs=require("fs");

//let gi=new Guild();

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

                )
                //チャンネルを作成するカテゴリを指定し、そのカテゴリのIDを取得 -> string
                .addStringOption(option =>
                    option
                        .setName("カテゴリ")
                        .setDescription("チャンネルを作成するカテゴリを指定します")
                        .setRequired(true)
                        .addChoices(
                            //...config.categories.map(category => ({name:category.name, value:category.id})),
                            ...ccconfig.servers.map(server=>
                                
                                    if(server.ID === config.server)...server.categories.map (category => ({name: category.name, value: category.ID}))
                            )
                        )
                )
                //チャンネルに対応したロールを作成をするかどうかを指定 -> boolean
                .addNumberOption(option =>
                     option
                        .setName("ロールの作成")
                        .setDescription("チャンネルに対応したロールを作成するかを指定します")
                        .setRequired(true)
                         .addChoices
                         (
                             {name: "作成する",value:1},
                             {name: "作成しない",value:0}
                         )
                    
                ),

            //"../botmain.js-l42"より、スラッシュコマンド実行時の情報"interaction"を"interactionCopy"にコピー
            async execute(interactionCopy)
            {
                //入力されたチャンネル名を扱いやすいように単独の変数に変換
                const channelName = interactionCopy.options.getString("チャンネル名");

                //選択されたカテゴリのIDを扱いやすいように単独の変数に変換
                const categoryID= interactionCopy.options.getString("カテゴリ");

                //チャンネルの作成。権限はカテゴリの権限に同期される。
                //                                           チャンネル名     カテゴリのID      メモ的な
                await interactionCopy.guild.channels.create({name:channelName,parent:categoryID,reason:"Botによって作成"});
                
                //もし、ロールの作成にてtrueが選択されていたら、ロールを作成する
                if(interactionCopy.options.getNumber("ロールの作成"))
                {
                    //ロールの作成。権限は@everyoneが適用される。
                    //                                        ロール名:とりまチャネ名  メンション許可    権限なし            メモ的な
                    interactionCopy.guild.roles.create({name:channelName,mentionable:true,permissions:BigInt(0),reason:"Botによって作成"});
                }
                
                await interactionCopy.reply("Created!!!!!");
            }

        },
        {
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
                ),
        
            async execute (interactionCopy)
            {
                
                let serverIndex;
                let categoryIndex;
                for (let i = 0; i < ccconfig.servers.length; i++)
                {
                    if (interactionCopy.guild.id === ccconfig.servers[i].ID)
                    {
                        serverIndex=i;
                        break;
                    }
                    if (i === ccconfig.servers.length - 1)
                    {
                        ccconfig.servers[ccconfig.servers.length] =
                            {
                                ID: interactionCopy.guild.id,
                                categories: [{ID:"0000000000000000000",name:"",allowRole:false,channels:[]}]};
                        serverIndex=i+1;
                        break;
                    }
                }
                
                for(let i=0;i<ccconfig.servers[serverIndex].categories.length;i++)
                {
                    if(interactionCopy.channel.parentId === ccconfig.servers[serverIndex].categories[i].ID)
                    {
                        categoryIndex = i;
                        await interactionCopy.reply("このカテゴリはすでに追加されています");
                        return;
                    }
                    if(i===ccconfig.servers[serverIndex].categories.length-1)
                    {
                        ccconfig.servers[serverIndex].categories[ccconfig.servers[serverIndex].categories.length]=
                            {
                                ID: interactionCopy.channel.parentId,
                                name: interactionCopy.channel.parent.name,
                                allowRole:Boolean(interactionCopy.options.getNumber("ロールの作成")),
                                channels:[{ID:"",name:"",thereRole:false,roleID:"0000000000000000000",roleName:""}]
                            };
                        categoryIndex =i+1;
                        break;
                    }
                }
                
                const ccjson = JSON.stringify (ccconfig, null, 2);
                try
                {
                    fs.writeFileSync ("CCConfig.json", ccjson, "utf8");
                } catch (e)
                {
                    console.log (e);
                }
                
                await interactionCopy.reply("Added!!!!!");
            }
        }
    ]