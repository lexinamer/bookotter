import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

function userShelfRef(uid) {
  return doc(db, 'shelves', uid);
}

export async function loadShelf(uid) {
  const snap = await getDoc(userShelfRef(uid));
  if (!snap.exists()) return { savedBooks: [], skippedBooks: [] };
  const data = snap.data();
  return {
    savedBooks: data.savedBooks ?? [],
    skippedBooks: data.skippedBooks ?? data.passedBooks ?? [],
    readBooks: data.readBooks ?? [],
  };
}

export async function saveBook(uid, book) {
  const ref = userShelfRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { savedBooks: [book], skippedBooks: [] });
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

export async function skipBook(uid, book) {
  const ref = userShelfRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { savedBooks: [], skippedBooks: [book] });
  } else {
    await updateDoc(ref, { skippedBooks: arrayUnion(book) });
  }
}

export async function unskipBook(uid, bookId) {
  const snap = await getDoc(userShelfRef(uid));
  if (!snap.exists()) return;
  const updated = (snap.data().skippedBooks ?? snap.data().passedBooks ?? []).filter(b => b.id !== bookId);
  await updateDoc(userShelfRef(uid), { skippedBooks: updated });
}

export async function readBook(uid, book) {
  const ref = userShelfRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { savedBooks: [], skippedBooks: [], readBooks: [book] });
  } else {
    await updateDoc(ref, { readBooks: arrayUnion(book) });
  }
}

export async function unreadBook(uid, bookId) {
  const snap = await getDoc(userShelfRef(uid));
  if (!snap.exists()) return;
  const updated = (snap.data().readBooks ?? []).filter(b => b.id !== bookId);
  await updateDoc(userShelfRef(uid), { readBooks: updated });
}
