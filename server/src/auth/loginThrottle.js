const attempts = new Map();

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function getPolicy() {
  return {
    threshold: toPositiveInt(process.env.LOGIN_FAILURE_THRESHOLD, 5),
    windowMs: toPositiveInt(process.env.LOGIN_FAILURE_WINDOW_MS, 1000 * 60 * 15),
    lockoutMs: toPositiveInt(process.env.LOGIN_LOCKOUT_MS, 1000 * 60 * 15)
  };
}

function keyFor(email, sourceIp) {
  return `${String(email || "").trim().toLowerCase()}|${sourceIp || "unknown"}`;
}

export function getLockoutState({ email, sourceIp, now = Date.now() }) {
  const key = keyFor(email, sourceIp);
  const current = attempts.get(key);
  if (!current) {
    return { locked: false, retryAfterMs: 0 };
  }

  if (current.lockedUntil && current.lockedUntil > now) {
    return { locked: true, retryAfterMs: current.lockedUntil - now };
  }

  if (current.lockedUntil && current.lockedUntil <= now) {
    attempts.delete(key);
  }

  return { locked: false, retryAfterMs: 0 };
}

export function recordFailure({ email, sourceIp, now = Date.now() }) {
  const key = keyFor(email, sourceIp);
  const policy = getPolicy();
  const current = attempts.get(key);

  if (!current || now - current.windowStart > policy.windowMs) {
    const entry = { failures: 1, windowStart: now, lockedUntil: null };
    attempts.set(key, entry);
    return { locked: false, remaining: policy.threshold - 1 };
  }

  current.failures += 1;
  if (current.failures >= policy.threshold) {
    current.lockedUntil = now + policy.lockoutMs;
    return { locked: true, remaining: 0, lockoutMs: policy.lockoutMs };
  }

  return { locked: false, remaining: Math.max(0, policy.threshold - current.failures) };
}

export function recordSuccess({ email, sourceIp }) {
  attempts.delete(keyFor(email, sourceIp));
}

export function clearLoginThrottleStore() {
  attempts.clear();
}
