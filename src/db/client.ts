import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { existsSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { homedir } from "os";

// DB_PATH:
// - Local dev: ~/.devforge/devforge.db (shared with DevForge private)
// - Server:    /opt/devforge-portal/devforge.db (separate, synced via API)
const dbPath = process.env.DB_PATH?.replace("~", homedir())
  ?? resolve(homedir(), ".devforge", "devforge.db");

const dir = dirname(dbPath);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
