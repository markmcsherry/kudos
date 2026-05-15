import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import request from "supertest";
import app from "../src/app.js";

describe("auth routes", () => {
  it("registers then logs in and returns current user", async () => {
    const agent = request.agent(app);
    const email = `casey+${crypto.randomUUID()}@example.com`;

    const registerResponse = await agent.post("/auth/register").send({
      firstName: "Casey",
      lastName: "Jones",
      email,
      password: "password123"
    });
    assert.equal(registerResponse.status, 201);
    assert.equal(registerResponse.body.user.email, email);

    const loginResponse = await agent.post("/auth/login").send({
      email,
      password: "password123"
    });
    assert.equal(loginResponse.status, 200);
    assert.equal(loginResponse.body.user.email, email);
    assert.equal(Object.hasOwn(loginResponse.body.user, "password"), false);
    assert.equal(Object.hasOwn(loginResponse.body.user, "passwordHash"), false);

    const meResponse = await agent.get("/auth/me");
    assert.equal(meResponse.status, 200);
    assert.equal(meResponse.body.user.email, email);
  });

  it("uses generic message for invalid login", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "unknown@example.com",
      password: "wrongpass"
    });
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "Invalid email or password");
  });

  it("rejects weak registration password", async () => {
    const response = await request(app).post("/auth/register").send({
      firstName: "Pat",
      lastName: "Short",
      email: "pat@example.com",
      password: "short"
    });
    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Password must be at least 8 characters.");
  });
});
