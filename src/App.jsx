import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Wizard from './features/Wizard';
import Results from './features/Results';
import { getRecommendations } from './core/api';
import './styles/global.css';
import './styles/tokens.css';
import './styles/engine.css';
import './styles/base.css';

const STORAGE_KEY = 'bookotter_active_session';

export default function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);

    try {
      const data = await getRecommendations(
        formData.books,
        formData.genre,
        formData.length
      );

      setResults(data.recommendations);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.recommendations));
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="loading-screen">Finding books with your exact taste...</div>
      </>
    );
  }

  return (
    <>
      <Nav />

      {!results ? (
        <Wizard onSubmit={handleSubmit} onReset={handleReset} />
      ) : (
        <Results data={results} onReset={handleReset} />
      )}
    </>
  );
}