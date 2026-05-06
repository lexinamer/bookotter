import { Routes, Route, useNavigate } from 'react-router-dom';

import Nav from './components/Nav';
import Wizard from './screens/Wizard';
import Results from './screens/Results';
import Shelf from './screens/Shelf';

import useAppState from './utils/useAppState';
import './styles/global.scss';

export default function App() {
  const navigate = useNavigate();

  const {
    user,
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
    maxRefreshes,
  } = useAppState(navigate);

  const guardedSave = async (book) => {
    if (!user) return confirmGoogleLogin();

    if (skippedBooks.some((item) => item.id === book.id)) {
      await handleRemoveSkipped(user.uid, book);
    }

    await handleSave(user.uid, book);
  };

  const guardedSkip = async (book) => {
    if (!user) return confirmGoogleLogin();

    if (savedBooks.some((item) => item.id === book.id)) {
      await handleRemoveSaved(user.uid, book);
    }

    await handleSkip(user.uid, book);
  };

  const guardedUnsave = (book) => handleRemoveSaved(user.uid, book);
  const guardedUnskip = (book) => handleRemoveSkipped(user.uid, book);

  return (
    <div className="app-shell">
      <Nav
        user={user}
        onLogin={confirmGoogleLogin}
        onLogout={logoutUser}
      />

      {loading ? (
        <div className="loading">
          Finding your next favorite book...
        </div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
          <button className="results-action" onClick={handleReset}>
            Start Over
          </button>
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
                  onSkip={guardedSkip}
                  savedBooks={savedBooks}
                  skippedBooks={skippedBooks}
                  refreshCount={refreshCount}
                  maxRefreshes={maxRefreshes}
                />
              )
            }
          />

          <Route
            path="/shelf"
            element={
              <Shelf
                savedBooks={savedBooks}
                skippedBooks={skippedBooks}
                onSave={guardedSave}
                onSkip={guardedSkip}
                onUnsave={guardedUnsave}
                onUnskip={guardedUnskip}
              />
            }
          />
        </Routes>
      )}
    </div>
  );
}