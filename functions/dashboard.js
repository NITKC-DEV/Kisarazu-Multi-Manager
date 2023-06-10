const axios = require('axios');
const db = require("../functions/db.js");
const {EmbedBuilder} = require("discord.js");

/*天気取得*/
async function getWeather() {
    const data = await db.find("main","weatherCache",{label: "最新の天気予報"});
    return data[0].response;
}

/*日数カウント*/
function diffInMonthsAndDays(from, to) {
    if(from > to) {
        [from, to] = [to, from];
    }
    const fromDate = new Date(from);
    let toDate = new Date(to);
    let months=0,days;
    let daysInMonth;
    if (toDate.getFullYear() % 4 === 0 && toDate.getFullYear() % 4 !== 0) {
        daysInMonth = [31, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30]; /*前の月が何日であるかのリスト*/
    } else if (toDate.getFullYear() % 400 === 0) {
        daysInMonth = [31, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30];
    } else {
        daysInMonth = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30];
    }

    if(toDate.getFullYear() - fromDate.getFullYear() >= 1) { /*12ヶ月以上あるなら、その分加算*/
        months += (toDate.getFullYear() - fromDate.getFullYear() - 1) *12
    }
    months += 12 * (toDate.getFullYear() - fromDate.getFullYear()) + (toDate.getMonth() - fromDate.getMonth())

    if(fromDate.getDate() > toDate.getDate()) {
        days = daysInMonth[toDate.getMonth()] - fromDate.getDate() + toDate.getDate()
        months -= 1;
    }
    else{
        days = toDate.getDate() - fromDate.getDate();
    }

    return [ months, days ];
}

