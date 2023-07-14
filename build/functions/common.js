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
const { setTimeout } = require("node:timers/promises");
/***
 * 返信し、time秒後に自動で削除する。
 * @param interaction 返信するinteraction
 * @param options メッセージのオブジェクト(contentの中の$time$を現在の残り時間に置き換える)
 * @param time 返信してから削除するまでの時間
*/
exports.autoDeleteEditReply = function (interaction, options, time) {
    (() => __awaiter(this, void 0, void 0, function* () {
        for (let i = time; i > 0; i--) {
            const defaultContent = JSON.parse(JSON.stringify(options)).content;
            const sendingOptions = JSON.parse(JSON.stringify(options));
            sendingOptions.content = defaultContent.replace(/\$time\$/g, i);
            yield setTimeout(1000);
            yield interaction.editReply(sendingOptions);
        }
        yield interaction.deleteReply();
    }))();
};
