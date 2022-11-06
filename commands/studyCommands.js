const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require("fs");
const commands = require("../botmain");

module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('studydate')
                .setDescription('自習室のデータを表示します')
                .addUserOption(option =>
                    option
                        .setName('ユーザー')
                        .setDescription('記録を見たいユーザーを指定します')
                        .setRequired(true)
                ),

            async execute(interaction) {
                const commands = require('../botmain')
                //jsonの読み込みとユーザーデータの取り出し
                const date = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));
                let option = interaction.options.data[0].value;
                let user=date.date.find(date => date.uid === option);
                let embed;
                if(user === undefined){
                    embed = new EmbedBuilder()
                        .setColor(0xD9D9D9)
                        .setTitle('データが存在しません')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setDescription('データが存在しないか、破損しています。VCに参加してからもう一度試してください。それでもエラーが起きる場合は、管理者に連絡してください。')
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else{

                    let hour = user.study.reduce((sum, element) => sum + element, 0)/3600;
                    let color;
                    let rank;
                    if(hour >= 48){
                        color = 0xF00400
                        rank = "Red";
                    }
                    else if(hour >= 42){
                        color = 0xF47A00
                        rank = "Orange"
                    }
                    else if(hour >= 35){
                        color = 0xBCBC00
                        rank = "Yellow"
                    }
                    else if(hour >= 24){
                        color = 0x0000F4
                        rank = "Blue"
                    }
                    else if(hour >= 14){
                        color = 0x00B8B8
                        rank = "Light Blue"
                    }
                    else if(hour >= 7){
                        color = 0x007B00
                        rank = "Green"
                    }
                    else if(hour >= 3){
                        color = 0x7C3E00
                        rank = "Brown"
                    }
                    else{
                        color = 0xD9D9D9
                        rank = "Gray"
                    }
                    let dt = new Date();
                    let date = [0,0,0,0,0,0,0];
                    let month = [0,0,0,0,0,0,0];
                    for(let i=0;i<7;i++){
                        dt.setDate(dt.getDate()-1)
                        month[i] = dt.getMonth();
                        date[i] = dt.getDate()
                    }

                    embed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle(user.name + 'の自習室データ')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://github.com/NITKC22s/bot-main'
                        })
                        .setThumbnail(user.icon)
                        .setDescription("現在のランク：" + rank)
                        .addFields(
                            {
                                name:"過去7日間の毎日のデータ",
                                value:month[6] + '/' + date[6] + "    " + Math.floor(user.study[6]/360)/10 + "時間\n" +month[5] + '/' + date[5] + "    " + Math.floor(user.study[5]/360)/10 + "時間\n" + month[4] + '/' + date[4] + "    " + Math.floor(user.study[4]/360)/10 + "時間\n" + month[3] + '/' + date[3] + "    " + Math.floor(user.study[3]/360)/10 + "時間\n" + month[2] + '/' + date[2] + "    " + Math.floor(user.study[2]/360)/10 + "時間\n" + month[1] + '/' + date[1] + "    " + Math.floor(user.study[1]/360)/10 + "時間\n" + month[0] + '/' + date[0] + "    " + Math.floor(user.study[0]/360)/10 + "時間\n"
                            },
                            {
                                name:"過去7日間の勉強時間",
                                value:Math.floor(hour*10)/10 + "時間"
                            },
                            {
                                name:"累計勉強時間",
                                value:Math.floor(user.StudyAll/360)/10 + "時間"
                            }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('studyroom')
                .setDescription('自習室機能の説明です'),
            async execute(interaction) {
                const commands = require('../botmain')
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('自習室機能')
                    .setAuthor({
                        name: "木更津22s統合管理bot",
                        iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                        url: 'https://github.com/NITKC22s/bot-main'
                    })
                    .setDescription('ボイスチャットに接続している時間を勉強している時間とみなし、勉強時間を記録してくれるツールです。')
                    .addFields(
                        {
                            name:"対象ボイスチャット",
                            value:"現在は「みんなの自習室」「一人の自習室」の2つが対象となっています。"
                        },
                        {
                            name:"データ確認方法",
                            value:"/studydate コマンドを使用してください。なお、一度も記録をしてない場合はデータがないので、対象のボイスチャッチに一度参加してから実行してみてください。"
                        },
                        {
                            name:"ランク",
                            value:"直近7日間の勉強時間に応じて、ランクが設定されます。ランクは以下のように設定されています。\n\n赤：48時間以上\n橙：42時間以上\n黄：35時間以上\n青：24時間以上\n水：14時間以上\n緑：7時間以上\n茶：3時間以上\n灰：3時間未満"
                        }


                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC22s server Admin' });
                await interaction.reply({ embeds: [embed] });
            },
        },
    ]