import { existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { homedir } from "os";

const DATABASE_URL = process.env.DATABASE_URL;

let db: any;

if (DATABASE_URL && DATABASE_URL.startsWith("postgres")) {
  // PostgreSQL for production
  const { drizzle } = require("drizzle-orm/node-postgres");
  const { Pool } = require("pg");
  const schema = require("./schema");
  const pool = new Pool({ connectionString: DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  // SQLite for local development
  const { drizzle } = require("drizzle-orm/better-sqlite3");
  const Database = require("better-sqlite3");
  const schema = require("./schema");

  const dbPath =
    process.env.DB_PATH?.replace("~", homedir()) ??
    resolve(homedir(), ".devforge", "devforge.db");
  const dir = dirname(dbPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  db = drizzle(sqlite, { schema });
}

export { db };
