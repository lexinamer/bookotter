import BookCard from '../components/BookCard';

export default function Results({
  data,
  prompt,
  onReset,
  onSave,
  savedBooks,
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

      {prompt && (
        <div className="results-prompt">
          {prompt.books?.length > 0 && (
            <div className="results-prompt-row">
              <span className="results-prompt-label">Books you loved</span>
              <span className="results-prompt-values">{prompt.books.join(', ')}</span>
            </div>
          )}
          {prompt.genre && (
            <div className="results-prompt-row">
              <span className="results-prompt-label">Genre</span>
              <span className="results-prompt-values">{prompt.genre}</span>
            </div>
          )}
          {prompt.mood?.length > 0 && (
            <div className="results-prompt-row">
              <span className="results-prompt-label">Mood</span>
              <span className="results-prompt-values">
                {Array.isArray(prompt.mood) ? prompt.mood.join(', ') : prompt.mood}
              </span>
            </div>
          )}
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
