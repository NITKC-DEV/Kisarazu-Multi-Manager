/*自習室機能 VC部分*/
const fs = require('fs');
const date = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));

exports.func = function studyroom(oldState, newState){
    let time = new Date();
    let UNIX=time.getTime()/1000; //UNIXTime
    let user=date.date.find(date => date.uid === oldState.id); /*その人のデータ*/
    if(oldState.channel===null){
        console.log(user.name+"さんがVCに入りました！大歓迎！");
        date.date.find(date => date.uid === oldState.id).lastJoin = UNIX; //参加した時刻を書き込み
    }
    else if(newState.channel===null){
        date.date.find(date => date.uid === oldState.id).StudyAll += UNIX-date.date.find(date => date.uid === oldState.id).lastJoin;
        console.log(user.name+"さんがVCから離れたらしい！滞在時間:"+(UNIX-date.date.find(date => date.uid === oldState.id).lastJoin) + "合計滞在時間" + date.date.find(date => date.uid === oldState.id).StudyAll);


    }
    else{
        console.log(user.name+"さんがVCを変更しました！ちぇ〜んじ");
    }

    fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
}