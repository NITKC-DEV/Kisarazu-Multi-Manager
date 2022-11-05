# 木更津22s統合管理BOT
## 概要
木更津高専22sの学年非公式Discordサーバーである「NIT,Kisarazu College 22s Server」に導入されている、NITKC22s 統合管理BOTのソースコードです。  
Discord.jsで書かれています。  


## 開発者
### [kokastar](https:github.com/starkoka)
役割：開発リーダー  
制作：[Genshin-Timer](https://github.com/starkoka/Genshin-Timer)、help・aboutコマンド、時間割機能、自習室機能  

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

### 自習室機能
設定されたボイスチャットに入っている時間を勉強時間とみなし、そのデータを見ることができる機能です。  　　

開発：kokastar

### チャンネル作成機能
コマンドを実行することで、その人に権限を与えることなく特定のカテゴリ内にチャンネルを作れます。また、そのチャンネルに対応したロールも自動作成されます。  　　

開発：Kouro・Naotiki

**再配布・再利用禁止**  
**Don't redistribution and reuse**
