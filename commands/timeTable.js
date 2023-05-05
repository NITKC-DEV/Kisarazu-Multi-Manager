/** @format */

const { SlashCommandBuilder } = require("discord.js");
const timetableBuilder = require("../timetable/timetableUtils");
const Classes = require("../timetable/timetables.json");
const fs = require("fs");
const { configPath } = require("../environmentConfig");
module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("timetable")
            .setDescription("指定した学科・曜日の時間割を送信します")
            .addStringOption((option) =>
                option
                    .setName("学科")
                    .setDescription("学科を指定します")
                    .setRequired(true)
                    .addChoices(
                        { name: "M-機械工学科", value: "M" },
                        { name: "E-電気電子工学科", value: "E" },
                        { name: "D-電子制御工学科", value: "D" },
                        { name: "J-情報工学科", value: "J" },
                        { name: "C-環境都市工学科", value: "C" }
                    )
            )
            .addStringOption((option) =>
                option
                    .setName("曜日")
                    .setDescription("曜日を指定します。指定なければ次の学校の日になります。")
                    .setRequired(false)
                    .addChoices(
                        { name: "月曜日", value: "1" },
                        { name: "火曜日", value: "2" },
                        { name: "水曜日", value: "3" },
                        { name: "木曜日", value: "4" },
                        { name: "金曜日", value: "5" }
                    )
            ),

        async execute(interaction) {
            let dt = new Date();
            let dayOfWeek = dt.getDay();
            let hours = dt.getHours();
            if (interaction.options.getString("曜日") === "1") {
                dayOfWeek = 1;
            } else if (interaction.options.getString("曜日") === "2") {
                dayOfWeek = 2;
            } else if (interaction.options.getString("曜日") === "3") {
                dayOfWeek = 3;
            } else if (interaction.options.getString("曜日") === "4") {
                dayOfWeek = 4;
            } else if (interaction.options.getString("曜日") === "5") {
                dayOfWeek = 5;
            } else {
                if (hours >= 17) {
                    dayOfWeek += 1;
                }
                if (dayOfWeek === 6 || dayOfWeek === 7 || dayOfWeek === 0) {
                    dayOfWeek = 1;
                }
            }

            const embed = timetableBuilder(Classes[interaction.options.getString("学科")], dayOfWeek);

            await interaction.reply({ embeds: [embed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName("tt-switcher")
            .setDescription("時間割定期送信のON/OFFを切り替えます")
            .setDefaultMemberPermissions(1 << 3)
            .addBooleanOption((option) => option.setName("options").setDescription("定期実行の可否を指定します").setRequired(true)),

        async execute(interaction) {
            const date = JSON.parse(fs.readFileSync(configPath, "utf8")); //ここで読み取り
            date.timetable = interaction.options.data[0].value;
            fs.writeFileSync(configPath, JSON.stringify(date, null, "\t")); //ここで書き出し
            await interaction.reply({
                content: "時間割定期通知機能を" + interaction.options.data[0].value + "に設定しました",
                ephemeral: true,
            });
        },
    },
];
