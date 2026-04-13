const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/stats — dashboard stats
router.get('/', (req, res) => {
  try {
    const totalDecks = db.prepare('SELECT COUNT(*) as c FROM decks').get().c;
    const totalCards = db.prepare('SELECT COUNT(*) as c FROM cards').get().c;
    const dueNow    = db.prepare("SELECT COUNT(*) as c FROM cards WHERE due_date <= datetime('now')").get().c;
    const reviewedToday = db.prepare(
      "SELECT COUNT(*) as c FROM reviews WHERE reviewed_at >= date('now')"
    ).get().c;

    // Reviews per day for last 30 days (for heatmap)
    const reviewsByDay = db.prepare(`
      SELECT date(reviewed_at) AS day, COUNT(*) AS count
      FROM reviews
      WHERE reviewed_at >= date('now', '-30 days')
      GROUP BY day
      ORDER BY day ASC
    `).all();

    // Accuracy today
    const todayReviews = db.prepare(
      "SELECT quality FROM reviews WHERE reviewed_at >= date('now')"
    ).all();
    const accuracyToday = todayReviews.length
      ? Math.round((todayReviews.filter(r => r.quality >= 3).length / todayReviews.length) * 100)
      : null;

    res.json({ totalDecks, totalCards, dueNow, reviewedToday, reviewsByDay, accuracyToday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
