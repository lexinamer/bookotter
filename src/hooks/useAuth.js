import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../services/firebase';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const beginAuthFlow = (type, book) => {
    setPendingAction({ type, book });
    setAuthModalOpen(true);
  };

  const confirmGoogleLogin = async () => {
    setAuthModalOpen(false);
    await signInWithPopup(auth, provider);
  };

  const logoutUser = async () => {
    await signOut(auth);
  };

  return {
    user,
    authReady,
    authModalOpen,
    pendingAction,
    setPendingAction,
    setAuthModalOpen,
    beginAuthFlow,
    confirmGoogleLogin,
    logoutUser,
  };
}