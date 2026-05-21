import { withClient } from "../../db/client.js";

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export async function listUsers({ page = 1, pageSize = 20, search = "", status = "all" }) {
  const safePage = toPositiveInt(page, 1);
  const safePageSize = Math.min(100, toPositiveInt(pageSize, 20));
  const safeSearch = String(search || "").trim().toLowerCase();
  const safeStatus = ["active", "inactive", "all"].includes(String(status || "all").toLowerCase())
    ? String(status || "all").toLowerCase()
    : "all";

  const where = [];
  const values = [];

  if (safeSearch) {
    values.push(`%${safeSearch}%`);
    where.push(
      `(LOWER(first_name) LIKE $${values.length} OR LOWER(last_name) LIKE $${values.length} OR LOWER(email) LIKE $${values.length})`
    );
  }

  if (safeStatus !== "all") {
    values.push(safeStatus);
    where.push(`status = $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (safePage - 1) * safePageSize;

  return withClient(async (client) => {
    const countResult = await client.query(`SELECT COUNT(*)::int AS total FROM users ${whereSql}`, values);

    const dataValues = [...values, safePageSize, offset];
    const limitParam = `$${dataValues.length - 1}`;
    const offsetParam = `$${dataValues.length}`;

    const dataResult = await client.query(
      `
        SELECT id, first_name, last_name, email, is_admin, status, created_at, updated_at
        FROM users
        ${whereSql}
        ORDER BY created_at DESC, id DESC
        LIMIT ${limitParam}
        OFFSET ${offsetParam}
      `,
      dataValues
    );

    return {
      page: safePage,
      pageSize: safePageSize,
      total: countResult.rows[0].total,
      items: dataResult.rows.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        isAdmin: row.is_admin,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    };
  });
}
