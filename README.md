Memoria
=======

Memoria is a spaced repetition tool specifically designed for developers to help them retain complex concepts like algorithms, data structures, and system design.

By utilizing the SM-2 algorithm—the same logic used by Anki—Memoria schedules reviews at the precise moment you are likely to forget a concept, maximizing long-term retention with minimal study time.

Features
--------

*   **Deck Management**: Group your study material by topic (e.g., LeetCode, React Hooks, System Design).
    
*   **Code Snippets**: Add cards with full markdown support for code blocks.
    
*   **SM-2 Algorithm**: Automated scheduling based on your recall quality (Again, Hard, Good, Easy).
    
*   **Personal Dashboard**: Visualize your progress, daily review counts, and accuracy.
    
*   **Zero External Dependencies**: Runs entirely on a local SQLite database. No cloud account or MongoDB setup required.
    

Tech Stack
----------

*   **Frontend**: React 18 (Vite)
    
*   **Backend**: Node.js, Express
    
*   **Database**: SQLite (via better-sqlite3)
    
*   **Design**: Tailwind CSS with custom typography (Oxanium, Manrope, DM Mono)
    
Project Structure
-----------------

*   **backend/**: Contains the Express server, SQLite schema initialization, and the SM-2 logic implementation.
    
*   **frontend/**: The React application, including the study interface and API client.
    
*   **package.json**: Root-level scripts to manage the full-stack environment concurrently.
    

API Reference
-------------

### Decks

*   GET /api/decks - Retrieve all decks.
    
*   POST /api/decks - Create a new deck.
    
*   DELETE /api/decks/:id - Remove a deck and its associated cards.
    

### Cards

*   GET /api/cards/due - Fetch cards scheduled for review today.
    
*   POST /api/cards/:id/review - Submit a recall rating (0-5) to update the card's next review date.
    

The SM-2 Logic
--------------

The system tracks three main variables for every card:

1.  **Interval**: The number of days until the next review.
    
2.  **Ease Factor**: A multiplier that increases or decreases based on how easy the card is to remember.
    
3.  **Repetitions**: The number of successful consecutive reviews.
    

When you rate a card, the system calculates the next interval by multiplying the current interval by the ease factor. If you mark a card as "Again," the interval resets to 1 day.
