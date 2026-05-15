import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

describe("server app", () => {
  it("returns health payload", async () => {
    const response = await request(app).get("/health");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: "ok" });
  });

  it("returns db health payload", async () => {
    const response = await request(app).get("/health/db");
    assert.ok(response.status === 200 || response.status === 503);
    assert.ok(response.body.database === "up" || response.body.database === "down");
  });
});
