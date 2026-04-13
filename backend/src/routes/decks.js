const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/decks — all decks with counts
router.get('/', (req, res) => {
  try {
    const decks = db.prepare(`
      SELECT
        d.*,
        COUNT(c.id)                                                              AS card_count,
        SUM(CASE WHEN c.due_date <= datetime('now') THEN 1 ELSE 0 END)          AS due_count
      FROM decks d
      LEFT JOIN cards c ON c.deck_id = d.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `).all();
    res.json(decks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/decks/:id — single deck
router.get('/:id', (req, res) => {
  try {
    const deck = db.prepare('SELECT * FROM decks WHERE id = ?').get(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/decks — create deck
router.post('/', (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const result = db.prepare(
      'INSERT INTO decks (name, description, color) VALUES (?, ?, ?)'
    ).run(name.trim(), description || '', color || '#7c3aed');
    const deck = db.prepare('SELECT * FROM decks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/decks/:id — update deck
router.put('/:id', (req, res) => {
  try {
    const { name, description, color } = req.body;
    db.prepare(
      'UPDATE decks SET name = ?, description = ?, color = ? WHERE id = ?'
    ).run(name, description || '', color || '#7c3aed', req.params.id);
    const deck = db.prepare('SELECT * FROM decks WHERE id = ?').get(req.params.id);
    res.json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/decks/:id — delete deck (cascades to cards)
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM decks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/decks/:id/cards — cards in a deck
router.get('/:id/cards', (req, res) => {
  try {
    const cards = db.prepare(
      'SELECT * FROM cards WHERE deck_id = ? ORDER BY created_at DESC'
    ).all(req.params.id);
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
