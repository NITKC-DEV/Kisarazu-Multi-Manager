/** @format */

import fs from "fs";
import { configPath } from "../environmentConfig.mjs";
import * as system from "./logsystem.mjs";
import * as statusAndMode from "./statusAndMode.mjs";

const statusName = ["online", "idle", "dnd", "invisible"];

/***
 * botのステータスを設定
 * @param status　[オンライン,退席中,取り込み中,オフライン]の位置で指定
 * @param presence ○○をプレイ中 のメッセージ
 * @returns {Promise<void>}
 */
export const status = async function func(status: any, presence = "") {
    // @ts-ignore
    client.user.setPresence({
        activities: [
            {
                name: presence,
            },
        ],
    });
    let statusData = status;
    if (statusData === 0) {
        const date = new Date();
        if (date.getHours() * 100 + date.getMinutes() >= 204 && date.getHours() * 100 + date.getMinutes() <= 509) statusData = 1;
    }
    //@ts-ignore
    client.user.setStatus(statusName[statusData]);
};

/***
 * メンテナンスモードを切り替えます
 * @param mode Trueでメンテナンスモード
 * @returns {Promise<void>}
 */
export const maintenance = async function (mode: any) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    config.maintenanceMode = mode;
    fs.writeFileSync(configPath, JSON.stringify(config, null, "\t"));
    await system.warn(`メンテナンスモードを${config.maintenanceMode}にしました。`, "メンテナンスモード変更");

    if (mode) {
        await statusAndMode.status(2, "BOTメンテナンス");
    } else {
        const date = new Date();
        let status = 0;
        if (date.getHours() * 100 + date.getMinutes() >= 204 && date.getHours() * 100 + date.getMinutes() <= 509) status = 1;
        await statusAndMode.status(status, "メンテナンス完了");
    }
};
