// noinspection SpellCheckingInspection

const { SlashCommandBuilder,ActionRowBuilder, Events, SelectMenuBuilder}=require("discord.js");
const config = process.env.NODE_ENV === "development" ? require("../../bot-main-pullrequest/config.dev.json") : require("../config.json");
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
                ),

            //"../botmain.js-l42"より、スラッシュコマンド実行時の情報"interaction"を"interactionCopy"にコピー
            async execute(interactionCopy)
            {
                const chooseCatecory=new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder().setCustomId('selectWow')
                            .setPlaceholder("カテゴリを選択")
                            .addOptions(
                                ...ccconfig.servers.find(server => server.ID===interactionCopy.guild.id).categories.map(category =>({label:category.name,value:category.ID}))
                            )
                    )

                await interactionCopy.reply({ content: interactionCopy.options.getString('チャンネル名')+"を作成するカテゴリを指定してください。", components: [chooseCatecory] ,ephemeral: true});
                
                //チャンネルの作成。権限はカテゴリの権限に同期される。
                //                                           チャンネル名                                            カテゴリのID      メモ的な
                //await interactionCopy.guild.channels.create({name:interactionCopy.options.getString('チャンネル名'),parent:,reason:'Botによって作成'});
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
                                categories: [{ID:"0000000000000000000",name:"キャンセル",allowRole:false,channels:[]}]};
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
        },
        {
            data:new SlashCommandBuilder()
                .setName("modaltest")
                .setDescription("testtest"),
            async execute (interactionCopy)
            {

                const row = new ActionRowBuilder()
			        .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('select')
                            .setPlaceholder('Nothing selected')
                            .addOptions(
                                {
                                    label: 'Select me',
                                    description: 'This is a description',
                                    value: 'first_option',
                                },
                                {
                                    label: 'You can select me too',
                                    description: 'This is also a description',
                                    value: 'second_option',
                                })
                    )

                const ttt = new ActionRowBuilder()
			        .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('select2')
                            .setPlaceholder('tttt')
                            .addOptions(
                                {
                                    label: 'Select me',
                                    description: 'This is a description',
                                    value: 'first_option',
                                },
                                {
                                    label: 'aaaaaaaaaaaa',
                                    description: 'This is also a description',
                                    value: 'second_option',
                                })
                    )

                //await interactionCopy.reply({ content: 'Pong!', components: [ttt]});
                await interactionCopy.reply({content:"aaaaaaa",components:[row,ttt]});
            }
        }
    ]