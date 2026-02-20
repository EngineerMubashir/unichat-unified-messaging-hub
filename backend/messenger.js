// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const axios = require("axios");
// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");
// const mysql = require("mysql2/promise");
// const FormData = require("form-data");
// const fetch = require("node-fetch");
// const cors = require("cors");

// const PORT = process.env.PORT || 4000;

// // Middleware
// const app = express();

// // ✅ CORS Configuration
// app.use(cors({
//   origin: [
//     "http://localhost:8081",
//     "http://localhost:3000",
//     "http://192.168.1.12:8081",
//     "*" // allow all for development
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "Accept"],
//   credentials: true
// }));

// app.options("*", cors());
// app.use(bodyParser.json());

// // ✅ Public folder
// app.use(express.static(path.join(__dirname, "public")));
// const mediaDir = path.join(__dirname, "public", "messenger_media");
// if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

// // sub-folders
// const receivedDir = path.join(mediaDir, "received");
// const sentDir = path.join(mediaDir, "sent");
// if (!fs.existsSync(receivedDir)) fs.mkdirSync(receivedDir, { recursive: true });
// if (!fs.existsSync(sentDir)) fs.mkdirSync(sentDir, { recursive: true });

// const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
// const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// const TEST_USER_ID = process.env.ADMIN_PSID; // Messenger user PSID

// // ✅ MySQL Connection
// let db;
// (async () => {
//   db = await mysql.createPool({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASS || "",
//     database: process.env.DB_NAME || "unichat"
//   });
// })();

// // ==========================
// // MESSENGER ROUTES
// // ==========================

// // ✅ 1. Verification endpoint
// app.get("/messenger/webhook", (req, res) => {
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   if (mode && token) {
//     if (mode === "subscribe" && token === VERIFY_TOKEN) {
//       console.log("✅ Messenger Webhook verified!");
//       res.status(200).send(challenge);
//     } else {
//       res.sendStatus(403);
//     }
//   }
// });

// // ✅ 2. Incoming webhook
// app.post("/messenger/webhook", async (req, res) => {
//   console.log("📩 Incoming Messenger:", JSON.stringify(req.body, null, 2));

//   if (req.body.object === "page") {
//     for (const entry of req.body.entry) {
//       const event = entry.messaging[0];
//       const senderId = event.sender.id;

//       let entryData = {
//         id: event.message?.mid || "m_" + Date.now(),
//         sender: senderId,
//         type: "text",
//         text: null,
//         media_url: null,
//         filename: null,
//         status: "received",
//         timestamp: Date.now()
//       };

//       if (event.message?.text) entryData.text = event.message.text;
//       else if (event.message?.attachments) {
//         const att = event.message.attachments[0];
//         entryData.type = att.type;

//         try {
//           const fileUrl = att.payload.url;
//           const fileRes = await axios.get(fileUrl, {
//             headers: { Authorization: `Bearer ${PAGE_ACCESS_TOKEN}` },
//             responseType: "arraybuffer"
//           });

//           const ext =
//             att.type === "image" ? ".jpg" :
//             att.type === "audio" ? ".mp3" :
//             att.type === "video" ? ".mp4" :
//             att.type === "file" ? ".pdf" : ".bin";

//           const filename = `${Date.now()}${ext}`;
//           const savePath = path.join(receivedDir, filename);
//           fs.writeFileSync(savePath, fileRes.data);

//           entryData.media_url = `/messenger_media/received/${filename}`;
//           entryData.filename = filename;

//         } catch (err) {
//           console.error("❌ Media download failed:", err.message);
//         }
//       }

//       await db.query(
//         `INSERT INTO messenger_receive_msg 
//           (id, sender, type, text, media_url, filename, status, timestamp)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//         [entryData.id, entryData.sender, entryData.type, entryData.text, entryData.media_url, entryData.filename, entryData.status, entryData.timestamp]
//       );
//     }

//     res.sendStatus(200);
//   } else {
//     res.sendStatus(404);
//   }
// });

// // ✅ 3. Send text
// app.post("/messenger/send", async (req, res) => {
//   const { text } = req.body;
//   if (!text) return res.status(400).json({ error: "Missing text" });

//   try {
//     const response = await axios.post(
//       `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
//       { recipient: { id: TEST_USER_ID }, message: { text } }
//     );

//     const sentMsg = {
//       id: response.data.message_id,
//       type: "text",
//       text,
//       status: "sent",
//       timestamp: Date.now()
//     };

//     await db.query(
//       `INSERT INTO messenger_sent_msg (id, type, text, status, timestamp)
//        VALUES (?, ?, ?, ?, ?)`,
//       [sentMsg.id, sentMsg.type, sentMsg.text, sentMsg.status, sentMsg.timestamp]
//     );

//     res.json({ success: true, response: sentMsg });
//   } catch (err) {
//     console.error("❌ Messenger Send Error:", err.response?.data || err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ 4. Send media
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, sentDir),
//   filename: (req, file, cb) => {
//     let ext = path.extname(file.originalname) || ".bin";
//     cb(null, Date.now() + ext);
//   }
// });
// const upload = multer({ storage });
// app.use("/messenger_media", express.static(mediaDir));

// app.post("/messenger/send-media", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     let { type, caption } = req.body;
//     const filePath = req.file.path;
//     if (type === "voice") type = "audio";

//     const formData = new FormData();
//     formData.append("recipient", JSON.stringify({ id: TEST_USER_ID }));
//     formData.append("message", JSON.stringify({ attachment: { type, payload: {} } }));
//     formData.append("filedata", fs.createReadStream(filePath));

//     const uploadRes = await fetch(
//       `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
//       { method: "POST", body: formData }
//     );

//     const sendData = await uploadRes.json();
//     const localUrl = `/messenger_media/sent/${req.file.filename}`;

//     await db.query(
//       `INSERT INTO messenger_sent_msg 
//         (id, type, text, media_url, filename, status, timestamp)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         sendData.message_id || null,
//         type,
//         caption || null,
//         localUrl,
//         req.file.originalname,
//         "sent",
//         Date.now()
//       ]
//     );

//     res.json({ success: true, sendData });
//   } catch (err) {
//     console.error("❌ Messenger Media Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });


// // ✅ 5. Get messages
// app.get("/messenger/sent", async (req, res) => {
//   const [rows] = await db.query("SELECT * FROM messenger_sent_msg ORDER BY timestamp ASC");
//   res.json(rows);
// });

// app.get("/messenger/received", async (req, res) => {
//   const [rows] = await db.query("SELECT * FROM messenger_receive_msg ORDER BY timestamp ASC");
//   res.json(rows);
// });

// // ✅ Serve frontend
// app.get("/messenger", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "messenger.html"));
// });

// // ----------------- START SERVER -----------------
// app.listen(PORT,"0.0.0.0", () => {
//   console.log(`🚀 Messenger API running at http://localhost:${PORT}/messenger`);
// });
