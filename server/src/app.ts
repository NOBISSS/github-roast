import "dotenv/config";

import express from "express";
import cors from "cors";

import roastRoutes from "./routes/roast.routes.js";
import { roastRateLimiter } from "./middleware/rateLimiter.js";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
    }),
);

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "GitHub Roast API is running! 🔥",
    });
});

app.use("/api/roast", roastRateLimiter, roastRoutes);

export default app;