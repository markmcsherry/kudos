import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import request from "supertest";
import { withClient } from "../db/client.js";
import app from "../src/app.js";

async function promoteToAdmin(email) {
  await withClient(async (client) => {
    await client.query("UPDATE users SET is_admin = TRUE WHERE email = $1", [email]);
  });
}

describe("admin users routes", () => {
  it("returns unauthorized for unauthenticated user list access", async () => {
    const response = await request(app).get("/api/admin/users");
    assert.equal(response.status, 401);
  });

  it("returns unauthorized for unauthenticated user mutation attempts and audits deny", async () => {
    const postResponse = await request(app).post("/api/admin/users").send({
      firstName: "Anon",
      lastName: "User",
      email: `anon+${crypto.randomUUID()}@example.com`,
      password: "password123"
    });
    assert.equal(postResponse.status, 401);

    const patchResponse = await request(app).patch("/api/admin/users/1").send({ firstName: "Nope" });
    assert.equal(patchResponse.status, 401);

    await withClient(async (client) => {
      const result = await client.query(
        `
          SELECT metadata
          FROM audit_events
          WHERE event_type = 'security.authz.denied'
            AND result = 'denied'
            AND metadata->>'reason' = 'unauthenticated'
            AND metadata->>'method' = 'PATCH'
            AND metadata->>'path' = '/api/admin/users/1'
          ORDER BY id DESC
          LIMIT 1
        `
      );

      assert.equal(result.rowCount, 1);
    });
  });

  it("returns users with partial case-insensitive search and status filter", async () => {
    const agent = request.agent(app);
    const adminEmail = `admin-users+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "Users",
      email: adminEmail,
      password: "password123"
    });
    await promoteToAdmin(adminEmail);
    await agent.post("/auth/login").send({ email: adminEmail, password: "password123" });

    const matchEmail = `john.smith+${crypto.randomUUID()}@example.com`;
    const otherEmail = `alpha+${crypto.randomUUID()}@example.com`;

    await request(app).post("/auth/register").send({
      firstName: "John",
      lastName: "Smith",
      email: matchEmail,
      password: "password123"
    });

    await request(app).post("/auth/register").send({
      firstName: "Alpha",
      lastName: "User",
      email: otherEmail,
      password: "password123"
    });

    await withClient(async (client) => {
      await client.query("UPDATE users SET status = 'inactive' WHERE email = $1", [matchEmail]);
    });

    const searchResponse = await agent.get("/api/admin/users").query({ search: "SMI" });
    assert.equal(searchResponse.status, 200);
    assert.ok(searchResponse.body.items.some((item) => item.email === matchEmail));

    const statusResponse = await agent.get("/api/admin/users").query({ status: "inactive" });
    assert.equal(statusResponse.status, 200);
    assert.ok(statusResponse.body.items.every((item) => item.status === "inactive"));
  });

  it("creates user as non-admin and writes audit event", async () => {
    const agent = request.agent(app);
    const adminEmail = `admin-create+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "Creator",
      email: adminEmail,
      password: "password123"
    });
    await promoteToAdmin(adminEmail);
    await agent.post("/auth/login").send({ email: adminEmail, password: "password123" });

    const createdEmail = `new-user+${crypto.randomUUID()}@example.com`;
    const response = await agent.post("/api/admin/users").send({
      firstName: "New",
      lastName: "User",
      email: createdEmail,
      password: "password123",
      status: "inactive"
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.user.email, createdEmail.toLowerCase());
    assert.equal(response.body.user.isAdmin, false);
    assert.equal(response.body.user.status, "inactive");

    await withClient(async (client) => {
      const eventResult = await client.query(
        `
          SELECT event_type, result, actor_user_id, target_type, target_id, metadata
          FROM audit_events
          WHERE event_type = 'admin.users.create.success'
            AND target_id = $1
          ORDER BY id DESC
          LIMIT 1
        `,
        [String(response.body.user.id)]
      );

      assert.equal(eventResult.rowCount, 1);
      assert.equal(eventResult.rows[0].result, "success");
      assert.equal(eventResult.rows[0].target_type, "user");
      assert.equal(eventResult.rows[0].metadata.createdUserEmail, createdEmail.toLowerCase());
    });
  });

  it("returns validation errors for invalid create payload", async () => {
    const agent = request.agent(app);
    const adminEmail = `admin-invalid+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "Invalid",
      email: adminEmail,
      password: "password123"
    });
    await promoteToAdmin(adminEmail);
    await agent.post("/auth/login").send({ email: adminEmail, password: "password123" });

    const response = await agent.post("/api/admin/users").send({
      firstName: "",
      lastName: "",
      email: "not-an-email",
      password: "123",
      status: "archived"
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Invalid user input.");
    assert.ok(response.body.fieldErrors.firstName);
    assert.ok(response.body.fieldErrors.lastName);
    assert.ok(response.body.fieldErrors.email);
    assert.ok(response.body.fieldErrors.password);
    assert.ok(response.body.fieldErrors.status);
  });

  it("defaults create status to active when omitted", async () => {
    const agent = request.agent(app);
    const adminEmail = `admin-default-status+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "Default",
      email: adminEmail,
      password: "password123"
    });
    await promoteToAdmin(adminEmail);
    await agent.post("/auth/login").send({ email: adminEmail, password: "password123" });

    const response = await agent.post("/api/admin/users").send({
      firstName: "Default",
      lastName: "Status",
      email: `default-status+${crypto.randomUUID()}@example.com`,
      password: "password123"
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.user.status, "active");
  });

  it("returns conflict for duplicate email during create", async () => {
    const agent = request.agent(app);
    const adminEmail = `admin-duplicate+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "Duplicate",
      email: adminEmail,
      password: "password123"
    });
    await promoteToAdmin(adminEmail);
    await agent.post("/auth/login").send({ email: adminEmail, password: "password123" });

    const duplicateEmail = `duplicate-user+${crypto.randomUUID()}@example.com`;
    await request(app).post("/auth/register").send({
      firstName: "Existing",
      lastName: "User",
      email: duplicateEmail,
      password: "password123"
    });

    const response = await agent.post("/api/admin/users").send({
      firstName: "New",
      lastName: "Attempt",
      email: duplicateEmail,
      password: "password123"
    });

    assert.equal(response.status, 409);
    assert.equal(response.body.error, "An account with that email already exists.");
    assert.ok(response.body.fieldErrors.email);
  });

  it("denies non-admin user edits", async () => {
    const nonAdminAgent = request.agent(app);
    const nonAdminEmail = `nonadmin-edit+${crypto.randomUUID()}@example.com`;
    await nonAdminAgent.post("/auth/register").send({
      firstName: "Non",
      lastName: "Admin",
      email: nonAdminEmail,
      password: "password123"
    });
    await nonAdminAgent.post("/auth/login").send({ email: nonAdminEmail, password: "password123" });

    const response = await nonAdminAgent.patch("/api/admin/users/1").send({ firstName: "Blocked" });
    assert.equal(response.status, 403);

    await withClient(async (client) => {
      const result = await client.query(
        `
          SELECT actor_user_id, metadata
          FROM audit_events
          WHERE event_type = 'security.authz.denied'
            AND result = 'denied'
            AND metadata->>'reason' = 'not_admin'
            AND metadata->>'method' = 'PATCH'
            AND metadata->>'path' = '/api/admin/users/1'
          ORDER BY id DESC
          LIMIT 1
        `
      );

      assert.equal(result.rowCount, 1);
      assert.ok(Number(result.rows[0].actor_user_id) > 0);
    });
  });

  it("updates profile fields and status with audit metadata", async () => {
    const agent = request.agent(app);
    const adminEmail = `admin-edit+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "Editor",
      email: adminEmail,
      password: "password123"
    });
    await promoteToAdmin(adminEmail);
    await agent.post("/auth/login").send({ email: adminEmail, password: "password123" });

    const targetEmail = `target+${crypto.randomUUID()}@example.com`;
    const createTarget = await request(app).post("/auth/register").send({
      firstName: "Target",
      lastName: "User",
      email: targetEmail,
      password: "password123"
    });

    const patchResponse = await agent.patch(`/api/admin/users/${createTarget.body.user.id}`).send({
      firstName: "Updated",
      lastName: "Person",
      status: "inactive"
    });

    assert.equal(patchResponse.status, 200);
    assert.equal(patchResponse.body.user.firstName, "Updated");
    assert.equal(patchResponse.body.user.lastName, "Person");
    assert.equal(patchResponse.body.user.status, "inactive");
    assert.equal(patchResponse.body.user.isAdmin, false);

    await withClient(async (client) => {
      const eventResult = await client.query(
        `
          SELECT event_type, result, metadata
          FROM audit_events
          WHERE event_type = 'admin.users.update.success'
            AND target_id = $1
          ORDER BY id DESC
          LIMIT 1
        `,
        [String(createTarget.body.user.id)]
      );

      assert.equal(eventResult.rowCount, 1);
      assert.equal(eventResult.rows[0].result, "success");
      assert.equal(eventResult.rows[0].metadata.previousStatus, "active");
      assert.equal(eventResult.rows[0].metadata.newStatus, "inactive");
      assert.ok(eventResult.rows[0].metadata.changedFields.includes("firstName"));
      assert.ok(eventResult.rows[0].metadata.changedFields.includes("status"));
    });
  });

  it("returns validation error for unsupported or invalid fields", async () => {
    const agent = request.agent(app);
    const adminEmail = `admin-invalid-edit+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "Validator",
      email: adminEmail,
      password: "password123"
    });
    await promoteToAdmin(adminEmail);
    await agent.post("/auth/login").send({ email: adminEmail, password: "password123" });

    const response = await agent.patch("/api/admin/users/1").send({ isAdmin: true });
    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Invalid user input.");
    assert.ok(response.body.fieldErrors._form);
  });

  it("returns conflict for duplicate email during update", async () => {
    const agent = request.agent(app);
    const adminEmail = `admin-dup-edit+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "DupEdit",
      email: adminEmail,
      password: "password123"
    });
    await promoteToAdmin(adminEmail);
    await agent.post("/auth/login").send({ email: adminEmail, password: "password123" });

    const first = await request(app).post("/auth/register").send({
      firstName: "First",
      lastName: "User",
      email: `first+${crypto.randomUUID()}@example.com`,
      password: "password123"
    });
    const second = await request(app).post("/auth/register").send({
      firstName: "Second",
      lastName: "User",
      email: `second+${crypto.randomUUID()}@example.com`,
      password: "password123"
    });

    const response = await agent.patch(`/api/admin/users/${second.body.user.id}`).send({
      email: first.body.user.email
    });

    assert.equal(response.status, 409);
    assert.equal(response.body.error, "An account with that email already exists.");
    assert.ok(response.body.fieldErrors.email);
  });

  it("does not store sensitive fields in audit metadata for user mutations", async () => {
    const agent = request.agent(app);
    const adminEmail = `admin-redaction+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "Redaction",
      email: adminEmail,
      password: "password123"
    });
    await promoteToAdmin(adminEmail);
    await agent.post("/auth/login").send({ email: adminEmail, password: "password123" });

    const createdEmail = `redaction-user+${crypto.randomUUID()}@example.com`;
    const createResponse = await agent.post("/api/admin/users").send({
      firstName: "Safe",
      lastName: "Create",
      email: createdEmail,
      password: "password123"
    });
    assert.equal(createResponse.status, 201);

    await agent.patch(`/api/admin/users/${createResponse.body.user.id}`).send({
      firstName: "Safer",
      status: "inactive"
    });

    await withClient(async (client) => {
      const result = await client.query(
        `
          SELECT event_type, metadata
          FROM audit_events
          WHERE event_type IN ('admin.users.create.success', 'admin.users.update.success')
            AND target_id = $1
          ORDER BY id DESC
        `,
        [String(createResponse.body.user.id)]
      );

      assert.ok(result.rowCount >= 2);
      for (const row of result.rows) {
        assert.equal(Object.hasOwn(row.metadata, "password"), false);
        assert.equal(Object.hasOwn(row.metadata, "passwordHash"), false);
      }
    });
  });
});
