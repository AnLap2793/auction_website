const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default', 
    password: 'Prf9b4ktZgXOvalIUxXF1QN1cVO5Q5W2',
    socket: {
        host: 'redis-12226.c80.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 12226
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

// Kết nối Redis khi khởi động
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Đã kết nối thành công với Redis');
    } catch (error) {
        console.error('Lỗi kết nối Redis:', error);
    }
};

module.exports = { redisClient, connectRedis }; 