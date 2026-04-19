const axios = require("axios");
const { API_KEY, API_URL } = require("./config");

async function placeOrder(service, link, qty) {
  try {
    let res = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service,
      link,
      quantity: qty
    });
    return res.data;
  } catch {
    return { error: true };
  }
}

module.exports = { placeOrder };
