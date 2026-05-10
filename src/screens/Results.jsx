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
  savedBooks,
  skippedBooks,
  refreshCount,
  maxRefreshes,
}) {
  const refreshesLeft = maxRefreshes - refreshCount;
  const canRefresh = refreshesLeft > 0;

  const visibleBooks = data.filter(
    (book) => !skippedBooks.some((item) => item.id === book.id)
  );

  return (
    <main className="results-screen">
      <section className="results-context">
        <div className="results-context-source">
          {prompt?.books?.length > 0 && (
            <span className="results-context-label">Based on</span>
          )}
          <span className="results-context-books">
            {prompt?.books?.length > 0
              ? prompt.books.map(toTitleCase).join(' + ')
              : 'Your Recommendations'}
          </span>
        </div>
        <div className="results-context-controls">
          {canRefresh && (
            <>
              <button className="results-control" onClick={onRefresh}>
                Try again ({refreshesLeft} left)
              </button>
              <span className="results-context-sep">·</span>
            </>
          )}
          <button className="results-control" onClick={onReset}>Start over</button>
        </div>
      </section>

      <section className="results-list">
        {visibleBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onSave={onSave}
            onSkip={onSkip}
            saved={savedBooks.some((item) => item.id === book.id)}
          />
        ))}
      </section>
    </main>
  );
}