import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Modal from '../components/Modal';

const COLORS = [
  '#7c3aed', '#6d28d9', '#4f46e5', '#0891b2',
  '#059669', '#d97706', '#dc2626', '#db2777',
  '#7c3aed', '#0ea5e9',
];

function DeckForm({ initial, onSave, onCancel }) {
  const [name, setName]   = useState(initial?.name || '');
  const [desc, setDesc]   = useState(initial?.description || '');
  const [color, setColor] = useState(initial?.color || COLORS[0]);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try { await onSave({ name, description: desc, color }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Deck Name *</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Dynamic Programming"
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Short description (optional)"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Color</label>
        <div className="color-picker">
          {COLORS.map(c => (
            <div
              key={c}
              className={`color-swatch ${color === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={loading || !name.trim()}>
          {loading ? 'Saving…' : initial ? 'Update Deck' : 'Create Deck'}
        </button>
      </div>
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [decks,  setDecks]  = useState([]);
  const [stats,  setStats]  = useState(null);
  const [modal,  setModal]  = useState(null); // null | 'create' | { deck }
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([api.getDecks(), api.getStats()]);
      setDecks(d);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createDeck = async (data) => {
    await api.createDeck(data);
    setModal(null);
    load();
  };

  const updateDeck = async (id, data) => {
    await api.updateDeck(id, data);
    setModal(null);
    load();
  };

  const deleteDeck = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this deck and all its cards?')) return;
    await api.deleteDeck(id);
    load();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span className="loading-text">Loading your decks…</span>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card" style={{ '--stat-color': '#7c3aed' }}>
          <div className="stat-label">Total Decks</div>
          <div className="stat-value">{stats?.totalDecks ?? 0}</div>
          <div className="stat-sub">knowledge sets</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#0891b2' }}>
          <div className="stat-label">Total Cards</div>
          <div className="stat-value">{stats?.totalCards ?? 0}</div>
          <div className="stat-sub">concepts tracked</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#ef4444' }}>
          <div className="stat-label">Due Now</div>
          <div className="stat-value">{stats?.dueNow ?? 0}</div>
          <div className="stat-sub">cards to review</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#10b981' }}>
          <div className="stat-label">Reviewed Today</div>
          <div className="stat-value">{stats?.reviewedToday ?? 0}</div>
          <div className="stat-sub">
            {stats?.accuracyToday !== null ? `${stats.accuracyToday}% accuracy` : 'no reviews yet'}
          </div>
        </div>
      </div>

      {/* Deck Section */}
      <div className="section-header">
        <span className="section-title">Your Decks</span>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
          + New Deck
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧠</div>
          <div className="empty-title">No decks yet</div>
          <div className="empty-desc">Create your first deck to start memorizing coding concepts with spaced repetition.</div>
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setModal('create')}>
            Create Your First Deck
          </button>
        </div>
      ) : (
        <div className="deck-grid">
          {decks.map(deck => (
            <div
              key={deck.id}
              className="deck-card"
              style={{ '--deck-color': deck.color }}
              onClick={() => navigate(`/decks/${deck.id}`)}
            >
              <div className="deck-card-header">
                <div>
                  <div className="deck-name">{deck.name}</div>
                  {deck.description && <div className="deck-desc">{deck.description}</div>}
                </div>
              </div>

              <div className="deck-meta">
                <span className="deck-count">{deck.card_count} cards</span>
                {deck.due_count > 0 && (
                  <span className={`due-badge ${deck.due_count > 10 ? 'urgent' : ''}`}>
                    {deck.due_count} due
                  </span>
                )}
              </div>

              <div className="deck-actions" onClick={e => e.stopPropagation()}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/study?deck_id=${deck.id}`)}
                  disabled={deck.due_count === 0}
                  title={deck.due_count === 0 ? 'No cards due' : 'Study this deck'}
                >
                  ⚡ Study {deck.due_count > 0 ? `(${deck.due_count})` : ''}
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={() => setModal({ deck })}
                  title="Edit deck"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={(e) => deleteDeck(deck.id, e)}
                  title="Delete deck"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Create New Deck" onClose={() => setModal(null)}>
          <DeckForm onSave={createDeck} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.deck && (
        <Modal title="Edit Deck" onClose={() => setModal(null)}>
          <DeckForm
            initial={modal.deck}
            onSave={(data) => updateDeck(modal.deck.id, data)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
