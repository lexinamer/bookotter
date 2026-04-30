import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from './firebase';
import { loadShelf, saveBook, unsaveBook } from './shelf';

const STORAGE_KEY = 'bookotter_active_session';

async function getRecommendations(books, genre, length) {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ books, genre, length }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get recommendations');
  }

  return response.json();
}

export default function useAppState(navigate) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [savedBooks, setSavedBooks] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function hydrateShelf() {
      if (!user) {
        setSavedBooks([]);
        return;
      }

      const shelf = await loadShelf(user.uid);
      setSavedBooks(shelf.savedBooks);
    }

    if (authReady) hydrateShelf();
  }, [user, authReady]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setResults(JSON.parse(stored));
  }, []);

  const beginAuthFlow = (type, book) => {
    setPendingAction({ type, book });
    setAuthModalOpen(true);
  };

  const confirmGoogleLogin = async () => {
    setAuthModalOpen(false);
    await signInWithPopup(auth, provider);
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  const handleSave = async (uid, book) => {
    await saveBook(uid, book);
    setSavedBooks(prev => [...prev.filter(b => b.id !== book.id), book]);
  };

  const handleRemoveSaved = async (uid, book) => {
    await unsaveBook(uid, book.id);
    setSavedBooks(prev => prev.filter(b => b.id !== book.id));
  };

  const handleSubmit = async (formData) => {
    setLoading(true);

    try {
      const data = await getRecommendations(formData.books, formData.genre, formData.length);
      setResults(data.recommendations);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.recommendations));
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

  return {
    user,
    authReady,
    authModalOpen,
    setAuthModalOpen,
    pendingAction,
    setPendingAction,
    beginAuthFlow,
    confirmGoogleLogin,
    logoutUser,
    savedBooks,
    handleSave,
    handleRemoveSaved,
    results,
    loading,
    setResults,
    handleSubmit,
    handleReset,
  };
}
