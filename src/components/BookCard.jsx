import { Bookmark } from 'lucide-react';

export default function BookCard({
  book,
  onSave,
  onRemoveSaved,
  mode = 'results',
  saved = false,
}) {
  const amazonBase = 'https://www.amazon.com/s?k=';
  const query = encodeURIComponent(`${book.title} ${book.author}`);

  const handleBookmark = () => {
    if (mode === 'results' && !saved) onSave(book);
    if (mode === 'saved') onRemoveSaved(book);
  };

  return (
    <article className="book-card">
      <div className="book-card-header">
        <div className="book-main">
          <h3 className="book-title">
            <a
              href={`${amazonBase}${query}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {book.title}
            </a>
          </h3>

          <p className="book-author">{book.author}</p>
          <p className="book-meta">{book.year} • {book.pages} pages • {book.genre}</p>
        </div>

        <button
          className={`bookmark-button${saved ? ' active' : ''}`}
          onClick={handleBookmark}
        >
          <Bookmark strokeWidth={1.2} />
        </button>
      </div>

      <p className="book-summary">{book.what}</p>

      <div className="book-why">
        <span className="prompt-kicker">Why we picked it</span>
        <p>{book.why}</p>
      </div>
    </article>
  );
}