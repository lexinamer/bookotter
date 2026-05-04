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
    <main className="results-screen">
      <section className="results-header">
        <div className="results-meta">
          <p className="form-label">{data.length} recommendations</p>

          <div className="results-actions">
            {canRefresh && (
              <button className="text-action" onClick={onRefresh}>
                Try Again <span className="remaining">({refreshesLeft} left)</span>
              </button>
            )}

            <button className="text-action" onClick={onReset}>
              Start Over
            </button>
          </div>
        </div>

        {prompt?.books?.length > 0 && (
          <div className="results-prompt">
            <span className="prompt-kicker">Based on</span>
            <span className="prompt-books">{prompt.books.join(', ')}</span>
          </div>
        )}
      </section>

      <section className="results-list">
        {data.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onSave={onSave}
            mode="results"
            saved={savedBooks.some(saved => saved.id === book.id)}
          />
        ))}
      </section>
    </main>
  );
}