export default function Results({
  data,
  onReset,
  onSave,
  onRead,
  savedBooks,
  readBooks,
}) {
  if (data.error) {
    return (
      <div id="results">
        <p className="body-copy">{data.error}</p>
      </div>
    );
  }

  return (
    <div id="results">
      <div className="results-topbar">
        <p className="meta-label">{data.length} recommendations for you</p>

        <button className="text-action" onClick={onReset}>
          Start Over
        </button>
      </div>

      {data.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onSave={onSave}
          onRead={onRead}
          mode="results"
          saved={savedBooks.some(saved => saved.id === book.id)}
          read={readBooks.some(read => read.id === book.id)}
        />
      ))}
    </div>
  );
}