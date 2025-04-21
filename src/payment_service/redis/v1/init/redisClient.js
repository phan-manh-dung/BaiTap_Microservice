const redis = require('redis');

// Tạo một client để kết nối tới Redis Cloud
const redisClient = redis.createClient({
  url: 'redis://:HxYilmEbMtWoNFit7zEe7MDhsBBW7Nkd@redis-11521.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com:11521/0',
});

redisClient.on('connect', () => {
  console.log('Connected to Redis Cloud successfully!');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

// Kết nối tới Redis
(async () => {
  await redisClient.connect();
  const ping = await redisClient.ping();
  console.log('Ping redis:', ping);
})();

module.exports = redisClient;
