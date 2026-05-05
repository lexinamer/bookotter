import React from 'react';

const ACTIONS = [
  { id: 'saved', label: 'Save', active: 'Saved' },
  { id: 'read', label: 'Already Read', active: 'Already Read' },
  { id: 'skipped', label: 'Not For Me', active: 'Not For Me' },
];

export default function BookCard({
  book,
  variant = 'results',
  shelfStatus,
  onSave,
  onSkip,
  onRead,
  saved = false,
  read = false,
}) {
  const query = encodeURIComponent(`${book.title} ${book.author}`);
  const amazonUrl = `https://www.amazon.com/s?k=${query}`;

  const currentState = saved ? 'saved' : read ? 'read' : null;

  function handleShelfChange(e) {
    const value = e.target.value;
    if (value === shelfStatus) return;
    if (value === 'saved') onSave(book);
    if (value === 'read') onRead(book);
    if (value === 'skipped') onSkip(book);
  }

  return (
    <article className={`book-card${variant === 'shelf' ? ' shelf' : ''}`}>
      <header className="bookcard-header">
        <div className="bookcard-heading">
          <h2 className="bookcard-title">
            <a href={amazonUrl} target="_blank" rel="noopener noreferrer">
              {book.title}
            </a>
          </h2>

          <p className="bookcard-author">{book.author}</p>
          <p className="bookcard-meta">{book.year} • {book.pages} pages • {book.genre}</p>
        </div>

        {variant === 'shelf' ? (
          <select className="bookcard-select" value={shelfStatus} onChange={handleShelfChange}>
            <option value="saved">Saved</option>
            <option value="read">Read</option>
            <option value="skipped">Not For Me</option>
          </select>
        ) : (
          <div className="bookcard-actions">
            {ACTIONS.map((action, index) => (
              <React.Fragment key={action.id}>
                {currentState === action.id ? (
                  <span className="bookcard-action active">{action.active}</span>
                ) : (
                  <button className="bookcard-action" onClick={() => {
                    if (action.id === 'saved') onSave(book);
                    if (action.id === 'read') onRead(book);
                    if (action.id === 'skipped') onSkip(book);
                  }}>
                    {action.label}
                  </button>
                )}

                {index < ACTIONS.length - 1 && <span className="bookcard-divider">|</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <p className="bookcard-summary">{book.what}</p>

      <section className="bookcard-why">
        <span className="bookcard-label">Why we picked it</span>
        <p>{book.why}</p>
      </section>
    </article>
  );
}