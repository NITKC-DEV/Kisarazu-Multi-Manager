const { SlashCommandBuilder, EmbedBuilder , version, Client, GatewayIntentBits, Partials} = require('discord.js')
const packageVer = require('../package.json')
const fs = require("fs");
const {configPath} = require("../environmentConfig");

const moment = require('moment');
const commands = require("../botmain");
function monthsAndDaysBetween(startUnix, endUnix) {
    const startDate = moment.unix(startUnix);
    const endDate = moment.unix(endUnix);

    let monthDiff = endDate.diff(startDate, 'months');
    let dayDiff = endDate.diff(startDate, 'days') % 30;

    // Handle cases where end date is in a later month but has a lower day value
    if (endDate.date() < startDate.date()) {
        monthDiff -= 1;
        dayDiff = moment.duration(endDate.diff(startDate.clone().subtract(monthDiff, 'months'), 'days')).asDays();
    }

    return [monthDiff,dayDiff];
}

module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('dashboard')
                .setDescription('ダッシュボードを表示します'),

            async execute(interaction) {
                /*現在時刻を取得*/
                const date = new Date();
                const time = date.toFormat('YYYY年 MM月DD日 HH24:MI:SS')

                /*bot及びユーザーの人数を取得*/
                const members = await interaction.guild.members.fetch({ withPresences: true });
                const user = members.filter(member => member.user.bot === false).size;
                const online = members.filter(member => member.presence && member.presence.status !== "offline" && member.user.bot === false).size;
                const botOnline = members.filter(member => member.presence && member.presence.status !== "offline" && member.user.bot === true).size;

                /*定期テスト*/
                const data = JSON.parse(fs.readFileSync(configPath, 'utf8'))
                let test,UNIXtest,testStart,testEnd;
                let now = Date.now() + 32400000;
                if(data.nextTest[0][0] === 0){
                    test = "現在設定されている次のテストはありません。"
                    for(let i =0; i < 3; i++){
                        data.nextTest[i] = data.nextTest[i+1]
                    }
                    data.nextTest[3] = [0,0,0,0,0]
                    fs.writeFileSync(configPath, JSON.stringify(data,null ,"\t"))
                }
                else{
                    UNIXtest = Date.UTC(data.nextTest[0][0],data.nextTest[0][1]-1,data.nextTest[0][2],8,50,0);
                    testStart = Date.UTC(data.nextTest[0][0],data.nextTest[0][1]-1,data.nextTest[0][2],0,0,0);
                    testEnd = Date.UTC(data.nextTest[0][0],data.nextTest[0][3]-1,data.nextTest[0][4],15,0,0);
                    if(now > testStart) {
                        if(now > testEnd){ /*テストが終了してたら*/
                            for(let i =0; i < 3; i++){
                                data.nextTest[i] = data.nextTest[i+1]
                            }
                            data.nextTest[3] = [0,0,0,0,0]
                            fs.writeFileSync(configPath, JSON.stringify(data,null ,"\t"))
                            if(data.nextTest[0][0] === 0){
                                test = "現在設定されている次のテストはありません。"
                            }
                        }
                        else{
                            if(now > testEnd - 86400000){ /*最終日なら*/
                                test = 'テスト最終日です'
                            }
                            else{
                                test = `テスト${Math.floor((now - testStart) / 86400000 + 1)}日目です(〜${data.nextTest[0][3]}月${data.nextTest[0][4]}日)`

                            }
                        }
                    }
                    else{
                        test = `${data.nextTest[0][0]}年${data.nextTest[0][1]}月${data.nextTest[0][2]}日〜${data.nextTest[0][3]}月${data.nextTest[0][4]}日`
                        day = monthsAndDaysBetween(now/1000, UNIXtest/1000)
                        test += `(${day[0]}ヶ月${day[1]}日後)`
                    }
                }




                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('NIT,Kisarazu College 22s ダッシュボード')
                    .setAuthor({
                        name: "木更津22s統合管理BOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://github.com/NITKC22s/bot-main'
                    })
                    .addFields(
                        [
                            {
                                name: '更新時刻',
                                value: `\`\`\`${time}\`\`\``,
                            },
                            {
                                name: 'サーバーの人数',
                                value: `\`\`\`参加人数${user}人　/　現在オンライン${online}人\`\`\``,
                            },
                            {
                                name: 'BOT台数',
                                value: `\`\`\`導入台数${interaction.guild.memberCount - user}台 / 稼働中${botOnline}台\`\`\``,
                            },
                            {
                                name: '次の定期テスト',
                                value: `\`\`\`${test}\`\`\``,
                            },
                            {
                                name: '実行環境',
                                value: 'node.js v18.9.0\ndiscord.js v' + version,

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
                .setName('next-test')
                .setDescription('次のテストを設定します。')
                .setDefaultMemberPermissions(1<<3)
                .addIntegerOption(option =>
                    option
                        .setName('年')
                        .setDescription('テストが実施される年を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('開始月')
                        .setDescription('テストが開始される月を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('開始日')
                        .setDescription('テストが開始される日を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('終了月')
                        .setDescription('テストが終了する月を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('終了日')
                        .setDescription('テストが終了する日を入力')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('四半期')
                        .setDescription('何番目のテストか入力(1~4)')
                        .setRequired(true)
                ),


            async execute(interaction) {
                if(interaction.options.data[5].value > 0 && interaction.options.data[5].value < 5){
                    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'))  //ここで読み取り
                    data.nextTest[interaction.options.data[5].value-1] = [
                        interaction.options.data[0].value,
                        interaction.options.data[1].value,
                        interaction.options.data[2].value,
                        interaction.options.data[3].value,
                        interaction.options.data[4].value
                    ]
                    fs.writeFileSync(configPath, JSON.stringify(data,null ,"\t")) //ここで書き出し
                    await interaction.reply({ content: `今年度${interaction.options.data[5].value}回目のテストを${data.nextTest[interaction.options.data[5].value-1][0]}年${data.nextTest[interaction.options.data[5].value-1][1]}月${data.nextTest[interaction.options.data[5].value-1][2]}日〜${data.nextTest[interaction.options.data[5].value-1][3]}月${data.nextTest[interaction.options.data[5].value-1][4]}日に設定しました`, ephemeral: true });
                }
                else{
                    await interaction.reply({content:"どっか〜ん　するから、1~4の中で指定してくれ", ephemeral: true })
                }

            },
        },
    ]