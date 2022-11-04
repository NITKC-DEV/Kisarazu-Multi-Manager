/*自習室機能 VC部分*/
const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const fs = require('fs');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel],
});
const date = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));
const config = process.env.NODE_ENV === "development" ? require('../config.dev.json') : require('../config.dev.json')
client.login(config.token);
exports.func = async function studyroom(oldState, newState){
    let time = new Date();
    let UNIX=time.getTime()/1000; //UNIXTime
    let user=date.date.find(date => date.uid === oldState.id); /*その人のデータ*/
    if(user === undefined){
        date.date.push({
                "uid": "",
                "name": "",
                "lastJoin": 0,
                "s0": 0,
                "s1": 0,
                "s2": 0,
                "s3": 0,
                "s4": 0,
                "s5": 0,
                "s6": 0,
                "studyAll": 0,
                "t0": 0,
                "t1": 0,
                "t2": 0,
                "t3": 0,
                "t4": 0,
                "t5": 0,
                "t6": 0,
                "TaskAll": 0,
                "now": false,
                "StudyAll": 0
            })
        date.date[date.date.length - 1].uid = String(newState.id);
        let name=await client.users.fetch(newState.id);
        let username = name.username;
        let discriminator=name.discriminator;
        date.date[date.date.length - 1].name = username + '#' + discriminator;
        user=date.date[date.date.length - 1];

    }



    let userPoint = date.date.indexOf(user) /*その人のデータの位置*/
    if(oldState.channel===null){
        console.log(user.name+"さんがVCに入りました！大歓迎！");
        user.lastJoin = UNIX; //参加した時刻を書き込み
        user.now = true;
    }
    else if(newState.channel===null){
        user.StudyAll += UNIX-user.lastJoin;
        user.s0 += UNIX-user.lastJoin;
        console.log(user.name+"さんがVCから離れたらしい！滞在時間:"+(UNIX-user.lastJoin) + "合計滞在時間" + user.StudyAll);
        user.now = false;
    }
    else{
        console.log(user.name+"さんがVCを変更しました！ちぇ〜んじ");
    }
    date.date[userPoint]=user
    fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
}

//この実装だと、日付をまたいで記録したときに想定しない値を撮ってしまうため注意

exports.update = function (){
    /*0時に切断したことにする*/
    let time = new Date();
    let UNIX=time.getTime()/1000; //UNIXTime
    UNIX=UNIX-(UNIX%86400); //今日の0時

    let now = date.date.filter(function(item, index){ /*今入ってる人を列挙*/
        if (item.now === true ) return true;
    });
    for(let i=0; i<now.length; i++){
        let user = now[i]; /*その人のデータ*/
        let userPoint = date.date.indexOf(user) /*その人のデータの位置*/
        /*切断と同様の処理*/
        user.StudyAll += UNIX-user.lastJoin;
        user.s0 += UNIX-user.lastJoin;
        /*参加と同じ処理*/
        console.log(user.name+"さんがVCに入ったまま日付をまたぎました！");
        user.lastJoin = UNIX;
        date.date[userPoint]=user
    }

    /*日付を1日ずらす作業*/
    for(let i=0;i<date.date.length;i++){
        date.date[i].s0 = date.date[i].s1;
        date.date[i].s1 = date.date[i].s2;
        date.date[i].s2 = date.date[i].s3;
        date.date[i].s3 = date.date[i].s4;
        date.date[i].s4 = date.date[i].s5;
        date.date[i].s5 = date.date[i].s6;
        date.date[i].s6 = 0;
    }
    for(let i=0;i<date.date.length;i++){
        date.date[i].t0 = date.date[i].t1;
        date.date[i].t1 = date.date[i].t2;
        date.date[i].t2 = date.date[i].t3;
        date.date[i].t3 = date.date[i].t4;
        date.date[i].t4 = date.date[i].t5;
        date.date[i].t5 = date.date[i].t6;
        date.date[i].t6 = 0;
    }
    fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
}