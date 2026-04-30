require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// ===== RATE LIMITERS =====

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions, please wait before trying again' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again in 15 minutes' },
});

app.use('/api/', generalLimiter);

// ===== JWT AUTH =====

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.warn('⚠️  JWT_SECRET not set — admin login disabled');

const requireAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
};

// ===== DATABASE =====

const isRemote = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id         SERIAL PRIMARY KEY,
      username   VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
      text       TEXT NOT NULL,
      approved   BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id         SERIAL PRIMARY KEY,
      username   VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
      text       TEXT NOT NULL,
      approved   BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS replies (
      id          SERIAL PRIMARY KEY,
      question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
      username    VARCHAR(100) NOT NULL DEFAULT 'Dr. Georgescu',
      text        TEXT NOT NULL,
      approved    BOOLEAN DEFAULT false,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  // Reaction counts columns (safe to run multiple times)
  for (const table of ['comments', 'questions', 'replies']) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS likes   INT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS hearts  INT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS unlikes INT NOT NULL DEFAULT 0`);
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reactions (
      id            SERIAL PRIMARY KEY,
      entity_type   VARCHAR(10) NOT NULL,
      entity_id     INT NOT NULL,
      reaction_type VARCHAR(10) NOT NULL,
      fingerprint   VARCHAR(64) NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(entity_type, entity_id, reaction_type, fingerprint)
    )
  `);
};

// ===== ADMIN =====

app.post('/api/admin/login', authLimiter, (req, res) => {
  const { password } = req.body;
  if (!JWT_SECRET || !process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ error: 'Admin not configured on server' });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

app.get('/api/admin/verify', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ') || !JWT_SECRET) {
    return res.json({ valid: false });
  }
  try {
    jwt.verify(auth.slice(7), JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.json({ valid: false });
  }
});

// ===== COMMENTS =====

app.get('/api/comments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/comments', postLimiter, async (req, res) => {
  try {
    const { username, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });
    const result = await pool.query(
      'INSERT INTO comments (username, text) VALUES ($1, $2) RETURNING *',
      [(username || 'Anonymous').slice(0, 100), text.slice(0, 2000)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/comments/:id/approve', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE comments SET approved = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comments/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM comments WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== QUESTIONS =====

app.get('/api/questions', async (req, res) => {
  try {
    const questions = await pool.query('SELECT * FROM questions ORDER BY created_at DESC');
    const replies = await pool.query('SELECT * FROM replies ORDER BY created_at ASC');
    const result = questions.rows.map(q => ({
      ...q,
      replies: replies.rows.filter(r => r.question_id === q.id),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/questions', postLimiter, async (req, res) => {
  try {
    const { username, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });
    const result = await pool.query(
      'INSERT INTO questions (username, text) VALUES ($1, $2) RETURNING *',
      [(username || 'Anonymous').slice(0, 100), text.slice(0, 2000)]
    );
    res.status(201).json({ ...result.rows[0], replies: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/questions/:id/approve', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE questions SET approved = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/questions/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== REPLIES =====

app.post('/api/questions/:id/replies', requireAdmin, async (req, res) => {
  try {
    const { username, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });
    const result = await pool.query(
      'INSERT INTO replies (question_id, username, text) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, (username || 'Dr. Georgescu').slice(0, 100), text.slice(0, 2000)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/questions/:qid/replies/:rid/approve', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE replies SET approved = true WHERE id = $1 AND question_id = $2 RETURNING *',
      [req.params.rid, req.params.qid]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/questions/:qid/replies/:rid', requireAdmin, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM replies WHERE id = $1 AND question_id = $2',
      [req.params.rid, req.params.qid]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== REACTIONS =====

const VALID_ENTITIES = ['comment', 'question', 'reply'];
const VALID_REACTIONS = ['like', 'heart', 'unlike'];
const ENTITY_TABLE = { comment: 'comments', question: 'questions', reply: 'replies' };
const REACTION_COL = { like: 'likes', heart: 'hearts', unlike: 'unlikes' };

app.post('/api/react', async (req, res) => {
  const { entity_type, entity_id, reaction_type, fingerprint } = req.body;
  if (!VALID_ENTITIES.includes(entity_type)) return res.status(400).json({ error: 'Invalid entity_type' });
  if (!VALID_REACTIONS.includes(reaction_type)) return res.status(400).json({ error: 'Invalid reaction_type' });
  if (!fingerprint || typeof fingerprint !== 'string' || fingerprint.length > 64) return res.status(400).json({ error: 'Invalid fingerprint' });
  const id = parseInt(entity_id, 10);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid entity_id' });

  const table = ENTITY_TABLE[entity_type];
  const col   = REACTION_COL[reaction_type];

  try {
    const existing = await pool.query(
      'SELECT id FROM reactions WHERE entity_type=$1 AND entity_id=$2 AND reaction_type=$3 AND fingerprint=$4',
      [entity_type, id, reaction_type, fingerprint]
    );
    let action;
    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM reactions WHERE entity_type=$1 AND entity_id=$2 AND reaction_type=$3 AND fingerprint=$4',
        [entity_type, id, reaction_type, fingerprint]
      );
      await pool.query(`UPDATE ${table} SET ${col} = GREATEST(0, ${col} - 1) WHERE id = $1`, [id]);
      action = 'removed';
    } else {
      await pool.query(
        'INSERT INTO reactions (entity_type, entity_id, reaction_type, fingerprint) VALUES ($1,$2,$3,$4)',
        [entity_type, id, reaction_type, fingerprint]
      );
      await pool.query(`UPDATE ${table} SET ${col} = ${col} + 1 WHERE id = $1`, [id]);
      action = 'added';
    }
    const result = await pool.query(`SELECT likes, hearts, unlikes FROM ${table} WHERE id = $1`, [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ action, ...result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== HEALTH =====

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'db_error', error: err.message });
  }
});

// ===== STATIC FILES =====

const buildPath = path.join(__dirname, 'build');
const hasBuild = fs.existsSync(buildPath);

if (hasBuild) {
  console.log('📁 Serving from build/ folder (production)');
  app.use(express.static(buildPath));
} else {
  console.log('⚠️  build/ folder not found. Run: npm run build');
  app.use(express.static(path.join(__dirname, 'public')));
}

app.get('*', (req, res) => {
  const buildIndexPath = path.join(buildPath, 'index.html');
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');

  if (fs.existsSync(buildIndexPath)) {
    res.sendFile(buildIndexPath);
  } else if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else {
    res.status(404).json({ error: 'index.html not found', message: 'Run: npm run build' });
  }
});

// ===== START =====

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  try {
    await initDB();
    console.log('✅ Database ready');
  } catch (err) {
    console.error('⚠️  Database unavailable:', err.message);
    console.error('Set DATABASE_URL in .env — API routes requiring DB will return 500');
  }
});
