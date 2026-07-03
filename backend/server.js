const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const allowedOrigin = process.env.CLIENT_URL;
const hasMongoConnection = Boolean(MONGO_URI);
const hasEmailDelivery = Boolean(EMAIL_USER && EMAIL_PASS);

app.use(cors({
  origin: allowedOrigin,
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "..")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests, please try again later",
});

app.use("/contact", limiter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
}, { timestamps: true });

const Contact = mongoose.model("Contact", ContactSchema);

const transporter = hasEmailDelivery ? nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
}) : null;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message, honeypot } = req.body;

    if (honeypot) {
      return res.status(400).json({ error: "Spam detected" });
    }

    if (!name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (message && message.length > 1000) {
      return res.status(400).json({ error: "Message too long" });
    }

    let data = { name, email, message };

    if (hasMongoConnection && mongoose.connection.readyState === 1) {
      data = await Contact.create({ name, email, message });
    }

    if (transporter) {
      await transporter.sendMail({
        from: EMAIL_USER,
        to: EMAIL_USER,
        subject: "New Contact Form Submission 🚀",
        html: `
          <h3>New Message Received</h3>
          <p><b>Name:</b> ${escapeHtml(name)}</p>
          <p><b>Email:</b> ${escapeHtml(email)}</p>
          <p><b>Message:</b> ${escapeHtml(message || "")}</p>
        `,
      });
    }

    res.status(200).json({
      message: transporter ? "Saved & Email Sent ✅" : "Saved locally ✅",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing request ❌" });
  }
});

app.use((req, res, next) => {
  if (req.method !== "GET") {
    return next();
  }

  res.sendFile(path.join(__dirname, "..", "index.html"));
});

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  if (!hasMongoConnection) {
    console.log("MongoDB disabled for local run");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Error ❌", error.message);
    console.log("Continuing without MongoDB");
  }
};

startServer();