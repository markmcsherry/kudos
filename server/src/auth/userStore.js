import crypto from "node:crypto";
import { withClient } from "../../db/client.js";

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const left = Buffer.from(hash, "hex");
  const right = Buffer.from(derived, "hex");
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

export function createUser({ firstName, lastName, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = hashPassword(password);
  return withClient(async (client) => {
    try {
      const result = await client.query(
        `
          INSERT INTO users (first_name, last_name, email, password_hash)
          VALUES ($1, $2, $3, $4)
          RETURNING id, first_name, last_name, email
        `,
        [firstName, lastName, normalizedEmail, passwordHash]
      );
      const row = result.rows[0];
      return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email
      };
    } catch (error) {
      if (error.code === "23505") {
        return null;
      }
      throw error;
    }
  });
}

export function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  return withClient(async (client) => {
    const result = await client.query(
      `
        SELECT id, first_name, last_name, email, password_hash
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      passwordHash: row.password_hash
    };
  });
}

export function findUserById(id) {
  const userId = Number(id);
  return withClient(async (client) => {
    const result = await client.query(
      `
        SELECT id, first_name, last_name, email
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email
    };
  });
}

export async function validateCredentials(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return null;
  }
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email };
}
