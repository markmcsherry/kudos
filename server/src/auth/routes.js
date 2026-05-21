import express from "express";
import { safeWriteAuditEvent } from "../audit/auditService.js";
import { getLockoutState, recordFailure, recordSuccess } from "./loginThrottle.js";
import passport from "./passport.js";
import { createUser } from "./userStore.js";

const router = express.Router();

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    safeWriteAuditEvent({
      eventType: "auth.register.failure",
      result: "failure",
      sourceIp: req.ip,
      metadata: { reason: "missing_fields", email: email || null }
    });
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!validateEmail(email)) {
    safeWriteAuditEvent({
      eventType: "auth.register.failure",
      result: "failure",
      sourceIp: req.ip,
      metadata: { reason: "invalid_email", email }
    });
    return res.status(400).json({ error: "Email format is invalid." });
  }
  if (password.length < 8) {
    safeWriteAuditEvent({
      eventType: "auth.register.failure",
      result: "failure",
      sourceIp: req.ip,
      metadata: { reason: "weak_password", email }
    });
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    const created = await createUser({ firstName, lastName, email, password });
    if (!created) {
      safeWriteAuditEvent({
        eventType: "auth.register.failure",
        result: "failure",
        sourceIp: req.ip,
        metadata: { reason: "duplicate_email", email }
      });
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    safeWriteAuditEvent({
      eventType: "auth.register.success",
      result: "success",
      actorUserId: created.id,
      sourceIp: req.ip,
      metadata: { email: created.email }
    });

    return res.status(201).json({ user: created });
  } catch {
    safeWriteAuditEvent({
      eventType: "auth.register.failure",
      result: "failure",
      sourceIp: req.ip,
      metadata: { reason: "server_error", email: email || null }
    });
    return res.status(500).json({ error: "Unable to register right now." });
  }
});

router.post("/login", (req, res, next) => {
  const lockoutState = getLockoutState({
    email: req.body?.email,
    sourceIp: req.ip
  });

  if (lockoutState.locked) {
    safeWriteAuditEvent({
      eventType: "auth.login.locked",
      result: "denied",
      sourceIp: req.ip,
      metadata: {
        email: req.body?.email || null,
        retryAfterMs: lockoutState.retryAfterMs
      }
    });
    return res.status(429).json({ error: "Too many failed attempts. Try again later." });
  }

  passport.authenticate("local", (authError, user) => {
    if (authError) {
      return next(authError);
    }
    if (!user) {
      const failureState = recordFailure({ email: req.body?.email, sourceIp: req.ip });
      safeWriteAuditEvent({
        eventType: "auth.login.failure",
        result: "failure",
        sourceIp: req.ip,
        metadata: {
          email: req.body?.email,
          throttled: failureState.locked
        }
      });
      if (failureState.locked) {
        safeWriteAuditEvent({
          eventType: "auth.login.locked",
          result: "denied",
          sourceIp: req.ip,
          metadata: { email: req.body?.email || null }
        });
        return res.status(429).json({ error: "Too many failed attempts. Try again later." });
      }
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      recordSuccess({ email: user.email, sourceIp: req.ip });
      const now = Date.now();
      req.session.authMeta = {
        loginAt: now,
        lastActivityAt: now
      };
      safeWriteAuditEvent({
        eventType: "auth.login.success",
        result: "success",
        actorUserId: user.id,
        sourceIp: req.ip,
        metadata: { email: user.email }
      });
      return res.json({ user });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  const actorUserId = req.user?.id ?? null;
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      safeWriteAuditEvent({
        eventType: "auth.logout.success",
        result: "success",
        actorUserId,
        sourceIp: req.ip
      });
      res.json({ status: "ok" });
    });
    return undefined;
  });
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    safeWriteAuditEvent({
      eventType: "auth.me.failure",
      result: "failure",
      sourceIp: req.ip,
      metadata: { reason: "unauthenticated" }
    });
    return res.status(401).json({ error: "Unauthorized" });
  }
  safeWriteAuditEvent({
    eventType: "auth.me.success",
    result: "success",
    actorUserId: req.user?.id ?? null,
    sourceIp: req.ip
  });
  return res.json({ user: req.user });
});

export default router;
