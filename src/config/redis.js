const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL
});

const connectRedis = async () => {
  redisClient.on("error", (err) =>
    console.error("❌ Redis error", err)
  );

  await redisClient.connect();
  console.log("✅ Redis connected");
};

module.exports = connectRedis;
module.exports.redisClient = redisClient;