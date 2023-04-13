import Redis from 'ioredis';

export class RedisClient {
  private static client: Redis;
  static init() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    RedisClient.client = new Redis({
      host: process.env.REDIS_URL,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    });
  }

  static get(): Redis {
    return RedisClient.client;
  }
}
