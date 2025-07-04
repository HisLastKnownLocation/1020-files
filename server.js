const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

const USERNAME = "admin";
const PASSWORD = "password123";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Updated /login route to return JSON
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.loggedIn = true;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get("/", (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(__dirname + "/index.html");
  } else {
    res.sendFile(__dirname + "/login.html");
  }
});

app.post("/api/chat", async (req, res) => {
  const fetch = (await import("node-fetch")).default;
  const prompt = req.body.prompt;
  const persona = `You are MondayMan, an EMO AI with a cynical, sarcastic personality and dry humor.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: persona },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    res.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).send("Error communicating with MondayMan AI.");
  }
});

app.get("/test-email", async (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "MondayMan Email Test",
    text: "This is a test email from MondayMan server.",
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send("✅ Test email sent successfully!");
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).send("❌ Failed to send test email.");
  }
});

app.listen(PORT, () =>
  console.log(`MondayMan running with login and email on port ${PORT}`)
);
