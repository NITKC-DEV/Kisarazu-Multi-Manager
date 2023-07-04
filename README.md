# 木更津高専統合管理BOT
## 概要
***
木更津高専生向けDiscordBOT「木更津高専統合管理BOT」のソースコードです。

## 搭載している主な機能
***
搭載している主な機能を紹介します。
### 時間割機能
データベースに保存されている時間割データをもとに、時間割を見ることができます。  
20時に設定したチャンネルに送信されるほか、コマンドで学年・学科・曜日を指定していつでも見ることができます。  
さらに、時間割変更や定期テストにも対応しています。
　　
#### 開発
kokastar

### チャンネル作成機能
コマンドを実行することで、その人に権限を与えることなく特定のカテゴリ内にチャンネルを作れます。また、そのチャンネルに対応したロールも自動作成されます。  　　

#### 開発
Kouro・Naotiki

### シークレットメッセージ機能
コマンドを実行し、その引数にメッセージや画像を指定することで、そのチャンネルにBOTが代理でメッセージを送ってくれます。

#### 開発
kokastar・Kouro

### ダッシュボード機能
コマンドを実行すると、サーバーの情報などを確認できます。具体的には、時刻・サーバーの人数・BOT台数・次の定期テストまでの日数・今年度の残り日数・今日の千葉の天気　を確認できます。

更に、毎分更新するダッシュボードを設定することもできます(各サーバーに1つのみ)

#### 開発
kokastar

### 天気機能
今日/明日/明後日の千葉の天気を見れます。  
また、20字に定期送信もされます。

#### 開発
kokastar

### 誕生日機能
誕生日を登録すると、そのサーバーで誕生日にお祝いしてくれます。

#### 開発
kokastar


## 開発者
***
開発は、NITKC-DEVの8名によって行われています。
```
NITKCとは、N(なんとなく) I(いい感じのものを) T(たくさん) K(開発する) C(コミュニティ)のことである
```
### [kokastar](https://github.com/starkoka)
#### 役割
機能アイデア出し、機能開発、データベース開発

#### 開発した機能
 - 時間割機能
 - 天気機能
 - ダッシュボード
 - guildDataSystem
 - 誕生日機能
 - シークレットメッセージ
 - メンテナンスモード
 - BOTステータス変更
 - ヘルプ関連/aboutコマンド/pingコマンド

### [Naotiki](https://github.com/naotiki)
#### 役割
マージ担当、bot環境構築、機能開発

#### 開発した機能
 - deploy-commandsツール
 - スラッシュコマンド周り
 - environmentConfig
 - チャンネル作成機能

### [KouRo](https://github.com/Kou-Ro)
#### 役割
機能アイデア出し、機能開発

#### 開発した機能
 - チャンネル作成機能
 - シークレットメッセージ

### [NXVZBGBFBEN](https://github.com/NXVZBGBFBEN)
#### 役割
サーバー環境構築、bot環境構築、デザイナー

#### 開発した機能
 - サーバー環境作成
 - Docker用意
 - アイコン作成

### みならいかいはつしゃ(4名)
みならいかいはつしゃは、今後開発者になる予定の人たちです。

 - [doit^6p](https://github.com/c-6p)
 - [トコトコ](https://github.com/tokotoko9981)
 - [maikuradentetu](https://github.com/maikuradentetu)
 - [nairoki23](https://github.com/nairoki23)