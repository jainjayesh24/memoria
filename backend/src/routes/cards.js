const express = require('express');
const router = express.Router();
const db = require('../database');
const sm2 = require('../sm2');

// GET /api/cards/due?deck_id=X — due cards for study
router.get('/due', (req, res) => {
  try {
    const { deck_id } = req.query;
    let sql = `SELECT * FROM cards WHERE due_date <= datetime('now')`;
    const params = [];
    if (deck_id) {
      sql += ' AND deck_id = ?';
      params.push(parseInt(deck_id));
    }
    sql += ' ORDER BY due_date ASC LIMIT 50';
    const cards = db.prepare(sql).all(...params);
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cards — create card
router.post('/', (req, res) => {
  try {
    const { deck_id, front, back, code, language } = req.body;
    if (!deck_id || !front || !back) {
      return res.status(400).json({ error: 'deck_id, front, and back are required' });
    }
    const result = db.prepare(
      'INSERT INTO cards (deck_id, front, back, code, language) VALUES (?, ?, ?, ?, ?)'
    ).run(deck_id, front.trim(), back.trim(), code || '', language || 'javascript');
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cards/:id — update card content
router.put('/:id', (req, res) => {
  try {
    const { front, back, code, language } = req.body;
    db.prepare(
      'UPDATE cards SET front = ?, back = ?, code = ?, language = ? WHERE id = ?'
    ).run(front, back, code || '', language || 'javascript', req.params.id);
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cards/:id
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cards/:id/review — submit SM-2 rating
router.post('/:id/review', (req, res) => {
  try {
    const { quality } = req.body; // 0–5
    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'quality must be 0–5' });
    }
    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const { ease_factor, interval, repetitions, due_date } = sm2(card, quality);

    db.prepare(
      'UPDATE cards SET ease_factor = ?, interval = ?, repetitions = ?, due_date = ? WHERE id = ?'
    ).run(ease_factor, interval, repetitions, due_date, req.params.id);

    db.prepare('INSERT INTO reviews (card_id, quality) VALUES (?, ?)').run(req.params.id, quality);

    const updated = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
