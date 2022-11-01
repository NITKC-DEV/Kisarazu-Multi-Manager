/*自習室機能 VC部分*/
const fs = require('fs');
const date = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));

exports.func = function (oldState, newState){
    let time = new Date();
    let UNIX=time.getTime()/1000; //UNIXTime
    let user=date.date.find(date => date.uid === oldState.id); /*その人のデータ*/
    if(oldState.channel===null){
        console.log(user.name+"さんがVCに入りました！大歓迎！");
        date.date.find(date => date.uid === oldState.id).lastJoin = UNIX; //参加した時刻を書き込み
    }
    else if(newState.channel===null){
        date.date.find(date => date.uid === oldState.id).StudyAll += UNIX-date.date.find(date => date.uid === oldState.id).lastJoin;
        date.date.find(date => date.uid === oldState.id).s0 += UNIX-date.date.find(date => date.uid === oldState.id).lastJoin;
        console.log(user.name+"さんがVCから離れたらしい！滞在時間:"+(UNIX-date.date.find(date => date.uid === oldState.id).lastJoin) + "合計滞在時間" + date.date.find(date => date.uid === oldState.id).StudyAll);


    }
    else{
        console.log(user.name+"さんがVCを変更しました！ちぇ〜んじ");
    }

    fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し ここが現状dateになってるので1ユーザー以外は消されちゃう問題あり
}

//この実装だと、日付をまたいで記録したときに想定しない値を撮ってしまうため注意

exports.update = function (){
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
}