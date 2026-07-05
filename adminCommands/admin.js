//data base
const notesRepo = require('../DataBase/notes');
const db = require('../DataBase/database');
//file
const fs = require('fs');
//whatsapp
const { Client, LocalAuth ,MessageMedia} = require('whatsapp-web.js');
//owner id
const OWNER = '966557752352@c.us';
//List for replay
const KickList = [
    'كيف تطرد عمك؟',
    "مايمديك تطرد عمك",
    "مين انت حتى تطرد العم"
];
const deleteMsgList = [
    'كيف تقمع عمك؟',
    "مايمديك تقمع عمك",
    "مين انت حتى تقمع العم"
];


async function isAuthorized(msg, chat) {
    try {
        const contact = await msg.getContact();
        const senderId = contact.id._serialized; 

        const participants = chat.participants;
        const sender = participants.find(p => p.id._serialized === senderId);
        
        const isAdmin = sender ? (sender.isAdmin || sender.isSuperAdmin) : false;
        const isOwner = (senderId === OWNER);

        // ترجع true إذا كان المرسل أدمن أو العم، وترجع false إذا كان عضو عادي
        return isAdmin || isOwner;
    } catch (err) {
        console.log("خطأ في التحقق من الصلاحيات:", err);
        return false; // في حال صار خطأ نعتبره ماله صلاحية لزيادة الأمان
    }
}


//Kick command
async function handleKickCommand(msg) {
    const chat = await msg.getChat();

    if (!chat.isGroup) {
        await chat.sendStateTyping();
        return msg.reply('هذا الأمر للقروبات فقط');
    }

    const hasPermission = await isAuthorized(msg, chat);
    if (!hasPermission) {
        await chat.sendStateTyping();
        return msg.reply('فقط الأدمن يقدر يطرد');
    }

    if (!msg.hasQuotedMsg) {
        await chat.sendStateTyping();
        return msg.reply('رد على رسالة الشخص');
    }

    const quoted = await msg.getQuotedMessage();

    // جلب معلومات جهة الاتصال لضمان دقة الآيدي
    const quotedContact = await quoted.getContact();
    const targetId = quotedContact.id._serialized;

    if (!targetId) {
        await chat.sendStateTyping();
        return msg.reply('ما قدرت أحدد الشخص');
    }

    // حماية العم من الطرد
    if (targetId === OWNER) {
        const randomIndex = Math.floor(Math.random() * KickList.length);
        await chat.sendStateTyping();
        return msg.reply(KickList[randomIndex]);
    }

    try {
        await chat.removeParticipants([targetId]);
        await chat.sendStateTyping();
        msg.reply('تم الطرد');
    } catch (err) {
        console.log(err);
        await chat.sendStateTyping();
        msg.reply('فشل الطرد، تأكد أن البوت أدمن');
    }
}

//8m3 command
async function handleSuppressCommand(msg) {
    const chat = await msg.getChat();

    if (!chat.isGroup) {
        await chat.sendStateTyping();
        return msg.reply('هذا الأمر للقروبات فقط');
    }

    // التحقق من الصلاحيات
    const hasPermission = await isAuthorized(msg, chat);
    if (!hasPermission) {
        // تم التعديل إلى يقمع بدلاً من يطرد
        await chat.sendStateTyping();
        return msg.reply('فقط الادمن يقدر يقمع'); 
    }

    if (!msg.hasQuotedMsg) {
        await chat.sendStateTyping();
        return msg.reply('رد على رسالة الشخص');
    }

    const quoted = await msg.getQuotedMessage();

    // جلب جهة اتصال صاحب الرسالة المقتبسة لضمان الآيدي 100%
    const quotedContact = await quoted.getContact();
    const targetId = quotedContact.id._serialized;

    if (!targetId) {
        await chat.sendStateTyping();
        return msg.reply('ما قدرت أحدد الرسالة');
    }

    // التحقق الصارم من العم
    if (targetId === OWNER) {
        const randomIndex = Math.floor(Math.random() * deleteMsgList.length);
        await chat.sendStateTyping();
        return msg.reply(deleteMsgList[randomIndex]);
    }

    try {
        await quoted.delete(true); // حذف عند الجميع (قمع)
        await chat.sendStateTyping();
        msg.reply('تم القمع');
    } catch (err) {
        console.log("خطأ في القمع:", err);
        // msg.reply('صار خطأ، تأكد أن البوت أدمن');
    }
}


module.exports = {
    handleKickCommand,
    handleSuppressCommand
};