const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const dbPath = process.env.DATABASE_PATH || "./data/vctime.sqlite";
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  total_seconds INTEGER NOT NULL DEFAULT 0,
  active_start_ms INTEGER,
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);
`);

function nowMs() {
  return Date.now();
}

function getUser(userId) {
  let row = db.prepare("SELECT * FROM users WHERE user_id = ?").get(userId);
  if (!row) {
    const t = nowMs();
    db.prepare(`
      INSERT INTO users (user_id, total_seconds, active_start_ms, created_at_ms, updated_at_ms)
      VALUES (?, 0, NULL, ?, ?)
    `).run(userId, t, t);
    row = db.prepare("SELECT * FROM users WHERE user_id = ?").get(userId);
  }
  return row;
}

function setActiveStart(userId, activeStartMs) {
  const t = nowMs();
  db.prepare("UPDATE users SET active_start_ms = ?, updated_at_ms = ? WHERE user_id = ?")
    .run(activeStartMs, t, userId);
}

function addSeconds(userId, seconds) {
  const t = nowMs();
  db.prepare("UPDATE users SET total_seconds = MAX(total_seconds + ?, 0), updated_at_ms = ? WHERE user_id = ?")
    .run(seconds, t, userId);
}

function clearActive(userId) {
  const t = nowMs();
  db.prepare("UPDATE users SET active_start_ms = NULL, updated_at_ms = ? WHERE user_id = ?")
    .run(t, userId);
}

module.exports = {
  getUser,
  setActiveStart,
  addSeconds,
  clearActive
};
