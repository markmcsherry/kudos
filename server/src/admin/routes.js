import express from "express";
import auditRoutes from "./auditRoutes.js";

const router = express.Router();

router.get("/status", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/audit-events", auditRoutes);

export default router;
