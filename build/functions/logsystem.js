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
const { EmbedBuilder } = require("discord.js");
const config = require("../environmentConfig");
/***
 * ログをコンソールとdiscordに送信する
 * @param message ログの本文
 * @param title ログのタイトル。省略可
 */
exports.log = function func(message, title) {
    return __awaiter(this, void 0, void 0, function* () {
        const date = new Date().toLocaleString(); // YYYY/MM/DD hh:mm:ss形式に変換
        console.log(`${title !== null && title !== void 0 ? title : "システムログ"} ----\n${(message.trim().split("```").join(''))}\n--------${date}\n`);
        const embed = new EmbedBuilder()
            .setColor(0x00A0EA)
            .setTitle(title !== null && title !== void 0 ? title : "システムログ")
            .setDescription(message)
            .setTimestamp()
            .setFooter({ text: 'Discord Log System' });
        const channel = yield client.channels.fetch(config.logSystem);
        yield channel.send({ embeds: [embed] });
    });
};
/***
 * エラー通知とログをコンソールとdiscordに送信する
 * @param message エラーメッセージの本文
 * @param error エラーオブジェクト。error.stackが存在する場合にそれが送られる。省略可
 * @param title エラーメッセージのタイトル。省略可
 */
exports.error = function func(message, error = { stack: "" }, title = "エラー") {
    return __awaiter(this, void 0, void 0, function* () {
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(title)
            .setDescription(message)
            .setTimestamp()
            .setFooter({ text: 'Discord Log System' });
        const date = new Date().toLocaleString(); // YYYY/MM/DD hh:mm:ss形式に変換
        console.error(`${title} ----\n${(message.trim().split("```").join(''))}\n\n${error.stack}\n\n--------${date}\n`);
        const errorChannel = yield client.channels.fetch(config.errorSystem);
        yield errorChannel.send({ embeds: [embed] });
        yield errorChannel.send(`\`\`\`\n${error.stack}\n\`\`\``);
        const logChannel = yield client.channels.fetch(config.logSystem);
        yield logChannel.send({ embeds: [embed] });
        yield logChannel.send(`\`\`\`\n${error.stack}\n\`\`\``);
    });
};
/***
 * 警告をdiscordに送信する
 * @param message ログの本文
 * @param title ログのタイトル。省略可
 */
exports.warn = function func(message, title = "警告") {
    return __awaiter(this, void 0, void 0, function* () {
        const date = new Date().toLocaleString(); // YYYY/MM/DD hh:mm:ss形式に変換
        console.warn(`${title} ----\n${(message.trim().split("```").join(''))}\n--------${date}\n`);
        const embed = new EmbedBuilder()
            .setColor(0xEC9F38)
            .setTitle(title)
            .setDescription(message)
            .setTimestamp()
            .setFooter({ text: 'Discord Log System' });
        const logChannel = yield client.channels.fetch(config.logSystem);
        const errorChannel = yield client.channels.fetch(config.errorSystem);
        yield logChannel.send({ embeds: [embed] });
        yield errorChannel.send({ embeds: [embed] });
    });
};
