import express from "express";
import auditRoutes from "./auditRoutes.js";
import usersRoutes from "./usersRoutes.js";

const router = express.Router();

router.get("/status", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/users", usersRoutes);
router.use("/audit-events", auditRoutes);

export default router;
