declare const ActionRowBuilder: any, StringSelectMenuBuilder: any;
declare const db: any;
declare const dbMain = "main";
declare const colCat = "CC-categories";
declare const colChan = "CC-channels";
declare const system: any;
/***
 * 与えられた引数からチャンネルを削除する
 * @param interaction 何かしらのinteraction(使わない実装にもできるけどだるかった)
 * @param ID チャンネルID
 * @returns {Promise<void>} void(同期処理)
 */
declare function channelDelete(interaction: any, ID: any): Promise<void>;
/***
 * 与えられた引数からロールを削除する
 * @param interaction 何かしらのinteraction
 * @param ID ロールID
 * @returns {Promise<void>} void(同期処理)
 */
declare function roleDelete(interaction: any, ID: any): Promise<void>;
