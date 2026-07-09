const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const PORT = process.env.PORT || 3000;

// SQLite embarque dans le conteneur -- pas de PVC (decision S61, demo :
// redemarrage du pod = base fraiche, aucun risque de corruption en direct).
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'feedback.db');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const app = express();
app.use(cors()); // frontend et backend sont deux services distincts (deux
                  // hosts d'Ingress differents) -- CORS ouvert pour la demo.
app.use(express.json());

// GET /feedback -- liste des messages, plus recent en premier.
app.get('/feedback', (req, res) => {
  const rows = db.prepare('SELECT id, author, message, created_at FROM feedback ORDER BY id DESC').all();
  res.json(rows);
});

// POST /feedback -- ajoute un message. Body attendu : { author, message }.
app.post('/feedback', (req, res) => {
  const { author, message } = req.body || {};
  if (!author || !author.trim() || !message || !message.trim()) {
    return res.status(400).json({ error: 'author et message sont requis' });
  }
  const stmt = db.prepare('INSERT INTO feedback (author, message) VALUES (?, ?)');
  const result = stmt.run(author.trim(), message.trim());
  const created = db.prepare('SELECT id, author, message, created_at FROM feedback WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// /health -- requis par le liveness probe (k8s/deployment.yaml, port 3000).
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'atlas-feedback-api' });
});

app.listen(PORT, () => {
  console.log(`atlas-feedback-api listening on port ${PORT}`);
});
