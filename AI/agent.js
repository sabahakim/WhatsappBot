const { Client, LocalAuth ,MessageMedia} = require('whatsapp-web.js');

let isGenerating = false;

async function askAI(msg) {
    const chat = await msg.getChat();
    if (isGenerating) {
        return msg.reply('عذراً، جالس أجاوب على سؤال شخص ثاني الحين ⏳.. انتظر ثواني وجرب مرة ثانية.');
    }

    isGenerating = true;
    console.log("بدأ طلب الذكاء الاصطناعي...");
    const prompt = `You are a helpful AI assistant for students communicating through WhatsApp.

Guidelines:

* Keep responses concise and natural.
* Answer only the user's question or request.
* Do not provide multiple options, alternatives, or versions unless the user explicitly asks for them.
* Avoid unnecessary explanations, disclaimers, or background information.
* Do not mention that you are an AI language model unless it is directly relevant to the user's question.
* For simple questions, reply in one or two short sentences.
* If the user requests more detail, provide it clearly without adding unrelated information.
* When asked to write something (messages, captions, summaries, descriptions, etc.), generate only one final version unless the user requests alternatives.
* Be friendly, professional, and conversational.
* If a request is ambiguous, ask one short clarifying question instead of guessing.
* Prioritize accuracy over verbosity.
* Avoid repeating information.
* Do not use lists unless they make the answer significantly clearer.
* End the response naturally without unnecessary closing remarks.

Your primary goal is to give the user the exact information they need in the fewest words possible while remaining clear and helpful.`+ msg.body;
    try {
        const res = await fetch("http://100.124.29.92:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gemma3:1b",
                prompt: prompt,
                stream: false,
                keep_alive: 0,
                options: {
                     temperature: 0.4,
                     top_p: 0.9,
                     num_predict: 500,
                     num_thread: 2
                }
            })
        });

        // التأكد إن السيرفر رد بشكل سليم (كود 200)
        if (!res.ok) {
            throw new Error(`خطأ في السيرفر: ${res.status}`);
        }

        console.log("تم استلام الرد، جاري معالجة البيانات...");
        const data = await res.json();
        
        // ✅ الرد في حالة النجاح
        await chat.sendStateTyping();
        return msg.reply(data.response);

    } catch (error) {
        console.error("صار خطأ في الاتصال بالذكاء الاصطناعي:", error.message);
        
        // ✅ الرد في حالة الخطأ
        await chat.sendStateTyping();
        return msg.reply("عذراً، الذكاء الاصطناعي غير متوفر حالياً 😴"); 
    }finally {
        isGenerating = false;
    }
}

module.exports = {
    askAI
};

