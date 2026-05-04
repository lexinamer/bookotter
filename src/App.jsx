import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Nav from './components/Nav';
import Wizard from './screens/Wizard';
import Results from './screens/Results';
import Shelf from './screens/Shelf';

import useAppState from './utils/useAppState';
import './styles/global.scss';

export default function App() {
  const navigate = useNavigate();
  const [shelfOpen, setShelfOpen] = useState(false);

  const {
    user,
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
    maxRefreshes,
  } = useAppState(navigate);

  const guardedSave = async (book) => {
    if (!user) return confirmGoogleLogin();
    await handleSave(user.uid, book);
  };

  const guardedRemoveSaved = async (book) => {
    if (!user) return;
    await handleRemoveSaved(user.uid, book);
  };

  return (
    <div className="app-shell">
      <Nav
        user={user}
        onLogin={confirmGoogleLogin}
        onLogout={logoutUser}
        onShelfOpen={() => setShelfOpen(true)}
      />

      <Shelf
        isOpen={shelfOpen}
        onClose={() => setShelfOpen(false)}
        savedBooks={savedBooks}
        onRemoveSaved={guardedRemoveSaved}
      />

      {loading ? (
        <div className="page-state loading-state">Finding your next favorite book...</div>
      ) : error ? (
        <div className="page-state error-state">
          <p>{error}</p>
          <button className="secondary-action" onClick={handleReset}>Start Over</button>
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              !results ? (
                <Wizard onSubmit={handleSubmit} />
              ) : (
                <Results
                  data={results}
                  prompt={prompt}
                  onReset={handleReset}
                  onRefresh={handleRefresh}
                  onSave={guardedSave}
                  savedBooks={savedBooks}
                  refreshCount={refreshCount}
                  maxRefreshes={maxRefreshes}
                />
              )
            }
          />
        </Routes>
      )}
    </div>
  );
}
