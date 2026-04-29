import BookCard from '../components/BookCard';

export default function Shelf({
  savedBooks,
  readBooks,
  onRemoveSaved,
  onRemoveRead,
  onRead,
  onBackToResults,
  hasResultsSession,
}) {
  return (
    <div id="results">
      {hasResultsSession && (
        <div className="results-topbar">
          <p className="meta-label">Your Shelf</p>

          <button className="secondary-action" onClick={onBackToResults}>
            Back to Recommendations
          </button>
        </div>
      )}

      <p className="meta-label">Saved Books</p>

      {savedBooks.length === 0 && <p className="body-copy">No saved books yet.</p>}

      <div className="results-grid">
        {savedBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onRemoveSaved={onRemoveSaved}
            onRead={onRead}
            mode="saved"
          />
        ))}
      </div>

      <div style={{ marginTop: '4rem' }}>
        <p className="meta-label">Books Read</p>
      </div>

      {readBooks.length === 0 && <p className="body-copy">No read books yet.</p>}

      <div className="results-grid">
        {readBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onRemoveRead={onRemoveRead}
            mode="read"
          />
        ))}
      </div>
    </div>
  );
}