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

describe("audit routes", () => {
  it("denies unauthenticated requests to admin audit events", async () => {
    const response = await request(app).get("/api/admin/audit-events");
    assert.equal(response.status, 401);
  });

  it("returns forbidden for authenticated non-admin user", async () => {
    const agent = request.agent(app);
    const email = `member+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Member",
      lastName: "User",
      email,
      password: "password123"
    });

    await agent.post("/auth/login").send({ email, password: "password123" });

    const response = await agent.get("/api/admin/audit-events");
    assert.equal(response.status, 403);
  });

  it("allows admin user to query paginated audit events", async () => {
    const agent = request.agent(app);
    const email = `admin+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Admin",
      lastName: "User",
      email,
      password: "password123"
    });

    await promoteToAdmin(email);

    await agent.post("/auth/login").send({ email, password: "password123" });

    const response = await agent.get("/api/admin/audit-events").query({ page: 1, pageSize: 5 });

    assert.equal(response.status, 200);
    assert.equal(response.body.page, 1);
    assert.equal(response.body.pageSize, 5);
    assert.equal(Array.isArray(response.body.items), true);
    assert.equal(typeof response.body.total, "number");

    const statusResponse = await agent.get("/api/admin/status");
    assert.equal(statusResponse.status, 200);
    assert.equal(statusResponse.body.status, "ok");
  });

  it("redacts sensitive metadata in stored audit events", async () => {
    const unique = crypto.randomUUID();
    await request(app).post("/auth/login").send({
      email: `unknown+${unique}@example.com`,
      password: "should-not-be-stored"
    });

    const event = await withClient(async (client) => {
      const result = await client.query(
        `
          SELECT metadata
          FROM audit_events
          WHERE event_type = 'auth.login.failure'
          ORDER BY id DESC
          LIMIT 1
        `
      );

      return result.rows[0];
    });

    assert.equal(Object.hasOwn(event.metadata, "password"), false);
    assert.equal(Object.hasOwn(event.metadata, "email"), true);
  });
});
