import { useState } from 'react';
import BookCard from '../components/BookCard';

const TABS = [
  { key: 'saved', label: 'Saved' },
  { key: 'skipped', label: 'Passed' },
];

export default function Shelf({
  savedBooks,
  skippedBooks,
  onSave,
  onSkip,
}) {
  const [tab, setTab] = useState('saved');

  const shelfMap = {
    saved: savedBooks,
    skipped: skippedBooks,
  };

  const emptyMessages = {
    saved: 'Nothing saved yet. Go find a recommendation you like.',
    skipped: 'Nothing skipped yet.',
  };

  const books = shelfMap[tab];

  return (
    <main className="shelf-screen">
      <section className="shelf-tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`shelf-tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}

            {shelfMap[key].length > 0 && (
              <span className="shelf-count">{shelfMap[key].length}</span>
            )}
          </button>
        ))}
      </section>

      <section className="shelf-list">
        {books.length === 0 ? (
          <p className="shelf-empty">{emptyMessages[tab]}</p>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="shelf"
              shelfStatus={tab}
              onSave={onSave}
              onSkip={onSkip}
            />
          ))
        )}
      </section>
    </main>
  );
}