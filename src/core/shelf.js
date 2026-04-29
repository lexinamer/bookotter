import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

function userShelfRef(uid) {
  return doc(db, 'shelves', uid);
}

export async function loadShelf(uid) {
  const snap = await getDoc(userShelfRef(uid));
  if (!snap.exists()) return { savedBooks: [], readBooks: [] };
  const data = snap.data();
  return {
    savedBooks: data.savedBooks ?? [],
    readBooks: data.readBooks ?? [],
  };
}

export async function saveBook(uid, book) {
  const ref = userShelfRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { savedBooks: [book], readBooks: [] });
  } else {
    await updateDoc(ref, { savedBooks: arrayUnion(book) });
  }
}

export async function unsaveBook(uid, bookId) {
  const snap = await getDoc(userShelfRef(uid));
  if (!snap.exists()) return;
  const updated = (snap.data().savedBooks ?? []).filter(b => b.id !== bookId);
  await updateDoc(userShelfRef(uid), { savedBooks: updated });
}

export async function markBookRead(uid, book) {
  const ref = userShelfRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { savedBooks: [], readBooks: [book] });
  } else {
    const savedBooks = (snap.data().savedBooks ?? []).filter(b => b.id !== book.id);
    await updateDoc(ref, { savedBooks, readBooks: arrayUnion(book) });
  }
}

export async function removeReadBook(uid, bookId) {
  const snap = await getDoc(userShelfRef(uid));
  if (!snap.exists()) return;
  const updated = (snap.data().readBooks ?? []).filter(b => b.id !== bookId);
  await updateDoc(userShelfRef(uid), { readBooks: updated });
}
