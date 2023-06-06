const {SlashCommandBuilder} = require('discord.js');
const system = require('../functions/logsystem.js');
const db = require('../functions/db.js');


module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('guilddata')
                .setDescription('サーバー情報を登録します。詳細は/adminhelp 参照')
                .setDefaultMemberPermissions(1<<3)
                .addIntegerOption(option =>
                    option
                        .setName('学年')
                        .setDescription('入学した年を西暦4桁で入力してください。')
                        .setRequired(false)
                ).addChannelOption(option =>
                    option
                        .setName('アナウンスチャンネル')
                        .setDescription('BOTのアナウンスをするときに使うチャンネルを指定してください。')
                        .setRequired(false)
                ).addChannelOption(option =>
                    option
                        .setName('メインチャンネル')
                        .setDescription('雑談等メインで使うチャンネルを指定してください。')
                        .setRequired(false)
                ).addChannelOption(option =>
                    option
                        .setName('m科チャンネル')
                        .setDescription('m科用チャンネルを指定してください。')
                        .setRequired(false)
                ).addRoleOption(option =>
                    option
                        .setName('m科ロール')
                        .setDescription('m科用ロールを指定してください。')
                        .setRequired(false)
                ).addChannelOption(option =>
                    option
                        .setName('e科チャンネル')
                        .setDescription('e科用チャンネルを指定してください。')
                        .setRequired(false)
                ).addRoleOption(option =>
                    option
                        .setName('e科ロール')
                        .setDescription('e科用ロールを指定してください。')
                        .setRequired(false)
                ).addChannelOption(option =>
                    option
                        .setName('d科チャンネル')
                        .setDescription('d科用チャンネルを指定してください。')
                        .setRequired(false)
                ).addRoleOption(option =>
                    option
                        .setName('d科ロール')
                        .setDescription('d科用ロールを指定してください。')
                        .setRequired(false)
                ).addChannelOption(option =>
                    option
                        .setName('j科チャンネル')
                        .setDescription('j科用チャンネルを指定してください。')
                        .setRequired(false)
                ).addRoleOption(option =>
                    option
                        .setName('j科ロール')
                        .setDescription('j科用ロールを指定してください。')
                        .setRequired(false)
                ).addChannelOption(option =>
                    option
                        .setName('c科チャンネル')
                        .setDescription('c科用チャンネルを指定してください。')
                        .setRequired(false)
                ).addRoleOption(option =>
                    option
                        .setName('c科ロール')
                        .setDescription('c科用ロールを指定してください。')
                        .setRequired(false)
                ),
            async execute(interaction) {
                const data = await db.find("main","guildData",{guild: String(interaction.guildId)});
                if(data.length > 0) {
                    await db.update("main","guildData",{guild: String(interaction.guildId)},{
                        $set:{
                            guild: String(interaction.guildId),
                            grade: String(interaction.options.getInteger("学年") ?? data[0].grade),
                            announce: String((interaction.options.getChannel("アナウンスチャンネル") ?? {id:data[0].announce}).id),
                            main: String((interaction.options.getChannel("メインチャンネル") ?? {id:data[0].main}).id),
                            mChannel: String((interaction.options.getChannel("m科チャンネル") ?? {id:data[0].mChannel}).id),
                            mRole: String((interaction.options.getRole("m科ロール") ?? {id:data[0].mRole}).id),
                            eChannel: String((interaction.options.getChannel("e科チャンネル") ?? {id:data[0].eChannel}).id),
                            eRole: String((interaction.options.getRole("e科ロール") ?? {id:data[0].eRole}).id),
                            dChannel: String((interaction.options.getChannel("d科チャンネル") ?? {id:data[0].dChannel}).id),
                            dRole: String((interaction.options.getRole("d科ロール") ?? {id:data[0].dRole}).id),
                            jChannel: String((interaction.options.getChannel("j科チャンネル") ?? {id:data[0].jChannel}).id),
                            jRole: String((interaction.options.getRole("j科ロール") ?? {id:data[0].jRole}).id),
                            cChannel: String((interaction.options.getChannel("c科チャンネル") ?? {id:data[0].cChannel}).id),
                            cRole: String((interaction.options.getRole("c科ロール") ?? {id:data[0].cRole}).id),
                        }
                    });
                }
                else{
                    await db.insert("main","guildData",{
                        guild: String(interaction.guildId),
                        grade: String(interaction.options.getInteger("学年") ?? "undefined"),
                        announce: String((interaction.options.getChannel("アナウンスチャンネル") ?? {id: "undefined"}).id),
                        main: String((interaction.options.getChannel("メインチャンネル") ?? {id:"undefined"}).id),
                        mChannel: String((interaction.options.getChannel("m科チャンネル") ?? {id:"undefined"}).id),
                        mRole: String((interaction.options.getRole("m科ロール") ?? {id:"undefined"}).id),
                        eChannel: String((interaction.options.getChannel("e科チャンネル") ?? {id:"undefined"}).id),
                        eRole: String((interaction.options.getRole("e科ロール") ?? {id:"undefined"}).id),
                        dChannel: String((interaction.options.getChannel("d科チャンネル") ?? {id:"undefined"}).id),
                        dRole: String((interaction.options.getRole("d科ロール") ?? {id:"undefined"}).id),
                        jChannel: String((interaction.options.getChannel("j科チャンネル") ?? {id:"undefined"}).id),
                        jRole: String((interaction.options.getRole("j科ロール") ?? {id:"undefined"}).id),
                        cChannel: String((interaction.options.getChannel("c科チャンネル") ?? {id:"undefined"}).id),
                        cRole: String((interaction.options.getRole("c科ロール") ?? {id:"undefined"}).id),
                    });
                }
            }
        }
    ]