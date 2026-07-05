//data base
const notesRepo = require('../DataBase/notes');
const db = require('../DataBase/database');
//file
const fs = require('fs');
//whatsapp
const { Client, LocalAuth ,MessageMedia} = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
//owner id
const OWNER = '966557752352@c.us';


// function safeText(data) {
//     if (!data) return "فارغ";
//     if (typeof data === "string") return data;
//     if (typeof data === "number") return data.toString();
//     if (typeof data === "object") return JSON.stringify(data);
//     return String(data);
// }

//add Note
async function handleSaveCommand(msg, notesRepo) {
    const chat = await msg.getChat();

    if (!chat.isGroup) {
        await chat.sendStateTyping();
        return msg.reply('هذا الأمر للقروبات فقط');
    }

    if (!msg.hasQuotedMsg) {
        await chat.sendStateTyping();
        return msg.reply('لازم ترد على رساله عشان احفظها');
    }

    // ["!احفظ", "java"]
    const shortCut = msg.body.split(' ')[1];
    
    if (!shortCut) {
        await chat.sendStateTyping();
        return msg.reply('لازم تكتب اسم للملاحظة');
    }

    const replayMsg = await msg.getQuotedMessage();   

    try {
        if (replayMsg.hasMedia) {
            const media = await replayMsg.downloadMedia();

            // إذا ما كان فيه اسم للملف، نعطيه اسم بناءً على الوقت الحالي
            let fileName = media.filename || `${Date.now()}.bin`;
            const filePath = `data/files/${fileName}`;

            // حفظ الملف
            fs.writeFileSync(filePath, media.data, 'base64');

            notesRepo.addFile(msg.from, shortCut, filePath);
        } else {
            // حفظ النص
            notesRepo.addNote(msg.from, shortCut, replayMsg.body);
        }
        await chat.sendStateTyping();
        msg.reply(`تم حفظ الملاحظة: ${shortCut}`);
        
    } catch (error) {
        console.error("خطأ أثناء حفظ الملاحظة:", error);
        await chat.sendStateTyping();
        msg.reply('صار خطأ أثناء الحفظ، حاول مرة ثانية.');
    }
}

//get Note
async function handleGetCommand(msg, notesRepo) {
    const text = msg.body;
    const chat = await msg.getChat();

    if (!chat.isGroup) {
        await chat.sendStateTyping();
        return msg.reply('هذا الأمر للقروبات فقط');
    }

    // ["!جيب", "java"]
    const shortCut = text.split(' ')[1];

    if (!shortCut) {
        await chat.sendStateTyping();
        return msg.reply('لازم تكتب اسم الملاحظة اللي تبيها، مثال: !جيب java');
    }

    const note = notesRepo.getNote(msg.from, shortCut);

    if (!note) {
        await chat.sendStateTyping();
        return msg.reply('ملاحظة غير موجودة');
    }

    if (note.file_path) {
        try {
            const media = MessageMedia.fromFilePath(note.file_path);
            await msg.reply(media, undefined, {
                sendMediaAsDocument: true
            });

        } catch (err) {
            console.log("خطأ في إرسال الملف:", err);
            // msg.reply("صار خطأ في إرسال الملف، تأكد إن الملف موجود في المجلد.");
        }

    } 
    // إذا كان الملاحظة عبارة عن نص فقط
    else if (note.TheNote) {
        await chat.sendStateTyping();
        await msg.reply(note.TheNote);
    } 
    else {
        await chat.sendStateTyping();
        await msg.reply("الملاحظة فاضية");
    }
}

//List Notes
async function handleListNotesCommand(msg, notesRepo) {
    const chat = await msg.getChat();

    if (!chat.isGroup) {
        await chat.sendStateTyping();
        return msg.reply('هذا الأمر للقروبات فقط');
    }

    try {
        const notes = notesRepo.getAllNotes(msg.from);

        if (!notes || notes.length === 0) {
            await chat.sendStateTyping();
            return msg.reply('لا يوجد ملاحظات');
        }

        const message = "*قائمة الملاحظات المحفوظة:*\n" + notes
            .map(n => `• ${n.short_cut}`)
            .join('\n');
        await chat.sendStateTyping();
        await msg.reply(message);

    } catch (error) {
        console.error("خطأ في عرض الملاحظات:", error);
        // msg.reply("صار خطأ أثناء جلب الملاحظات.");
    }
}

//delete Note
async function handleDeleteNoteCommand(msg, notesRepo) {
    const chat = await msg.getChat();

    if (!chat.isGroup) {
        await chat.sendStateTyping();
        return msg.reply('هذا الأمر للقروبات فقط');
    }

    const shortCut = msg.body.split(' ')[1];

    if (!shortCut) {
        await chat.sendStateTyping();
        return msg.reply('لازم تكتب اسم الملاحظة اللي تبي تحذفها، مثال: !احذف java');
    }

    try {
        notesRepo.deleteNote(msg.from, shortCut);
        await chat.sendStateTyping();
        await msg.reply(`تم حذف الملاحظة: ${shortCut}`);

    } catch (error) {
        console.error("خطأ في حذف الملاحظة:", error);
        // msg.reply("صار خطأ أثناء الحذف.");
    }
}






module.exports = {
    handleSaveCommand,
    handleGetCommand,
    handleListNotesCommand,
    handleDeleteNoteCommand
};