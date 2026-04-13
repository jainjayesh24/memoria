FROM node:18-alpine

WORKDIR /app

# Copy root manifest
COPY package.json ./

# ── Frontend build ──────────────────────────────────────────
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend

COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# ── Backend install ─────────────────────────────────────────
COPY backend/package*.json ./backend/
RUN npm install --prefix backend --omit=dev

COPY backend/ ./backend/

# Persistent data directory (mounted as a Fly volume)
RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/data/memoria.db

EXPOSE 8080

CMD ["node", "backend/server.js"]
