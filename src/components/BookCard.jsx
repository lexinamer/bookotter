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

  const handleClick = () => {
    if (mode === 'results' && !saved) onSave(book);
    if (mode === 'saved') onRemoveSaved(book);
  };

  return (
    <div className="result-card">
      <div className="card-top">
        <div className="card-headings">
          <a
            href={`${amazonBase}${query}`}
            target="_blank"
            rel="noopener noreferrer"
            className="display-title-sm"
          >
            {book.title}
          </a>

          <div className="meta-label">{book.author}</div>
          <div className="micro-label">
            {book.genre} • {book.year} • {book.pages} pages
          </div>
        </div>

        <button
          className={`icon-toggle ${saved ? 'active' : ''}`}
          onClick={handleClick}
        >
          <Bookmark size={14} strokeWidth={1.8} />
        </button>
      </div>

      <p className="book-note">{book.what}</p>
      <p className="book-reason">{book.why}</p>
    </div>
  );
}