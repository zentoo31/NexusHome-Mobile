#!/usr/bin/env node
// audio-converter.js
// Simple Express server that accepts multipart/form-data with field 'file'
// and forwards it to OpenAI Whisper (audio transcription) if OPENAI_API_KEY is set.
// Listens on port 3020.

// Instructions:
// 1) Install dependencies:
//    npm install express multer node-fetch form-data dotenv
// 2) Set environment variable OPENAI_API_KEY (example: .env file with OPENAI_API_KEY=sk-...)
// 3) Run: node audio-converter.js

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config();

const PORT = process.env.PORT || 3020;
const upload = multer({ dest: 'uploads/' });
const app = express();

app.post('/transcribe', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name: file)' });

  try {
    // If no API key, return an informative response
    if (!process.env.OPENAI_API_KEY) {
      // Optionally, here you could run a local ASR engine. For now return a helpful message.
      // In production, set OPENAI_API_KEY to enable real transcription.
      // Clean up uploaded file
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      return res.json({ text: 'Transcripción no disponible en este servidor. Configure OPENAI_API_KEY.' });
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path));
    form.append('model', 'whisper-1');
    if (req.body.language) form.append('language', req.body.language);

    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        // form.getHeaders() will be added automatically by node-fetch when using form as body?
      },
      body: form,
    });

    const json = await resp.json();
    // Clean up file
    try { fs.unlinkSync(req.file.path); } catch (e) {}

    // The OpenAI transcription response usually contains { text: "..." }
    const text = json?.text || json?.data?.[0]?.text || '';
    return res.json({ text });
  } catch (err) {
    console.error('Transcription error:', err);
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    return res.status(500).json({ error: 'Transcription failed', details: String(err) });
  }
});

app.get('/', (_req, res) => res.send('Audio converter running'));

app.listen(PORT, () => console.log(`audio-converter listening on http://localhost:${PORT}`));
