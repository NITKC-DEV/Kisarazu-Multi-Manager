"use strict";
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const Path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'configPath... Remove this comment to see the full error message
const configPath = Path.resolve(
// @ts-expect-error TS(2304): Cannot find name '__dirname'.
__dirname, 
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
process.env.NODE_ENV === "production" ? "../env/config.json" : "../env/config.dev.json");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'config'.
const config = require(configPath);
// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports = config;
// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'mode'?
module.exports.configPath = configPath;
