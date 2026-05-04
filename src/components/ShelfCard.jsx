export default function ShelfCard({ book, mode, onSave, onSkip, onRead }) {
  const amazonBase = 'https://www.amazon.com/s?k=';
  const query = encodeURIComponent(`${book.title} ${book.author}`);

  const currentStatus = {
    saved: 'saved',
    read: 'read',
    skipped: 'skipped',
  }[mode];

  const handleStatusChange = (e) => {
    const value = e.target.value;

    if (value === currentStatus) return;

    if (value === 'saved') onSave(book);
    if (value === 'read') onRead(book);
    if (value === 'skipped') onSkip(book);
  };

  return (
    <article className="shelf-card">
      <div className="shelf-card-header">
        <h4 className="shelf-card-title">
          <a href={`${amazonBase}${query}`} target="_blank" rel="noopener noreferrer">
            {book.title}
          </a>
        </h4>
        <select
          className="shelf-status-select"
          value={currentStatus}
          onChange={handleStatusChange}
        >
          <option value="saved">Saved</option>
          <option value="read">Read</option>
          <option value="skipped">Passed</option>
        </select>
      </div>
      <p className="shelf-card-author">{book.author}</p>
      <p className="shelf-card-meta">{book.year} · {book.pages} pages · {book.genre}</p>
      <p className="shelf-card-hook">{book.what}</p>
      <p className="shelf-card-why">{book.why}</p>

    </article>
  );
}