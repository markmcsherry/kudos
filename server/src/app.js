import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { checkDatabaseHealth } from "../db/client.js";
import adminRoutes from "./admin/routes.js";
import { requireAdmin } from "./auth/adminPolicy.js";
import passport from "./auth/passport.js";
import authRoutes from "./auth/routes.js";
import { enforceSessionPolicy } from "./auth/sessionPolicy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, "../../client/dist");

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "kudos-local-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(enforceSessionPolicy);

app.use("/auth", authRoutes);
app.use("/api/admin", requireAdmin, adminRoutes);

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
