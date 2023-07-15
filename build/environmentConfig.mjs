import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const configPath = path.resolve(__dirname, process.env.NODE_ENV === "production" ? "../env/config.json" : "../env/config.dev.json");
export const config = await import(configPath);
