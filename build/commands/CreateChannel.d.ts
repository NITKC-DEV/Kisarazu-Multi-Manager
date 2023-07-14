declare const _exports: {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    /***
     * /add-category で登録されたカテゴリにチャンネルを作成する
     * @param interaction
     * @returns {Promise<void>}
     */
    execute(interaction: any): Promise<void>;
}[];
export = _exports;
import { SlashCommandBuilder } from "@discordjs/builders";
