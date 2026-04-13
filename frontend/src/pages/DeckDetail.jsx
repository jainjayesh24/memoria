import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Modal from '../components/Modal';

const LANGUAGES = ['javascript', 'python', 'java', 'c++', 'go', 'rust', 'sql', 'bash', 'other'];

function CardForm({ deckId, initial, onSave, onCancel }) {
  const [front,    setFront]    = useState(initial?.front    || '');
  const [back,     setBack]     = useState(initial?.back     || '');
  const [code,     setCode]     = useState(initial?.code     || '');
  const [lang,     setLang]     = useState(initial?.language || 'javascript');
  const [showCode, setShowCode] = useState(!!initial?.code);
  const [loading,  setLoading]  = useState(false);

  const submit = async () => {
    if (!front.trim() || !back.trim()) return;
    setLoading(true);
    try { await onSave({ deck_id: deckId, front, back, code: showCode ? code : '', language: lang }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Question (Front) *</label>
        <textarea
          value={front}
          onChange={e => setFront(e.target.value)}
          placeholder="e.g. What is the time complexity of QuickSort?"
          rows={3}
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Answer (Back) *</label>
        <textarea
          value={back}
          onChange={e => setBack(e.target.value)}
          placeholder="Average O(n log n), worst case O(n²) due to poor pivot selection."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={showCode}
            onChange={e => setShowCode(e.target.checked)}
            style={{ width: 'auto' }}
          />
          Include code snippet
        </label>
      </div>

      {showCode && (
        <>
          <div className="form-group">
            <label className="form-label">Language</label>
            <select value={lang} onChange={e => setLang(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Code</label>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="// paste your code snippet here"
              rows={5}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
            />
          </div>
        </>
      )}

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={loading || !front.trim() || !back.trim()}
        >
          {loading ? 'Saving…' : initial ? 'Update Card' : 'Add Card'}
        </button>
      </div>
    </>
  );
}

export default function DeckDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [deck,     setDeck]   = useState(null);
  const [cards,    setCards]  = useState([]);
  const [modal,    setModal]  = useState(null); // null | 'add' | { card }
  const [loading,  setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [d, c] = await Promise.all([api.getDeck(id), api.getDeckCards(id)]);
      setDeck(d);
      setCards(c);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const addCard = async (data) => {
    await api.createCard(data);
    setModal(null);
    load();
  };

  const editCard = async (cardId, data) => {
    await api.updateCard(cardId, data);
    setModal(null);
    load();
  };

  const deleteCard = async (cardId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this card?')) return;
    await api.deleteCard(cardId);
    load();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span className="loading-text">Loading deck…</span>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <div className="empty-title">Deck not found</div>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Go Home</button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')} title="Back">←</button>
        <div className="page-title-block">
          <div className="page-title" style={{ color: deck.color }}>{deck.name}</div>
          {deck.description && <div className="page-subtitle">{deck.description}</div>}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/study?deck_id=${id}`)}
          disabled={cards.length === 0}
        >
          ⚡ Study Deck
        </button>
      </div>

      {/* Card list header */}
      <div className="section-header">
        <span className="section-title">{cards.length} {cards.length === 1 ? 'Card' : 'Cards'}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
          + Add Card
        </button>
      </div>

      {/* Cards */}
      {cards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📇</div>
          <div className="empty-title">No cards yet</div>
          <div className="empty-desc">Add your first card to this deck to start studying.</div>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setModal('add')}>
            Add First Card
          </button>
        </div>
      ) : (
        <div className="card-list">
          {cards.map(card => (
            <div key={card.id} className="card-item">
              <div className="card-item-body">
                <div className="card-front-text">{card.front}</div>
                <div className="card-back-text">{card.back}</div>
                {card.code && (
                  <div className="card-code-badge">
                    {'</>'} {card.language}
                  </div>
                )}
                <div className="sm2-info">
                  <span className="sm2-badge">interval: {card.interval}d</span>
                  <span className="sm2-badge">reps: {card.repetitions}</span>
                  <span className="sm2-badge">ef: {card.ease_factor.toFixed(2)}</span>
                  <span className="sm2-badge">due: {new Date(card.due_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="card-item-actions">
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={() => setModal({ card })}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={(e) => deleteCard(card.id, e)}
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === 'add' && (
        <Modal title="Add New Card" onClose={() => setModal(null)}>
          <CardForm deckId={parseInt(id)} onSave={addCard} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.card && (
        <Modal title="Edit Card" onClose={() => setModal(null)}>
          <CardForm
            deckId={parseInt(id)}
            initial={modal.card}
            onSave={(data) => editCard(modal.card.id, data)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
