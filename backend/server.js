const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/decks', require('./src/routes/decks'));
app.use('/api/cards', require('./src/routes/cards'));
app.use('/api/stats', require('./src/routes/stats'));

// Serve compiled React frontend in production
if (process.env.NODE_ENV === 'production') {
  // Works whether started from root or from backend/
  const distPath = path.join(__dirname, '../frontend/dist');
  const fs = require('fs');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`🌐 Serving frontend from ${distPath}`);
  } else {
    console.warn('⚠️  Frontend dist not found — run npm run build first');
  }
}

app.listen(PORT, () => {
  console.log(`\n🧠 Memoria running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  }
});
