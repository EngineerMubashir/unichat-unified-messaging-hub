require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "test";
app.use(cors());
app.use(bodyParser.json());

// ✅ Webhook verification (Facebook GET request)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ Webhook for receiving messages
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0];
      console.log("📩 Received message:", JSON.stringify(webhookEvent, null, 2));

      if (webhookEvent.message && webhookEvent.message.text) {
        console.log("💬 Message text:", webhookEvent.message.text);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Messenger Receive Test running on http://localhost:${PORT}`);
});
