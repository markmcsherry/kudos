import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { checkDatabaseHealth } from "../db/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, "../../client/dist");

const app = express();

app.get("/health", async (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  try {
    await checkDatabaseHealth();
    res.json({ status: "ok", database: "up" });
  } catch {
    res.status(503).json({ status: "degraded", database: "down" });
  }
});

app.use(express.static(staticDir));

app.get("*", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

export default app;
