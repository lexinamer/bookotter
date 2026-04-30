import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from './firebase';
import { loadShelf, saveBook, unsaveBook } from './shelf';

const STORAGE_KEY = 'bookotter_active_session';
const PROMPT_KEY = 'bookotter_active_prompt';
const REFRESH_COUNT_KEY = 'bookotter_refresh_count';
const EXCLUDED_BOOKS_KEY = 'bookotter_excluded_books';
const MAX_REFRESHES = 2;

async function getRecommendations(books, genre, moods, excludeBooks = []) {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ books, genre, moods, excludeBooks }),
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
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [excludedBooks, setExcludedBooks] = useState([]);

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
    const storedPrompt = localStorage.getItem(PROMPT_KEY);
    if (storedPrompt) setPrompt(JSON.parse(storedPrompt));
    const storedCount = localStorage.getItem(REFRESH_COUNT_KEY);
    if (storedCount) setRefreshCount(parseInt(storedCount, 10));
    const storedExcluded = localStorage.getItem(EXCLUDED_BOOKS_KEY);
    if (storedExcluded) setExcludedBooks(JSON.parse(storedExcluded));
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
      const data = await getRecommendations(formData.books, formData.genre, formData.mood);
      const promptData = { books: formData.books, genre: formData.genre, mood: formData.mood };
      setResults(data.recommendations);
      setPrompt(promptData);
      setRefreshCount(0);
      setExcludedBooks([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.recommendations));
      localStorage.setItem(PROMPT_KEY, JSON.stringify(promptData));
      localStorage.setItem(REFRESH_COUNT_KEY, '0');
      localStorage.setItem(EXCLUDED_BOOKS_KEY, JSON.stringify([]));
      navigate('/');
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!prompt || refreshCount >= MAX_REFRESHES) return;
    setLoading(true);

    try {
      const currentTitles = (results || []).map((b) => `${b.title} by ${b.author}`);
      const nextExcluded = [...excludedBooks, ...currentTitles];
      const data = await getRecommendations(prompt.books, prompt.genre, prompt.mood, nextExcluded);
      const nextCount = refreshCount + 1;
      setResults(data.recommendations);
      setRefreshCount(nextCount);
      setExcludedBooks(nextExcluded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.recommendations));
      localStorage.setItem(REFRESH_COUNT_KEY, String(nextCount));
      localStorage.setItem(EXCLUDED_BOOKS_KEY, JSON.stringify(nextExcluded));
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setPrompt(null);
    setRefreshCount(0);
    setExcludedBooks([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROMPT_KEY);
    localStorage.removeItem(REFRESH_COUNT_KEY);
    localStorage.removeItem(EXCLUDED_BOOKS_KEY);
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
    prompt,
    loading,
    setResults,
    handleSubmit,
    handleRefresh,
    handleReset,
    refreshCount,
    maxRefreshes: MAX_REFRESHES,
  };
}
