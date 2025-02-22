import { createClient } from "redis";

const redisUrl =
  process.env.REDIS_URL ||
  "rediss://red-cue3q0t2ng1s7381rp60:11HCvnved5Cow56fQvqVCPxmoeMtjGOi@singapore-redis.render.com:6379";

const redisClient = createClient({
  url: redisUrl,
});

redisClient.connect().catch(console.error);

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

export default redisClient;
