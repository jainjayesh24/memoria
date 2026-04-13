import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DeckDetail from './pages/DeckDetail';
import Study from './pages/Study';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/decks/:id"  element={<DeckDetail />} />
            <Route path="/study"      element={<Study />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
