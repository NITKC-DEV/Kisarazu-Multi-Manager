/** @format */

import path from "path";
import { fileURLToPath } from "url";
import { EnvironmentConfig } from "./types/Kisarazu-Multi-Manager/jsonStructure";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const configPath = path.resolve(__dirname, process.env.NODE_ENV === "production" ? "../env/config.json" : "../env/config.dev.json");

export const config = require(configPath) as EnvironmentConfig;
