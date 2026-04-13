/**
 * database.js
 * Uses node-sqlite3-wasm (pure WebAssembly — zero native compilation needed).
 * Exposes a thin wrapper that mirrors the better-sqlite3 API so routes stay clean.
 */
const { Database: WasmDB } = require('node-sqlite3-wasm');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../memoria.db');

const _raw = new WasmDB(DB_PATH);

// Pragmas (WAL mode + foreign key enforcement)
_raw.exec('PRAGMA journal_mode = WAL');
_raw.exec('PRAGMA foreign_keys = ON');

// Schema
_raw.exec(`
  CREATE TABLE IF NOT EXISTS decks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    color       TEXT    DEFAULT '#7c3aed',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cards (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id     INTEGER NOT NULL,
    front       TEXT    NOT NULL,
    back        TEXT    NOT NULL,
    code        TEXT    DEFAULT '',
    language    TEXT    DEFAULT 'javascript',
    ease_factor REAL    DEFAULT 2.5,
    interval    INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    due_date    DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id     INTEGER NOT NULL,
    quality     INTEGER NOT NULL,
    reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
  );
`);

/**
 * Thin better-sqlite3-compatible wrapper.
 * Usage: db.prepare('SELECT …').all(p1, p2)
 *         db.prepare('INSERT …').run(p1, p2)  → { lastInsertRowid, changes }
 *         db.prepare('SELECT …').get(p1)       → row | null
 */
const db = {
  prepare(sql) {
    return {
      all:  (...args) => _raw.all(sql, args.flat()),
      get:  (...args) => _raw.get(sql, args.flat()) ?? null,
      run:  (...args) => _raw.run(sql, args.flat()),
    };
  },
  exec(sql) { _raw.exec(sql); },
};

module.exports = db;
