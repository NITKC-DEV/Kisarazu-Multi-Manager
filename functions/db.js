const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require('../environmentConfig')

const system = require('../functions/logsystem.js');

/***
 * データベースからデータを取得する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param label labelキーのフィルター
 * @returns オブジェクト型の配列
 */

exports.getDatabase = async function (dbName,collectionName,label) {
    const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
    const collection = dbClient.db(dbName).collection(collectionName);

    return await collection.find({label: label}).toArray()
}

/***
 * データベースからデータを取得する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param label labelキーのフィルター
 * @param update update operatorを用いた更新内容の記述
 */
exports.updateDB = async function run(dbName,collectionName,label,update) {
    const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
    try {
        const database = dbClient.db(dbName);
        const collection = database.collection(collectionName);

        const result = await collection.updateOne(
            {
                label: label
            },
            update
        )
        system.log(`${dbName}.${collectionName}を更新`,`db操作実行`);
    } finally {
        await dbClient.close();
    }
}