const {ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');
const db = require("../functions/db.js");
const dbMain = "main";
const colCat = "CC-categories";
const colChan = "CC-channels";

exports.createChannel = async function(interaction) {
    const waitingMessage = await interaction.deferUpdate({ephemeral: true});
    const receivedValue = JSON.parse(interaction.values[0]);
    
    if(receivedValue.categoryID === "cancel") {
        await waitingMessage.edit({content: "キャンセルされました", components: []});
    }
    else {
        const createdChannel = await interaction.guild.channels.create({
            name: receivedValue.channelName,
            parent: receivedValue.categoryID !== interaction.guildId ? receivedValue.categoryID : null,
            reason: "木更津高専統合管理BOTの/create-channelにより作成",
            type:0
        });
        
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

exports.createRole = async function(interaction) {
    const waitingMessage = await interaction.deferUpdate({ephemeral: true});
    const receivedValue = JSON.parse(interaction.values[0]);
    
    if(receivedValue.value) {
        const createdRole = await interaction.guild.roles.create({
            name: receivedValue.channelName,
            permissions: BigInt(0),
            mentionable: true,
            reason: "木更津高専統合管理BOTの/create-channelにより作成"
        });
        
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

exports.selectDelete = async function(interaction) {
    const waitingMessage = await interaction.deferUpdate({ephemeral: true});
    if(interaction.values[0] === "Cancel") {
        await waitingMessage.edit({content: "キャンセルされました", components: []});
    }
    else {
        const receivedValue = JSON.parse(interaction.values[0]);
        let returnMessage;
        
        switch(receivedValue.categoryID) {
            case "All":
                if(receivedValue.value) {
                    for(const channelData of (await db.find(dbMain, colChan, {guildID: interaction.guildId})).map(channel => ({
                        ID: channel.ID,
                        thereRole: channel.thereRole,
                        roleID: channel.roleID
                    }))) {
                        await channelDelete(interaction, channelData.ID);
                        if(channelData.thereRole) {
                            await roleDelete(interaction, channelData.roleID);
                        }
                    }
                }
                
                await db.delete(dbMain, colChan, {guildID: interaction.guildId});
                await db.delete(dbMain, colCat, {guildID: interaction.guildId});
                
                if(receivedValue.value) {
                    returnMessage = "このサーバーの全てのカテゴリの登録を解除し、それらに作られたチャンネルとロールを全て削除しました";
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
                        await channelDelete(interaction, channelData.ID);
                        
                        if(channelData.thereRole) {
                            await channelDelete(interaction, channelData.roleID);
                        }
                    }
                }
                
                await db.delete(dbMain, colChan, {categoryID: receivedValue.categoryID});
                await db.delete(dbMain, colCat, {ID: receivedValue.categoryID});
                
                if(receivedValue.value) {
                    returnMessage = catName + "の登録を解除し、そこに作られたチャンネルとロールを全て削除しました";
                }
                else {
                    returnMessage = catName + "の登録を解除しました";
                }
                
                break;
        }
        await waitingMessage.edit({content: returnMessage, components: []});
    }
};

async function channelDelete(interaction, ID) {
    await interaction.guild.channels.delete(ID, "木更津高専統合管理BOTの/remove-categoryにより削除");
}

async function roleDelete(interaction, ID) {
    await interaction.guild.roles.delete(ID, "木更津高専統合管理BOTの/remove-categoryにより削除");
}

exports.removeDeletedChannelData = async function(channel) {
    await db.delete(dbMain, colChan, {ID: channel.id})
};

exports.removeDeletedCategoryData = async function(category) {
    await db.delete(dbMain,colCat,{ID:category.id});
    await db.delete(dbMain, colChan, {categoryID: category.id});
}

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

exports.updateCategoryData = async function(category){
    const categoryData = await db.find(dbMain,colCat,{ID:category.id});
    const newCategory = await client.channels.cache.get(category.id);
    if(categoryData.length > 0){
        if(categoryData[0].name !== newCategory.name){
            await db.update(dbMain,colCat,{ID:newCategory.id},{$set:{name:newCategory.name}});
        }
    }
};

exports.removeDeletedRoleData = async function(role){
    await db.update(dbMain,colChan,{roleID:role.id},{$set:{thereRole: false,roleID: "",roleName:""}});
};

exports.updateRoleData = async function(role){
    const channelData = await db.find(dbMain,colChan,{roleID:role.id});
    
    if(channelData.length > 0){
        const newRole = await (await client.guilds.fetch(role.guild.id)).roles.fetch(role.id);
        if(channelData[0].roleName !== newRole.name) {
            await db.update(dbMain,colChan,{roleID:newRole.id},{$set:{roleName:newRole.name}});
        }
    }
};