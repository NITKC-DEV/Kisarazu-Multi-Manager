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
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require("./db.js");
const dbMain = "main";
const colCat = "CC-categories";
const colChan = "CC-channels";
const system = require("./logsystem.js");
/***
 * /createChannelによって作成されたStringSelectMenuを受け付け、チャンネルを作成する
 *
 * ロールを作成するかを問うStringSelectMenuを投げる
 * @param interaction StringSelectMenuInteractionオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.createChannel = function (interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const waitingMessage = yield interaction.deferUpdate({ ephemeral: true });
        //ゴリ押しJson文字列をオブジェクト型に変換する
        const receivedValue = JSON.parse(interaction.values[0]);
        if (receivedValue.categoryID === "cancel") {
            yield waitingMessage.edit({ content: "キャンセルされました", components: [] });
        }
        else {
            let createdChannel;
            try {
                createdChannel = yield interaction.guild.channels.create({
                    name: receivedValue.channelName,
                    parent: receivedValue.categoryID !== interaction.guildId ? receivedValue.categoryID : null,
                    reason: "木更津高専統合管理BOTの/create-channelにより作成",
                    type: 0
                });
            }
            catch (error) {
                yield waitingMessage.edit({ content: "チャンネルの作成に失敗しました", components: [] });
                yield system.error("/create-channelチャンネル作成失敗", error);
                return;
            }
            yield db.insert(dbMain, colChan, {
                ID: createdChannel.id,
                name: createdChannel.name,
                creatorID: interaction.user.id,
                createTime: Date.now(),
                thereRole: false,
                roleID: "",
                roleName: "",
                categoryID: receivedValue.categoryID,
                guildID: interaction.guildId
            });
            //応答待ったりDB更新してる間にカテゴリの登録が解除されてたときにキャンセルする
            if ((yield db.find(dbMain, colCat, { ID: createdChannel.parentId || createdChannel.guildId })).length === 0) {
                yield channelDelete(interaction, createdChannel.id);
                yield db.delete(dbMain, colChan, { ID: createdChannel.id });
                yield system.warn("カテゴリ参照失敗");
                yield waitingMessage.edit({ content: "このカテゴリは登録されていません", components: [] });
                return;
            }
            if ((yield db.find(dbMain, colCat, { ID: receivedValue.categoryID }))[0].allowRole) {
                const createRole = new ActionRowBuilder()
                    .addComponents(new StringSelectMenuBuilder()
                    .setCustomId("createRole")
                    .addOptions({
                    label: "作成する",
                    value: JSON.stringify({
                        value: true,
                        channelID: createdChannel.id,
                        channelName: createdChannel.name,
                    })
                }, {
                    label: "作成しない",
                    value: JSON.stringify({
                        value: false,
                        channelID: createdChannel.id,
                        channelName: createdChannel.name,
                    })
                }));
                yield waitingMessage.edit({ content: "このチャンネルに対応したロールを作成しますか？", components: [createRole] });
            }
            else {
                yield waitingMessage.edit({ content: "作成しました", components: [] });
            }
        }
    });
};
/***
 * functions/CCFunc.js.createChannel関数から投げられた、ロール作成用のStringSelectMenuの受取
 * @param interaction StringSelectMenuInteractionオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.createRole = function (interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const waitingMessage = yield interaction.deferUpdate({ ephemeral: true });
        const receivedValue = JSON.parse(interaction.values[0]);
        if (receivedValue.value) {
            let createdRole;
            try {
                createdRole = yield interaction.guild.roles.create({
                    name: receivedValue.channelName,
                    permissions: BigInt(0),
                    mentionable: true,
                    reason: "木更津高専統合管理BOTの/create-channelにより作成"
                });
            }
            catch (error) {
                yield waitingMessage.edit({ content: "ロールの作成に失敗しました", components: [] });
                yield system.error("/create-channelロール作成失敗", error);
                return;
            }
            yield db.update(dbMain, colChan, { ID: receivedValue.channelID }, {
                $set: {
                    thereRole: true,
                    roleID: createdRole.id,
                    roleName: createdRole.name,
                }
            });
            yield waitingMessage.edit({ content: "ロールを作成して終了しました", components: [] });
        }
        else {
            yield waitingMessage.edit({ content: "ロールを作成せずに終了しました", components: [] });
        }
    });
};
/***
 * /remove-categoryによって作成されたStringSelectMenuの受け取る
 *
 * チャンネルとロールの削除するかを問うStringSelectMenuを投げる
 * @param interaction StringSelectMenuInteractionオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.removeCategory = function (interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const waitingMessage = yield interaction.deferUpdate({ ephemeral: true });
        switch (interaction.values[0]) {
            case "Cancel":
                yield waitingMessage.edit({ content: "キャンセルされました", components: [] });
                break;
            default:
                const selectDelete = new ActionRowBuilder()
                    .addComponents(new StringSelectMenuBuilder()
                    .setCustomId("selectDelete")
                    .setOptions({ label: "はい", value: JSON.stringify({ value: true, categoryID: interaction.values[0] }) }, { label: "いいえ", value: JSON.stringify({ value: false, categoryID: interaction.values[0] }) }, { label: "キャンセル", value: "Cancel" }));
                yield waitingMessage.edit({
                    content: "カテゴリの登録解除時に/create-channelによって作られたチャンネルとロールを削除しますか?",
                    components: [selectDelete]
                });
        }
    });
};
/***
 * functions/CCFunc.js.removeCategoryから投げられたStringSelectMenuを受け取る
 *
 * データを削除し、必要に応じチャンネルトロールを削除する
 * @param interaction StringSelectMenuInteractionオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.selectDelete = function (interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const waitingMessage = yield interaction.deferUpdate({ ephemeral: true });
        if (interaction.values[0] === "Cancel") {
            yield waitingMessage.edit({ content: "キャンセルされました", components: [] });
        }
        else {
            const receivedValue = JSON.parse(interaction.values[0]);
            let returnMessage;
            let errorCount = 0;
            switch (receivedValue.categoryID) {
                case "All":
                    if (receivedValue.value) {
                        for (const channelData of (yield db.find(dbMain, colChan, { guildID: interaction.guildId })).map(channel => ({
                            ID: channel.ID,
                            thereRole: channel.thereRole,
                            roleID: channel.roleID
                        }))) {
                            try {
                                yield channelDelete(interaction, channelData.ID);
                            }
                            catch (error) {
                                yield system.error("/remove-categoryチャンネル削除失敗", error);
                                errorCount++;
                            }
                            try {
                                if (channelData.thereRole) {
                                    yield roleDelete(interaction, channelData.roleID);
                                }
                            }
                            catch (error) {
                                yield system.error("/remove-categoryロール削除失敗", error);
                                errorCount++;
                            }
                        }
                    }
                    yield db.delete(dbMain, colChan, { guildID: interaction.guildId });
                    yield db.delete(dbMain, colCat, { guildID: interaction.guildId });
                    if (receivedValue.value) {
                        returnMessage = "このサーバーの全てのカテゴリの登録を解除し、それらに作られたチャンネルとロールを全て削除しました" + (errorCount > 0 ? `\n${errorCount}個のチャンネルまたはロールの削除に失敗しました` : "");
                    }
                    else {
                        returnMessage = "このサーバーの全てのカテゴリの登録を解除しました";
                    }
                    break;
                default:
                    const catName = (yield db.find(dbMain, colCat, { ID: receivedValue.categoryID }))[0].name;
                    if (receivedValue.value) {
                        for (const channelData of (yield db.find(dbMain, colChan, { categoryID: receivedValue.categoryID })).map(channel => ({
                            ID: channel.ID,
                            thereRole: channel.thereRole,
                            roleID: channel.roleID
                        }))) {
                            try {
                                yield channelDelete(interaction, channelData.ID);
                            }
                            catch (error) {
                                yield system.error("/remove-categoryチャンネル削除失敗", error);
                                errorCount++;
                            }
                            try {
                                if (channelData.thereRole) {
                                    yield channelDelete(interaction, channelData.roleID);
                                }
                            }
                            catch (error) {
                                yield system.error("/remove-categoryロール削除失敗", error);
                                errorCount++;
                            }
                        }
                    }
                    yield db.delete(dbMain, colChan, { categoryID: receivedValue.categoryID });
                    yield db.delete(dbMain, colCat, { ID: receivedValue.categoryID });
                    if (receivedValue.value) {
                        returnMessage = catName + "の登録を解除し、そこに作られたチャンネルとロールを全て削除しました" + (errorCount > 0 ? `\n${errorCount}個のチャンネルまたはロールの削除に失敗しました` : "");
                    }
                    else {
                        returnMessage = catName + "の登録を解除しました";
                    }
                    break;
            }
            yield waitingMessage.edit({ content: returnMessage, components: [] });
        }
    });
};
/***
 * 与えられた引数からチャンネルを削除する
 * @param interaction 何かしらのinteraction(使わない実装にもできるけどだるかった)
 * @param ID チャンネルID
 * @returns {Promise<void>} void(同期処理)
 */
