const notesRepo = require('./DataBase/notes');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
//commands
const { handleSaveCommand , handleGetCommand , handleListNotesCommand ,handleDeleteNoteCommand} = require('./notes/noteCommands');
const { handleKickCommand ,handleSuppressCommand} = require('./adminCommands/admin');
const { askAI } = require('./AI/agent');
//owner id
const OWNER = process.env.OWNER_NUMBER;// قائمة مؤقتة لحفظ الأشخاص اللي عليهم تبريد
const cooldowns = new Set();
const COOLDOWN_SECONDS = 5; // مدة التبريد بالثواني (تقدر تعدلها)

// const client = new Client({
//     authStrategy: new LocalAuth({
//     clientId: "main"}), // يحفظ الجلسة عشان ما تعيد QR كل مرة
//     puppeteer: {
//         executablePath: process.env.CHROME_BIN || "/usr/bin/chromium",
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     }
// });
const fs = require('fs');
const path = require('path');

// امسح ملفات القفل القديمة من محاولات فاشلة سابقة
const sessionPath = path.join(__dirname, '.wwebjs_auth', 'session-main');
['SingletonLock', 'SingletonCookie', 'SingletonSocket'].forEach(fileName => {
    const filePath = path.join(sessionPath, fileName);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`تم مسح ملف قفل قديم: ${fileName}`);
        } catch (err) {
            console.log(`تعذر مسح ${fileName}:`, err.message);
        }
    }
});

const client = new Client({
    authStrategy: new LocalAuth({
    clientId: "main"}),
    puppeteer: {
        executablePath: process.env.CHROME_BIN || "/usr/bin/chromium",
        protocolTimeout: 120000,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

// يظهر QR أول مرة
client.on('qr', qr => {
    console.log('🔗 امسح الـ QR من واتساب:');
    qrcode.generate(qr, { small: true });
});

// جاهز
client.on('ready', () => {
    console.log('The bot is ready!!');
});

client.on("disconnected", (reason) => {
    console.log("Disconnected:", reason);
});

// يرد على الرسائل
client.on('message', async msg => {
    const userId = msg.author || msg.from;
    console.log(`Received message from ${userId}: ${msg.body}`);
// 2. إذا كان الشخص في قائمة التبريد، البوت يتجاهل رسالته فوراً
    if (cooldowns.has(userId)) {
        // نصيحة ذهبية: لا ترسل له رسالة "انتظر شوي"، لأن لو أرسل 20 رسالة، البوت بيرد 20 مرة 
        // وهذا يسبب باند. التجاهل الصامت (return) هو أقوى حماية.
        return; 
    }

    // 3. تأكيد أن الرسالة تحتوي على أمر فعلي (تبدأ بـ ! أو #) عشان ما نبرد سوالف الناس العادية
    if (msg.body.startsWith('!') || msg.body.startsWith('#')) {
        // إضافة الشخص لقائمة التبريد
        cooldowns.add(userId);
        // إزالة الشخص من القائمة بعد 5 ثواني
        setTimeout(() => {
            cooldowns.delete(userId);
        }, COOLDOWN_SECONDS * 1000); // نضرب في 1000 لأن الجافاسكربت تحسب بالملي ثانية
    }
    //مسج هو اوبجيكت
    //نص الرسالة
    const text = msg.body.toLowerCase();
    // console.log(msg.from);
    // console.log(msg.author);

    if (msg.body.startsWith('!احفظ')) {
        await handleSaveCommand(msg, notesRepo);
    }

    if (text.startsWith('!جيب')) {
        await handleGetCommand(msg, notesRepo);
    }

    if (msg.body === '!الملاحظات') {
        await handleListNotesCommand(msg, notesRepo);
    }

    if (msg.body.startsWith('!احذف')) {
        await handleDeleteNoteCommand(msg, notesRepo);
    }

    if (msg.body === '!اطرد') {
        await handleKickCommand(msg);
    }

    if (msg.body === '!اقمع') {
        await handleSuppressCommand(msg);
    }

    if (msg.body.startsWith("#")) {
        await askAI(msg);
    }

});

client.initialize();

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise:", err);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});