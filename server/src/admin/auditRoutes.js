import express from "express";
import { listAuditEvents } from "../audit/auditService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { page, pageSize, from, to, eventType, actorUserId, result } = req.query;

  try {
    const auditEvents = await listAuditEvents({
      page,
      pageSize,
      from,
      to,
      eventType,
      actorUserId,
      result
    });

    return res.json(auditEvents);
  } catch {
    return res.status(500).json({ error: "Unable to load audit events." });
  }
});

export default router;
