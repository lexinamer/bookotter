
export default function BookCard({
  book,
  variant = 'results',
  shelfStatus,
  onSave,
  onSkip,
  onUnsave,
  onUnskip,
  saved = false,
}) {
  const query = encodeURIComponent(`${book.title} ${book.author}`);
  const amazonUrl = `https://www.amazon.com/s?k=${query}`;

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
          <div className="bookcard-actions">
            <button className="bookcard-chip" onClick={() => shelfStatus === 'saved' ? onUnsave(book) : onUnskip(book)}>
              Remove
            </button>
          </div>
        ) : (
          <div className="bookcard-actions">
            {saved ? (
              <span className="bookcard-saved">Saved</span>
            ) : (
              <>
                <button className="bookcard-chip" onClick={() => onSave(book)}>Save</button>
                <button className="bookcard-link" onClick={() => onSkip(book)}>Pass</button>
              </>
            )}
          </div>
        )}
      </header>

      <p className="bookcard-summary">{book.what}</p>

      {variant !== 'shelf' && (
        <section className="bookcard-why">
          <span className="bookcard-label">Why we picked it</span>
          <p>{book.why}</p>
        </section>
      )}
    </article>
  );
}
