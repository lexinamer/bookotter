import { useEffect, useState } from 'react';
import {
  loadShelf,
  saveBook,
  unsaveBook,
  markBookRead,
  removeReadBook,
} from '../services/shelf';

export default function useShelf(user, authReady) {
  const [savedBooks, setSavedBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);

  useEffect(() => {
    async function hydrateShelf() {
      if (!user) {
        setSavedBooks([]);
        setReadBooks([]);
        return;
      }

      const shelf = await loadShelf(user.uid);
      setSavedBooks(shelf.savedBooks);
      setReadBooks(shelf.readBooks);
    }

    if (authReady) hydrateShelf();
  }, [user, authReady]);

  const handleSave = async (uid, book) => {
    await saveBook(uid, book);
    setSavedBooks(prev => [...prev.filter(b => b.id !== book.id), book]);
  };

  const handleRemoveSaved = async (uid, book) => {
    await unsaveBook(uid, book.id);
    setSavedBooks(prev => prev.filter(b => b.id !== book.id));
  };

  const handleRemoveRead = async (uid, book) => {
    await removeReadBook(uid, book.id);
    setReadBooks(prev => prev.filter(b => b.id !== book.id));
  };

  const handleRead = async (uid, book) => {
    await markBookRead(uid, book);
    setSavedBooks(prev => prev.filter(b => b.id !== book.id));
    setReadBooks(prev => [...prev.filter(b => b.id !== book.id), book]);
  };

  return {
    savedBooks,
    readBooks,
    handleSave,
    handleRemoveSaved,
    handleRemoveRead,
    handleRead,
  };
}