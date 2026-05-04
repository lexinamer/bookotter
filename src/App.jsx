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
    readBooks,
    handleSave,
    handleRemoveSaved,
    handleSkip,
    handleRemoveSkipped,
    handleRead,
    handleRemoveRead,
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
    if (skippedBooks.some(b => b.id === book.id)) await handleRemoveSkipped(user.uid, book);
    if (readBooks.some(b => b.id === book.id)) await handleRemoveRead(user.uid, book);
    await handleSave(user.uid, book);
  };

  const guardedRemoveSaved = async (book) => {
    if (!user) return;
    await handleRemoveSaved(user.uid, book);
  };

  const guardedSkip = async (book) => {
    if (!user) return confirmGoogleLogin();
    if (savedBooks.some(b => b.id === book.id)) await handleRemoveSaved(user.uid, book);
    if (readBooks.some(b => b.id === book.id)) await handleRemoveRead(user.uid, book);
    await handleSkip(user.uid, book);
  };

  const guardedRemoveSkipped = async (book) => {
    if (!user) return;
    await handleRemoveSkipped(user.uid, book);
  };

  const guardedRead = async (book) => {
    if (!user) return confirmGoogleLogin();
    if (savedBooks.some(b => b.id === book.id)) await handleRemoveSaved(user.uid, book);
    if (skippedBooks.some(b => b.id === book.id)) await handleRemoveSkipped(user.uid, book);
    await handleRead(user.uid, book);
  };

  const guardedRemoveRead = async (book) => {
    if (!user) return;
    await handleRemoveRead(user.uid, book);
  };

  return (
    <div className="app-shell">
      <Nav
        user={user}
        onLogin={confirmGoogleLogin}
        onLogout={logoutUser}
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
                  onSkip={guardedSkip}
                  onRead={guardedRead}
                  savedBooks={savedBooks}
                  skippedBooks={skippedBooks}
                  readBooks={readBooks}
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
                readBooks={readBooks}
                onSave={guardedSave}
                onSkip={guardedSkip}
                onRead={guardedRead}
                onRemoveSaved={guardedRemoveSaved}
                onRemoveSkipped={guardedRemoveSkipped}
                onRemoveRead={guardedRemoveRead}
              />
            }
          />
        </Routes>
      )}
    </div>
  );
}
