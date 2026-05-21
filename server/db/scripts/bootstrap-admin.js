import { safeWriteAuditEvent } from "../../src/audit/auditService.js";
import { createOrPromoteAdmin } from "../../src/auth/userStore.js";

function isTruthy(value) {
  return String(value || "").toLowerCase() === "true";
}

function validateInputs({ email, password }) {
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }
}

async function run() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME || "Admin";
  const lastName = process.env.ADMIN_LAST_NAME || "User";
  const allowPromoteExisting = isTruthy(process.env.ADMIN_PROMOTE_EXISTING);

  validateInputs({ email, password });

  const result = await createOrPromoteAdmin({
    firstName,
    lastName,
    email,
    password,
    allowPromoteExisting
  });

  await safeWriteAuditEvent({
    eventType: `admin.bootstrap.${result.action}`,
    result: "success",
    actorUserId: result.user.id,
    targetType: "user",
    targetId: String(result.user.id),
    metadata: {
      email: result.user.email,
      bootstrapAction: result.action
    }
  });

  console.log(`Admin bootstrap complete: ${result.action} (${result.user.email})`);
}

run().catch(async (error) => {
  await safeWriteAuditEvent({
    eventType: "admin.bootstrap.failed",
    result: "failure",
    metadata: {
      error: error.message
    }
  });
  console.error(`Admin bootstrap failed: ${error.message}`);
  process.exitCode = 1;
});
