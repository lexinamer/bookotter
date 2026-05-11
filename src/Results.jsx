const toTitleCase = (str) =>
  str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

export default function Results({
  data,
  prompt,
  onReset,
  onRefresh,
  refreshCount,
  maxRefreshes,
  loading,
}) {
  const refreshesLeft = maxRefreshes - refreshCount;
  const canRefresh = refreshesLeft > 0;

  return (
    <main className="results-screen">
      <section className={`results-context ${loading ? 'is-loading' : ''}`}>
        <div className="results-context-source">
          {prompt?.books?.length > 0 && (
            <span className="results-context-label">Because you loved</span>
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
              <button className="results-control" onClick={onRefresh} disabled={loading}>
                {loading ? 'Finding books...' : `Try again (${refreshesLeft} left)`}
              </button>
              <span className="results-context-sep">·</span>
            </>
          )}
          <button className="results-control" onClick={onReset} disabled={loading}>
            Start over
          </button>
        </div>
      </section>

      <section className={`results-list ${loading ? 'is-loading' : ''}`}>
        {data.map((book) => {
          const goodreadsUrl = `https://www.goodreads.com/search?q=${encodeURIComponent(`${book.title} ${book.author}`)}`;

          return (
            <article key={book.id} className="book-card">
              <header>
                <div className="heading">
                  <h2>
                    <a href={goodreadsUrl} target="_blank" rel="noopener noreferrer">
                      {book.title}
                    </a>
                  </h2>
                  <p className="author">{book.author}</p>
                  <p className="meta">{book.year} • {book.pages} pages • {book.genre}</p>
                </div>
              </header>

              <p className="summary">{book.what}</p>

              <section className="why">
                <p>{book.why}</p>
              </section>
            </article>
          );
        })}
      </section>
    </main>
  );
}
