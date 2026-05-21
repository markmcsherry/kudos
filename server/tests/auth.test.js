import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import request from "supertest";
import { clearLoginThrottleStore } from "../src/auth/loginThrottle.js";
import { createOrPromoteAdmin } from "../src/auth/userStore.js";
import app from "../src/app.js";

const DEFAULT_IDLE_TIMEOUT = process.env.SESSION_IDLE_TIMEOUT_MS;
const DEFAULT_ABSOLUTE_TIMEOUT = process.env.SESSION_ABSOLUTE_TIMEOUT_MS;
const DEFAULT_LOGIN_FAILURE_THRESHOLD = process.env.LOGIN_FAILURE_THRESHOLD;
const DEFAULT_LOGIN_FAILURE_WINDOW_MS = process.env.LOGIN_FAILURE_WINDOW_MS;
const DEFAULT_LOGIN_LOCKOUT_MS = process.env.LOGIN_LOCKOUT_MS;

afterEach(() => {
  clearLoginThrottleStore();
  process.env.SESSION_IDLE_TIMEOUT_MS = DEFAULT_IDLE_TIMEOUT;
  process.env.SESSION_ABSOLUTE_TIMEOUT_MS = DEFAULT_ABSOLUTE_TIMEOUT;
  process.env.LOGIN_FAILURE_THRESHOLD = DEFAULT_LOGIN_FAILURE_THRESHOLD;
  process.env.LOGIN_FAILURE_WINDOW_MS = DEFAULT_LOGIN_FAILURE_WINDOW_MS;
  process.env.LOGIN_LOCKOUT_MS = DEFAULT_LOGIN_LOCKOUT_MS;
});

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
    assert.equal(loginResponse.body.user.isAdmin, false);
    assert.equal(Object.hasOwn(loginResponse.body.user, "password"), false);
    assert.equal(Object.hasOwn(loginResponse.body.user, "passwordHash"), false);

    const meResponse = await agent.get("/auth/me");
    assert.equal(meResponse.status, 200);
    assert.equal(meResponse.body.user.email, email);
    assert.equal(meResponse.body.user.isAdmin, false);
  });

  it("uses generic message for invalid login", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "unknown@example.com",
      password: "wrongpass"
    });
    assert.equal(response.status, 401);
    assert.equal(response.body.error, "Invalid email or password");
  });

  it("locks login attempts after configured threshold", async () => {
    process.env.LOGIN_FAILURE_THRESHOLD = "2";
    process.env.LOGIN_FAILURE_WINDOW_MS = "60000";
    process.env.LOGIN_LOCKOUT_MS = "60000";

    const first = await request(app).post("/auth/login").send({
      email: "blocked@example.com",
      password: "wrongpass"
    });
    assert.equal(first.status, 401);

    const second = await request(app).post("/auth/login").send({
      email: "blocked@example.com",
      password: "wrongpass"
    });
    assert.equal(second.status, 429);
    assert.equal(second.body.error, "Too many failed attempts. Try again later.");

    const third = await request(app).post("/auth/login").send({
      email: "blocked@example.com",
      password: "wrongpass"
    });
    assert.equal(third.status, 429);
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

  it("promotes existing user to admin only with explicit intent", async () => {
    const email = `promote+${crypto.randomUUID()}@example.com`;
    await request(app).post("/auth/register").send({
      firstName: "Promo",
      lastName: "User",
      email,
      password: "password123"
    });

    await assert.rejects(
      () =>
        createOrPromoteAdmin({
          firstName: "Promo",
          lastName: "User",
          email,
          password: "password123",
          allowPromoteExisting: false
        }),
      /ADMIN_PROMOTE_EXISTING=true/
    );

    const promoted = await createOrPromoteAdmin({
      firstName: "Promo",
      lastName: "User",
      email,
      password: "password123",
      allowPromoteExisting: true
    });

    assert.equal(promoted.action, "promoted");
    assert.equal(promoted.user.isAdmin, true);
  });

  it("expires authenticated session after idle timeout", async () => {
    process.env.SESSION_IDLE_TIMEOUT_MS = "1";
    process.env.SESSION_ABSOLUTE_TIMEOUT_MS = "100000";

    const agent = request.agent(app);
    const email = `idle+${crypto.randomUUID()}@example.com`;

    await agent.post("/auth/register").send({
      firstName: "Idle",
      lastName: "Timeout",
      email,
      password: "password123"
    });

    const loginResponse = await agent.post("/auth/login").send({
      email,
      password: "password123"
    });
    assert.equal(loginResponse.status, 200);

    await new Promise((resolve) => setTimeout(resolve, 10));

    const meResponse = await agent.get("/auth/me");
    assert.equal(meResponse.status, 401);
    assert.equal(meResponse.body.error, "Session expired. Please sign in again.");
  });
});
