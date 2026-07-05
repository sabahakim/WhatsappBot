const Database = require('better-sqlite3');

const db = new Database('./data/bot.db');
// إنشاء جدول المستخدمين
db.prepare(`
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL,
    short_cut TEXT UNIQUE,
    TheNote TEXT,
    file_path TEXT
)
`).run();

module.exports = db;

