const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require('../environmentConfig')
const system = require('../functions/logsystem.js');
const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });

/***
 * データベースからデータを取得する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param filter フィルターを指定
 * @returns Array型
 */
exports.getDatabase = async function (dbName,collectionName,filter) {
    const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
    const collection = dbClient.db(dbName).collection(collectionName);

    return await collection.find(filter).toArray()
}

/***
 * データベースを更新する
 * @param dbName 更新先データベース名
 * @param collectionName 更新先コレクション名
 * @param filter 更新対象のフィルターを指定
 * @param update update operatorを用いた更新内容の記述
 */
exports.updateDB = async function run(dbName,collectionName,filter,update) {
    try {
        const database = dbClient.db(dbName);
        const collection = database.collection(collectionName);

        const result = await collection.updateOne(filter,update)
        system.log(`${dbName}.${collectionName}を更新`,`db操作実行`);
    } finally {

    }
}


/***
 * データベースにレコードを追加する
 * @param dbName 追加先データベース名
 * @param collectionName 追加先コレクション名
 * @param object 追加するレコード(オブジェクト型)
 */
exports.add = async function run(dbName,collectionName,object) {

    try {
        const database = dbClient.db(dbName);
        const collection = database.collection(collectionName);

        const result = await collection.insertOne(object);
        system.log(`${dbName}.${collectionName}にレコード追加`,`db操作実行`);
    } finally {

    }
}

//引数の詳細については、mongodbの公式ドキュメントを参照すること