import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, "../../client/dist");

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(express.static(staticDir));

app.get("*", (_req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

export default app;
