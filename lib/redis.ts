import { Redis } from '@upstash/redis';

/**
 * Khởi tạo singleton Redis client để sử dụng trong toàn bộ project.
 * Upstash Redis sử dụng HTTP nên nó rất phù hợp với môi trường Edge Functions và Serverless.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Helper functions (tuỳ chọn)
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    return await redis.get<T>(key);
  } catch (error) {
    console.error('Redis Get Error:', error);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttlSeconds: number = 3600): Promise<void> => {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error('Redis Set Error:', error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis Delete Error:', error);
  }
};
