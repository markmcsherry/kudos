import { Client } from "pg";
import { getConnectionConfig } from "./config.js";

export async function withClient(work) {
  const client = new Client(getConnectionConfig());
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

export async function checkDatabaseHealth() {
  return withClient(async (client) => {
    await client.query("SELECT 1");
    return true;
  });
}
