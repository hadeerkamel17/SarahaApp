import { config } from "dotenv";
import { resolve } from "node:path";
const NODE_ENV = process.env.NODE_ENV;
const envpath = {
  development: ".env.development",
  production: ".env.production",
};
config({ path: resolve(`config/${envpath[NODE_ENV]}`) });
export const PORT = process.env.PORT;
export const DB_URI = process.env.DB_URI;
