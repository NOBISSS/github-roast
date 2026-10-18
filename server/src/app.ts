import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import roastRoutes from "./routes/roast.routes";

dotenv.config();

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

app.use("/api/roast", roastRoutes);

export default app;