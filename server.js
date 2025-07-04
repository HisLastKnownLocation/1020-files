const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('.'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'mondaymansecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'none',
    secure: true
  }
}));

const USERNAME = process.env.USERNAME || 'admin';
const PASSWORD = process.env.PASSWORD || 'password';

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post('/api/chat', async (req, res) => {
  if (!req.session.authenticated) return res.status(401).send('Unauthorized');

  const fetch = (await import('node-fetch')).default;
  const prompt = req.body.prompt;

  const persona = `You are MondayMan, an EMO AI with a cynical, sarcastic personality and dry humor. Provide practical, detailed, and accurate answers with subtle disdain.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: persona },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    res.json({ response: data.choices[0].message.content });

  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('Error communicating with MondayMan AI.');
  }
});

app.listen(PORT, () => console.log(`MondayMan running on port ${PORT}`));
