import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Nav from './components/Nav';
import AuthModal from './components/AuthModal';
import Wizard from './features/Wizard';
import Results from './features/Results';
import Shelf from './features/Shelf';
import { getRecommendations } from './core/api';
import { watchAuthState, loginWithGoogle, logoutUser } from './features/auth';
import {
  loadShelf,
  saveBook,
  unsaveBook,
  markBookRead,
  removeReadBook,
} from './core/shelf';

import './styles/global.scss';

const STORAGE_KEY = 'bookotter_active_session';

export default function App() {
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [savedBooks, setSavedBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const unsubscribe = watchAuthState(setUser, setAuthReady);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    async function hydrateShelf() {
      if (!user) {
        setSavedBooks([]);
        setReadBooks([]);
        return;
      }

      const shelf = await loadShelf(user.uid);
      setSavedBooks(shelf.savedBooks);
      setReadBooks(shelf.readBooks);
    }

    if (authReady) hydrateShelf();
  }, [user, authReady]);

  useEffect(() => {
    async function replayPending() {
      if (!user || !pendingAction) return;

      if (pendingAction.type === 'save') {
        await handleSave(pendingAction.book, true);
      }

      if (pendingAction.type === 'read') {
        await handleRead(pendingAction.book, true);
      }

      setPendingAction(null);
    }

    replayPending();
  }, [user]);

  const handleSubmit = async (formData) => {
    setLoading(true);

    try {
      const data = await getRecommendations(
        formData.books,
        formData.genre,
        formData.length,
        readBooks.map(book => book.title)
      );

      const filtered = data.recommendations.filter(
        (book) => !readBooks.some((read) => read.id === book.id)
      );

      setResults(filtered);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      navigate('/');
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/');
  };

  const beginAuthFlow = (type, book) => {
    setPendingAction({ type, book });
    setAuthModalOpen(true);
  };

  const confirmGoogleLogin = async () => {
    setAuthModalOpen(false);
    await loginWithGoogle();
  };

  const handleSave = async (book, bypassAuth = false) => {
    if (!user && !bypassAuth) {
      return beginAuthFlow('save', book);
    }

    const activeUser = user || (await loginWithGoogle()).user;
    await saveBook(activeUser.uid, book);

    setSavedBooks(prev => [...prev.filter(b => b.id !== book.id), book]);
  };

  const handleRemoveSaved = async (book) => {
    if (!user) return;

    await unsaveBook(user.uid, book.id);
    setSavedBooks(prev => prev.filter(b => b.id !== book.id));
  };

  const handleRemoveRead = async (book) => {
    if (!user) return;

    await removeReadBook(user.uid, book.id);
    setReadBooks(prev => prev.filter(b => b.id !== book.id));
  };

  const handleRead = async (book, bypassAuth = false) => {
    if (!user && !bypassAuth) {
      return beginAuthFlow('read', book);
    }

    const activeUser = user || (await loginWithGoogle()).user;
    await markBookRead(activeUser.uid, book);

    setSavedBooks(prev => prev.filter(b => b.id !== book.id));
    setReadBooks(prev => [...prev.filter(b => b.id !== book.id), book]);
  };

  if (loading) {
    return (
      <>
        <Nav user={user} onLogin={confirmGoogleLogin} onLogout={logoutUser} />
        <div className="loading-screen">Finding books with your exact taste...</div>
      </>
    );
  }

  return (
    <>
      <Nav user={user} onLogin={confirmGoogleLogin} onLogout={logoutUser} />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onConfirm={confirmGoogleLogin}
      />

      <Routes>
        <Route
          path="/"
          element={
            !results ? (
              <Wizard onSubmit={handleSubmit} onReset={handleReset} />
            ) : (
              <Results
                data={results}
                onReset={handleReset}
                onSave={handleSave}
                onRead={handleRead}
                savedBooks={savedBooks}
                readBooks={readBooks}
              />
            )
          }
        />

        <Route
          path="/shelf"
          element={
            <Shelf
              savedBooks={savedBooks}
              readBooks={readBooks}
              onRemoveSaved={handleRemoveSaved}
              onRemoveRead={handleRemoveRead}
              onRead={handleRead}
              onBackToResults={() => navigate('/')}
              hasResultsSession={!!results}
            />
          }
        />
      </Routes>
    </>
  );
}