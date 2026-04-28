export default function BookCard({
  book,
  onSave,
  onRead,
  onUnsave,
  mode = 'results',
  saved = false,
}) {
  const bookshopBase = 'https://bookshop.org/search?keywords=';
  const amazonBase = 'https://www.amazon.com/s?k=';
  const query = encodeURIComponent(`${book.title} ${book.author}`);

  return (
    <div className="result-card">
      <div className="result-title">{book.title}</div>
      <div className="result-author">{book.author}</div>
      <div className="result-meta">{book.year} • {book.pages} pages</div>
      <div className="result-what">{book.what}</div>
      <div className="result-why">{book.why}</div>

      <div className="result-links">
        <a
          href={`${bookshopBase}${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="result-link"
        >
          Bookshop
        </a>

        <a
          href={`${amazonBase}${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="result-link"
        >
          Amazon
        </a>
      </div>

      {mode === 'results' && (
        <div className="result-links" style={{ marginTop: '1rem' }}>
          {saved ? (
            <button className="result-link" onClick={() => onUnsave(book)}>
              Saved
            </button>
          ) : (
            <button className="result-link" onClick={() => onSave(book)}>
              Save
            </button>
          )}

          <button className="result-link" onClick={() => onRead(book)}>
            Mark Read
          </button>
        </div>
      )}

      {mode === 'saved' && (
        <div className="result-links" style={{ marginTop: '1rem' }}>
          <button className="result-link" onClick={() => onUnsave(book)}>
            Remove Saved
          </button>

          <button className="result-link" onClick={() => onRead(book)}>
            Mark Read
          </button>
        </div>
      )}

      {mode === 'read' && (
        <div className="result-links" style={{ marginTop: '1rem' }}>
          <button className="result-link" onClick={() => onUnsave(book)}>
            Remove Read
          </button>
        </div>
      )}
    </div>
  );
}