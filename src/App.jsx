import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AuthModal from './components/AuthModal';

import Nav from './components/Nav';
import Wizard from './screens/Wizard';
import Results from './screens/Results';
import Shelf from './screens/Shelf';
import useAuth from './hooks/useAuth';
import useShelf from './hooks/useShelf';
import useRecommendations from './hooks/useRecommendations';
import './styles/global.scss';

export default function App() {
  const navigate = useNavigate();

  const {
    user,
    authReady,
    authModalOpen,
    pendingAction,
    setPendingAction,
    setAuthModalOpen,
    beginAuthFlow,
    confirmGoogleLogin,
    logoutUser,
  } = useAuth();

  const {
    savedBooks,
    readBooks,
    handleSave,
    handleRemoveSaved,
    handleRemoveRead,
    handleRead,
  } = useShelf(user, authReady);

  const {
    results,
    loading,
    handleSubmit,
    handleReset,
  } = useRecommendations(readBooks, navigate);

  useEffect(() => {
    async function replayPending() {
      if (!user || !pendingAction) return;

      if (pendingAction.type === 'save') {
        await handleSave(user.uid, pendingAction.book);
      }

      if (pendingAction.type === 'read') {
        await handleRead(user.uid, pendingAction.book);
      }

      setPendingAction(null);
    }

    replayPending();
  }, [user]);

  const guardedSave = async (book) => {
    if (!user) return beginAuthFlow('save', book);
    await handleSave(user.uid, book);
  };

  const guardedRead = async (book) => {
    if (!user) return beginAuthFlow('read', book);
    await handleRead(user.uid, book);
  };

  const guardedRemoveSaved = async (book) => {
    if (!user) return;
    await handleRemoveSaved(user.uid, book);
  };

  const guardedRemoveRead = async (book) => {
    if (!user) return;
    await handleRemoveRead(user.uid, book);
  };

  if (loading) {
    return (
      <>
        <Nav user={user} onLogin={confirmGoogleLogin} onLogout={logoutUser} />
        <div className="loading-screen">Finding books with your exact taste...</div>
      </>
    );
  }

  return (
    <>
      <Nav user={user} onLogin={confirmGoogleLogin} onLogout={logoutUser} />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onConfirm={confirmGoogleLogin}
      />

      <Routes>
        <Route
          path="/"
          element={
            !results ? (
              <Wizard onSubmit={handleSubmit} onReset={handleReset} />
            ) : (
              <Results
                data={results}
                onReset={handleReset}
                onSave={guardedSave}
                onRead={guardedRead}
                savedBooks={savedBooks}
                readBooks={readBooks}
              />
            )
          }
        />

        <Route
          path="/shelf"
          element={
            <Shelf
              savedBooks={savedBooks}
              readBooks={readBooks}
              onRemoveSaved={guardedRemoveSaved}
              onRemoveRead={guardedRemoveRead}
              onRead={guardedRead}
              onBackToResults={() => navigate('/')}
              hasResultsSession={!!results}
            />
          }
        />
      </Routes>
    </>
  );
}