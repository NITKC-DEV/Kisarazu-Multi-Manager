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


exports.func = async function studyroom(oldState, newState){
    let time = new Date();
    let UNIX=time.getTime()/1000; //UNIXTime
    let user=date.date.find(date => date.uid === oldState.id); /*その人のデータ*/
    if(user === undefined){
        date.date.push({
                "uid": "",
                "name": "",
                "icon":"",
                "lastJoin": 0,
                "study":[0,0,0,0,0,0,0],
                "StudyAll": 0,
                "task":[0,0,0,0,0,0,0],
                "TaskAll": 0,
                "now": false
            })
        date.date[date.date.length - 1].uid = String(newState.id); //id取得
        user=date.date[date.date.length - 1];

    }
    //名前とアイコンの更新
    let userDate=await client.users.fetch(newState.id);
    let username = userDate.username;
    let discriminator=userDate.discriminator;
    let icon = userDate.displayAvatarURL()
    user.name = username + '#' + discriminator;
    user.icon = icon;


    let userPoint = date.date.indexOf(user) /*その人のデータの位置*/
    if(oldState.channel===null){
        if(config.studyVC.indexOf(newState.channelId)!==-1){
            console.log(user.name+"さんがVCに入りました！大歓迎！");
            user.lastJoin = UNIX; //参加した時刻を書き込み
            user.now = true;
        }
    }
    else if(newState.channel===null){
        if(config.studyVC.indexOf(oldState.channelId)!==-1){
            user.StudyAll += UNIX-user.lastJoin;
            user.study[0] += UNIX-user.lastJoin;
            console.log(user.name+"さんがVCから離れたらしい！滞在時間:"+(UNIX-user.lastJoin) + "合計滞在時間" + user.StudyAll);
            user.now = false;
        }
    }
    else{
        if(config.studyVC.indexOf(oldState.channelId)!==-1){
            user.StudyAll += UNIX-user.lastJoin;
            user.study[0] += UNIX-user.lastJoin;
            user.now = false;
        }
        if(config.studyVC.indexOf(newState.channelId)!==-1){
            user.lastJoin = UNIX; //参加した時刻を書き込み
            user.now = true;
        }
        console.log(user.name+"さんがVC切り替えを行いました");
    }
    date.date[userPoint]=user
    fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
}


exports.update = function (){
    /*0時に切断したことにする*/
    let time = new Date();
    let UNIX=time.getTime()/1000; //UNIXTime
    UNIX=UNIX-(UNIX%86400)-32400; //今日の0時

    let now = date.date.filter(function(item, index){ /*今入ってる人を列挙*/
        if (item.now === true ) return true;
    });
    for(let i=0; i<now.length; i++){
        let user = now[i]; /*その人のデータ*/
        let userPoint = date.date.indexOf(user) /*その人のデータの位置*/
        /*切断と同様の処理*/
        user.StudyAll += UNIX-user.lastJoin+32400;
        user.study[0] += UNIX-user.lastJoin+32400; //32400は時差考慮
        /*参加と同じ処理*/
        console.log(user.name+"さんがVCに入ったまま日付をまたぎました！");
        user.lastJoin = UNIX;
        date.date[userPoint]=user
    }

    /*日付を1日ずらす作業*/
    for(let i=0;i<date.date.length;i++){
        for(let j=6;j>0;j--){
            date.date[i].study[j] = date.date[i].study[j-1];
        }
        date.date[i].study[0] = 0;
    }
    for(let i=0;i<date.date.length;i++){
        for(let j=6;j>0;j--){
            date.date[i].task[j] = date.date[i].task[j-1];
        }
        date.date[i].task[0] = 0;
    }
    fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
}

client.login(config.token);