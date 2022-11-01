/*自習室機能 VC部分*/
exports.func = function studyroom(oldState, newState){
    if(oldState.channel===null){
        console.log(oldState+"さんがVCに入りました！大歓迎！");
    }
    else if(newState.channel===null){
        console.log(oldState+"さんがVCから離れたらしい！もう二度と来んじゃねーぞ");
    }
    else{
        console.log(oldState+"さんがVCを変更しました！ちぇ〜んじ");
    }
}