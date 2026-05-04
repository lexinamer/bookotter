import { useState } from 'react';
import ShelfCard from '../components/ShelfCard';

const TABS = [
  { key: 'saved', label: 'Saved' },
  { key: 'read', label: 'Read' },
  { key: 'skipped', label: 'Passed' },
];

export default function Shelf({
  savedBooks,
  skippedBooks,
  readBooks,
  onSave,
  onSkip,
  onRead,
}) {
  const [tab, setTab] = useState('saved');

  const shelfMap = {
    saved: savedBooks,
    read: readBooks,
    skipped: skippedBooks,
  };

  const emptyMessages = {
    saved: 'Nothing saved yet. Go find a recommendation you like.',
    read: 'Nothing marked as read yet.',
    skipped: 'Nothing passed on yet.',
  };

  const books = shelfMap[tab];

  return (
    <main className="shelf-page">
      <div className="shelf-tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`shelf-tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
            {shelfMap[key].length > 0 && (
              <span className="shelf-tab-count">{shelfMap[key].length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="shelf-list">
        {books.length === 0 ? (
          <p className="shelf-empty">{emptyMessages[tab]}</p>
        ) : (
          books.map((book) => (
            <ShelfCard
              key={book.id}
              book={book}
              mode={tab}
              onSave={onSave}
              onSkip={onSkip}
              onRead={onRead}
            />
          ))
        )}
      </div>
    </main>
  );
}