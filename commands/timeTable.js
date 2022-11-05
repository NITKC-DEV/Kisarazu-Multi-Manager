const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports =[
    {
        data: new SlashCommandBuilder()
            .setName('timetable')
            .setDescription('指定した学科・曜日の時間割を送信します')
            .addStringOption(option =>
                option
                    .setName('学科')
                    .setDescription('学科を指定します')
                    .setRequired(true)
                    .addChoices(
                        {name:'M-機械工学科', value:'M'},
                        {name:'E-電気電子工学科', value:'E'},
                        {name:'D-電子制御工学科', value:'D'},
                        {name:'J-情報工学科', value:'J'},
                        {name:'C-環境都市工学科', value:'C'},
                    )
            )
            .addStringOption(option =>
                option
                    .setName('曜日')
                    .setDescription('曜日を指定します。指定なければ次の学校の日になります。')
                    .setRequired(false)
                    .addChoices(
                        {name:'月曜日', value:'1'},
                        {name:'火曜日', value:'2'},
                        {name:'水曜日', value:'3'},
                        {name:'木曜日', value:'4'},
                        {name:'金曜日', value:'5'},
                    )

            ),

        async execute(interaction) {
            let embed;
            let dt = new Date();
            let dayofweek = dt.getDay();
            let hours = dt.getHours();
            if(interaction.options.getString('曜日')==='1'){
                dayofweek=1;
            }
            else if(interaction.options.getString('曜日')==='2'){
                dayofweek=2;
            }
            else if(interaction.options.getString('曜日')==='3'){
                dayofweek=3;
            }
            else if(interaction.options.getString('曜日')==='4'){
                dayofweek=4;
            }
            else if(interaction.options.getString('曜日')==='5'){
                dayofweek=5;
            }
            else{
                if(hours>=17){
                    dayofweek+=1;
                }
                if(dayofweek===6 || dayofweek===7 || dayofweek===0){
                    dayofweek=1;
                }
            }
            if(dayofweek===1){
                if(interaction.options.getString('学科')==='M'){
                    embed = new EmbedBuilder()
                        .setColor(0x00A0EA)
                        .setTitle('機械工学科 時間割')
                        .setAuthor({
                            name: "木更津22s統合管理BOT",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください\n')
                        .addFields(
                            [
                                {
                                    name: "──────────\n**基礎数学Ⅱ**",
                                    value:'担当教員：関口 昌由 \n授業場所：1年機械工学科教室\n──────────',
                                },
                                {
                                    name: '**工学実験ⅠB**',
                                    value:'担当教員：小田 功・高橋 美喜男\n　　　　　松井 翔太 \n授業場所：実習工場\n──────────',
                                },
                                {
                                    name: '**図学製図Ⅱ**',
                                    value:'担当教員：松井 翔太 \n授業場所：1年機械工学科教室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：**1年機械工学科教室**ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')==='E'){
                    embed = new EmbedBuilder()
                        .setColor(0xD64E5A)
                        .setTitle('電気電子工学科 時間割')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .addFields(
                            [
                                {
                                    name: '──────────\n**基礎数学Ⅱ**',
                                    value:'担当教員：鈴木 道治 \n授業場所：1年電気電子工学科教室\n──────────',
                                },
                                {
                                    name: '**空きコマ**',
                                    value:'時間割上では、3,4時間目は空きコマになっています。\n──────────',
                                },
                                {
                                    name: '**英語ⅠB**',
                                    value:'担当教員：岩崎 洋一・小川 祐輔 \n授業場所：1年電気電子工学科教室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年電気電子工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')==='D'){
                        embed = new EmbedBuilder()
                            .setColor(0x865DC0)
                            .setTitle('電子制御工学科 時間割')
                            .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                            .setAuthor({
                                name: "木更津22s統合管理bot",
                                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                                url: 'https://discord.gg/mwyC8PTcXa'
                            })
                            .addFields(
                                [
                                    {
                                        name: '──────────\n**基礎数学Ⅱ**',
                                        value:'担当教員：阿部 孝之 \n授業場所：1年電子制御工学科教室\n──────────',
                                    },
                                    {
                                        name: '**英語ⅡB**',
                                        value:'担当教員：瀬川 直美 \n授業場所：特別教室\n──────────',
                                    },
                                    {
                                        name: '**物理学Ⅰ**',
                                        value:'担当教員：高谷 博史 \n授業場所：1年電子制御工学科教室\n──────────',
                                    },
                                    {
                                        name: '**課題学習時間**',
                                        value:'授業場所：1年電子制御工学科教室ほか\n──────────',
                                    },

                                ]
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')==='J'){
                        embed = new EmbedBuilder()
                            .setColor(0xCAAB0D)
                            .setTitle('情報工学科 時間割')
                            .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                            .setAuthor({
                                name: "木更津22s統合管理bot",
                                iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                                url: 'https://discord.gg/mwyC8PTcXa'
                            })
                            .addFields(
                                [
                                    {
                                        name: '──────────\n**物理学Ⅰ**',
                                        value:'担当教員：高谷 博史 \n授業場所：1年情報工学科教室\n──────────',
                                    },
                                    {
                                        name: '**英語ⅠB**',
                                        value:'担当教員：小川 祐輔 \n授業場所：1年情報工学科教室\n──────────',
                                    },
                                    {
                                        name: '**基礎数学Ⅲ**',
                                        value:'担当教員：阿部 孝之 \n授業場所：1年情報工学科教室\n──────────',
                                    },
                                    {
                                        name: '**課題学習時間**',
                                        value:'授業場所：1年情報工学科教室ほか\n──────────',
                                    },

                                ]
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')==='C'){
                    embed = new EmbedBuilder()
                        .setColor(0x1E9B50)
                        .setTitle('環境都市工学科 時間割')
                        .setDescription('月曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**英語ⅡB**',
                                    value:'担当教員：瀬川 直美 \n授業場所：特別教室\n──────────',
                                },
                                {
                                    name: '**基礎数学Ⅲ**',
                                    value:'担当教員：阿部 孝之 \n授業場所：1年環境都市工学科教室\n──────────',
                                },
                                {
                                    name: '**基礎数学Ⅱ**',
                                    value:'担当教員：佐野 照和 \n授業場所：1年環境都市工学科教室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年環境都市学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else{
                    embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('エラー！！！')
                        .setDescription('おっと！何かが上手く行かなかったようだ<@626680496834871308>\n\n Error: Command argument is invalid')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
            }
            else if(dayofweek===2){
                if(interaction.options.getString('学科')==='M'){
                    embed = new EmbedBuilder()
                        .setColor(0x00A0EA)
                        .setTitle('機械工学科 時間割')
                        .setAuthor({
                            name: "木更津22s統合管理BOT",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setDescription('火曜日の時間割です。\n ※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .addFields(
                            [
                                {
                                    name: '──────────\n**地理B**',
                                    value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　高石 憲明 \n授業場所：1年機械工学科教室\n──────────',
                                },
                                {
                                    name: '**物理学Ⅰ**',
                                    value:'担当教員：高谷 博史 \n授業場所：1年機械工学科教室\n──────────',
                                },
                                {
                                    name: '**技術者入門Ⅱ**',
                                    value:'担当教員：板垣 貴喜・内田 洋彰\n　　　　　小田 　功・歸山 智治\n　　　　　松井 翔太\n──────────',
                                },


                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='E'){
                    embed = new EmbedBuilder()
                        .setColor(0xD64E5A)
                        .setTitle('電気電子工学科 時間割')
                        .setDescription('火曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**物理学Ⅰ**',
                                    value:'担当教員：高谷 博史 \n授業場所：1年電気電子工学科教室\n──────────',
                                },
                                {
                                    name: '**基礎化学ⅠB**',
                                    value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                                },
                                {
                                    name: '**技術者入門Ⅱ**',
                                    value:'担当教員：小原 翔馬・水越 彰仁 \n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')==='D'){
                    embed = new EmbedBuilder()
                        .setColor(0x865DC0)
                        .setTitle('電子制御工学科 時間割')
                        .setDescription('火曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**電子計算機Ⅰ**\n',
                                    value:'担当教員：沢口 義人 \n授業場所：1年電子制御工学科教室\n──────────',
                                },
                                {
                                    name: '**技術者入門Ⅱ**',
                                    value:'担当教員：沢口 義人・奥山 彫夢\n──────────',
                                },
                                {
                                    name: '**技術者入門Ⅱ**',
                                    value:'担当教員：沢口 義人・奥山 彫夢\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')==='J'){
                    embed = new EmbedBuilder()
                        .setColor(0xCAAB0D)
                        .setTitle('情報工学科 時間割')
                        .setDescription('火曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**実験実習ⅠB**',
                                    value:'担当教員：米村 恵一・能城 沙織 \n授業場所：情報工学科回路実験室\n──────────',
                                },
                                {
                                    name: '**コンピュータ入門Ⅱ**',
                                    value:'担当教員：丸山 真佐夫・吉澤 陽介 \n授業場所：情報工学科計算機演習室\n──────────',
                                },
                                {
                                    name: '**技術者入門Ⅱ**',
                                    value:'担当教員：米村 恵一・和田 州平\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='C'){
                    embed = new EmbedBuilder()
                        .setColor(0x1E9B50)
                        .setTitle('環境都市工学科 時間割')
                        .setDescription('火曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**基礎数学Ⅱ**',
                                    value:'担当教員：佐野 照和 \n授業場所：1年環境都市工学科教室\n──────────',
                                },
                                {
                                    name: '**空きコマ**',
                                    value:'時間割上では、3,4時間目は空きコマになっています。\n──────────',
                                },
                                {
                                    name: '**技術者入門Ⅱ**',
                                    value:'担当教員：石川 雅朗\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else{
                    embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('エラー！！！')
                        .setDescription('おっと！何かが上手く行かなかったようだ<@626680496834871308>\n\n Error: Command argument is invalid')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
            }
            else if(dayofweek===3){
                if(interaction.options.getString('学科')==='M'){
                    embed = new EmbedBuilder()
                        .setColor(0x00A0EA)
                        .setTitle('機械工学科 時間割')
                        .setAuthor({
                            name: "木更津22s統合管理BOT",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setDescription('水曜日の時間割です。\n ※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .addFields(
                            [
                                {
                                    name: '──────────\n**美術**',
                                    value:'担当教員：加藤 達彦・馬場 喜久 \n授業場所：第6講義室\n──────────',
                                },
                                {
                                    name: '**保健体育ⅠB**',
                                    value:'担当教員：坂田 洋満・篠村 朋樹　\n授業場所：体育館・グラウンド他ほか\n──────────',
                                },
                                {
                                    name: '**英語ⅠB**',
                                    value:'担当教員：岩崎 洋一・小川 祐輔 \n授業場所：1年機械工学科教室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年機械工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')==='E'){
                    embed = new EmbedBuilder()
                        .setColor(0xD64E5A)
                        .setTitle('電気電子工学科 時間割')
                        .setDescription('水曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**ディジタル回路Ⅰ**',
                                    value:'担当教員：若葉 陽一 \n授業場所：1年電気電子工学科教室\n──────────',
                                },
                                {
                                    name: '**基礎数学Ⅱ**',
                                    value:'担当教員：鈴木 道治 \n授業場所：1年電気電子工学科教室\n──────────',
                                },
                                {
                                    name: '**保健体育ⅠB**',
                                    value:'担当教員：坂田 洋満・篠村 朋樹 \n授業場所：体育館・グラウンドほか\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年電気電子工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='D'){
                    embed = new EmbedBuilder()
                        .setColor(0x865DC0)
                        .setTitle('電子制御工学科 時間割')
                        .setDescription('水曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**保健体育ⅠB**',
                                    value:'担当教員：坂田 洋満,篠村 朋樹 \n授業場所：体育館・グラウンドほか\n──────────',
                                },
                                {
                                    name: '**美術**',
                                    value:'担当教員：加藤 達彦,馬場 喜久 \n授業場所：第6講義室\n──────────',
                                },
                                {
                                    name: '**基礎化学ⅠB**',
                                    value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年電子制御工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='J'){
                    embed = new EmbedBuilder()
                        .setColor(0xCAAB0D)
                        .setTitle('情報工学科 時間割')
                        .setDescription('水曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**基礎数学Ⅱ**',
                                    value:'担当教員：山下 哲 \n授業場所：1年情報工学科教室\n──────────',
                                },
                                {
                                    name: '**国語ⅠB**',
                                    value:'担当教員：加田 謙一郎 \n授業場所：1年情報工学科教室\n──────────',
                                },
                                {
                                    name: '**美術**',
                                    value:'担当教員：加藤 達彦・馬場 喜久 \n授業場所：第6講義室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年情報工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='C'){
                    embed = new EmbedBuilder()
                        .setColor(0x1E9B50)
                        .setTitle('環境都市工学科 時間割')
                        .setDescription('水曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**測量学Ⅰ**',
                                    value:'担当教員：島﨑 彦人 \n授業場所：1年環境都市工学科教室\n──────────',
                                },
                                {
                                    name: '**基礎化学ⅠB**',
                                    value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                                },
                                {
                                    name: '**国語ⅠB**',
                                    value:'担当教員：加田 謙一郎 \n授業場所：1年環境都市工学科教室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年環境都市学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else{
                    embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('エラー！！！')
                        .setDescription('おっと！何かが上手く行かなかったようだ<@626680496834871308>\n\n Error: Command argument is invalid')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
            }
            else if(dayofweek===4){
                if(interaction.options.getString('学科')==='M'){
                    embed = new EmbedBuilder()
                        .setColor(0x00A0EA)
                        .setTitle('機械工学科 時間割')
                        .setAuthor({
                            name: "木更津22s統合管理BOT",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setDescription('木曜日の時間割です。\n ※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .addFields(
                            [
                                {
                                    name: '──────────\n**国語ⅠB**',
                                    value:'担当教員：加田 謙一郎 \n授業場所：1年機械工学科教室\n──────────',
                                },
                                {
                                    name: '**基礎数学Ⅱ**',
                                    value:'担当教員：関口 昌由 \n授業場所：1年機械工学科教室\n──────────',
                                },
                                {
                                    name: '**情報処理Ⅱ**',
                                    value:'担当教員：伊藤 裕一・青葉 知弥 \n授業場所：ネットワーク情報センター\n──────────',
                                },
                                {
                                    name: '**HR**',
                                    value:'授業場所：1年機械工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='E'){
                    embed = new EmbedBuilder()
                        .setColor(0xD64E5A)
                        .setTitle('電気電子工学科 時間割')
                        .setDescription('木曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**基礎数学Ⅲ**',
                                    value:'担当教員：阿部 孝之 \n授業場所：1年電気電子工学科教室\n──────────',
                                },
                                {
                                    name: '**電気電子工学入門**',
                                    value:'担当教員：谷井 宏成 \n授業場所：1年電気電子工学科教室\n──────────',
                                },
                                {
                                    name: '**国語ⅠB**',
                                    value:'担当教員：加田 謙一郎   \n授業場所：1年電気電子工学科教室\n──────────',
                                },
                                {
                                    name: '**HR**',
                                    value:'授業場所：1年電気電子工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='D'){
                    embed = new EmbedBuilder()
                        .setColor(0x865DC0)
                        .setTitle('電子制御工学科 時間割')
                        .setDescription('木曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**英語ⅠB**',
                                    value:'担当教員：岩崎 洋一・小川 祐輔 \n授業場所：1年電子制御工学科教室\n──────────',
                                },
                                {
                                    name: '**国語ⅠB**',
                                    value:'担当教員：加田 謙一郎 \n授業場所：1年電子制御工学科教室\n──────────',
                                },
                                {
                                    name: '**基礎数学Ⅱ**',
                                    value:'担当教員：阿部 孝之 \n授業場所：1年電子制御工学科教室\n──────────',
                                },
                                {
                                    name: '**HR**',
                                    value:'授業場所：1年電子制御工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='J'){
                    embed = new EmbedBuilder()
                        .setColor(0xCAAB0D)
                        .setTitle('情報工学科 時間割')
                        .setDescription('木曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**英語ⅡB**',
                                    value:'担当教員：瀬川 直美　\n授業場所：特別教室\n──────────',
                                },
                                {
                                    name: '**基礎化学ⅠB**',
                                    value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                                },
                                {
                                    name: '**コンピュータ演習Ⅱ**',
                                    value:'担当教員：米村 恵一・和田 州平 \n授業場所：情報工学科回路実験室\n──────────',
                                },
                                {
                                    name: '**HR**',
                                    value:'授業場所：1年情報工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='C'){
                    embed = new EmbedBuilder()
                        .setColor(0x1E9B50)
                        .setTitle('環境都市工学科 時間割')
                        .setDescription('木曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**物理学Ⅰ**',
                                    value:'担当教員：高谷 博史 \n授業場所：特別教室\n──────────',
                                },
                                {
                                    name: '**空きコマ**',
                                    value:'時間割上では、3,4時間目は空きコマになっています。\n──────────',
                                },
                                {
                                    name: '**英語ⅠB**',
                                    value:'担当教員：岩崎 洋一・小川 祐輔 \n授業場所：1年環境都市工学科教室\n──────────',
                                },
                                {
                                    name: '**HR**',
                                    value:'授業場所：1年環境都市学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else{
                    embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('エラー！！！')
                        .setDescription('おっと！何かが上手く行かなかったようだ<@626680496834871308>\n\n Error: Command argument is invalid')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
            }
            else if(dayofweek===5){
                if(interaction.options.getString('学科')==='M'){
                    embed = new EmbedBuilder()
                        .setColor(0x00A0EA)
                        .setTitle('機械工学科 時間割')
                        .setAuthor({
                            name: "木更津22s統合管理BOT",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setDescription('金曜日の時間割です。\n ※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .addFields(
                            [
                                {
                                    name: '──────────\n**英語ⅡB**',
                                    value:'担当教員：瀬川 直美 \n授業場所：特別教室\n──────────',
                                },
                                {
                                    name: '**基礎化学ⅠB**',
                                    value:'担当教員：藤井 翔 \n授業場所：化学実験室\n──────────',
                                },
                                {
                                    name: '**基礎数学Ⅲ**',
                                    value:'担当教員：阿部 孝之 \n授業場所：第一講義室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年機械工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='E'){
                    embed = new EmbedBuilder()
                        .setColor(0xD64E5A)
                        .setTitle('電気電子工学科 時間割')
                        .setDescription('金曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**地理B**',
                                    value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　高石 憲明 \n授業場所：1年電気電子工学科教室\n──────────',
                                },
                                {
                                    name: '**英語ⅡB**',
                                    value:'担当教員：瀬川 直美 \n授業場所：特別教室\n──────────',
                                },
                                {
                                    name: '**プログラミングⅠ**',
                                    value:'担当教員：飯田 聡子 \n授業場所：ネットワーク情報センター\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年電気電子工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='D'){
                    embed = new EmbedBuilder()
                        .setColor(0x865DC0)
                        .setTitle('電子制御工学科 時間割')
                        .setDescription('金曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**機械制御入門Ⅱ**',
                                    value:'担当教員：沢口 義人　\n授業場所：1年電子制御工学科教室\n──────────',
                                },
                                {
                                    name: '**地理B**',
                                    value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　川元 豊和 \n授業場所：1年電子制御工学科教室\n──────────',
                                },
                                {
                                    name: '**基礎数学Ⅲ**',
                                    value:'担当教員：阿部 孝之 \n授業場所：第一講義室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年電子制御工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else if(interaction.options.getString('学科')==='J'){
                    embed = new EmbedBuilder()
                        .setColor(0xCAAB0D)
                        .setTitle('情報工学科 時間割')
                        .setDescription('金曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**保健体育ⅠB**',
                                    value:'担当教員：坂田 洋満・篠村 朋樹 \n授業場所：グラウンド・体育館ほか\n──────────',
                                },
                                {
                                    name: '**基礎数学Ⅱ**',
                                    value:'担当教員：山下 哲 \n授業場所：1年情報工学科教室\n──────────',
                                },
                                {
                                    name: '**地理B**',
                                    value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　川元 豊和 \n授業場所：1年情報工学科教室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年情報工学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')==='C'){
                    embed = new EmbedBuilder()
                        .setColor(0x1E9B50)
                        .setTitle('環境都市工学科 時間割')
                        .setDescription('金曜日の時間割です。\n※休講や、授業変更等がある可能性があります。各自で確認してください')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .addFields(
                            [
                                {
                                    name: '──────────\n**地理B**',
                                    value:'担当教員：小谷 俊博・武長 玄次郎\n　　　　　川元 豊和 \n授業場所：特別教室\n──────────',
                                },
                                {
                                    name: '**保健体育ⅠB**',
                                    value:'担当教員：坂田 洋満・篠村 朋樹 \n授業場所：体育館・グラウンドほか\n──────────',
                                },
                                {
                                    name: '**力学基礎**',
                                    value:'担当教員：大久保 努 \n授業場所：環境都市工学科都市創造実験室\n──────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所：1年環境都市学科教室ほか\n──────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
                else{
                    embed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('エラー！！！')
                        .setDescription('おっと！何かが上手く行かなかったようだ<@626680496834871308>\n\n Error: Command argument is invalid')
                        .setAuthor({
                            name: "木更津22s統合管理bot",
                            iconURL: 'https://pbs.twimg.com/media/FcoDQ9zaIAUL08j?format=png&name=small',
                            url: 'https://discord.gg/mwyC8PTcXa'
                        })
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
            }


            await interaction.reply({ embeds: [embed] });
        },
    },


]
