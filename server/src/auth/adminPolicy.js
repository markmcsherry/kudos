import { safeWriteAuditEvent } from "../audit/auditService.js";

function deniedMetadata(req, reason) {
  return {
    path: req.originalUrl || req.path,
    method: req.method,
    reason
  };
}

export async function requireAdmin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    await safeWriteAuditEvent({
      eventType: "security.authz.denied",
      result: "denied",
      sourceIp: req.ip,
      metadata: deniedMetadata(req, "unauthenticated")
    });
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!req.user || req.user.isAdmin !== true) {
    await safeWriteAuditEvent({
      eventType: "security.authz.denied",
      result: "denied",
      actorUserId: req.user?.id ?? null,
      sourceIp: req.ip,
      metadata: deniedMetadata(req, "not_admin")
    });
    return res.status(403).json({ error: "Forbidden" });
  }

  return next();
}
