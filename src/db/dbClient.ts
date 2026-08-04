import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST;
const DB_PORT = parseInt(process.env.DB_PORT ?? "3306", 10);
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

const DB_CONNECTION_LIMIT = parseInt(
	process.env.DB_CONNECTION_LIMIT ?? "10",
	10
);

const DB_QUEUE_LIMIT = parseInt(
	process.env.DB_QUEUE_LIMIT ?? "0",
	10
);

if (!DB_HOST || !DB_USER || !DB_NAME) {
	throw new Error("Missing required database environment variables.");
}

if (Number.isNaN(DB_PORT)) {
	throw new Error("DB_PORT must be a number.");
}

if (Number.isNaN(DB_CONNECTION_LIMIT)) {
	throw new Error("DB_CONNECTION_LIMIT must be a number.");
}

if (Number.isNaN(DB_QUEUE_LIMIT)) {
	throw new Error("DB_QUEUE_LIMIT must be a number.");
}

const useSSL =
	process.env.NODE_ENV === "production" ||
	!!process.env.AMPLIFY_BUILD_ID;

const globalForMysql = globalThis as unknown as {
	mysqlPool: mysql.Pool | undefined;
};

const pool =
	globalForMysql.mysqlPool ??
	mysql.createPool({
		host: DB_HOST,
		port: DB_PORT,
		user: DB_USER,
		password: DB_PASSWORD,
		database: DB_NAME,
		waitForConnections: true,
		connectionLimit: DB_CONNECTION_LIMIT,
		queueLimit: DB_QUEUE_LIMIT,
		ssl: useSSL
			? {
					rejectUnauthorized: false,
			  }
			: undefined,
	});

if (process.env.NODE_ENV !== "production") {
	globalForMysql.mysqlPool = pool;
}

const initDb = async () => {
	const connection = await pool.getConnection();

	try {
		await connection.query("SELECT 1");
		console.log("MySQL database connected.");
	} finally {
		connection.release();
	}
};

export {
	pool,
	initDb
};