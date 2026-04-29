import BookCard from '../components/BookCard';

export default function Results({
  data,
  onReset,
  onSave,
  onUnsave,
  onRead,
  savedBooks,
}) {
  if (data.error) {
    return (
      <div id="results">
        <p className="error">{data.error}</p>
      </div>
    );
  }

  return (
    <div id="results">
      <p className="results-header">{data.length} recommendations for you</p>
      <button className="btn-next" onClick={onReset}>Get New Books</button>

      {data.map((book, idx) => (
        <BookCard
          key={idx}
          book={book}
          onSave={onSave}
          onRead={onRead}
          onUnsave={onUnsave}
          mode="results"
          saved={savedBooks.some(saved => saved.id === book.id)}
        />
      ))}
    </div>
  );
}