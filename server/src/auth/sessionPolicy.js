import { safeWriteAuditEvent } from "../audit/auditService.js";

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function getSessionPolicy() {
  return {
    idleTimeoutMs: toPositiveInt(process.env.SESSION_IDLE_TIMEOUT_MS, 1000 * 60 * 30),
    absoluteTimeoutMs: toPositiveInt(process.env.SESSION_ABSOLUTE_TIMEOUT_MS, 1000 * 60 * 60 * 8)
  };
}

function shouldSkipPath(pathname) {
  return pathname === "/auth/login" || pathname === "/auth/register" || pathname === "/auth/logout";
}

export async function enforceSessionPolicy(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated() || shouldSkipPath(req.path)) {
    return next();
  }

  const now = Date.now();
  const policy = getSessionPolicy();

  if (!req.session.authMeta) {
    req.session.authMeta = {
      loginAt: now,
      lastActivityAt: now
    };
    return next();
  }

  const loginAt = Number(req.session.authMeta.loginAt || now);
  const lastActivityAt = Number(req.session.authMeta.lastActivityAt || loginAt);

  const idleExpired = now - lastActivityAt > policy.idleTimeoutMs;
  const absoluteExpired = now - loginAt > policy.absoluteTimeoutMs;

  if (idleExpired || absoluteExpired) {
    const actorUserId = req.user?.id ?? null;
    const reason = idleExpired ? "idle_timeout" : "absolute_timeout";
    req.logout(() => {
      req.session.destroy(async () => {
        await safeWriteAuditEvent({
          eventType: "auth.session.timeout",
          result: "failure",
          actorUserId,
          sourceIp: req.ip,
          metadata: {
            reason,
            path: req.originalUrl || req.path
          }
        });
        res.status(401).json({ error: "Session expired. Please sign in again." });
      });
    });
    return undefined;
  }

  req.session.authMeta.lastActivityAt = now;
  return next();
}
