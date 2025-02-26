import Redis from "ioredis";

export const redisConfig = {
  port: 6379,
  host: "127.0.0.1",
};

const redisConnection = new Redis(redisConfig);
export default redisConnection;
