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
export const REDIS_URL = process.env.REDIS_URL;
export const ALLOW_ORIGINS = process.env.ALLOW_ORIGINS?.split(",") || [];
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const KEY = process.env.KEY;
