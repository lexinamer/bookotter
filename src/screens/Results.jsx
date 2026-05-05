import BookCard from '../components/BookCard';

const toTitleCase = (str) =>
  str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

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

  const visibleBooks = data.filter(
    (book) =>
      !skippedBooks.some((item) => item.id === book.id) &&
      !readBooks.some((item) => item.id === book.id)
  );

  return (
    <main className="results-screen">
      <section className="results-top">
        {prompt?.books?.length > 0 && (
          <p className="results-label">Based on</p>
        )}

        <div className="results-bar">
          <h3 className="results-title">
            {prompt?.books?.length > 0
              ? prompt.books.map(toTitleCase).join(' + ')
              : 'Your Recommendations'}
          </h3>

          <div className="results-actions">
            {canRefresh && (
              <button className="results-action" onClick={onRefresh}>
                Try Again <span>({refreshesLeft} left)</span>
              </button>
            )}

            <button className="results-action" onClick={onReset}>
              Start Over
            </button>
          </div>
        </div>
      </section>

      <section className="results-list">
        {visibleBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onSave={onSave}
            onSkip={onSkip}
            onRead={onRead}
            saved={savedBooks.some((item) => item.id === book.id)}
            read={readBooks.some((item) => item.id === book.id)}
          />
        ))}
      </section>
    </main>
  );
}