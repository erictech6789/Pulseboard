import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

export type DB = Database.Database

const SCHEMA = `
CREATE TABLE IF NOT EXISTS teams (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  plan       TEXT NOT NULL DEFAULT 'free'
);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  team_id       INTEGER NOT NULL REFERENCES teams(id),
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  kind       TEXT NOT NULL,
  detail     TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reset_tokens (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  token      TEXT NOT NULL UNIQUE,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
`

export function applySchema(db: DB): DB {
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)
  return db
}

/** An empty in-memory database with the schema applied. Used by the test suite. */
export function createTestDb(): DB {
  return applySchema(new Database(':memory:'))
}

let cached: DB | null = null

export function getDb(): DB {
  if (!cached) {
    const file = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'app.db')
    // data/ is gitignored, so a fresh clone doesn't have it and better-sqlite3
    // refuses to create the file. Make the directory before opening.
    fs.mkdirSync(path.dirname(file), { recursive: true })
    cached = applySchema(new Database(file))
  }
  return cached
}
