"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

// In-memory messages
let messagesStore = {};

// SEND MESSAGE
app.post("/send", (req, res) => {
  const { to, recipientId, text } = req.body;
  const key = to || recipientId;
  if (!key || !text) return res.status(400).json({ error: "Missing to/recipientId or text" });

  if (!messagesStore[key]) messagesStore[key] = [];
  const newMsg = { id: Date.now(), text, timestamp: new Date(), from: "me" };
  messagesStore[key].push(newMsg);

  console.log("Message stored:", newMsg);
  res.json({ success: true, message: newMsg });
});

// GET MESSAGES
app.get("/messages", (req, res) => {
  const { to, recipientId } = req.query;
  const key = to || recipientId;
  res.setHeader("Cache-Control", "no-store");
  res.json(messagesStore[key] || []);
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 WhatsApp API running on http://localhost:${PORT}`));






// "use strict";
// require("dotenv").config();

// const express = require("express"),
//   bodyParser = require("body-parser"),
//   path = require("path"),
//   cors = require("cors");

// const app = express();

// // ✅ Middleware
// app.use(bodyParser.json());

// // ✅ CORS setup - ab sab origins allowed
// app.use(cors());

// // ✅ In-memory messages store
// let messagesStore = {};

// // ----------------- SEND MESSAGE API -----------------
// app.post("/send", (req, res) => {
//   const { to, recipientId, text } = req.body;
//   const key = to || recipientId;

//   if (!key || !text) {
//     return res.status(400).json({ error: "Missing to/recipientId or text" });
//   }

//   if (!messagesStore[key]) messagesStore[key] = [];

//   const newMsg = {
//     id: Date.now(),
//     text,
//     timestamp: new Date(),
//     from: "me",
//   };

//   messagesStore[key].push(newMsg);

//   console.log("Message stored:", newMsg);

//   // TODO: Yahan real WhatsApp/Messenger API call bhi karna hoga
//   res.json({ success: true, message: newMsg });
// });

// // ----------------- GET MESSAGES API -----------------
// app.get("/messages", (req, res) => {
//   const { to, recipientId } = req.query;
//   const key = to || recipientId;

//   res.setHeader("Cache-Control", "no-store"); // Cache avoid karne ke liye
//   res.json(messagesStore[key] || []);
// });

// // ----------------- Serve test HTML pages -----------------
// app.use(express.static(path.join(__dirname, "public")));

// // ----------------- START SERVER -----------------
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
