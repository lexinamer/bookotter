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
        <div className="step-actions" style={{ marginBottom: '2rem' }}>
          <button className="btn-next" onClick={onBackToResults}>
            Back to Recommendations
          </button>
        </div>
      )}

      <p className="results-header">Saved Books</p>

      {savedBooks.length === 0 && <p className="error">No saved books yet.</p>}

      {savedBooks.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onRemoveSaved={onRemoveSaved}
          onRead={onRead}
          mode="saved"
        />
      ))}

      <p className="results-header" style={{ marginTop: '3rem' }}>
        Books Read
      </p>

      {readBooks.length === 0 && <p className="error">No read books yet.</p>}

      {readBooks.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onRemoveRead={onRemoveRead}
          mode="read"
        />
      ))}
    </div>
  );
}
