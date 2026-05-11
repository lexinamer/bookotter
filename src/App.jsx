import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Nav from './screens/Nav';
import Wizard from './screens/Wizard';
import Results from './screens/Results';

import './styles/global.scss';

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
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ recommendations, prompt, refreshCount, excludedBooks })
  );
}

export default function App() {
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [excludedBooks, setExcludedBooks] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const session = JSON.parse(stored);
    if (session.recommendations) setResults(session.recommendations);
    if (session.prompt) setPrompt(session.prompt);
    if (session.refreshCount != null) setRefreshCount(session.refreshCount);
    if (session.excludedBooks) setExcludedBooks(session.excludedBooks);
  }, []);

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
    navigate('/');
  }

  return (
    <div className="app-shell">
      <Nav />

      {error ? (
        <div className="error">
          <p>{error}</p>
          <button onClick={handleReset}>Start Over</button>
        </div>
      ) : (

      <Routes>
        <Route
          path="/"
          element={
            !results ? (
              <Wizard onSubmit={handleSubmit} loading={loading} />
            ) : (
              <Results
                data={results}
                prompt={prompt}
                onReset={handleReset}
                onRefresh={handleRefresh}
                refreshCount={refreshCount}
                maxRefreshes={MAX_REFRESHES}
                loading={loading}
              />
            )
          }
        />
      </Routes>
      )}
    </div>
  );
}
