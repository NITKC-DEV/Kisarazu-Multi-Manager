const { MongoClient, ServerApiVersion } = require("mongodb");
const config = require('../environmentConfig')

const system = require('../functions/logsystem.js');

exports.editTest = async function run(year, month1,day1,month2,day2,quarter) {
    const dbClient = new MongoClient(config.db, { serverApi: ServerApiVersion.v1 });
    try {
        const database = dbClient.db("main");
        const collection = database.collection("nextTest");

        const result = await collection.updateOne(
            {
                quarter: String(quarter)
            },
            {
                $set: {
                    year: String(year),
                    month1: String(month1),
                    day1: String(day1),
                    month2: String(month2),
                    day2: String(day2),
                    quarter:String(quarter)
                },
            }
        )
        system.log(`nextTestを更新 : ${result.upsertedId}`,`db操作実行`);
    } finally {
        await dbClient.close();
    }
}