const redis = require('redis');
const client = redis.createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST
});

const roomSocketHandler = (socket) => {

}
module.exports = roomSocketHandler;
