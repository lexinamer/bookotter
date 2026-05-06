
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
            {shelfStatus === 'saved' ? (
              <>
                <button className="bookcard-shelf-chip" onClick={() => onUnsave(book)}>Unsave</button>
                <button className="bookcard-shelf-chip" onClick={() => onSkip(book)}>Pass</button>
              </>
            ) : (
              <>
                <button className="bookcard-shelf-chip" onClick={() => onUnskip(book)}>Remove</button>
                <button className="bookcard-shelf-chip" onClick={() => onSave(book)}>Save</button>
              </>
            )}
          </div>
        ) : (
          <div className="bookcard-actions">
            {saved ? (
              <span className="bookcard-chip">Saved</span>
            ) : (
              <button className="bookcard-action-save" onClick={() => onSave(book)}>Save</button>
            )}
            <button className="bookcard-action-pass" onClick={() => onSkip(book)}>Pass</button>
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
