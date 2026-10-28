import { createClient } from "redis";

export const redis_client = createClient({
  url: "rediss://default:gQAAAAAAA5n5AAIgcDJiMTEyMjJkMWFjOTU0MDg4Yjc1NGI1ZGViMzNlM2M5MA@sure-gnu-236025.upstash.io:6379",
});

const connectionRedis = async () => {
  await redis_client
    .connect("mongodb://localhost:27017/SarahaApp", {
      serverSelectionTimeoutMs: 5000,
    })
    .then(() => {
      console.log("Redis Connected Successfully ...😉 😉 😉 😉");
    })
    .catch((err) => {
      console.log("Redis Connected Failed ...😒 😒 😒 😒");
    });
};

export default connectionRedis;
