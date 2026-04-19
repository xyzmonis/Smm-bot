const TelegramBot = require("node-telegram-bot-api");

// ⚠️ token yahan mat daal — Render se aayega
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Bot working 🚀", {
    reply_markup: {
      keyboard: [
        ["💼 Services"],
        ["💰 Add Fund", "🤝 Refer"],
        ["💸 Earn Money"]
      ],
      resize_keyboard: true
    }
  });
});

console.log("Bot started...");
