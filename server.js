const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = './db.json';

// ===== DB FUNCTIONS =====
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], payments: [] }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ===== HEALTH =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ===== REGISTER =====
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;

  let db = readDB();

  if (db.users.find(u => u.username === username)) {
    return res.json({ error: "User exists" });
  }

  const user = {
    id: Date.now().toString(),
    username,
    password,
    balance: 0
  };

  db.users.push(user);
  writeDB(db);

  res.json({ success: true, user });
});

// ===== LOGIN =====
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  let db = readDB();

  const user = db.users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.json({ error: "Invalid" });

  res.json({ success: true, user });
});

// ===== PAYMENT REQUEST =====
app.post('/api/pay', (req, res) => {
  const { userId, amount } = req.body;

  let db = readDB();

  const payment = {
    id: Date.now().toString(),
    userId,
    amount,
    status: "pending"
  };

  db.payments.push(payment);
  writeDB(db);

  res.json({ success: true });
});

// ===== ADMIN APPROVE =====
app.post('/api/admin/approve', (req, res) => {
  const { id } = req.body;

  let db = readDB();
  const pay = db.payments.find(p => p.id === id);

  if (!pay) return res.json({ error: "Not found" });

  pay.status = "approved";

  const user = db.users.find(u => u.id === pay.userId);
  if (user) {
    user.balance += Number(pay.amount);
  }

  writeDB(db);

  res.json({ success: true });
});

// ===== START =====
const PORT = 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
