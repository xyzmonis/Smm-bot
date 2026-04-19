const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome bhai 🚀", {
    reply_markup: {
      keyboard: [
        [
          {
            text: "💼 Social Media Service",
            web_app: {
              url: "https://bestsmmpanell.42web.io/"
            }
          }
        ],
        ["💰 Add Fund", "🤝 Refer"],
        ["💸 Earn Money"]
      ],
      resize_keyboard: true
    }
  });
});

console.log("Bot started...");
