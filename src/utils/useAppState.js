import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from './firebase';
import { loadShelf, saveBook, unsaveBook } from './shelf';

const STORAGE_KEY = 'nextread_session';
const MAX_REFRESHES = 2;

async function getRecommendations(books, excludeBooks = [], focus = null) {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ books, excludeBooks, focus }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get recommendations');
  }

  return response.json();
}

function saveSession(recommendations, prompt, refreshCount, excludedBooks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ recommendations, prompt, refreshCount, excludedBooks }));
}

export default function useAppState(navigate) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [savedBooks, setSavedBooks] = useState([]);
  const [results, setResults] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    if (!stored) return;

    const { recommendations, prompt, refreshCount, excludedBooks } = JSON.parse(stored);
    if (recommendations) setResults(recommendations);
    if (prompt) setPrompt(prompt);
    if (refreshCount != null) setRefreshCount(refreshCount);
    if (excludedBooks) setExcludedBooks(excludedBooks);
  }, []);

  const confirmGoogleLogin = async () => {
    await signInWithPopup(auth, provider);
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  const handleSave = async (uid, book) => {
    setSavedBooks(prev => [...prev.filter(b => b.id !== book.id), book]);
    await saveBook(uid, book);
  };

  const handleRemoveSaved = async (uid, book) => {
    await unsaveBook(uid, book.id);
    setSavedBooks(prev => prev.filter(b => b.id !== book.id));
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRecommendations(formData.books, [], formData.focus);
      const promptData = { books: formData.books, focus: formData.focus };
      setResults(data.recommendations);
      setPrompt(promptData);
      setRefreshCount(0);
      setExcludedBooks([]);
      saveSession(data.recommendations, promptData, 0, []);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!prompt || refreshCount >= MAX_REFRESHES) return;
    setLoading(true);
    setError(null);

    try {
      const currentTitles = (results || []).map((b) => `${b.title} by ${b.author}`);
      const nextExcluded = [...excludedBooks, ...currentTitles];
      const data = await getRecommendations(prompt.books, nextExcluded, prompt.focus);
      const nextCount = refreshCount + 1;
      setResults(data.recommendations);
      setRefreshCount(nextCount);
      setExcludedBooks(nextExcluded);
      saveSession(data.recommendations, prompt, nextCount, nextExcluded);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setPrompt(null);
    setRefreshCount(0);
    setExcludedBooks([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/');
  };

  return {
    user,
    authReady,
    confirmGoogleLogin,
    logoutUser,
    savedBooks,
    handleSave,
    handleRemoveSaved,
    results,
    prompt,
    loading,
    error,
    handleSubmit,
    handleRefresh,
    handleReset,
    refreshCount,
    maxRefreshes: MAX_REFRESHES,
  };
}
