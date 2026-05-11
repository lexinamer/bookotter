import { useState } from 'react';
import BookCard from '../components/BookCard';

const TABS = [
  { key: 'saved', label: 'Saved' },
  { key: 'skipped', label: 'Passed' },
];

export default function Shelf({
  user,
  onLogin,
  onLogout,
  savedBooks,
  skippedBooks,
  onSave,
  onSkip,
  onUnsave,
  onUnskip,
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

        <button className="shelf-auth-link" onClick={user ? onLogout : onLogin}>
          {user ? 'Sign out' : 'Sign in with Google'}
        </button>
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
              onUnsave={onUnsave}
              onUnskip={onUnskip}
            />
          ))
        )}
      </section>
    </main>
  );
}