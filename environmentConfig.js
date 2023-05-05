/** @format */

const Path = require("path");

const configPath = Path.resolve(__dirname, process.env.NODE_ENV === "production" ? "./config.json" : "./config.dev.json");
// eslint-disable-next-line import/no-dynamic-require
const config = require(configPath);
module.exports = config;
module.exports.configPath = configPath;
