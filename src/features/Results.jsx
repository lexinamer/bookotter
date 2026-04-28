import BookCard from '../components/BookCard';

export default function Results({ data, onReset }) {
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

      {data.map((book, idx) => (
        <BookCard
          key={idx}
          book={book}
          onSave={() => {}}
          onRead={() => {}}
          onUnsave={() => {}}
          mode="results"
          saved={false}
        />
      ))}

      <div className="step-actions" style={{ marginTop: '3rem' }}>
        <button className="btn-next" onClick={onReset}>
          Get New Books
        </button>

        <button className="btn-start-over" onClick={onReset}>
          Start Over
        </button>
      </div>
    </div>
  );
}