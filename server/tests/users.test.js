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
});
