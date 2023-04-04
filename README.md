# 木更津22s統合管理BOT
## 概要
木更津高専22sの学年非公式Discordサーバーである「NIT,Kisarazu College 22s Server」に導入されている、NITKC22s 統合管理BOTのソースコードです。  
Discord.jsで書かれています。


## 開発者
### [kokastar](https://github.com/starkoka)
役割：開発リーダー  
制作：[Genshin-Timer](https://github.com/starkoka/Genshin-Timer)、help・aboutコマンド、時間割機能、

### [Naotiki](https://github.com/naotiki)
役割：開発者・マージ最高責任者  
制作：deploy-commandsツール、スラッシュコマンドの分離、時間割機能の最適化、チャンネル作成機能

### [KouRo](https://github.com/Kou-Ro)
役割：開発者  
制作：チャンネル作成機能

### [NXVZBGBFBEN](https://github.com/NXVZBGBFBEN)
役割：開発者・デザイナー  
制作：botのアイコン、リポジトリのバナー画像

## 搭載している機能
### Genshin-Timer
[Genshin-Timer](https://github.com/starkoka/Genshin-Timer)を移植させています。デイリー通知や樹脂回復通知などの機能があります。  　　

開発：kokastar

### 時間割機能
別ファイルに記録されている時間割データをもとに、時間割を20時に定期送信する他、コマンドでいつでも好きな学科・曜日の時間割を見ることができます。  　　

開発：kokastar・Naotiki

### チャンネル作成機能
コマンドを実行することで、その人に権限を与えることなく特定のカテゴリ内にチャンネルを作れます。また、そのチャンネルに対応したロールも自動作成されます。  　　

開発：Kouro・Naotiki

### シークレットメッセージ機能
コマンドを実行し、その引数にメッセージや画像を指定することで、そのチャンネルにBOTが代理でメッセージを送ってくれます。

開発：kokastar・Kouro

### ダッシュボード機能
コマンドを実行すると、サーバーの情報などを確認できます。具体的には、時刻・サーバーの人数・BOT台数・次の定期テストまでの日数・今年度の残り日数・今日の千葉の天気　を確認できます。

更に、毎分更新するダッシュボードを設定することもできます(1つのみ)

### pingコマンド機能
応答時間を返します。

開発：kokastar

**再配布・再利用禁止**  
**Don't redistribution and reuse**
