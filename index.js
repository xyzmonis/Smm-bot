const TelegramBot = require("node-telegram-bot-api");

const token = "8218865814:AAE9CJ_pEphpLV_aCOJ5DPD9gooPhN4uLho"; // ⚠️ new token use karna
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome bhai 🚀", {
        reply_markup: {
            keyboard: [
                ["💼 Social Media Service"],
                ["💰 Add Fund", "🤝 Refer"],
                ["💸 Earn Money"]
            ],
            resize_keyboard: true
        }
    });
});