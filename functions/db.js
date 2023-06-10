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
exports.find = async function (dbName, collectionName, filter) {
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
exports.update = async function run(dbName, collectionName, filter, update) {
    try {
        const database = dbClient.db(dbName);
        const collection = database.collection(collectionName);

        const result = await collection.updateOne(filter,update)
        await system.log(`${dbName}.${collectionName}を更新`,`DB更新実行`);
    } catch(err) {
        await system.error(`${dbName}.${collectionName}を更新できませんでした`,err,`DB更新失敗`);
    }
}


/***
 * データベースにレコードを追加する
 * @param dbName 追加先データベース名
 * @param collectionName 追加先コレクション名
 * @param object 追加するレコード(オブジェクト型)
 */
exports.insert = async function run(dbName, collectionName, object) {

    try {
        const database = dbClient.db(dbName);
        const collection = database.collection(collectionName);

        const result = await collection.insertOne(object);
        await system.log(`${dbName}.${collectionName}にレコード追加`,`DB追加実行`);
    } catch(err) {
        await system.error(`${dbName}.${collectionName}にレコードを追加できませんでした`,err,`DB追加失敗`);
    }
}
/***
 * データベースにレコードを削除する
 * @param dbName 削除元データベース名
 * @param collectionName 削除元コレクション名
 * @param filter 削除対象のフィルターを指定
 */
exports.delete = async function run(dbName,collectionName,filter) {

    try {
        const database = dbClient.db(dbName);
        const collection = database.collection(collectionName);

        const result = await collection.deleteOne(filter);
        await system.log(`${dbName}.${collectionName}からレコード削除`,`DBレコード削除実行`);
    } catch(err) {
        await system.error(`${dbName}.${collectionName}からレコードを削除できませんでした`,err,`DB削除失敗`);
    }
}

//引数の詳細については、mongodbの公式ドキュメントを参照すること
