/** @format */

import { MongoClient, ServerApiVersion, WithId } from "mongodb";

import { config } from "../environmentConfig.mjs";

import * as db from "./db.mjs";
import * as system from "./logsystem.mjs";

const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });

/**
 * データベースからデータを取得する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param filter フィルターを指定
 * @returns {Promise<WithId<Document>[]>}
 */
export const find = async function (dbName: any, collectionName: any, filter: any): Promise<WithId<Document>[]> {
    const collection = await dbClient.db(dbName).collection(collectionName);

    // @ts-ignore よくわからん(?)
    return collection.find(filter).toArray();
};

/**
 * filterに該当する要素があるかどうか確認する
 * @param dbName 取得先データベース名
 * @param collectionName 取得先コレクション名
 * @param filter フィルターを指定
 * @returns {Promise<boolean>}
 */
export const includes = async function (dbName: any, collectionName: any, filter: any): Promise<boolean> {
    const collection = await dbClient.db(dbName).collection(collectionName);
    const data = await collection.find(filter).toArray();
    return data.length > 0;
};

/**
 * データベースを更新する
 * @param dbName 更新先データベース名
 * @param collectionName 更新先コレクション名
 * @param filter 更新対象のフィルターを指定
 * @param update update operatorを用いた更新内容の記述
 * @returns {Promise<void>}
 */
export const update = async function run(dbName: any, collectionName: any, filter: any, update: any): Promise<void> {
    try {
        const database = await dbClient.db(dbName);
        const collection = await database.collection(collectionName);

        const result = await collection.updateOne(filter, update);
        await system.log(`${dbName}.${collectionName}を更新`, `DB更新実行`);
    } catch (err: any) {
        await system.error(`${dbName}.${collectionName}を更新できませんでした`, err, `DB更新失敗`);
    }
};

/**
 * データベースにレコードを追加する
 * @param dbName 追加先データベース名
 * @param collectionName 追加先コレクション名
 * @param object 追加するレコード(オブジェクト型)
 * @returns {Promise<void>}
 */
export const insert = async function run(dbName: any, collectionName: any, object: any): Promise<void> {
    try {
        const database = await dbClient.db(dbName);
        const collection = await database.collection(collectionName);

        const result = await collection.insertOne(object);
        await system.log(`${dbName}.${collectionName}にレコード追加`, `DB追加実行`);
    } catch (err: any) {
        await system.error(`${dbName}.${collectionName}にレコードを追加できませんでした`, err, `DB追加失敗`);
    }
};

/**
 * filterにレコードが見つかればそれをsetで更新し、見つからなけれレコードを追加する
 * @param dbName 追加先データベース名
 * @param collectionName 追加先コレクション名
 * @param filter 更新対象のフィルターを指定
 * @param object 追加するレコード(オブジェクト型)
 * @returns {Promise<void>}
 */
export const updateOrInsert = async function run(dbName: any, collectionName: any, filter: any, object: any): Promise<void> {
    try {
        const data = await db.find(dbName, collectionName, filter);
        if (data.length > 0) {
            await db.update(dbName, collectionName, filter, { $set: object });
        } else {
            await db.insert(dbName, collectionName, object);
        }
    } catch (err: any) {
        await system.error(`${dbName}.${collectionName}にレコードを追加できませんでした`, err, `DB追加失敗`);
    }
};

/**
 * データベースからレコードを削除する
 * @param dbName 削除元データベース名
 * @param collectionName 削除元コレクション名
 * @param filter 削除対象のフィルターを指定
 * @returns {Promise<void>}
 */
export const del = async function run(dbName: any, collectionName: any, filter: any): Promise<void> {
    try {
        const database = await dbClient.db(dbName);
        const collection = await database.collection(collectionName);

        const result = await collection.deleteMany(filter);
        await system.log(`${dbName}.${collectionName}からレコード削除(削除されたとは言っていない)`, `DBレコード削除操作実行`);
    } catch (err: any) {
        await system.error(`${dbName}.${collectionName}からレコードを削除できませんでした`, err, `DB削除失敗`);
    }
};

/**
 *
 * @returns {Promise<void>}
 */
export const open = async function close(): Promise<void> {
    const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
    // @ts-ignore 引数が足りない
    await system.log("DB - open");
};

/**
 *
 * @returns {Promise<void>}
 */
export const close = async function close(): Promise<void> {
    await dbClient.close();
    // @ts-ignore 引数が足りない
    await system.log("DB - close");
};

// 引数の詳細については、mongodbの公式ドキュメントを参照すること
