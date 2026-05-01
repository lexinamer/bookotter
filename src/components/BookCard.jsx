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
          <h3>
            <a
              href={`${amazonBase}${query}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {book.title}
            </a>
          </h3>

          <div className="label">{book.author}</div>
          <div className="caption">
            {book.year} • {book.pages} pages{book.genre ? ` • ${book.genre}` : ''}
          </div>
        </div>

        <button
          className={`icon-toggle ${saved ? 'active' : ''}`}
          onClick={handleClick}
        >
          <Bookmark size={14} strokeWidth={1.8} />
        </button>
      </div>

      <p className="callout">{book.what}</p>
      <p>{book.why}</p>
    </div>
  );
}