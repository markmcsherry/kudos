import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withClient } from "../client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDir = path.resolve(__dirname, "../seed");

async function run() {
  await withClient(async (client) => {
    const files = (await fs.readdir(seedDir))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const sql = await fs.readFile(path.join(seedDir, file), "utf8");
      await client.query(sql);
    }
  });

  console.log("Database seed complete.");
}

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
