// db.js
// Uses Node.js's BUILT-IN node:sqlite module -- no native compilation,
// no Visual Studio Build Tools, no node-gyp required. Ships with Node itself
// (available in Node.js v22.5+ / stable in recent versions like v24).

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'students.db');
const db = new DatabaseSync(DB_PATH);

console.log('Connected to SQLite database at', DB_PATH);

// Create the students table if it does not already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    course TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 6),
    phone TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

console.log('Students table is ready.');

module.exports = db;
