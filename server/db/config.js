export function getDatabaseUrl() {
  return process.env.DATABASE_URL || null;
}

export function getConnectionConfig() {
  const databaseUrl = getDatabaseUrl();
  if (databaseUrl) {
    return {
      connectionString: databaseUrl
    };
  }

  return {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || "kudos_app",
    password: process.env.POSTGRES_PASSWORD || "change_me_local",
    database: process.env.POSTGRES_DB || "kudos"
  };
}
