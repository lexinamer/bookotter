import { Bookmark, CircleCheck } from 'lucide-react';

export default function BookCard({
  book,
  onSave,
  onRead,
  onRemoveSaved,
  onRemoveRead,
  mode = 'results',
  saved = false,
  read = false,
}) {
  const amazonBase = 'https://www.amazon.com/s?k=';
  const query = encodeURIComponent(`${book.title} ${book.author}`);

  return (
    <div className="result-card">
      <div className="card-top">
        <div className="card-headings">
          <a
            href={`${amazonBase}${query}`}
            target="_blank"
            rel="noopener noreferrer"
            className="result-title"
          >
            {book.title}
          </a>

          <div className="result-author">{book.author}</div>
          <div className="result-meta">{book.year} • {book.pages} pages</div>
        </div>

        {mode === 'results' && (
          <div className="card-actions">
            <button
              className={`icon-toggle ${saved ? 'active' : ''}`}
              onClick={() => !saved && !read && onSave(book)}
            >
              <Bookmark size={15} strokeWidth={1.8} />
            </button>

            <button
              className={`icon-toggle ${read ? 'active' : ''}`}
              onClick={() => !read && onRead(book)}
            >
              <CircleCheck size={15} strokeWidth={1.8} />
            </button>
          </div>
        )}

        {mode === 'saved' && (
          <div className="card-actions">
            <button
              className="icon-toggle active"
              onClick={() => onRemoveSaved(book)}
            >
              <Bookmark size={15} strokeWidth={1.8} />
            </button>

            <button
              className="icon-toggle"
              onClick={() => onRead(book)}
            >
              <CircleCheck size={15} strokeWidth={1.8} />
            </button>
          </div>
        )}

        {mode === 'read' && (
          <div className="card-actions">
            <button
              className="icon-toggle active"
              onClick={() => onRemoveRead(book)}
            >
              <CircleCheck size={15} strokeWidth={1.8} />
            </button>
          </div>
        )}
      </div>

      <div className="result-what">{book.what}</div>
      <div className="result-why">{book.why}</div>
    </div>
  );
}
