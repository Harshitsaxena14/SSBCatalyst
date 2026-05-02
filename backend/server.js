const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const allowedOrigin = process.env.CLIENT_URL;

app.use(cors({
  origin: allowedOrigin,
}));
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests, please try again later",
});

app.use("/contact", limiter);

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in backend/.env");
  process.exit(1);
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("Missing EMAIL_USER or EMAIL_PASS in backend/.env");
  process.exit(1);
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
}, { timestamps: true });

const Contact = mongoose.model("Contact", ContactSchema);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

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

    const data = await Contact.create({ name, email, message });

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

    res.status(200).json({ message: "Saved & Email Sent ✅", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing request ❌" });
  }
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB Error ❌", error.message);
    process.exit(1);
  }
};

startServer();