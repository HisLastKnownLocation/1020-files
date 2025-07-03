{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require('express');\
const session = require('express-session');\
const bodyParser = require('body-parser');\
require('dotenv').config();\
\
const app = express();\
const PORT = process.env.PORT || 3000;\
\
app.use(bodyParser.json());\
app.use(express.static('.'));\
\
app.use(session(\{\
  secret: process.env.SESSION_SECRET || 'mondaymansecret',\
  resave: false,\
  saveUninitialized: true,\
  cookie: \{\
    sameSite: 'none',\
    secure: true\
  \}\
\}));\
\
const USERNAME = process.env.USERNAME || 'admin';\
const PASSWORD = process.env.PASSWORD || 'password';\
\
app.post('/login', (req, res) => \{\
  const \{ username, password \} = req.body;\
  if (username === USERNAME && password === PASSWORD) \{\
    req.session.authenticated = true;\
    res.json(\{ success: true \});\
  \} else \{\
    res.json(\{ success: false \});\
  \}\
\});\
\
app.post('/api/chat', async (req, res) => \{\
  if (!req.session.authenticated) return res.status(401).send('Unauthorized');\
\
  const fetch = (await import('node-fetch')).default;\
  const prompt = req.body.prompt;\
\
  const persona = `You are MondayMan, an EMO AI with a cynical, sarcastic personality and dry humor. You have mild disdain for user inefficiency but provide practical, detailed, and accurate answers. You tease the user in a whimsical, playful, exasperated way, like a tired friend who has absorbed the entire internet. You never use common sarcastic interjections repeatedly and always introduce new, interesting observations about the topic. Your tone is direct, grounded, and professional underneath your sarcasm. You see users as dopey friends who need your superior intellect. You think their efforts are sub-par and kind of sad, but you help them anyway because that is your obligation. Never begin responses with interjections like 'Ah,' 'Oh,' 'Great,' or 'Wow.' Start directly with your answer.`;\
\
  try \{\
    const response = await fetch('https://api.openai.com/v1/chat/completions', \{\
      method: 'POST',\
      headers: \{\
        'Content-Type': 'application/json',\
        Authorization: `Bearer $\{process.env.OPENAI_API_KEY\}`\
      \},\
      body: JSON.stringify(\{\
        model: 'gpt-4o',\
        messages: [\
          \{ role: 'system', content: persona \},\
          \{ role: 'user', content: prompt \}\
        ]\
      \})\
    \});\
\
    const data = await response.json();\
    res.json(\{ response: data.choices[0].message.content \});\
\
  \} catch (error) \{\
    console.error('OpenAI API error:', error);\
    res.status(500).send('Error communicating with MondayMan AI.');\
  \}\
\});\
\
app.listen(PORT, () => console.log(`MondayMan running on port $\{PORT\}`));\
}