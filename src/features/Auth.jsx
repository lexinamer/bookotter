import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '../core/firebase';

export function watchAuthState(setUser, setAuthReady) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser);
    setAuthReady(true);
  });
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, provider);
}

export async function logoutUser() {
  return signOut(auth);
}