import BookCard from '../components/BookCard';

const toTitleCase = (str) =>
  str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

export default function Results({
  data,
  prompt,
  onReset,
  onRefresh,
  onSave,
  onSkip,
  onRead,
  savedBooks,
  skippedBooks,
  readBooks,
  refreshCount,
  maxRefreshes,
}) {
  const refreshesLeft = maxRefreshes - refreshCount;
  const canRefresh = refreshesLeft > 0;

  return (
    <main className="results-screen">
      <section className="results-header">
        {prompt?.books?.length > 0 && (
          <span className="prompt-kicker">Based on</span>
        )}
        <div className="results-meta">
          <h2 className="results-title">
            {prompt?.books?.length > 0
              ? prompt.books.map(toTitleCase).join(' + ')
              : 'Your Recommendations'}
          </h2>
          <div className="results-right">
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
        </div>
      </section>

      <section className="results-list">
        {data
          .filter(book =>
            !skippedBooks.some(b => b.id === book.id) &&
            !readBooks.some(b => b.id === book.id)
          )
          .map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSave={onSave}
              onSkip={onSkip}
              onRead={onRead}
              mode="results"
              saved={savedBooks.some(b => b.id === book.id)}
              read={readBooks.some(b => b.id === book.id)}
            />
          ))}
      </section>
    </main>
  );
}