exports.generation = async function func(guild) {
    /*現在時刻を取得*/
    const date = new Date();
    const time = date.toFormat('YYYY年 MM月DD日 HH24:MI:SS')

    /*bot及びユーザーの人数を取得*/
    const members = await guild.members.fetch({withPresences: true});
    const user = members.filter(member => member.user.bot === false).size;
    const online = members.filter(member => member.presence && member.presence.status !== "offline" && member.user.bot === false).size;
    const botOnline = members.filter(member => member.presence && member.presence.status !== "offline" && member.user.bot === true).size;

    /*定期テスト*/
    const data = await db.find("main","nextTest",{label: {$in:["1","2","3","4"]}});

    let test, UNIXtest, testStart, testEnd;
    let now = Date.now() + 32400000;
    if (data[0].year === 0) {
        test = "現在設定されている次のテストはありません。"
        for (let i = 0; i < 3; i++) {
            data[0].nextTest[i] = data[0].nextTest[i + 1]
        }
        data[0].nextTest[3] = [0, 0, 0, 0, 0]
    } else {
        UNIXtest = Date.UTC(data[0].year, data[0].month1 - 1, data[0].day1, 8, 50, 0);
        testStart = Date.UTC(data[0].year, data[0].month1 - 1, data[0].day1,  0, 0, 0);
        testEnd = Date.UTC(data[0].year, data[0].month2 - 1, data[0].day2,  15, 0, 0);
        if (now > testStart) {
            if (now > testEnd) { /*テストが終了してたら*/
                if (data[1].year === "0") {
                    test = "現在設定されている次のテストはありません。";
                }
                else{
                    test = `${data[1].year}年${data[1].month1}月${data[1].day1}日〜${data[1].month2}月${data[1].day2}日`
                    let day = diffInMonthsAndDays(now, UNIXtest)
                    test += `(${day[0]}ヶ月と${day[1]}日後)`
                }
                for (let i = 0; i < 3; i++) {
                    db.update(
                        "main","nextTest",{label:String(i+1)},
                        {
                            $set: {
                                year: String(data[i+1].year),
                                month1: String(data[i+1].month1),
                                day1: String(data[i+1].day1),
                                month2: String(data[i+1].month2),
                                day2: String(data[i+1].day2)
                            },
                        }
                    )
                }
                db.update(
                    "main","nextTest",{label:"4"},
                    {
                        $set: {
                            year: "0",
                            month1: "0",
                            day1: "0",
                            month2: "0",
                            day2: "0"
                        },
                    }
                )
            }
            else {
                if (now > testEnd - 86400000) { /*最終日なら*/
                    test = '本日はテスト期間最終日です'
                } else {
                    test = `現在テスト期間です(〜${data[0].month2}月${data[0].day2}日)`

                }
            }
        } else {
            test = `${data[0].year}年${data[0].month1}月${data[0].day1}日〜${data[0].month2}月${data[0].day2}日`
            let day = diffInMonthsAndDays(now, UNIXtest)
            test += `(${day[0]}ヶ月と${day[1]}日後)`
        }
    }

    /*今年度残り日数計算*/
    let year;
    if (date.getMonth() < 3) {
        year = date.getFullYear();
    } else {
        year = date.getFullYear() + 1;
    }
    const endOfTheYear = Date.UTC(year, 2, 31, 23, 59, 59);
    const remainingYear = (endOfTheYear - now);
    const remainingProportion = 20 - (remainingYear / 31557600000 * 20);
    let bar = `[`;
    for (let i = 0; i < Math.floor(remainingProportion); i++) {
        bar += `#`;
    }
    bar += `#`
    for (let i = 0; i < 20 - Math.floor(remainingProportion); i++) {
        bar += `-`;
    }
    bar += `] ${Math.floor((remainingProportion / 2) * 100) / 10}% DONE`

    /*天気取得*/
    const weatherData = await getWeather();
    let weather;
    if (!weatherData) {
        weather = "天気を取得できませんでした"
    }
    else{
        let todayMax;
        let todayMin;
        const weatherCache = await db.find("main","weatherCache",{label: {$in:["0","1"]}}); /*天気のキャッシュを取得*/

        if (weatherData.forecasts[0].date === weatherCache[0].day) {
            todayMax = weatherCache[0].max;
            todayMin = weatherCache[0].min;
        } else {

            if (weatherData.forecasts[0].date === weatherCache[1].day) {
                todayMax = weatherCache[1].max;
                todayMin = weatherCache[1].min;
            } else {
                todayMax = `---`;
                todayMin = `---`;
            }
            await db.update(  /*日付を1日動かす*/
                "main", "weatherCache", {label: "0"},
                {
                    $set: {
                        day: weatherCache[1].day,
                        max: weatherCache[1].max,
                        min: weatherCache[1].min
                    },
                }
            )
        }

        db.update(  /*明日の天気のキャッシュを更新*/
            "main","weatherCache",{label:"1"},
            {
                $set: {
                    day:weatherData.forecasts[1].date,
                    max:weatherData.forecasts[1].temperature.max.celsius ?? `---`,
                    min:weatherData.forecasts[1].temperature.min.celsius ?? `---`
                },
            }
        )

        const min = [weatherData.forecasts[0].temperature.min.celsius ?? todayMin, weatherData.forecasts[1].temperature.min.celsius ?? `---`]
        const max = [weatherData.forecasts[0].temperature.max.celsius ?? todayMax, weatherData.forecasts[1].temperature.max.celsius ?? `---`]

        weather = `${weatherData.forecasts[0].dateLabel}：${weatherData.forecasts[0].telop} 最高気温：${max[0]}°C 最低気温：${min[0]}°C\n${weatherData.forecasts[1].dateLabel}：${weatherData.forecasts[1].telop} 最高気温：${max[1]}°C 最低気温：${min[1]}°C\n\n発表時刻：${weatherData.publicTimeFormatted} `;

    }
    const embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle(guild.name + '  ダッシュボード')
        .setAuthor({
            name: "木更津高専統合管理BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://github.com/NITKC22s/bot-main'
        })
        .addFields([
            {
                name: '更新時刻',
                value: `\`\`\`${time}\`\`\``,
            },
            {
                name: 'サーバーの人数',
                value: `\`\`\`現在オンライン${online}人　/　参加人数${user}人\`\`\``,
            },
            {
                name: 'BOT台数',
                value: `\`\`\`稼働中${botOnline}台 / 導入台数${guild.memberCount - user}台 \`\`\``,
            },
            {
                name: '次の定期テスト',
                value: `\`\`\`${test}\`\`\``,
            },
            {
                name: '今年度残り',
                value: `\`\`\`\n${bar}\`\`\``,

            },
            {
                name: '千葉の天気(Powered by 気象庁)',
                value: `\`\`\`${weather}\`\`\``,

            }
        ])
        .setTimestamp()
        .setFooter({text: 'Developed by NITKC22s server Admin'});


    return embed;


}