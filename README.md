# 🧠 Memoria

> **Spaced repetition for developers.** Master algorithms, data structures, and system design concepts — never forget them again.

Memoria uses the **SM-2 algorithm** (the same one powering Anki) to schedule flashcard reviews at optimal intervals. Study less. Remember more.

---

## ✨ Features

- **Create Decks** — Organise cards by topic (Dynamic Programming, System Design, etc.)
- **Add Cards** — Question / answer format with optional code snippets
- **SM-2 Spaced Repetition** — Cards automatically schedule themselves based on how well you remember them
- **Study Sessions** — Flip cards, rate recall (Again / Hard / Good / Easy), track progress
- **Dashboard Stats** — Total cards, due today, accuracy, reviews per day
- **Fully Offline** — No external APIs. No MongoDB. Just SQLite.

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite                   |
| Backend   | Node.js + Express                 |
| Database  | SQLite via `better-sqlite3`       |
| Algorithm | SM-2 Spaced Repetition            |
| Fonts     | Oxanium · Manrope · DM Mono      |

---

## 🚀 Local Development

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/memoria.git
cd memoria

# 2. Install all dependencies
npm run install:all

# 3. Start both servers (runs on ports 3001 + 5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

> The backend API runs on `http://localhost:3001`.  
> Vite proxies `/api/*` requests automatically in dev mode.

---

## 🏗 Project Structure

```
memoria/
├── backend/
│   ├── server.js              # Express entry point
│   └── src/
│       ├── database.js        # SQLite init + schema
│       ├── sm2.js             # SM-2 algorithm
│       └── routes/
│           ├── decks.js       # CRUD for decks
│           ├── cards.js       # CRUD for cards + review
│           └── stats.js       # Dashboard stats
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── api.js             # API client
│       ├── index.css          # Global styles
│       ├── pages/
│       │   ├── Home.jsx       # Dashboard + deck grid
│       │   ├── DeckDetail.jsx # Cards in a deck
│       │   └── Study.jsx      # Flip card study mode
│       └── components/
│           ├── Navbar.jsx
│           └── Modal.jsx
├── package.json               # Root scripts (concurrently)
└── README.md
```

---

## 🌐 Deployment

### Option A — Railway (Recommended, Free Tier)

1. Push repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set these environment variables in Railway:
   ```
   NODE_ENV=production
   PORT=3001
   DB_PATH=/data/memoria.db
   ```
4. Add a **Volume** mounted at `/data` for SQLite persistence
5. Set the **Build Command**: `npm run build`
6. Set the **Start Command**: `npm start`

### Option B — Render (Free Tier)

1. Push repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `NODE_ENV=production`
4. Add a **Disk** (persistent storage) mounted at `/data`
5. Set `DB_PATH=/data/memoria.db`

### Option C — Fly.io

```bash
npm install -g flyctl
flyctl auth login
flyctl launch
flyctl volumes create memoria_data --size 1
flyctl deploy
```

---

## 📡 API Reference

### Decks
| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | `/api/decks`       | List all decks           |
| POST   | `/api/decks`       | Create a deck            |
| PUT    | `/api/decks/:id`   | Update a deck            |
| DELETE | `/api/decks/:id`   | Delete deck + all cards  |
| GET    | `/api/decks/:id/cards` | Cards in a deck      |

### Cards
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/cards`              | Create a card            |
| PUT    | `/api/cards/:id`          | Update card content      |
| DELETE | `/api/cards/:id`          | Delete a card            |
| GET    | `/api/cards/due`          | Get due cards            |
| POST   | `/api/cards/:id/review`   | Submit SM-2 rating (0–5) |

### Stats
| Method | Endpoint     | Description            |
|--------|--------------|------------------------|
| GET    | `/api/stats` | Dashboard stats        |

---

## 🧮 SM-2 Algorithm

Memoria uses the classic **SM-2** spaced repetition algorithm:

| Rating | Quality | Next Review |
|--------|---------|-------------|
| Again  | 1       | Tomorrow    |
| Hard   | 2       | 1 day       |
| Good   | 4       | interval × ease_factor |
| Easy   | 5       | interval × ease_factor (boosted) |

Cards start with `ease_factor = 2.5` and `interval = 0`. The ease factor adjusts after every review, ensuring difficult cards appear more frequently.

---

## 📝 License

MIT — free to use, fork, and deploy.

---

*Built with ⚡ by Jayesh Jain — [github.com/jainjayesh24](https://github.com/jainjayesh24)*
