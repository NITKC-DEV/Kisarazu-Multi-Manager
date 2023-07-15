const Path = require("path")

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'configPath... Remove this comment to see the full error message
const configPath = Path.resolve(
  __dirname,
  process.env.NODE_ENV === "production" ? "../env/config.json" : "../env/config.dev.json"
);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'config'.
const config = require(configPath);
module.exports = config;
module.exports.configPath = configPath;
