const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

// ===== CONFIG =====
const token = process.env.BOT_TOKEN;
const ADMIN_ID = 6270522295; // ✅ tera admin id set

const bot = new TelegramBot(token, { polling: true });

// ===== DATABASE =====
let db = {
  users: {},
  services: [],
  orders: [],
  payment: {
    upi: "yourupi@upi",
    qr: ""
  }
};

// ===== LOAD DB =====
if (fs.existsSync("db.json")) {
  db = JSON.parse(fs.readFileSync("db.json"));
}

// ===== SAVE DB =====
function saveDB() {
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
}

// ===== START =====
bot.onText(/\/start/, (msg) => {
  const id = msg.from.id;

  if (!db.users[id]) {
    db.users[id] = { balance: 0 };
    saveDB();
  }

  bot.sendMessage(msg.chat.id, "🚀 Welcome Panel", {
    reply_markup: {
      keyboard: [
        ["💼 Services", "📊 Balance"],
        ["📦 Orders", "💰 Add Fund"],
        ...(id == ADMIN_ID ? [["👑 Admin Panel"]] : [])
      ],
      resize_keyboard: true
    }
  });
});

// ===== MESSAGE HANDLER =====
bot.on("message", (msg) => {
  const id = msg.from.id;
  const chatId = msg.chat.id;
  const text = msg.text;

  // BALANCE
  if (text === "📊 Balance") {
    return bot.sendMessage(chatId, `💰 Balance: ₹${db.users[id].balance}`);
  }

  // SERVICES
  if (text === "💼 Services") {
    let list = "📋 Services:\n\n";
    db.services.forEach(s => {
      list += `${s.id}. ${s.name}\n💸 ₹${s.rate}/1000\n⏱ ${s.time}\n\n`;
    });
    return bot.sendMessage(chatId, list + "Send: serviceId link qty");
  }

  // ORDER PLACE
  if (text && text.split(" ").length === 3) {
    let [sid, link, qty] = text.split(" ");
    let service = db.services.find(s => s.id == sid);

    if (!service) return;

    if (db.users[id].balance < service.rate) {
      return bot.sendMessage(chatId, "❌ Low balance");
    }

    db.users[id].balance -= service.rate;

    db.orders.push({
      user: id,
      service: service.name,
      link,
      qty,
      status: "Processing"
    });

    saveDB();

    return bot.sendMessage(chatId, "✅ Order placed!");
  }

  // ADD FUND
  if (text === "💰 Add Fund") {
    return bot.sendMessage(chatId,
      `💳 Pay here:\nUPI: ${db.payment.upi}\n\nSend screenshot after payment`);
  }

  // ADMIN PANEL BUTTON
  if (text === "👑 Admin Panel" && id == ADMIN_ID) {
    return bot.sendMessage(chatId, "👑 Admin Panel", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💰 User Balance", callback_data: "bal" }],
          [{ text: "⚙️ Services", callback_data: "services" }],
          [{ text: "💳 Payment", callback_data: "payment" }],
          [{ text: "📦 Orders", callback_data: "orders" }]
        ]
      }
    });
  }

  // ===== ADMIN COMMANDS =====

  // ADD BALANCE
  if (id == ADMIN_ID && text.startsWith("/add")) {
    let [_, uid, amt] = text.split(" ");
    if (!db.users[uid]) db.users[uid] = { balance: 0 };
    db.users[uid].balance += Number(amt);
    saveDB();
    return bot.sendMessage(chatId, "✅ Balance Added");
  }

  // REMOVE BALANCE
  if (id == ADMIN_ID && text.startsWith("/remove")) {
    let [_, uid, amt] = text.split(" ");
    db.users[uid].balance -= Number(amt);
    saveDB();
    return bot.sendMessage(chatId, "❌ Balance Removed");
  }

  // SET UPI
  if (id == ADMIN_ID && text.startsWith("/setupi")) {
    let upi = text.split(" ")[1];
    db.payment.upi = upi;
    saveDB();
    return bot.sendMessage(chatId, "✅ UPI Updated");
  }

  // ADD SERVICE
  if (id == ADMIN_ID && text.startsWith("/service")) {
    let [_, name, rate] = text.split(" ");
    db.services.push({
      id: db.services.length + 1,
      name,
      rate: Number(rate),
      time: "1hr"
    });
    saveDB();
    return bot.sendMessage(chatId, "✅ Service Added");
  }

});

// ===== CALLBACK BUTTONS =====
bot.on("callback_query", (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;

  if (data === "bal") {
    bot.sendMessage(chatId, "Use:\n/add userId amount\n/remove userId amount");
  }

  if (data === "services") {
    bot.sendMessage(chatId, "Use:\n/service name rate");
  }

  if (data === "payment") {
    bot.sendMessage(chatId, "Use:\n/setupi yourupi@upi");
  }

  if (data === "orders") {
    let list = db.orders.map(o =>
      `${o.user} | ${o.service} | ${o.status}`
    ).join("\n");

    bot.sendMessage(chatId, list || "No orders");
  }

  bot.answerCallbackQuery(query.id);
});

console.log("🚀 Bot running...");
