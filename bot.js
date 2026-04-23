const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const TOKEN = "8474500650:AAH7L8vPaO8d_nW-PryNm6eXqU4J18-riLM";
const ADMIN_ID = "6270522295";

const bot = new TelegramBot(TOKEN, { polling: true });

const DB_FILE = './db.json';

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ===== START =====
bot.onText(/\/start/, (msg) => {
  if (msg.chat.id != ADMIN_ID) return;

  bot.sendMessage(msg.chat.id,
`Admin Commands:
/users
/payments
/approve ID
/reject ID
/add USERID AMOUNT`);
});

// ===== USERS =====
bot.onText(/\/users/, (msg) => {
  if (msg.chat.id != ADMIN_ID) return;

  let db = readDB();
  let text = db.users.map(u => `${u.id} | ${u.username} | ₹${u.balance}`).join("\n");

  bot.sendMessage(msg.chat.id, text || "No users");
});

// ===== PAYMENTS =====
bot.onText(/\/payments/, (msg) => {
  if (msg.chat.id != ADMIN_ID) return;

  let db = readDB();
  let text = db.payments.map(p => `${p.id} | ${p.userId} | ₹${p.amount} | ${p.status}`).join("\n");

  bot.sendMessage(msg.chat.id, text || "No payments");
});

// ===== APPROVE =====
bot.onText(/\/approve (.+)/, (msg, match) => {
  if (msg.chat.id != ADMIN_ID) return;

  let id = match[1];
  let db = readDB();

  let pay = db.payments.find(p => p.id === id);
  if (!pay) return bot.sendMessage(msg.chat.id, "Not found");

  pay.status = "approved";

  let user = db.users.find(u => u.id === pay.userId);
  if (user) user.balance += Number(pay.amount);

  writeDB(db);

  bot.sendMessage(msg.chat.id, "Approved ✅");
});

// ===== REJECT =====
bot.onText(/\/reject (.+)/, (msg, match) => {
  if (msg.chat.id != ADMIN_ID) return;

  let id = match[1];
  let db = readDB();

  let pay = db.payments.find(p => p.id === id);
  if (!pay) return bot.sendMessage(msg.chat.id, "Not found");

  pay.status = "rejected";
  writeDB(db);

  bot.sendMessage(msg.chat.id, "Rejected ❌");
});

// ===== ADD MONEY =====
bot.onText(/\/add (.+) (.+)/, (msg, match) => {
  if (msg.chat.id != ADMIN_ID) return;

  let userId = match[1];
  let amount = Number(match[2]);

  let db = readDB();
  let user = db.users.find(u => u.id === userId);

  if (!user) return bot.sendMessage(msg.chat.id, "User not found");

  user.balance += amount;
  writeDB(db);

  bot.sendMessage(msg.chat.id, "Balance Added 💰");
});
