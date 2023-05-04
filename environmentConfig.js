/** @format */

const Path = require("path");

const developmentConfig = require("./config.dev.json");
const productionConfig = require("./config.json");

let config;
let configPath;

switch (process.env.NODE_ENV) {
    case "production":
        config = productionConfig;
        configPath = Path.resolve(__dirname, "./config.json");
        break;
    default:
        config = developmentConfig;
        configPath = Path.resolve(__dirname, "./config.dev.json");
        break;
}

module.exports = config;
module.exports.configPath = configPath;
