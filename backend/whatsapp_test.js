// whatsapp_test.js
require("dotenv").config();
const express = require('express')
const axios = require("axios");
const cors = require("cors");
const app = express();
 app.use(cors());
const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;
const testNumber = process.env.TEST_NUMBER; // format: 923001234567

async function sendTestMessage() {
  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: testNumber,
        type: "text",
        text: { body: "Zaheem test message ✅" },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Message sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error.response?.data || error.message);
  }
}

sendTestMessage();
