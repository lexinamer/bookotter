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

  const isShelf = variant === 'shelf';

  return (
    <article className={`book-card ${variant}`}>
      <header>
        <div className="heading">
          <h2>
            <a href={amazonUrl} target="_blank" rel="noopener noreferrer">
              {book.title}
            </a>
          </h2>
          <p className="author">{book.author}</p>
          <p className="meta">{book.year} • {book.pages} pages • {book.genre}</p>
        </div>

      </header>

      <p className="summary">{book.what}</p>

      {!isShelf && (
        <section className="why">
          <p>{book.why}</p>
        </section>
      )}

      <div className="actions">
        {isShelf ? (
          <button className="chip" onClick={() => shelfStatus === 'saved' ? onUnsave(book) : onUnskip(book)}>
            Remove
          </button>
        ) : saved ? (
          <span className="saved">Saved</span>
        ) : (
          <>
            <button className="chip" onClick={() => onSave(book)}>Save</button>
            <button className="link" onClick={() => onSkip(book)}>Pass</button>
          </>
        )}
      </div>
    </article>
  );
}