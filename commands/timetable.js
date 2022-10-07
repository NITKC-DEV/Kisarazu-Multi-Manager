const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const commands = require("../botmain");

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
            if(interaction.options.getString('曜日')=='1'){
                dayofweek=1;
            }
            else if(interaction.options.getString('曜日')=='2'){
                dayofweek=2;
            }
            else if(interaction.options.getString('曜日')=='3'){
                dayofweek=3;
            }
            else if(interaction.options.getString('曜日')=='4'){
                dayofweek=4;
            }
            else if(interaction.options.getString('曜日')=='5'){
                dayofweek=5;
            }
            else{
                if(hours>=17){
                    dayofweek+=1;
                }
                if(dayofweek==6 || dayofweek==7 || dayofweek==0){
                    dayofweek=1;
                }
            }
            if(dayofweek=1){
                if(interaction.options.getString('学科')=='M'){
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
                                    name: "**基礎数学Ⅱ**",
                                    value:'担当教員:関口 昌由 \n授業場所:1年機械工学科教室\n─────────────────',
                                },
                                {
                                    name: '**工学実験ⅠB**',
                                    value:'担当教員:小田 功,高橋 美喜男,松井 翔太 \n授業場所:実習工場\n─────────────────',
                                },
                                {
                                    name: '**図学製図Ⅱ**',
                                    value:'担当教員:松井 翔太 \n授業場所:1年機械工学科教室\n─────────────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所:**1年機械工学科教室**ほか\n─────────────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')=='E'){
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
                                    name: '**基礎数学Ⅱ**',
                                    value:'担当教員:鈴木 道治 \n授業場所:1年電気電子工学科教室\n─────────────────',
                                },
                                {
                                    name: '**空きコマ**',
                                    value:'時間割上では、3,4時間目は空きコマになっています。\n─────────────────',
                                },
                                {
                                    name: '**英語ⅠB**',
                                    value:'担当教員:岩崎 洋一,小川 祐輔 \n授業場所:1年電気電子工学科教室\n─────────────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所:1年電気電子工学科教室ほか\n─────────────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')=='D'){
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
                                        name: '**基礎数学Ⅱ**',
                                        value:'担当教員:阿部 孝之 \n授業場所:1年電子制御工学科教室\n─────────────────',
                                    },
                                    {
                                        name: '**英語ⅡB**',
                                        value:'担当教員:瀬川 直美 \n授業場所:特別教室\n─────────────────',
                                    },
                                    {
                                        name: '**物理学Ⅰ**',
                                        value:'担当教員:高谷 博史 \n授業場所:1年電子制御工学科教室\n─────────────────',
                                    },
                                    {
                                        name: '**課題学習時間**',
                                        value:'授業場所:1年電子制御工学科教室ほか\n─────────────────',
                                    },

                                ]
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')=='J'){
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
                                        name: '**物理学Ⅰ**',
                                        value:'担当教員:高谷 博史 \n授業場所:1年情報工学科教室\n─────────────────',
                                    },
                                    {
                                        name: '**英語ⅠB**',
                                        value:'担当教員:小川 祐輔 \n授業場所:1年情報工学科教室\n─────────────────',
                                    },
                                    {
                                        name: '**基礎数学Ⅲ**',
                                        value:'担当教員:阿部 孝之 \n授業場所:1年情報工学科教室\n─────────────────',
                                    },
                                    {
                                        name: '**課題学習時間**',
                                        value:'授業場所:1年情報工学科教室ほか\n─────────────────',
                                    },

                                ]
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Developed by NITKC22s server Admin' });

                }
                else if(interaction.options.getString('学科')=='C'){
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
                                    name: '**英語ⅡB**',
                                    value:'担当教員:瀬川 直美 \n授業場所:特別教室\n─────────────────',
                                },
                                {
                                    name: '**基礎数学Ⅲ**',
                                    value:'担当教員:阿部 孝之 \n授業場所:1年環境都市工学科教室\n─────────────────',
                                },
                                {
                                    name: '**基礎数学Ⅱ**',
                                    value:'担当教員:佐野 照和 \n授業場所:1年環境都市工学科教室\n─────────────────',
                                },
                                {
                                    name: '**課題学習時間**',
                                    value:'授業場所:1年環境都市学科教室ほか\n─────────────────',
                                },

                            ]
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC22s server Admin' });
                }
            }
            else if(dayofweek=2){
                if(interaction.options.getString('学科')=='M'){

                }
                else if(interaction.options.getString('学科')=='E'){

                }
                else if(interaction.options.getString('学科')=='D'){

                }
                else if(interaction.options.getString('学科')=='J'){

                }
                else if(interaction.options.getString('学科')=='C'){

                }
            }
            else if(dayofweek=3){
                if(interaction.options.getString('学科')=='M'){

                }
                else if(interaction.options.getString('学科')=='E'){

                }
                else if(interaction.options.getString('学科')=='D'){

                }
                else if(interaction.options.getString('学科')=='J'){

                }
                else if(interaction.options.getString('学科')=='C'){

                }
            }
            else if(dayofweek=4){
                if(interaction.options.getString('学科')=='M'){

                }
                else if(interaction.options.getString('学科')=='E'){

                }
                else if(interaction.options.getString('学科')=='D'){

                }
                else if(interaction.options.getString('学科')=='J'){

                }
                else if(interaction.options.getString('学科')=='C'){

                }
            }
            else if(dayofweek=5){
                if(interaction.options.getString('学科')=='M'){

                }
                else if(interaction.options.getString('学科')=='E'){

                }
                else if(interaction.options.getString('学科')=='D'){

                }
                else if(interaction.options.getString('学科')=='J'){

                }
                else if(interaction.options.getString('学科')=='C'){

                }
            }

            await interaction.reply({ embeds: [embed] });
        },
    },


]
