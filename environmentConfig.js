const fs = require("fs");
const path = require("path");

const configPath = path.resolve(__dirname, process.env.NODE_ENV === "production" ? "./config.json" : "./config.dev.json");
const config = await JSON.parse(fs.readFileSync(configPath, "utf-8"));
module.exports = config;
module.exports.configPath = configPath;
