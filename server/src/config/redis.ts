import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
});

redis.on("connect", () => {
    console.log("[Redis] Connecting...");
});

redis.on("ready", () => {
    console.log("[Redis] Connection ready.");
});

redis.on("error", (error: Error) => {
    console.error("[Redis] Connection error:", error.message);
});

redis.on("close", () => {
    console.warn("[Redis] Connection closed.");
});

export async function connectRedis(): Promise<void> {
    if (redis.status === "wait") {
        await redis.connect();
    }

    if (redis.status !== "ready") {
        throw new Error(
            `Redis connection is not ready. Current status: ${redis.status}`,
        );
    }
}

export async function disconnectRedis(): Promise<void> {
    if (redis.status !== "end") {
        await redis.quit();
    }
}