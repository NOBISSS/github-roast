import { redis } from "../config/redis.js";

class RoastCache {
    async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
        if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
            throw new Error("Cache TTL must be a positive number.");
        }

        const serializedData = JSON.stringify(data);
        const ttlSeconds = Math.ceil(ttlMs / 1000);

        await redis.set(key, serializedData, "EX", ttlSeconds);
    }

    async get<T>(key: string): Promise<T | null> {
        const cachedData = await redis.get(key);

        if (cachedData === null) {
            return null;
        }

        return JSON.parse(cachedData) as T;
    }

    async delete(key: string): Promise<void> {
        await redis.del(key);
    }

    async clear(): Promise<void> {
        // Only delete keys belonging to this application's cache.
        let cursor = "0";

        do {
            const [nextCursor, keys] = await redis.scan(
                cursor,
                "MATCH",
                "github-roast:cache:*",
                "COUNT",
                100,
            );

            cursor = nextCursor;

            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } while (cursor !== "0");
    }
}

export const roastCache = new RoastCache();