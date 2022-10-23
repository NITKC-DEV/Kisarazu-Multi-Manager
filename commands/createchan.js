const { SlashCommandBuilder, Guild}=require('discord.js');

module.exports=
    [
        {
            data:new SlashCommandBuilder()
                .setName('createchan')
                .setDescription('チャンネルの作成')
                .addStringOption(option =>
                    option
                        .setName('チャンネル名')
                        .setDescription('作成するチャンネル名を指定します')
                        .setRequired(true)

                )
                .addNumberOption(option =>
                    option
                        .setName('カテゴリ')
                        .setDescription('チャンネルを作成するカテゴリを指定します')
                        .setRequired(true)
                        .addChoices(
                            {name:'専門科目を語る会',value:1033563012470157403},
                        )
                )
                .addBooleanOption(option =>
                     option
                        .setName('ロールの作成')
                        .setDescription('チャンネルに対応したロールを作成するかを指定します')
                        .setRequired(true)
                )

        }
    ]