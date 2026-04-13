import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

function FlipCard({ card, flipped, onFlip }) {
  const hasCode = card.code && card.code.trim().length > 0;
  return (
    <div
      className={`flip-card-container ${hasCode ? 'has-code' : ''}`}
      onClick={!flipped ? onFlip : undefined}
      style={{ cursor: flipped ? 'default' : 'pointer' }}
    >
      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="flip-face flip-face-front">
          <div className="flip-card-tag">Question</div>
          <div className="flip-card-question">{card.front}</div>
          {!flipped && (
            <div className="flip-card-hint">
              <span>🖱</span> Click to reveal answer
            </div>
          )}
        </div>

        {/* Back */}
        <div className="flip-face flip-face-back">
          <div className="flip-card-tag" style={{ alignSelf: 'flex-start' }}>Answer</div>
          <div className="flip-card-answer">{card.back}</div>
          {hasCode && (
            <pre className="flip-card-code">{card.code}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

const RATINGS = [
  { key: 'again', label: 'Again',  sub: '< 1 day',  quality: 1, cls: 'again' },
  { key: 'hard',  label: 'Hard',   sub: '~1 day',   quality: 2, cls: 'hard'  },
  { key: 'good',  label: 'Good',   sub: '~4 days',  quality: 4, cls: 'good'  },
  { key: 'easy',  label: 'Easy',   sub: '~7 days',  quality: 5, cls: 'easy'  },
];

export default function Study() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const deckId     = params.get('deck_id');

  const [cards,    setCards]    = useState([]);
  const [idx,      setIdx]      = useState(0);
  const [flipped,  setFlipped]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [done,     setDone]     = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct,  setCorrect]  = useState(0);
  const [rating,   setRating]   = useState(false); // prevent double-click

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDueCards(deckId);
      setCards(data);
      if (data.length === 0) setDone(true);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => { load(); }, [load]);

  const handleRate = async (quality) => {
    if (rating) return;
    setRating(true);
    const card = cards[idx];
    try {
      await api.reviewCard(card.id, quality);
      setReviewed(r => r + 1);
      if (quality >= 3) setCorrect(c => c + 1);
      const next = idx + 1;
      if (next >= cards.length) {
        setDone(true);
      } else {
        setIdx(next);
        setFlipped(false);
      }
    } finally {
      setRating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span className="loading-text">Loading cards…</span>
      </div>
    );
  }

  if (done) {
    const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;
    return (
      <div className="study-done fade-in">
        <div className="done-icon">🎉</div>
        <div className="done-title">Session Complete!</div>
        <div className="done-sub">You've reviewed all due cards for now.</div>
        <div className="done-stats">
          <div className="done-stat">
            <div className="done-stat-val" style={{ color: 'var(--accent-light)' }}>{reviewed}</div>
            <div className="done-stat-lbl">Reviewed</div>
          </div>
          <div className="done-stat">
            <div className="done-stat-val" style={{ color: 'var(--green)' }}>{correct}</div>
            <div className="done-stat-lbl">Correct</div>
          </div>
          <div className="done-stat">
            <div className="done-stat-val" style={{ color: 'var(--yellow)' }}>{accuracy}%</div>
            <div className="done-stat-lbl">Accuracy</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← Dashboard</button>
          {deckId && (
            <button className="btn btn-primary" onClick={() => navigate(`/decks/${deckId}`)}>
              View Deck
            </button>
          )}
        </div>
      </div>
    );
  }

  const card     = cards[idx];
  const total    = cards.length;
  const progress = Math.round((idx / total) * 100);

  return (
    <div className="study-page fade-in">
      {/* Progress */}
      <div className="study-progress-bar-wrap">
        <div className="study-progress-info">
          <span>Card {idx + 1} of {total}</span>
          <span>{progress}% done</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <FlipCard
        card={card}
        flipped={flipped}
        onFlip={() => setFlipped(true)}
      />

      {/* Rating Buttons */}
      {flipped ? (
        <div className="rating-section">
          <div className="rating-label">How well did you remember?</div>
          <div className="rating-buttons">
            {RATINGS.map(r => (
              <button
                key={r.key}
                className={`rating-btn ${r.cls}`}
                onClick={() => handleRate(r.quality)}
                disabled={rating}
              >
                <span className="rating-btn-label">{r.label}</span>
                <span className="rating-btn-sub">{r.sub}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          {idx + 1} / {total} cards due
        </div>
      )}
    </div>
  );
}
