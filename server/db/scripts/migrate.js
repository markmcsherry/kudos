import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withClient } from "../client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../migrations");

async function run() {
  await withClient(async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const files = (await fs.readdir(migrationsDir))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const existing = await client.query(
        "SELECT 1 FROM schema_migrations WHERE version = $1",
        [file]
      );

      if (existing.rowCount > 0) {
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  });

  console.log("Database migrations complete.");
}

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
});
