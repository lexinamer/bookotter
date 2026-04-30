import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AuthModal from './components/AuthModal';

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
    authReady,
    authModalOpen,
    setAuthModalOpen,
    pendingAction,
    setPendingAction,
    beginAuthFlow,
    confirmGoogleLogin,
    logoutUser,
    savedBooks,
    handleSave,
    handleRemoveSaved,
    results,
    prompt,
    loading,
    handleSubmit,
    handleRefresh,
    handleReset,
    refreshCount,
    maxRefreshes,
  } = useAppState(navigate);

  useEffect(() => {
    async function replayPending() {
      if (!user || !pendingAction) return;

      if (pendingAction.type === 'save') {
        await handleSave(user.uid, pendingAction.book);
      }

      setPendingAction(null);
    }

    replayPending();
  }, [user]);

  const guardedSave = async (book) => {
    if (!user) return beginAuthFlow('save', book);
    await handleSave(user.uid, book);
  };

  const guardedRemoveSaved = async (book) => {
    if (!user) return;
    await handleRemoveSaved(user.uid, book);
  };

  if (loading) {
    return (
      <>
        <Nav user={user} onLogin={confirmGoogleLogin} onLogout={logoutUser} onShelfOpen={() => setShelfOpen(true)} />
        <div className="loading-screen">Finding books with your exact taste...</div>
      </>
    );
  }

  return (
    <>
      <Nav user={user} onLogin={confirmGoogleLogin} onLogout={logoutUser} onShelfOpen={() => setShelfOpen(true)} />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onConfirm={confirmGoogleLogin}
      />

      <Shelf
        isOpen={shelfOpen}
        onClose={() => setShelfOpen(false)}
        savedBooks={savedBooks}
        onRemoveSaved={guardedRemoveSaved}
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
    </>
  );
}
