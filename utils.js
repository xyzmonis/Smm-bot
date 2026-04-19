const fs = require("fs");

function loadDB() {
  return JSON.parse(fs.readFileSync("db.json"));
}

function saveDB(data) {
  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
}

module.exports = { loadDB, saveDB };
