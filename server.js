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

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.loggedIn = true;
    res.redirect("/");
  } else {
    res.send('Invalid credentials. <a href="/">Try again</a>');
  }
});

app.get("/", (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(process.cwd() + "/index.html");
  } else {
    res.sendFile(process.cwd() + "/login.html");
  }
});

app.post("/api/chat", async (req, res) => {
  const fetch = (await import("node-fetch")
