import express from "express";
import { withClient } from "../../db/client.js";
import { safeWriteAuditEvent } from "../audit/auditService.js";
import { createUser } from "../auth/userStore.js";
import { listUsers } from "./userDirectoryService.js";

const router = express.Router();

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCreatePayload({ firstName, lastName, email, password, status }) {
  const errors = {};

  if (!String(firstName || "").trim()) {
    errors.firstName = "First name is required.";
  }
  if (!String(lastName || "").trim()) {
    errors.lastName = "Last name is required.";
  }
  if (!String(email || "").trim()) {
    errors.email = "Email is required.";
  } else if (!validateEmail(String(email))) {
    errors.email = "Email format is invalid.";
  }
  if (!String(password || "")) {
    errors.password = "Password is required.";
  } else if (String(password).length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (status !== undefined) {
    const safeStatus = String(status || "").trim().toLowerCase();
    if (!["active", "inactive"].includes(safeStatus)) {
      errors.status = "Status must be active or inactive.";
    }
  }

  return errors;
}

function normalizeStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "inactive" ? "inactive" : "active";
}

function validateUpdatePayload(payload) {
  const allowedFields = new Set(["firstName", "lastName", "email", "status"]);
  const incomingKeys = Object.keys(payload || {});
  const unknownKeys = incomingKeys.filter((key) => !allowedFields.has(key));
  if (unknownKeys.length > 0) {
    return {
      errors: { _form: "Unsupported fields were provided." },
      hasChanges: false
    };
  }

  const errors = {};
  if (!incomingKeys.length) {
    errors._form = "At least one field must be provided.";
  }

  if (incomingKeys.includes("firstName") && !String(payload.firstName || "").trim()) {
    errors.firstName = "First name is required.";
  }
  if (incomingKeys.includes("lastName") && !String(payload.lastName || "").trim()) {
    errors.lastName = "Last name is required.";
  }
  if (incomingKeys.includes("email")) {
    const safeEmail = String(payload.email || "").trim();
    if (!safeEmail) {
      errors.email = "Email is required.";
    } else if (!validateEmail(safeEmail)) {
      errors.email = "Email format is invalid.";
    }
  }
  if (incomingKeys.includes("status")) {
    const safeStatus = String(payload.status || "").trim().toLowerCase();
    if (!["active", "inactive"].includes(safeStatus)) {
      errors.status = "Status must be active or inactive.";
    }
  }

  return {
    errors,
    hasChanges: incomingKeys.length > 0
  };
}

router.get("/", async (req, res) => {
  try {
    const result = await listUsers({
      page: req.query.page,
      pageSize: req.query.pageSize,
      search: req.query.search,
      status: req.query.status
    });

    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Unable to load users." });
  }
});

router.post("/", async (req, res) => {
  const firstName = String(req.body?.firstName || "").trim();
  const lastName = String(req.body?.lastName || "").trim();
  const email = String(req.body?.email || "").trim();
  const password = String(req.body?.password || "");
  const status = req.body?.status;

  const validationErrors = validateCreatePayload({ firstName, lastName, email, password, status });
  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ error: "Invalid user input.", fieldErrors: validationErrors });
  }

  try {
    const created = await createUser({ firstName, lastName, email, password, status: normalizeStatus(status) });
    if (!created) {
      return res.status(409).json({
        error: "An account with that email already exists.",
        fieldErrors: { email: "An account with that email already exists." }
      });
    }

    await safeWriteAuditEvent({
      eventType: "admin.users.create.success",
      result: "success",
      actorUserId: req.user?.id ?? null,
      targetType: "user",
      targetId: String(created.id),
      sourceIp: req.ip,
      metadata: {
        createdUserEmail: created.email,
        createdUserIsAdmin: created.isAdmin
      }
    });

    return res.status(201).json({ user: created });
  } catch {
    await safeWriteAuditEvent({
      eventType: "admin.users.create.failure",
      result: "failure",
      actorUserId: req.user?.id ?? null,
      targetType: "user",
      sourceIp: req.ip,
      metadata: { email, reason: "server_error" }
    });
    return res.status(500).json({ error: "Unable to create user." });
  }
});

router.patch("/:id", async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid user id." });
  }

  const { errors } = validateUpdatePayload(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Invalid user input.", fieldErrors: errors });
  }

  const firstName = req.body.firstName === undefined ? undefined : String(req.body.firstName).trim();
  const lastName = req.body.lastName === undefined ? undefined : String(req.body.lastName).trim();
  const email = req.body.email === undefined ? undefined : String(req.body.email).trim().toLowerCase();
  const status = req.body.status === undefined ? undefined : normalizeStatus(req.body.status);

  try {
    const updated = await withClient(async (client) => {
      const existingResult = await client.query(
        `
          SELECT id, first_name, last_name, email, is_admin, status
          FROM users
          WHERE id = $1
          LIMIT 1
        `,
        [userId]
      );
      if (existingResult.rowCount === 0) {
        return null;
      }

      const existing = existingResult.rows[0];
      const nextFirstName = firstName ?? existing.first_name;
      const nextLastName = lastName ?? existing.last_name;
      const nextEmail = email ?? existing.email;
      const nextStatus = status ?? existing.status;

      try {
        const updateResult = await client.query(
          `
            UPDATE users
            SET first_name = $2,
                last_name = $3,
                email = $4,
                status = $5,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, first_name, last_name, email, is_admin, status, created_at, updated_at
          `,
          [userId, nextFirstName, nextLastName, nextEmail, nextStatus]
        );

        const row = updateResult.rows[0];
        return {
          user: {
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            isAdmin: row.is_admin,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          },
          previous: {
            firstName: existing.first_name,
            lastName: existing.last_name,
            email: existing.email,
            status: existing.status
          }
        };
      } catch (error) {
        if (error.code === "23505") {
          return { duplicateEmail: true };
        }
        throw error;
      }
    });

    if (!updated) {
      return res.status(404).json({ error: "User not found." });
    }

    if (updated.duplicateEmail) {
      return res.status(409).json({
        error: "An account with that email already exists.",
        fieldErrors: { email: "An account with that email already exists." }
      });
    }

    const changedFields = Object.entries(updated.previous)
      .filter(([key, value]) => {
        if (key === "firstName") return updated.user.firstName !== value;
        if (key === "lastName") return updated.user.lastName !== value;
        if (key === "email") return updated.user.email !== value;
        if (key === "status") return updated.user.status !== value;
        return false;
      })
      .map(([key]) => key);

    await safeWriteAuditEvent({
      eventType: "admin.users.update.success",
      result: "success",
      actorUserId: req.user?.id ?? null,
      targetType: "user",
      targetId: String(updated.user.id),
      sourceIp: req.ip,
      metadata: {
        changedFields,
        previousStatus: updated.previous.status,
        newStatus: updated.user.status
      }
    });

    return res.json({ user: updated.user });
  } catch {
    await safeWriteAuditEvent({
      eventType: "admin.users.update.failure",
      result: "failure",
      actorUserId: req.user?.id ?? null,
      targetType: "user",
      targetId: String(userId),
      sourceIp: req.ip,
      metadata: { reason: "server_error" }
    });
    return res.status(500).json({ error: "Unable to update user." });
  }
});

export default router;
