const db = require('./database');

// إضافة ملاحظة
function addNote(chatId, shortCut, note) {
    const stmt = db.prepare(`
        INSERT INTO notes (chat_id, short_cut, TheNote, file_path)
        VALUES (?, ?, ?, ?)
    `);

    return stmt.run(chatId, shortCut, note, null);
}

// جلب ملاحظة بالاختصار
function getNote(chatId, shortCut) {
    const stmt = db.prepare(`
        SELECT * FROM notes
        WHERE chat_id = ?
        AND short_cut = ?
    `);

    return stmt.get(chatId, shortCut);
}

// جلب جميع الملاحظات
function getAllNotes(chatId) {
    return db.prepare(`
        SELECT short_cut FROM notes
        WHERE chat_id = ?
    `).all(chatId);
}

// حذف ملاحظة
function deleteNote(chatId, shortCut) {
    return db.prepare(`
        DELETE FROM notes
        WHERE chat_id = ?
        AND short_cut = ?
    `).run(chatId, shortCut);
}

// إضافة ملف
function addFile(chatId, shortCut, filePath) {
    const stmt = db.prepare(`
        INSERT INTO notes (chat_id, short_cut, TheNote, file_path)
        VALUES (?, ?, ?, ?)
    `);

    return stmt.run(chatId, shortCut, null, filePath);
}

// جلب ملف
function getFile(chatId, shortCut) {
    const stmt = db.prepare(`
        SELECT * FROM notes
        WHERE chat_id = ?
        AND short_cut = ?
    `);

    return stmt.get(chatId, shortCut);
}

// حذف ملف
function deleteFile(chatId, shortCut) {
    return db.prepare(`
        DELETE FROM notes
        WHERE chat_id = ?
        AND short_cut = ?
    `).run(chatId, shortCut);
}

module.exports = {
    addNote,
    getNote,
    getAllNotes,
    deleteNote,
    addFile,
    getFile,
    deleteFile
};