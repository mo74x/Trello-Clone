import { Redis } from 'ioredis';

const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
});

redis.ping().then((result) => {
    console.log('Redis connection successful:', result);
    redis.disconnect();
    process.exit(0);
}).catch((err) => {
    console.error('Redis connection failed:', err);
    process.exit(1);
});
