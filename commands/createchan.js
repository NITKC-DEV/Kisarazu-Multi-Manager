const { SlashCommandBuilder, PermissionsBitField, BitField}=require('discord.js');
const config = process.env.NODE_ENV === "development" ? require('../config.dev.json') : require('../config.json');

//ここから先の[]が"../botmain.js/スラッシュコマンド登録"にてcommandsに代入
module.exports=
    [
        {
            //スラッシュコマンドの定義
            data:new SlashCommandBuilder()
                .setName('createhan')
                .setDescription('チャンネルの作成')
                //チャンネル名を入力 -> string
                .addStringOption(option =>
                    option
                        .setName('チャンネル名')
                        .setDescription('作成するチャンネル名を指定します')
                        .setRequired(true)

                )
                //チャンネルを作成するカテゴリを指定し、そのカテゴリのIDを取得 -> string
                .addStringOption(option =>
                    option
                        .setName('カテゴリ')
                        .setDescription('チャンネルを作成するカテゴリを指定します')
                        .setRequired(true)
                        .addChoices(
                            ...config.categories.map(category => ({name:category.name, value:category.id}))
                        )
                )
                //チャンネルに対応したロールを作成をするかどうかを指定 -> boolean
                .addBooleanOption(option =>
                     option
                        .setName('ロールの作成')
                        .setDescription('チャンネルに対応したロールを作成するかを指定します')
                        .setRequired(true)
                ),

            //"../botmain.js-l42"より、スラッシュコマンド実行時の情報"interaction"を"interactionCopy"にコピー
            async execute(interactionCopy)
            {
                //入力されたチャンネル名を扱いやすいように単独の変数に変換
                const channelName = interactionCopy.options.getString('チャンネル名');

                //選択されたカテゴリのIDを扱いやすいように単独の変数に変換
                const categoryID= interactionCopy.options.getString('カテゴリ');

                //チャンネルの作成。権限はカテゴリの権限に同期される。
                //                                           チャンネル名     カテゴリのID      メモ的な
                await interactionCopy.guild.channels.create({name:channelName,parent:categoryID,reason:'Botによって作成'});
                
                //もし、ロールの作成にてtrueが選択されていたら、ロールを作成する
                if(interactionCopy.options.getBoolean('ロールの作成'))
                {
                    //ロール権限の格納
                    const perm=new PermissionsBitField();
                    //ロールの作成。権限は@everyoneが適用される。
                    //                                        ロール名:とりまチャネ名  メンション許可    上で作ったpermから、すべての権限を取り除く        メモ的な
                    await interactionCopy.guild.roles.create({name:channelName,mentionable:true,permissions:[perm.remove([PermissionsBitField.All])],reason:'Botによって作成'});
                }
                
                await interactionCopy.reply("Created!!!!!");
            }

        }
    ]