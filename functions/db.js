const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require('../environmentConfig')

const system = require('../functions/logsystem.js');

/***
 * データベースからデータを取得する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param filter フィルターを指定
 * @returns オブジェクト型の配列
 */

exports.getDatabase = async function (dbName,collectionName,filter) {
    const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
    const collection = dbClient.db(dbName).collection(collectionName);

    return await collection.find(filter).toArray()
}

/***
 * データベースからデータを取得する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param filter フィルターを指定
 * @param update update operatorを用いた更新内容の記述
 */
exports.updateDB = async function run(dbName,collectionName,filter,update) {
    const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
    try {
        const database = dbClient.db(dbName);
        const collection = database.collection(collectionName);

        const result = await collection.updateOne(filter,update)
        system.log(`${dbName}.${collectionName}を更新`,`db操作実行`);
    } finally {
        await dbClient.close();
    }
}

//引数の詳細については、mongodbの公式ドキュメントを参照すること