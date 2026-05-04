export default function BookCard({
  book,
  onSave,
  onSkip,
  onRemoveSaved,
  onRemoveSkipped,
  mode = 'results',
  saved = false,
  skipped = false,
}) {
  const amazonBase = 'https://www.amazon.com/s?k=';
  const query = encodeURIComponent(`${book.title} ${book.author}`);

  return (
    <article className="book-card">
      <div className="book-card-header">
        <div className="book-main">
          <h3 className="book-title">
            <a href={`${amazonBase}${query}`} target="_blank" rel="noopener noreferrer">
              {book.title}
            </a>
          </h3>

          <p className="book-author">{book.author}</p>
          <p className="book-meta">{book.year} • {book.pages} pages • {book.genre}</p>
        </div>

        <div className="book-actions">
          {mode === 'results' && (
            <>
              <button
                className={`book-action-pill${saved ? ' active' : ''}`}
                onClick={() => saved ? onRemoveSaved?.(book) : onSave(book)}
              >
                {saved ? 'Saved' : 'Save for later'}
              </button>
              <button
                className={`book-action-pill${skipped ? ' active' : ''}`}
                onClick={() => skipped ? onRemoveSkipped?.(book) : onSkip(book)}
              >
                {skipped ? 'Skipped' : 'Not this one'}
              </button>
            </>
          )}

          {mode === 'saved' && (
            <button className="book-action-pill" onClick={() => onRemoveSaved(book)}>
              Remove
            </button>
          )}

          {mode === 'skipped' && (
            <button className="book-action-pill" onClick={() => onRemoveSkipped(book)}>
              Remove
            </button>
          )}
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
