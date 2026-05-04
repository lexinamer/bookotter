import BookCard from '../components/BookCard';

export default function Results({
  data,
  prompt,
  onReset,
  onRefresh,
  onSave,
  savedBooks,
  refreshCount,
  maxRefreshes,
}) {
  const refreshesLeft = maxRefreshes - refreshCount;
  const canRefresh = refreshesLeft > 0;

  return (
    <div id="results">
      <div className="topbar">
        <p className="label">{data.length} recommendations</p>

        <div className="topbar-actions">
          {canRefresh && (
            <button className="action" onClick={onRefresh}>
              Try Again
              <span className="remaining">({refreshesLeft} left)</span>
            </button>
          )}
          <button className="action" onClick={onReset}>
            Start Over
          </button>
        </div>
      </div>

      {prompt?.books?.length > 0 && (
        <div className="prompt">
          <span className="prompt-label">Based on</span>
          <span className="prompt-values">{prompt.books.join(', ')}</span>
        </div>
      )}

      {data.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onSave={onSave}
          mode="results"
          saved={savedBooks.some(saved => saved.id === book.id)}
        />
      ))}
    </div>
  );
}
