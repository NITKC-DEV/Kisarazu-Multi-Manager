const {EmbedBuilder} = require("discord.js");

/***
 *
 * メンテするよ〜的な告知 、時間指定で告知したいもの: notice
 * 開始しますよ〜的な告知：start
 * 終了したよ的な告知・すぐに送信したい告知：end
 *
 ***/


const notice = new EmbedBuilder()
    .setColor(0x00A0EA)
    .setTitle('木更津高専統合管理bot v4.0.0アップデート')
    .setAuthor({
        name: "木更津高専統合管理BOT",
        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
        url: 'https://github.com/NITKC22s/bot-main'
    })
    .setDescription('本日このあと、木更津統合管理bot v4.0.0アップデートを行います。更新の概要は以下のとおりです。\n' +
        'なお、詳細な説明は以下のnote限定公開記事から確認できます。\n' +
        'https://note.com/preview/nb707df4cc223?prev_access_key=ba5ff23b6c302b4c48dd2733a86430fd\n' +
        'なお、これに伴いこの後23時~24時からメンテナンスを行います。create-chanコマンドが使用不可になるほか、一時的にbotがオフラインになる可能性があります。')
    .addFields(
        [
            {
                name: '新機能',
                value: '・pingコマンド\n' +
                    '・サーバーダッシュボード\n' +
                    '・シークレットメッセージ\n',
            },
            {
                name: '調整',
                value: '・スラッシュコマンド名をわかりやすいように変更\n' +
                    '・create-chanコマンドにあったバグを修正',
            },
            {
                name: 'その他',
                value: '・新サーバーへ移行(さくらのクラウド)\n' +
                    '・discord.js v14.9.0への更新',
            }
        ]
    )
    .setTimestamp()
    .setFooter({ text: 'Developed by NITKC22s server Admin' });

const start = new EmbedBuilder()
    .setColor(0x00A0EA)
    .setTitle('メンテナンスのお知らせ')
    .setAuthor({
        name: "木更津22s統合管理BOT",
        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
        url: 'https://github.com/NITKC22s/bot-main'
    })
    .setDescription('まもなく、アップデートに伴うサーバーのメンテナンスを行います。\n' +
        'その関係で、一部機能が制限されます。\n' +
        'なお、アップデートの詳細は以下のnote限定公開記事から見れます。\n' +
        'https://note.com/preview/nb707df4cc223?prev_access_key=ba5ff23b6c302b4c48dd2733a86430fd')
    .addFields(
        [
            {
                name: '日時',
                value: '本日4/5(火) 23:00~24:00(予定)',
            },{
            name: '制限される機能',
            value: '・create-chanコマンドが使用不可になります\n' +
                '・BOTが停止する場合があります\n',
        },
        ]
    )
    .setTimestamp()
    .setFooter({ text: 'Developed by NITKC22s server Admin' });

const end = new EmbedBuilder()
    .setColor(0x00A0EA)
    .setTitle('メンテナンス終了のお知らせ')
    .setAuthor({
        name: "木更津22s統合管理BOT",
        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
        url: 'https://github.com/NITKC22s/bot-main'
    })
    .setDescription('メンテナンスは終了しました。ご協力ありがとうございました。\n' +
        'アップデートの詳細は以下のnote限定公開記事から見れます。\n' +
        'https://note.com/preview/nb707df4cc223?prev_access_key=ba5ff23b6c302b4c48dd2733a86430fd')
    .setTimestamp()
    .setFooter({ text: 'Developed by NITKC22s server Admin' });

module.exports = {notice: notice,start: start, end: end};