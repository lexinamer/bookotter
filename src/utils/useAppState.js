import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from './firebase';
import {
  loadShelf,
  saveBook,
  unsaveBook,
  skipBook,
  unskipBook,
} from './shelf';

const STORAGE_KEY = 'nextread_session';
const MAX_REFRESHES = 2;

/* =========================
   API
========================= */

async function getRecommendations(
  books,
  excludeBooks = [],
  focus = null,
  skippedBooks = []
) {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ books, excludeBooks, focus, skippedBooks }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get recommendations');
  }

  return response.json();
}

function saveSession(recommendations, prompt, refreshCount, excludedBooks) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ recommendations, prompt, refreshCount, excludedBooks })
  );
}

/* =========================
   HOOK
========================= */

export default function useAppState(navigate) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [savedBooks, setSavedBooks] = useState([]);
  const [skippedBooks, setSkippedBooks] = useState([]);

  const [results, setResults] = useState(null);
  const [prompt, setPrompt] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [refreshCount, setRefreshCount] = useState(0);
  const [excludedBooks, setExcludedBooks] = useState([]);

  /* =========================
     AUTH
  ========================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  /* =========================
     SHELF HYDRATION
  ========================= */

  useEffect(() => {
    async function hydrateShelf() {
      if (!user) {
        setSavedBooks([]);
        setSkippedBooks([]);
        return;
      }

      const shelf = await loadShelf(user.uid);
      setSavedBooks(shelf.savedBooks);
      setSkippedBooks(shelf.skippedBooks);
    }

    if (authReady) {
      hydrateShelf();
    }
  }, [user, authReady]);

  /* =========================
     SESSION HYDRATION
  ========================= */

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const session = JSON.parse(stored);

    if (session.recommendations) setResults(session.recommendations);
    if (session.prompt) setPrompt(session.prompt);
    if (session.refreshCount != null) setRefreshCount(session.refreshCount);
    if (session.excludedBooks) setExcludedBooks(session.excludedBooks);
  }, []);

  /* =========================
     AUTH ACTIONS
  ========================= */

  async function confirmGoogleLogin() {
    await signInWithPopup(auth, provider);
  }

  async function logoutUser() {
    await signOut(auth);
  }

  /* =========================
     SHELF ACTIONS
  ========================= */

  async function handleSave(uid, book) {
    setSavedBooks((prev) => [...prev.filter((item) => item.id !== book.id), book]);
    await saveBook(uid, book);
  }

  async function handleRemoveSaved(uid, book) {
    setSavedBooks((prev) => prev.filter((item) => item.id !== book.id));
    await unsaveBook(uid, book.id);
  }

  async function handleSkip(uid, book) {
    setSkippedBooks((prev) => [...prev.filter((item) => item.id !== book.id), book]);
    await skipBook(uid, book);
  }

  async function handleRemoveSkipped(uid, book) {
    setSkippedBooks((prev) => prev.filter((item) => item.id !== book.id));
    await unskipBook(uid, book.id);
  }

  /* =========================
     RECOMMENDATIONS
  ========================= */

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);

    try {
      const data = await getRecommendations(
        formData.books,
        [],
        formData.focus,
        skippedBooks
      );

      const promptData = {
        books: formData.books,
        focus: formData.focus,
      };

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
  }

  async function handleRefresh() {
    if (!prompt || refreshCount >= MAX_REFRESHES) return;

    setLoading(true);
    setError(null);

    try {
      const currentTitles = (results || []).map(
        (book) => `${book.title} by ${book.author}`
      );

      const nextExcluded = [...excludedBooks, ...currentTitles];

      const data = await getRecommendations(
        prompt.books,
        nextExcluded,
        prompt.focus,
        skippedBooks
      );

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
  }

  function handleReset() {
    setResults(null);
    setPrompt(null);
    setRefreshCount(0);
    setExcludedBooks([]);
    setError(null);

    localStorage.removeItem(STORAGE_KEY);
    navigate('/');
  }

  return {
    user,
    authReady,
    confirmGoogleLogin,
    logoutUser,
    savedBooks,
    skippedBooks,
    handleSave,
    handleRemoveSaved,
    handleSkip,
    handleRemoveSkipped,
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