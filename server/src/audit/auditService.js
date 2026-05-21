import { withClient } from "../../db/client.js";

const SENSITIVE_METADATA_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "sessionId",
  "cookie"
]);

function redactMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !SENSITIVE_METADATA_KEYS.has(key))
      .map(([key, value]) => [key, value === undefined ? null : value])
  );
}

export async function writeAuditEvent({
  eventType,
  result,
  actorUserId = null,
  targetType = null,
  targetId = null,
  requestId = null,
  correlationId = null,
  sourceIp = null,
  metadata = {}
}) {
  if (!eventType || !result) {
    throw new Error("eventType and result are required");
  }

  const redactedMetadata = redactMetadata(metadata);

  return withClient(async (client) => {
    const insertResult = await client.query(
      `
        INSERT INTO audit_events (
          event_type,
          result,
          actor_user_id,
          target_type,
          target_id,
          request_id,
          correlation_id,
          source_ip,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        RETURNING id, occurred_at
      `,
      [
        eventType,
        result,
        actorUserId,
        targetType,
        targetId,
        requestId,
        correlationId,
        sourceIp,
        JSON.stringify(redactedMetadata)
      ]
    );

    return insertResult.rows[0];
  });
}

export async function safeWriteAuditEvent(payload) {
  try {
    await writeAuditEvent(payload);
  } catch {
    return null;
  }
  return true;
}

export async function listAuditEvents({
  page = 1,
  pageSize = 20,
  from = null,
  to = null,
  eventType = null,
  actorUserId = null,
  result = null
}) {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safePageSize = Number.isFinite(Number(pageSize))
    ? Math.min(100, Math.max(1, Number(pageSize)))
    : 20;
  const offset = (safePage - 1) * safePageSize;

  const where = [];
  const values = [];

  if (from) {
    values.push(from);
    where.push(`occurred_at >= $${values.length}`);
  }
  if (to) {
    values.push(to);
    where.push(`occurred_at <= $${values.length}`);
  }
  if (eventType) {
    values.push(eventType);
    where.push(`event_type = $${values.length}`);
  }
  if (actorUserId) {
    values.push(Number(actorUserId));
    where.push(`actor_user_id = $${values.length}`);
  }
  if (result) {
    values.push(result);
    where.push(`result = $${values.length}`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const countSql = `SELECT COUNT(*)::int AS total FROM audit_events ${whereSql}`;

  values.push(safePageSize);
  const limitParam = `$${values.length}`;
  values.push(offset);
  const offsetParam = `$${values.length}`;

  const dataSql = `
    SELECT
      id,
      occurred_at,
      event_type,
      event_version,
      result,
      actor_user_id,
      target_type,
      target_id,
      request_id,
      correlation_id,
      source_ip,
      metadata
    FROM audit_events
    ${whereSql}
    ORDER BY occurred_at DESC, id DESC
    LIMIT ${limitParam}
    OFFSET ${offsetParam}
  `;

  return withClient(async (client) => {
    const [countResult, dataResult] = await Promise.all([
      client.query(countSql, values.slice(0, values.length - 2)),
      client.query(dataSql, values)
    ]);

    return {
      page: safePage,
      pageSize: safePageSize,
      total: countResult.rows[0].total,
      items: dataResult.rows
    };
  });
}
