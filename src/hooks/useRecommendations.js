import { useEffect, useState } from 'react';
import { getRecommendations } from '../services/api';

const STORAGE_KEY = 'bookotter_active_session';

export default function useRecommendations(readBooks, navigate) {
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

  return {
    results,
    loading,
    setResults,
    handleSubmit,
    handleReset,
  };
}