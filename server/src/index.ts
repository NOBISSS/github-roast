import "dotenv/config";

import app from "./app.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
    try {
        // Connect to Redis before accepting HTTP requests.
        await connectRedis();

        const server = app.listen(PORT, () => {
            console.log(`[Server] Running on http://localhost:${PORT}`);
        });

        let isShuttingDown = false;

        async function shutdown(signal: string): Promise<void> {
            if (isShuttingDown) {
                return;
            }

            isShuttingDown = true;
            console.log(`[Server] Received ${signal}. Shutting down...`);

            // Stop accepting new requests and wait for active requests.
            server.close(async (error) => {
                if (error) {
                    console.error("[Server] Error closing HTTP server:", error);
                    process.exitCode = 1;
                }

                try {
                    await disconnectRedis();
                    console.log("[Redis] Disconnected.");
                } catch (redisError) {
                    console.error("[Redis] Error during shutdown:", redisError);
                    process.exitCode = 1;
                }

                if (error) {
                    process.exit(1);
                }
            });
        }

        process.on("SIGINT", () => {
            void shutdown("SIGINT");
        });

        process.on("SIGTERM", () => {
            void shutdown("SIGTERM");
        });
    } catch (error) {
        console.error("[Server] Failed to start:", error);

        try {
            await disconnectRedis();
        } catch (redisError) {
            console.error("[Redis] Cleanup failed:", redisError);
        }

        process.exitCode = 1;
    }
}

void startServer();