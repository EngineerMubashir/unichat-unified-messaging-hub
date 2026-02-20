require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors")
 app.use(cors());

const PORT = 4000;

// Middleware
app.use(bodyParser.json());

// ✅ Step 1: Verification endpoint
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse params from query string
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Check token
  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ Step 2: Receive messages
app.post("/webhook", (req, res) => {
  let body = req.body;

  console.log("📩 Incoming webhook body:", JSON.stringify(body, null, 2));

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      let message = body.entry[0].changes[0].value.messages[0];
      let from = message.from; // sender phone number
      let text = message.text?.body;

      console.log(`📲 Message received from ${from}: ${text}`);
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Run server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Webhook server running on port ${PORT}`);
});
