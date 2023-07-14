"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require('../environmentConfig');
const system = require('./logsystem.js');
const db = require('./db.js');
const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
/***
 * データベースからデータを取得する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param filter フィルターを指定
 * @returns {Promise<WithId<Document>[]>}
 */
exports.find = function (dbName, collectionName, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const collection = yield dbClient.db(dbName).collection(collectionName);
        return yield collection.find(filter).toArray();
    });
};
/***
 * filterに該当する要素があるかどうか確認する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param filter フィルターを指定
 * @returns {Promise<boolean>}
 */
exports.includes = function (dbName, collectionName, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const collection = yield dbClient.db(dbName).collection(collectionName);
        const data = yield collection.find(filter).toArray();
        return data.length > 0;
    });
};
/***
 * データベースを更新する
 * @param dbName 更新先データベース名
 * @param collectionName 更新先コレクション名
 * @param filter 更新対象のフィルターを指定
 * @param update update operatorを用いた更新内容の記述
 * @returns {Promise<void>}
 */
exports.update = function run(dbName, collectionName, filter, update) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const database = yield dbClient.db(dbName);
            const collection = yield database.collection(collectionName);
            const result = yield collection.updateOne(filter, update);
            yield system.log(`${dbName}.${collectionName}を更新`, `DB更新実行`);
        }
        catch (err) {
            yield system.error(`${dbName}.${collectionName}を更新できませんでした`, err, `DB更新失敗`);
        }
    });
};
/***
 * データベースにレコードを追加する
 * @param dbName 追加先データベース名
 * @param collectionName 追加先コレクション名
 * @param object 追加するレコード(オブジェクト型)
 * @returns {Promise<void>}
 */
exports.insert = function run(dbName, collectionName, object) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const database = yield dbClient.db(dbName);
            const collection = yield database.collection(collectionName);
            const result = yield collection.insertOne(object);
            yield system.log(`${dbName}.${collectionName}にレコード追加`, `DB追加実行`);
        }
        catch (err) {
            yield system.error(`${dbName}.${collectionName}にレコードを追加できませんでした`, err, `DB追加失敗`);
        }
    });
};
/***
 * filterにレコードが見つかればそれをsetで更新し、見つからなけれレコードを追加する
 * @param dbName 追加先データベース名
 * @param collectionName 追加先コレクション名
 * @param filter 更新対象のフィルターを指定
 * @param object 追加するレコード(オブジェクト型)
 * @returns {Promise<void>}
 */
exports.updateOrInsert = function run(dbName, collectionName, filter, object) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield db.find(dbName, collectionName, filter);
            if (data.length > 0) {
                yield db.update(dbName, collectionName, filter, { $set: object });
            }
            else {
                yield db.insert(dbName, collectionName, object);
            }
        }
        catch (err) {
            yield system.error(`${dbName}.${collectionName}にレコードを追加できませんでした`, err, `DB追加失敗`);
        }
    });
};
/***
 * データベースからレコードを削除する
 * @param dbName 削除元データベース名
 * @param collectionName 削除元コレクション名
 * @param filter 削除対象のフィルターを指定
 * @returns {Promise<void>}
 */
exports.delete = function run(dbName, collectionName, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const database = yield dbClient.db(dbName);
            const collection = yield database.collection(collectionName);
            const result = yield collection.deleteMany(filter);
            yield system.log(`${dbName}.${collectionName}からレコード削除(削除されたとは言っていない)`, `DBレコード削除操作実行`);
        }
        catch (err) {
            yield system.error(`${dbName}.${collectionName}からレコードを削除できませんでした`, err, `DB削除失敗`);
        }
    });
};
/***
 *
 * @returns {Promise<void>}
 */
exports.open = function close() {
    return __awaiter(this, void 0, void 0, function* () {
        const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
        yield system.log("DB - open");
    });
};
/***
 *
 * @returns {Promise<void>}
 */
exports.close = function close() {
    return __awaiter(this, void 0, void 0, function* () {
        yield dbClient.close();
        yield system.log("DB - close");
    });
};
//引数の詳細については、mongodbの公式ドキュメントを参照すること
