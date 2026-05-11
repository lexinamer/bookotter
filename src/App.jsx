import { useState } from 'react';

import Nav from './screens/Nav';
import Wizard from './screens/Wizard';
import Results from './screens/Results';

import './styles/global.scss';

const STORAGE_KEY = 'nextread_session';
const MAX_REFRESHES = 2;

function loadSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveSession(recommendations, prompt, refreshCount, excludedBooks) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ recommendations, prompt, refreshCount, excludedBooks })
  );
}

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

export default function App() {
  const [initialSession] = useState(loadSession);

  const [results, setResults] = useState(initialSession.recommendations ?? null);
  const [prompt, setPrompt] = useState(initialSession.prompt ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(initialSession.refreshCount ?? 0);
  const [excludedBooks, setExcludedBooks] = useState(initialSession.excludedBooks ?? []);

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);

    try {
      const data = await getRecommendations(formData.books, [], formData.focus);

      const promptData = {
        books: data.books?.length ? data.books : formData.books,
        focus: formData.focus,
      };

      setResults(data.recommendations);
      setPrompt(promptData);
      setRefreshCount(0);
      setExcludedBooks([]);

      saveSession(data.recommendations, promptData, 0, []);
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
      const currentTitles = (results || []).map((book) => `${book.title} by ${book.author}`);
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
  }

  function handleReset() {
    setResults(null);
    setPrompt(null);
    setRefreshCount(0);
    setExcludedBooks([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="app-shell">
      <Nav />

      {error ? (
        <div className="error">
          <p>{error}</p>
          <button onClick={handleReset}>Start Over</button>
        </div>
      ) : results ? (
        <Results
          data={results}
          prompt={prompt}
          onReset={handleReset}
          onRefresh={handleRefresh}
          refreshCount={refreshCount}
          maxRefreshes={MAX_REFRESHES}
          loading={loading}
        />
      ) : (
        <Wizard onSubmit={handleSubmit} loading={loading} />
      )}
    </div>
  );
}
