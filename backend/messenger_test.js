require("dotenv").config();
const express = require('express')
const axios = require("axios");
const cors = require('cors');
const app = express();
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const ADMIN_PSID = process.env.ADMIN_PSID;
app.use(cors());
async function sendMessage(to, text) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: to },
        message: { text }
      },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("✅ Message sent:", res.data);
  } catch (err) {
    console.error("❌ Error sending message:", err.response?.data || err.message);
  }
}

// ---- Test run ----
if (!PAGE_ACCESS_TOKEN || !ADMIN_PSID) {
  console.error("❌ Please set PAGE_ACCESS_TOKEN and ADMIN_PSID in your .env file");
  process.exit(1);
}

sendMessage(ADMIN_PSID, "Hello zaheem! Messenger Test API is  working 🚀");
