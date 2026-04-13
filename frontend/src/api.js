const BASE = '/api';

const req = async (url, options = {}) => {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

export const api = {
  // Decks
  getDecks:      ()           => req('/decks'),
  getDeck:       (id)         => req(`/decks/${id}`),
  createDeck:    (data)       => req('/decks',    { method: 'POST', body: JSON.stringify(data) }),
  updateDeck:    (id, data)   => req(`/decks/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  deleteDeck:    (id)         => req(`/decks/${id}`, { method: 'DELETE' }),
  getDeckCards:  (id)         => req(`/decks/${id}/cards`),

  // Cards
  createCard:    (data)       => req('/cards',    { method: 'POST', body: JSON.stringify(data) }),
  updateCard:    (id, data)   => req(`/cards/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  deleteCard:    (id)         => req(`/cards/${id}`, { method: 'DELETE' }),
  getDueCards:   (deck_id)    => req(`/cards/due${deck_id ? `?deck_id=${deck_id}` : ''}`),
  reviewCard:    (id, quality)=> req(`/cards/${id}/review`, { method: 'POST', body: JSON.stringify({ quality }) }),

  // Stats
  getStats:      ()           => req('/stats'),
};