function channelDelete(interaction, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.guild.channels.delete(ID, "木更津高専統合管理BOTの/remove-categoryにより削除");
    });
}
/***
 * 与えられた引数からロールを削除する
 * @param interaction 何かしらのinteraction
 * @param ID ロールID
 * @returns {Promise<void>} void(同期処理)
 */
function roleDelete(interaction, ID) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.guild.roles.delete(ID, "木更津高専統合管理BOTの/remove-categoryにより削除");
    });
}
/***
 * チャンネルが削除されたときにDBから情報を削除する
 * @param channel チャンネルオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.removeDeletedChannelData = function (channel) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.delete(dbMain, colChan, { ID: channel.id });
    });
};
/***
 * カテゴリが削除されたときにDBから情報を削除する
 * @param category カテゴリ(チャンネル)オブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.removeDeletedCategoryData = function (category) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.delete(dbMain, colCat, { ID: category.id });
        yield db.delete(dbMain, colChan, { categoryID: category.id });
    });
};
/***
 * チャンネルの情報が変更されたときにDBの情報を更新する
 * @param channel 変更を検知したときのchannelオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.updateChannelData = function (channel) {
    return __awaiter(this, void 0, void 0, function* () {
        const channelData = yield db.find(dbMain, colChan, { ID: channel.id });
        const newChannel = yield client.channels.cache.get(channel.id);
        if (channelData.length > 0) {
            if (channelData[0].categoryID !== (newChannel.parentId !== null ? newChannel.parentId : newChannel.guildId)) {
                yield db.delete(dbMain, colChan, { ID: newChannel.id });
            }
            if (channelData[0].name !== newChannel.name) {
                yield db.update(dbMain, colChan, { ID: newChannel.id }, { $set: { name: newChannel.name } });
            }
        }
    });
};
/**
 * カテゴリの情報が変更されたときにDBの情報を更新する
 * @param category 変更を検知したときのカテゴリ(チャンネル)オブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.updateCategoryData = function (category) {
    return __awaiter(this, void 0, void 0, function* () {
        const categoryData = yield db.find(dbMain, colCat, { ID: category.id });
        const newCategory = yield client.channels.cache.get(category.id);
        if (categoryData.length > 0) {
            if (categoryData[0].name !== newCategory.name) {
                yield db.update(dbMain, colCat, { ID: newCategory.id }, { $set: { name: newCategory.name } });
            }
        }
    });
};
/***
 * ロールが削除されたときにDBから情報を削除する
 * @param role roleオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.removeDeletedRoleData = function (role) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.update(dbMain, colChan, { roleID: role.id }, { $set: { thereRole: false, roleID: "", roleName: "" } });
    });
};
/***
 * ロールの情報が変更されたときにDBの情報を更新する
 * @param role 変更を検知したときのroleオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.updateRoleData = function (role) {
    return __awaiter(this, void 0, void 0, function* () {
        const channelData = yield db.find(dbMain, colChan, { roleID: role.id });
        if (channelData.length > 0) {
            const newRole = yield (yield client.guilds.fetch(role.guild.id)).roles.fetch(role.id);
            if (channelData[0].roleName !== newRole.name) {
                yield db.update(dbMain, colChan, { roleID: newRole.id }, { $set: { roleName: newRole.name } });
            }
        }
    });
};
/***
 * ギルドから抜けたときにDBからその情報を削除する
 * @param guild 抜けたときのguildオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.deleteGuildData = function (guild) {
    return __awaiter(this, void 0, void 0, function* () {
        const categoryData = yield db.find(dbMain, colCat, { guildID: guild.id });
        for (const category of categoryData) {
            yield db.delete(dbMain, colChan, { categoryID: category.ID });
        }
        yield db.delete(dbMain, colCat, { guildID: guild.id });
    });
};
/***
 * ギルド、カテゴリ、チャンネル、ロールの情報を参照し、整合性を確認する
 * @returns {Promise<void>} void(同期処理)
 */
