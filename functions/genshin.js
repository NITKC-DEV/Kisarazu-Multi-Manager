const config = require("../environmentConfig");
const {EmbedBuilder} = require("discord.js");
exports.daily = async function func(message, title) {
    const daily = {
        color: 0x27668d,
        title: "デイリー更新",
        author: {
            name: "Genshin-timer",
            icon_url: "https://pbs.twimg.com/media/FcdR7aIaIAE75Uu?format=png&name=large",
            url: "https://github.com/starkoka/Genshin-Timer",
        },
        description: "デイリーが更新されました。忘れずに4つ+追加報酬を受け取りましょう\n\n",
        timestamp: new Date().toISOString(),
        footer: {
            text: "Developed by @kokastar_studio",
            icon_url: "https://pbs.twimg.com/profile_images/1503219566478229506/0dkJeazd_400x400.jpg",
        },
    };
    client.channels.cache.get(config.daily).send({embeds: [daily]});
    let dt = new Date();
    let dayofweek = dt.getDay();
    let date = dt.getDate();
    const genshinColor = 0x27668d;
    if (dayofweek === 1) {
        /*月曜日*/
        const monday = {
            color: genshinColor,
            title: "新しい週が始まりました",
            description: "新しい週が始まり、以下のものがリセットされました。\n\n",
            fields: [
                {
                    name: "​\n週ボスリセット",
                    value: "風魔龍・トワリン、アンドリアス、「公子」、若陀龍王、「淑女」、禍津御建鳴神命、七葉寂照秘密主の報酬が再度受け取れるようになりました。\nまた、樹脂半減回数がリセットされました。",
                },
                {
                    name: "​\n評判任務更新",
                    value: "モンド、璃月、稲妻、スメール各国の評判任務が更新されました。\n",
                },
                {
                    name: "​\n「緋紅の願い」リセット",
                    value: "ドラゴンスパインのクエスト「緋紅の願い」が再挑戦できるようになりました。\n",
                },
                {
                    name: "​\nアイテム購入回数リセット",
                    value: "加工済み食材・洞天百貨宝貨・四方八方の網の購入回数がリセットされました。\n",
                },
                {
                    name: "​\n木材変転回数リセット",
                    value: "木材変転の上限回数がリセットされました。\n",
                },
                {
                    name: "​\n週間限定ギフトパック購入回数リセット",
                    value: "週間限定ギフトパックの購入上限回数がリセットされました。\n",
                },
                {
                    name: "​\n七聖召喚ウィークリーゲスト対戦リセット",
                    value: "七聖召喚のウィークリーゲスト対戦がリセットされました\n",
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [monday]});
    }

    if (dayofweek === 4) {
        /*木曜日*/
        const thursday = {
            color: genshinColor,
            title: "木曜日になりました",
            description: "木曜日になり、以下のものがリセットされました。\n\n",
            fields: [
                {
                    name: "​\n聖遺物購入回数リセット",
                    value: "聖遺物の購入回数上限がリセットされました",
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [thursday]});
    }

    if (dayofweek === 5) {
        /*金曜日*/
        const friday = {
            color: genshinColor,
            title: "金曜日になりました",
            description: "金曜日になり、以下のものがリセットされました。\n\n",
            fields: [
                {
                    name: "​\n「緋紅の願い」リセット",
                    value: "ドラゴンスパインのクエスト「緋紅の願い」が再挑戦できるようになりました。\n",
                },
                {
                    name: "​\n周回する壺の精霊出現",
                    value: "自分の塵歌壺内で商品を購入可能になりました(日曜日まで)",
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [friday]});
    }

    if (dayofweek === 6) {
        /*土曜日*/
        const saturday = {
            color: genshinColor,
            title: "土曜日になりました",
            description: "土曜日になり、以下のものがリセットされました。\n\n",
            fields: [
                {
                    name: "​\n他人の壺の精霊で購入可能に",
                    value: "他人のの塵歌壺内で商品を購入可能になりました。(日曜日まで)",
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [saturday]});
    }
    if (date % 3 === 0) {
        /*3の倍数の日*/
        const multiple = {
            color: genshinColor,
            title: "アイテム購入リセット",
            description: "博来・長順以外の★4以上の食べ物、食材、素材、特産品購入がリセットされました\n\n",
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [multiple]});
    }
    if (date % 3 === 1) {
        /*3の倍数+1の日*/
        const multiple2 = {
            color: genshinColor,
            title: "アイテム購入リセット",
            description: "博来・長順の★4以上の食べ物、食材、素材、特産品購入がリセットされました\n\n",
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [multiple2]});
    }

    if (date === 1) {
        /*毎月1日*/
        const first = {
            color: genshinColor,
            title: "1日になりました",
            description: "月が変わり、以下のものがリセットされました。\n\n",
            fields: [
                {
                    name: "​\n螺旋リセット",
                    value: "螺旋9~12層がリセットされました。",
                },
                {
                    name: "​\nスター交換ラインナップ更新・リセット",
                    value: "スターライト交換のラインナップが更新されました。\nまた、スターライト交換・スターダスト交換の購入回数上限がリセットされました。",
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [first]});
    }
    if (date === 16) {
        /*毎月16日*/
        const sixteenth = {
            color: genshinColor,
            title: "16日になりました",
            description: "月の後半に入り、以下のものがリセットされました。\n\n",
            fields: [
                {
                    name: "​\n螺旋リセット",
                    value: "螺旋9~12層がリセットされました。",
                },
            ],
            timestamp: new Date().toISOString(),
        };
        client.channels.cache.get(config.daily).send({embeds: [sixteenth]});
    }
};
