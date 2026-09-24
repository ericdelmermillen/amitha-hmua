import { Pool, PoolClient } from "pg";

const DB_HOST = process.env.PG_DB_HOST;
const DB_PORT = parseInt(process.env.PG_DB_PORT ?? "5432", 10);
const DB_USER = process.env.PG_DB_USER;
const DB_PASSWORD = process.env.PG_DB_PASSWORD;
const DB_NAME = process.env.PG_DB_NAME;

const DB_CONNECTION_LIMIT = parseInt(process.env.DB_CONNECTION_LIMIT ?? "10", 10);

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error("Missing required database environment variables.");
}

if (Number.isNaN(DB_PORT)) {
  throw new Error("DB_PORT must be a number.");
}

if (Number.isNaN(DB_CONNECTION_LIMIT)) {
  throw new Error("DB_CONNECTION_LIMIT must be a number.");
}

const useSSL = process.env.NODE_ENV === "production" || Boolean(process.env.AMPLIFY_BUILD_ID);

// Caches the connection pool on globalThis during local development 
// to prevent hot-reloads (HMR) from instantiating redundant pools and exhausting DB connections.
const globalForPg = globalThis as unknown as {pgPool: Pool | undefined};

const pool =
  globalForPg.pgPool ??
  new Pool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    max: DB_CONNECTION_LIMIT,
    ssl: useSSL
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

const initDb = async () => {
  let client: PoolClient | undefined;

  try {
    client = await pool.connect();
    await client.query("SELECT 1");
    console.log("PostgreSQL database connected.");
  } finally {
    if (client) {
      client.release();
    }
  }
};

export {
  pool,
  initDb
};