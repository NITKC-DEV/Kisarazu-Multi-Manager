const {ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');
const db = require("../functions/db.js");
const dbMain = "main";
const colCat = "CC-categories";
const colChan = "CC-channels";
const system = require("./logsystem");

/***
 * /createChannelによって作成されたStringSelectMenuを受け付け、チャンネルを作成する
 *
 * ロールを作成するかを問うStringSelectMenuを投げる
 * @param interaction StringSelectMenuInteractionオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.createChannel = async function(interaction) {
    const waitingMessage = await interaction.deferUpdate({ephemeral: true});
    //ゴリ押しJson文字列をオブジェクト型に変換する
    const receivedValue = JSON.parse(interaction.values[0]);
    
    if(receivedValue.categoryID === "cancel") {
        await waitingMessage.edit({content: "キャンセルされました", components: []});
    }
    else {
        let createdChannel;
        try {
            createdChannel = await interaction.guild.channels.create({
                name: receivedValue.channelName,
                parent: receivedValue.categoryID !== interaction.guildId ? receivedValue.categoryID : null,
                reason: "木更津高専統合管理BOTの/create-channelにより作成",
                type: 0
            });
        }
        catch(error) {
            await waitingMessage.edit({content: "チャンネルの作成に失敗しました", components: []});
            await system.error("/create-channelチャンネル作成失敗", error);
            return;
        }
        
        
        await db.insert(dbMain, colChan, {
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
        if((await db.find(dbMain, colCat, {ID: createdChannel.parentId || createdChannel.guildId})).length === 0) {
            await channelDelete(interaction, createdChannel.id);
            await db.delete(dbMain, colChan,{ID:createdChannel.id});
            await system.warn("カテゴリ参照失敗");
            await waitingMessage.edit({content: "このカテゴリは登録されていません", components: []});
            return;
        }
        
        if((await db.find(dbMain, colCat, {ID: receivedValue.categoryID}))[0].allowRole) {
            const createRole = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("createRole")
                        .addOptions(
                            {
                                label: "作成する",
                                value: JSON.stringify({
                                    value: true,
                                    channelID: createdChannel.id,
                                    channelName: createdChannel.name,
                                })
                            },
                            {
                                label: "作成しない",
                                value: JSON.stringify({
                                    value: false,
                                    channelID: createdChannel.id,
                                    channelName: createdChannel.name,
                                })
                            }
                        )
                );
            
            await waitingMessage.edit({content: "このチャンネルに対応したロールを作成しますか？", components: [createRole]});
        }
        else {
            await waitingMessage.edit({content: "作成しました", components: []});
        }
    }
};

/***
 * functions/CCFunc.js.createChannel関数から投げられた、ロール作成用のStringSelectMenuの受取
 * @param interaction StringSelectMenuInteractionオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.createRole = async function(interaction) {
    const waitingMessage = await interaction.deferUpdate({ephemeral: true});
    const receivedValue = JSON.parse(interaction.values[0]);
    
    if(receivedValue.value) {
        let createdRole;
        try {
            createdRole = await interaction.guild.roles.create({
                name: receivedValue.channelName,
                permissions: BigInt(0),
                mentionable: true,
                reason: "木更津高専統合管理BOTの/create-channelにより作成"
            });
        }
        catch(error) {
            await waitingMessage.edit({content: "ロールの作成に失敗しました", components: []});
            await system.error("/create-channelロール作成失敗", error);
            return;
        }
        
        await db.update(dbMain, colChan, {ID: receivedValue.channelID}, {
            $set: {
                thereRole: true,
                roleID: createdRole.id,
                roleName: createdRole.name,
            }
        });
        
        await waitingMessage.edit({content: "ロールを作成して終了しました", components: []});
    }
    else {
        await waitingMessage.edit({content: "ロールを作成せずに終了しました", components: []});
    }
};

/***
 * /remove-categoryによって作成されたStringSelectMenuの受け取る
 *
 * チャンネルとロールの削除するかを問うStringSelectMenuを投げる
 * @param interaction StringSelectMenuInteractionオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.removeCategory = async function(interaction) {
    const waitingMessage = await interaction.deferUpdate({ephemeral: true});
    switch(interaction.values[0]) {
        case "Cancel":
            await waitingMessage.edit({content: "キャンセルされました", components: []});
            break;
        default:
            const selectDelete = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("selectDelete")
                        .setOptions(
                            {label: "はい", value: JSON.stringify({value: true, categoryID: interaction.values[0]})},
                            {label: "いいえ", value: JSON.stringify({value: false, categoryID: interaction.values[0]})},
                            {label: "キャンセル", value: "Cancel"}
                        )
                );
            
            await waitingMessage.edit({
                content: "カテゴリの登録解除時に/create-channelによって作られたチャンネルとロールを削除しますか?",
                components: [selectDelete]
            });
    }
};

/***
 * functions/CCFunc.js.removeCategoryから投げられたStringSelectMenuを受け取る
 *
 * データを削除し、必要に応じチャンネルトロールを削除する
 * @param interaction StringSelectMenuInteractionオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.selectDelete = async function(interaction) {
    const waitingMessage = await interaction.deferUpdate({ephemeral: true});
    if(interaction.values[0] === "Cancel") {
        await waitingMessage.edit({content: "キャンセルされました", components: []});
    }
    else {
        const receivedValue = JSON.parse(interaction.values[0]);
        let returnMessage;
        let errorCount = 0;
        switch(receivedValue.categoryID) {
            case "All":
                if(receivedValue.value) {
                    for(const channelData of (await db.find(dbMain, colChan, {guildID: interaction.guildId})).map(channel => ({
                        ID: channel.ID,
                        thereRole: channel.thereRole,
                        roleID: channel.roleID
                    }))) {
                        try {
                            await channelDelete(interaction, channelData.ID);
                        }
                        catch(error) {
                            await system.error("/remove-categoryチャンネル削除失敗", error);
                            errorCount++;
                        }
                        
                        try {
                            if(channelData.thereRole) {
                                await roleDelete(interaction, channelData.roleID);
                            }
                        }
                        catch(error) {
                            await system.error("/remove-categoryロール削除失敗", error);
                            errorCount++;
                        }
                    }
                }
                
                await db.delete(dbMain, colChan, {guildID: interaction.guildId});
                await db.delete(dbMain, colCat, {guildID: interaction.guildId});
                
                if(receivedValue.value) {
                    returnMessage = "このサーバーの全てのカテゴリの登録を解除し、それらに作られたチャンネルとロールを全て削除しました" + (errorCount > 0 ? `\n${errorCount}個のチャンネルまたはロールの削除に失敗しました` : "");
                }
                else {
                    returnMessage = "このサーバーの全てのカテゴリの登録を解除しました";
                }
                
                break;
            default:
                const catName = (await db.find(dbMain, colCat, {ID: receivedValue.categoryID}))[0].name;
                if(receivedValue.value) {
                    for(const channelData of (await db.find(dbMain, colChan, {categoryID: receivedValue.categoryID})).map(channel => ({
                        ID: channel.ID,
                        thereRole: channel.thereRole,
                        roleID: channel.roleID
                    }))) {
                        try {
                            await channelDelete(interaction, channelData.ID);
                        }
                        catch(error) {
                            await system.error("/remove-categoryチャンネル削除失敗", error);
                            errorCount++;
                        }
                        
                        try {
                            if(channelData.thereRole) {
                                await channelDelete(interaction, channelData.roleID);
                            }
                        }
                        catch(error) {
                            await system.error("/remove-categoryロール削除失敗", error);
                            errorCount++;
                        }
                    }
                }
                
                await db.delete(dbMain, colChan, {categoryID: receivedValue.categoryID});
                await db.delete(dbMain, colCat, {ID: receivedValue.categoryID});
                
                if(receivedValue.value) {
                    returnMessage = catName + "の登録を解除し、そこに作られたチャンネルとロールを全て削除しました" + (errorCount > 0 ? `\n${errorCount}個のチャンネルまたはロールの削除に失敗しました` : "");
                }
                else {
                    returnMessage = catName + "の登録を解除しました";
                }
                
                break;
        }
        await waitingMessage.edit({content: returnMessage, components: []});
    }
};

/***
 * 与えられた引数からチャンネルを削除する
 * @param interaction 何かしらのinteraction(使わない実装にもできるけどだるかった)
 * @param ID チャンネルID
 * @returns {Promise<void>} void(同期処理)
 */
async function channelDelete(interaction, ID) {
    await interaction.guild.channels.delete(ID, "木更津高専統合管理BOTの/remove-categoryにより削除");
}

/***
 * 与えられた引数からロールを削除する
 * @param interaction 何かしらのinteraction
 * @param ID ロールID
 * @returns {Promise<void>} void(同期処理)
 */
async function roleDelete(interaction, ID) {
    await interaction.guild.roles.delete(ID, "木更津高専統合管理BOTの/remove-categoryにより削除");
}

/***
 * チャンネルが削除されたときにDBから情報を削除する
 * @param channel チャンネルオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.removeDeletedChannelData = async function(channel) {
    await db.delete(dbMain, colChan, {ID: channel.id})
};

/***
 * カテゴリが削除されたときにDBから情報を削除する
 * @param category カテゴリ(チャンネル)オブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.removeDeletedCategoryData = async function(category) {
    await db.delete(dbMain, colCat, {ID: category.id});
    await db.delete(dbMain, colChan, {categoryID: category.id});
}

/***
 * チャンネルの情報が変更されたときにDBの情報を更新する
 * @param channel 変更を検知したときのchannelオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.updateChannelData = async function(channel) {
    const channelData = await db.find(dbMain, colChan, {ID: channel.id});
    const newChannel = await client.channels.cache.get(channel.id);
    if(channelData.length > 0) {
        if(channelData[0].categoryID !== (newChannel.parentId !== null ? newChannel.parentId : newChannel.guildId)) {
            await db.delete(dbMain, colChan, {ID: newChannel.id});
        }
        
        if(channelData[0].name !== newChannel.name) {
            await db.update(dbMain, colChan, {ID: newChannel.id}, {$set: {name: newChannel.name}});
        }
    }
};

/**
 * カテゴリの情報が変更されたときにDBの情報を更新する
 * @param category 変更を検知したときのカテゴリ(チャンネル)オブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.updateCategoryData = async function(category) {
    const categoryData = await db.find(dbMain, colCat, {ID: category.id});
    const newCategory = await client.channels.cache.get(category.id);
    if(categoryData.length > 0) {
        if(categoryData[0].name !== newCategory.name) {
            await db.update(dbMain, colCat, {ID: newCategory.id}, {$set: {name: newCategory.name}});
        }
    }
};

/***
 * ロールが削除されたときにDBから情報を削除する
 * @param role roleオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.removeDeletedRoleData = async function(role) {
    await db.update(dbMain, colChan, {roleID: role.id}, {$set: {thereRole: false, roleID: "", roleName: ""}});
};

/***
 * ロールの情報が変更されたときにDBの情報を更新する
 * @param role 変更を検知したときのroleオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.updateRoleData = async function(role) {
    const channelData = await db.find(dbMain, colChan, {roleID: role.id});
    
    if(channelData.length > 0) {
        const newRole = await (await client.guilds.fetch(role.guild.id)).roles.fetch("0");
        if(channelData[0].roleName !== newRole.name) {
            await db.update(dbMain, colChan, {roleID: newRole.id}, {$set: {roleName: newRole.name}});
        }
    }
};

/***
 * ギルドから抜けたときにDBからその情報を削除する
 * @param guild 抜けたときのguildオブジェクト
 * @returns {Promise<void>} void(同期処理)
 */
exports.deleteGuildData = async function(guild) {
    const categoryData = await db.find(dbMain, colCat, {guildID: guild.id});
    for(const category of categoryData) {
        await db.delete(dbMain, colChan, {categoryID: category.ID});
    }
    await db.delete(dbMain, colCat, {guildID: guild.id});
};

/***
 * ギルド、カテゴリ、チャンネル、ロールの情報を参照し、整合性を確認する
 * @returns {Promise<void>} void(同期処理)
 */
exports.dataCheck = async function() {
    
    await system.log("開始", "createChannelデータベース整合性検証");
    try {
        for(const category of await db.find(dbMain, colCat, {})) {
            let guildData;
            try {
                guildData = await client.guilds.fetch(category.guildID);
            }
            catch(e) {
                if(e.code === 10004) {
                    await db.delete(dbMain, colChan, {guildID: category.guildID});
                    await db.delete(dbMain, colCat, {guildID: category.guildID});
                    continue;
                }
                else {
                    // 意図しない例外の場合、丸め込んでしまうため、そのまま例外をスローして、外でキャッチするため警告を抑制
                    // noinspection ExceptionCaughtLocallyJS
                    throw(e);
                }
            }
            if(category.ID !== category.guildID) {
                const categoryData = await guildData.channels.cache.get(category.ID);
                if(categoryData === undefined) {
                    await db.delete(dbMain, colChan, {categoryID: category.ID});
                    await db.delete(dbMain, colCat, {ID: category.ID});
                }
                else if(categoryData.name !== category.name) {
                    await db.update(dbMain, colCat, {ID: category.ID}, {$set: {name: categoryData.name}});
                }
            }
        }
        
        for(const channel of await db.find(dbMain, colChan, {})) {
            if((await db.find(dbMain, colCat, {ID: channel.categoryID})).length === 0) {
                await db.delete(dbMain, colChan, {ID: channel.ID});
                continue;
            }
            
            const channelData = await client.channels.cache.get(channel.ID);
            
            if(channelData === undefined) {
                await db.delete(dbMain, colChan, {ID: channel.ID});
                continue;
            }
            else if(channelData.name !== channel.name) {
                await db.update(dbMain, colChan, {ID: channel.ID}, {$set: {name: channelData.name}});
            }
            
            if(channel.thereRole) {
                const roleData = await (await client.guilds.fetch((await db.find(dbMain, colCat, {ID: channel.categoryID}))[0].guildID)).roles.fetch(channel.roleID);
                if(roleData === null) {
                    await db.update(dbMain, colChan, {ID: channel.ID}, {
                        $set: {
                            thereRole: false,
                            roleName: "",
                            roleID: ""
                        }
                    });
                }
                else if(roleData.name !== channel.roleName) {
                    await db.update(dbMain, colChan, {ID: channel.ID}, {$set: {roleName: roleData.name}});
                }
            }
        }
    }
    catch(error) {
        await system.error("異常終了\n再起動推奨", error, "createChannelデータベース整合性検証");
        return;
    }
    await system.log("正常終了", "createChannelデータベース整合性検証");
};