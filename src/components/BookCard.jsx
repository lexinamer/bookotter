const ACTIONS = [
  { id: 'saved', label: 'Save', active: 'Saved' },
  { id: 'read', label: 'Already Read', active: 'Already Read' },
  { id: 'skipped', label: 'Not For Me', active: 'Not for Me' },
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

  if (variant === 'shelf') {
    const handleStatusChange = (e) => {
      const value = e.target.value;
      if (value === shelfStatus) return;
      if (value === 'saved') onSave(book);
      if (value === 'read') onRead(book);
      if (value === 'skipped') onSkip(book);
    };

    return (
      <article className="shelf-card">
        <div className="shelf-card-header">
          <h4 className="shelf-card-title">
            <a href={amazonUrl} target="_blank" rel="noopener noreferrer">{book.title}</a>
          </h4>
          <select className="shelf-status-select" value={shelfStatus} onChange={handleStatusChange}>
            <option value="saved">Saved</option>
            <option value="read">Read</option>
            <option value="skipped">Not For Me</option>
          </select>
        </div>
        <p className="shelf-card-author">{book.author}</p>
        <p className="shelf-card-meta">{book.year} · {book.pages} pages · {book.genre}</p>
        <p className="shelf-card-hook">{book.what}</p>
        <p className="shelf-card-why">{book.why}</p>
      </article>
    );
  }

  const currentState = saved ? 'saved' : read ? 'read' : null;
  const handlers = { saved: onSave, read: onRead, skipped: onSkip };

  return (
    <article className="book-card">
      <div className="book-card-header">
        <div className="book-main">
          <h3 className="book-title">
            <a href={amazonUrl} target="_blank" rel="noopener noreferrer">{book.title}</a>
          </h3>
          <p className="book-author">{book.author}</p>
          <p className="book-meta">{book.year} • {book.pages} pages • {book.genre}</p>
        </div>
        <div className="book-actions">
          {ACTIONS.map((action, index) => (
            <>
              {currentState === action.id ? (
                <span className="book-action-pill active">{action.active}</span>
              ) : (
                <button className="book-action-pill" onClick={() => handlers[action.id](book)}>
                  {action.label}
                </button>
              )}
              {index < ACTIONS.length - 1 && <span className="book-action-divider">|</span>}
            </>
          ))}
        </div>
      </div>
      <p className="book-summary">{book.what}</p>
      <div className="book-why">
        <span className="prompt-kicker">Why we picked it</span>
        <p>{book.why}</p>
      </div>
    </article>
  );
}
