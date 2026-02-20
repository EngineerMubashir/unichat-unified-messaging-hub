require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mysql = require("mysql2/promise");
const FormData = require("form-data");
const fetch = require("node-fetch");
const cors = require("cors");

const PORT = process.env.PORT || 4000;

// Middleware
const app = express();

// ✅ FIXED CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:8081",  // React Native dev server
    "http://localhost:3000",  // Web dev server (if any)
    "http://192.168.1.12:8081", // Your local network IP
    "*" // Allow all for development (remove in production)
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(bodyParser.json());

// Rest of your code stays the same...


app.use(bodyParser.json());

// ✅ Public folder for frontend + media files
app.use(express.static(path.join(__dirname, "public")));
const mediaDir = path.join(__dirname, "public", "media");
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir);

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const TEST_NUMBER = process.env.TEST_NUMBER;

// ✅ MySQL Connection
let db;
(async () => {
  db = await mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "unichat"
  });
})();

/* ==========================
   WHATSAPP ROUTES (/whatsapp)
   ========================== */

// ✅ 1. Verification endpoint
app.get("/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ WhatsApp Webhook verified!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ 2. Incoming webhook (receive messages)
app.post("/whatsapp/webhook", async (req, res) => {
  let body = req.body;

  console.log("📩 Incoming webhook:", JSON.stringify(body, null, 2));

  if (body.object) {
    const changes = body.entry?.[0]?.changes?.[0]?.value;

    /* ---- Messages ---- */
    if (changes?.messages) {
      let msg = changes.messages[0];
      let from = msg.from;
      let type = msg.type;
      let entry = {
        id: msg.id,
        sender: from,
        type,
        text: null,
        media_url: null,
        filename: null,
        contact_name: null,
        contact_phone: null,
        status: "received",
        timestamp: Date.now()
      };

      if (type === "text") {
        entry.text = msg.text.body;
      } 
      else if (["image", "audio", "video", "document", "sticker"].includes(type)) {
        const mediaId = msg[type].id;
        try {
          const urlRes = await axios.get(
            `https://graph.facebook.com/v20.0/${mediaId}`,
            { headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` } }
          );
          const fileUrl = urlRes.data.url;

          const fileRes = await axios.get(fileUrl, {
            headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
            responseType: "arraybuffer",
          });

          const ext = type === "image" ? "jpg" : 
                      type === "audio" ? "mp3" : 
                      type === "video" ? "mp4" : 
                      type === "document" ? (msg.document?.filename?.split('.').pop() || "bin") : "bin";

          const filePath = path.join(mediaDir, `${mediaId}.${ext}`);
          fs.writeFileSync(filePath, fileRes.data);

          entry.media_url = `/media/${mediaId}.${ext}`;
          if (type === "document") entry.filename = msg.document.filename;
        } catch (err) {
          console.error("❌ Media download failed:", err.message);
        }
      }
      else if (type === "contacts") {
        const contact = msg.contacts[0];
        entry.contact_name = contact.name?.formatted_name || "Unknown";
        entry.contact_phone = contact.phones?.[0]?.wa_id || contact.phones?.[0]?.phone || "N/A";
      }

      await db.query(
        `INSERT INTO received_messages (id, sender, type, text, media_url, filename, contact_name, contact_phone, status, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [entry.id, entry.sender, entry.type, entry.text, entry.media_url, entry.filename, entry.contact_name, entry.contact_phone, entry.status, entry.timestamp]
      );
    }

    /* ---- Status updates ---- */
    if (changes?.statuses) {
      let status = changes.statuses[0];
      console.log("📊 Status update:", status);

      let msgId = status.id;
      let newStatus = status.status; // sent/delivered/read

      await db.query(`UPDATE sent_messages SET status=? WHERE id=?`, [newStatus, msgId]);
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// ✅ 3. Send text message
app.post("/whatsapp/send", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: TEST_NUMBER,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const sentMsg = {
      id: response.data.messages[0].id,
      type: "text",
      text,
      status: "sent",
      timestamp: Date.now()
    };

    await db.query(
      `INSERT INTO sent_messages (id, type, text, status, timestamp)
       VALUES (?, ?, ?, ?, ?)` ,
      [sentMsg.id, sentMsg.type, sentMsg.text, sentMsg.status, sentMsg.timestamp]
    );

    res.json({ success: true, response: sentMsg });
  } catch (error) {
    console.error("❌ Send error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 4. Send Media (image/document/audio/video)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/media/sent/"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

app.use("/media", express.static(path.join(__dirname, "public/media")));

app.post("/whatsapp/send-media", upload.single("file"), async (req, res) => {
  try {
    const { type, caption } = req.body;
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // ✅ 1. Upload file to WhatsApp
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
      filename: req.file.originalname,
      contentType: mimeType
    });
    formData.append("messaging_product", "whatsapp");

    const uploadRes = await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/media`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
        body: formData
      }
    );
    const uploadData = await uploadRes.json();
    console.log("Upload response:", uploadData);

    if (!uploadData.id) {
      throw new Error("Media upload failed: " + JSON.stringify(uploadData));
    }

    // ✅ 2. Send message
    const sendRes = await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: TEST_NUMBER,
          type,
          [type]: { id: uploadData.id, caption }
        })
      }
    );
    const sendData = await sendRes.json();
    console.log("Send response:", sendData);

    if (sendData.error) {
      throw new Error("Send failed: " + JSON.stringify(sendData));
    }

    // ✅ 3. Local file path
    const localUrl = `/media/sent/${req.file.filename}`;

    // ✅ 4. Save in DB
    await db.query(
      `INSERT INTO sent_messages 
        (id, sender, type, text, media_url, filename, contact_name, contact_phone, status, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        sendData.messages?.[0]?.id || null,
        "me",
        type,
        caption || null,
        localUrl,
        req.file.originalname,
        null,
        null,
        "sent",
        Date.now()
      ]
    );

    res.json({ success: true, sendData });
  } catch (err) {
    console.error("Media error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 5. Get messages separately
app.get("/whatsapp/received", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM received_messages ORDER BY timestamp ASC");
  res.json(rows);
});

app.get("/whatsapp/sent", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM sent_messages ORDER BY timestamp ASC");
  res.json(rows);
});

// ✅ Serve frontend
app.get("/whatsapp", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp API running at http://localhost:${PORT}/whatsapp`);
});
