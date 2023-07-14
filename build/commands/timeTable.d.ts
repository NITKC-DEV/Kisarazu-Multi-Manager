declare const _exports: {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute(interaction: any): Promise<void>;
}[];
export = _exports;
import { SlashCommandBuilder } from "@discordjs/builders";
