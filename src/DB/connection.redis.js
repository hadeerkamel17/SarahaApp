import { createClient } from "redis";
import { REDIS_URL } from "./../../config/config.service.js";

export const redis_client = createClient({
  url: REDIS_URL,
});

const connectionRedis = async () => {
  await redis_client
    .connect()
    .then(() => {
      console.log("Redis Connected Successfully ...😉 😉 😉 😉");
    })
    .catch((err) => {
      console.log("Redis Connected Failed ...😒 😒 😒 😒");
    });
};

export default connectionRedis;
