const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ===== CONFIG =====
const ADMIN_ID = 6270522295; // 👉 apna telegram ID daal

// ===== DATABASE (simple JSON) =====
let db = {
  users: {},
  services: [
    { id: 1, name: "Instagram Likes", rate: 10, min: 100, max: 10000, time: "1-2 hr" }
  ],
  payment: {
    upi: "yourupi@upi",
    qr: ""
  },
  orders: []
};

// ===== SAVE FUNCTION =====
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

  bot.sendMessage(msg.chat.id, "Welcome 🚀", {
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

// ===== BALANCE =====
bot.on("message", (msg) => {
  const id = msg.from.id;
  const text = msg.text;

  if (text === "📊 Balance") {
    bot.sendMessage(msg.chat.id, `💰 Balance: ₹${db.users[id].balance}`);
  }

  // ===== SERVICES =====
  if (text === "💼 Services") {
    let list = "📋 Services:\n\n";
    db.services.forEach(s => {
      list += `${s.id}. ${s.name}\n💸 ₹${s.rate}/1000\n⏱ ${s.time}\n\n`;
    });

    bot.sendMessage(msg.chat.id, list + "\nSend: serviceId link qty");
  }

  // ===== ORDER PLACE =====
  if (text && text.split(" ").length === 3) {
    const [serviceId, link, qty] = text.split(" ");
    const service = db.services.find(s => s.id == serviceId);

    if (!service) return;

    if (db.users[id].balance < service.rate) {
      return bot.sendMessage(msg.chat.id, "❌ Low balance");
    }

    db.users[id].balance -= service.rate;

    db.orders.push({
      user: id,
      service: service.name,
      link,
      qty,
      status: "Pending"
    });

    saveDB();

    bot.sendMessage(msg.chat.id, "✅ Order placed!");
  }

  // ===== ADD FUND =====
  if (text === "💰 Add Fund") {
    bot.sendMessage(msg.chat.id,
      `💳 Pay here:\nUPI: ${db.payment.upi}\n\nAfter payment send screenshot`);
  }

  // ===== ADMIN PANEL =====
  if (text === "👑 Admin Panel" && id == ADMIN_ID) {
    bot.sendMessage(msg.chat.id, "Admin Panel 👇", {
      reply_markup: {
        keyboard: [
          ["➕ Add Balance", "➖ Remove Balance"],
          ["⚙️ Add Service", "✏️ Edit Service"],
          ["💳 Set UPI"],
          ["📦 All Orders"]
        ],
        resize_keyboard: true
      }
    });
  }

  // ===== ADMIN: ADD BALANCE =====
  if (id == ADMIN_ID && text.startsWith("/addbal")) {
    let [_, uid, amt] = text.split(" ");
    db.users[uid].balance += Number(amt);
    saveDB();
    bot.sendMessage(msg.chat.id, "✅ Balance Added");
  }

  // ===== ADMIN: SET UPI =====
  if (id == ADMIN_ID && text.startsWith("/setupi")) {
    let upi = text.split(" ")[1];
    db.payment.upi = upi;
    saveDB();
    bot.sendMessage(msg.chat.id, "✅ UPI Updated");
  }

  // ===== ADMIN: ADD SERVICE =====
  if (id == ADMIN_ID && text.startsWith("/addservice")) {
    let [_, name, rate] = text.split(" ");
    db.services.push({
      id: db.services.length + 1,
      name,
      rate: Number(rate),
      min: 100,
      max: 10000,
      time: "1 hr"
    });
    saveDB();
    bot.sendMessage(msg.chat.id, "✅ Service Added");
  }

  // ===== ADMIN: VIEW ORDERS =====
  if (text === "📦 All Orders" && id == ADMIN_ID) {
    let list = db.orders.map(o =>
      `${o.user} | ${o.service} | ${o.status}`
    ).join("\n");

    bot.sendMessage(msg.chat.id, list || "No orders");
  }

});
