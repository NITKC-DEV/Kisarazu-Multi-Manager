const {SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder} = require("discord.js");
const db = require("../functions/db.js");
const dbMain = "main";          //データベースmainとコレクションCC-categoryを定数化
const colCat = "CC-categories";

module.exports =
    [
        {
            //スラッシュコマンドの定義
            data: new SlashCommandBuilder()
                .setName("create-channel")
                .setDescription("チャンネルの作成")
                //チャンネル名を入力 -> string
                .addStringOption(option =>
                    option
                        .setName("チャンネル名")
                        .setDescription("作成するチャンネル名を指定します")
                        .setRequired(true)
                ),
            /***
             * /add-category で登録されたカテゴリにチャンネルを作成する
             * @param interaction
             * @returns {Promise<void>}
             */
            async execute(interaction) {
                await interaction.deferReply({ephemeral: true});
                if(interaction.guild !== null) {
                    const guildCats = await db.find(dbMain, colCat, {"guildID": interaction.guildId});
                    if(guildCats.length > 0) {
                        const channelName = interaction.options.getString("チャンネル名").replace(/ /g, "-");
                        if(channelName.length <= 30) {
                            //Optionのvalueにはanyとか言っときながら、string型しか入力できないので、オブジェクト型を無理やりJson文字列に変換し渡す
                            const selectCategory = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setPlaceholder("カテゴリを選択してください")
                                        .setCustomId("createChannel")
                                        .addOptions(
                                            ...guildCats.map(data => ({
                                                label: data.name,
                                                value: JSON.stringify({categoryID: data.ID, channelName: channelName})
                                            })),
                                            {
                                                label: "キャンセル",
                                                value: JSON.stringify({categoryID: "cancel", channelName: channelName})
                                            }
                                        )
                                );
                            
                            await interaction.editReply({
                                content: `${channelName}を作成するカテゴリを指定してください`,
                                components: [selectCategory],
                                ephemeral: true
                            });
                        }
                        else {
                            await interaction.editReply({
                                content: "チャンネル名として指定できる文字数は最大30文字です",
                                ephemeral: true
                            });
                        }
                    }
                    else {
                        await interaction.editReply({
                            content: "このサーバーでは/create-chanが許可されているカテゴリがありません。\n管理者権限を持つ人が/add-categoryを実行することで/create-chanが有効になります。",
                            ephemeral: true
                        });
                    }
                    
                }
                else {
                    await interaction.editReply("このコマンドはサーバーでのみ実行できます");
                }
            }
        },
        {
            //カテゴリ登録用スラッシュコマンド
            data: new SlashCommandBuilder()
                .setName("add-category")
                .setDescription("/CreateChanによってチャンネルの作成ができるカテゴリにこのカテゴリを追加します")
                .addNumberOption(option =>
                    option
                        .setName("ロールの追加を許可")
                        .setDescription("/CreateChanによって作成されたチャンネルに対応するメンション用のロールの作成を許可するかどうかを指定します")
                        .setRequired(true)
                        .addChoices
                        (
                            {name: "許可する", value: 1},
                            {name: "許可しない", value: 0}
                        )
                )
                .setDefaultMemberPermissions(1 << 3),
            /***
             * データベースに/create-channelを許可するカテゴリを登録する
             * @param interaction
             * @returns {Promise<void>}
             */
            async execute(interaction) {
                await interaction.deferReply({ephemeral: true});
                if(interaction.channel.type === 0) {
                    if((await db.find(dbMain, colCat, {ID: interaction.channel.parentId ? interaction.channel.parentId : "0"})).length === 0) {
                        await db.insert(dbMain, colCat, {
                            ID: interaction.channel.parentId !== null ? interaction.channel.parentId : interaction.guildId,
                            name: interaction.channel.parent !== null ? interaction.channel.parent.name : "カテゴリなし",
                            allowRole: Boolean(interaction.options.getNumber("ロールの追加を許可")),
                            guildID: interaction.guildId
                        });
                        await interaction.editReply({content: "追加しました", ephemeral: true});
                    }
                    else {
                        await interaction.editReply({content: "このカテゴリはすでに追加されています", ephemeral: true});
                    }
                }
                else {
                    await interaction.editReply("このコマンドはサーバー内のテキストチャンネルでのみ実行できます");
                }
            }
        },
        {
            data: new SlashCommandBuilder()
                .setName("remove-category")
                .setDescription("/add-categoryによって登録されたカテゴリの登録を解除します")
                .setDefaultMemberPermissions(1 << 3),
            /***
             * /add-categoryによって登録されたカテゴリの登録を解除する
             * @param interaction
             * @returns {Promise<void>}
             */
            async execute(interaction) {
                await interaction.deferReply({ephemeral: true});
                if(interaction.guild !== null) {
                    const guildCats = await db.find(dbMain, colCat, {"guildID": interaction.guildId});
                    if(guildCats.length > 0) {
                        const selectCategory = new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setPlaceholder("カテゴリを選択")
                                    .setCustomId("removeCategory")
                                    .addOptions(
                                        {label: "全カテゴリを登録解除する", value: "All"},
                                        ...guildCats.map(cat => ({label: cat.name, value: cat.ID})),
                                        {label: "キャンセル", value: "Cancel"}
                                    )
                            );
                        
                        await interaction.editReply({
                            content: "削除するカテゴリを指定してください。",
                            components: [selectCategory],
                            ephemeral: true
                        });
                    }
                    else {
                        await interaction.editReply({
                            content: "このサーバーには登録されているカテゴリがありません。",
                            ephemeral: true
                        });
                    }
                }
                else {
                    await interaction.editReply("このコマンドはサーバーでのみ実行できます");
                }
            }
        }
    ]