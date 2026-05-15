import { withClient } from "../client.js";

async function run() {
  await withClient(async (client) => {
    await client.query("DROP TABLE IF EXISTS kudos CASCADE;");
    await client.query("DROP TABLE IF EXISTS users CASCADE;");
    await client.query("DROP TABLE IF EXISTS schema_migrations CASCADE;");
  });

  console.log("Database reset complete. Run db:migrate and db:seed next.");
}

run().catch((error) => {
  console.error("Reset failed:", error.message);
  process.exitCode = 1;
});