exports.dataCheck = function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield system.log("開始", "createChannelデータベース整合性検証");
        try {
            for (const category of yield db.find(dbMain, colCat, {})) {
                let guildData;
                try {
                    guildData = yield client.guilds.fetch(category.guildID);
                }
                catch (e) {
                    if (e.code === 10004) {
                        yield db.delete(dbMain, colChan, { guildID: category.guildID });
                        yield db.delete(dbMain, colCat, { guildID: category.guildID });
                        continue;
                    }
                    else {
                        // 意図しない例外の場合、丸め込んでしまうため、そのまま例外をスローして、外でキャッチするため警告を抑制
                        // noinspection ExceptionCaughtLocallyJS
                        throw (e);
                    }
                }
                if (category.ID !== category.guildID) {
                    const categoryData = yield guildData.channels.cache.get(category.ID);
                    if (categoryData === undefined) {
                        yield db.delete(dbMain, colChan, { categoryID: category.ID });
                        yield db.delete(dbMain, colCat, { ID: category.ID });
                    }
                    else if (categoryData.name !== category.name) {
                        yield db.update(dbMain, colCat, { ID: category.ID }, { $set: { name: categoryData.name } });
                    }
                }
            }
            for (const channel of yield db.find(dbMain, colChan, {})) {
                if ((yield db.find(dbMain, colCat, { ID: channel.categoryID })).length === 0) {
                    yield db.delete(dbMain, colChan, { ID: channel.ID });
                    continue;
                }
                const channelData = yield client.channels.cache.get(channel.ID);
                if (channelData === undefined) {
                    yield db.delete(dbMain, colChan, { ID: channel.ID });
                    continue;
                }
                else if (channelData.name !== channel.name) {
                    yield db.update(dbMain, colChan, { ID: channel.ID }, { $set: { name: channelData.name } });
                }
                if (channel.thereRole) {
                    const roleData = yield (yield client.guilds.fetch((yield db.find(dbMain, colCat, { ID: channel.categoryID }))[0].guildID)).roles.fetch(channel.roleID);
                    if (roleData === null) {
                        yield db.update(dbMain, colChan, { ID: channel.ID }, {
                            $set: {
                                thereRole: false,
                                roleName: "",
                                roleID: ""
                            }
                        });
                    }
                    else if (roleData.name !== channel.roleName) {
                        yield db.update(dbMain, colChan, { ID: channel.ID }, { $set: { roleName: roleData.name } });
                    }
                }
            }
        }
        catch (error) {
            yield system.error("異常終了\n再起動推奨", error, "createChannelデータベース整合性検証");
            return;
        }
        yield system.log("正常終了", "createChannelデータベース整合性検証");
    });
};
