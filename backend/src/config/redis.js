const { createClient } = require("redis");

const redisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

// Kết nối Redis khi khởi động
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Đã kết nối thành công với Redis");
    } catch (error) {
        console.error("Lỗi kết nối Redis:", error);
    }
};

module.exports = { redisClient, connectRedis };
