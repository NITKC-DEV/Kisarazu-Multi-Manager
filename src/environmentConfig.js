const fs = require("fs");
const path = require("path");

const configPath = path.resolve(__dirname, process.env.NODE_ENV === "production" ? "../env/config.json" : "../env/config.dev.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
module.exports = config;
module.exports.configPath = configPath;
