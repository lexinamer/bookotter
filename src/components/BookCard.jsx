export default function BookCard({
  book,
  onSave,
  onSkip,
  onRead,
  mode = 'results',
  saved = false,
  read = false,
}) {
  const amazonBase = 'https://www.amazon.com/s?k=';
  const query = encodeURIComponent(`${book.title} ${book.author}`);

  let actionContent;

  if (mode === 'results') {
    if (saved) {
      actionContent = <span className="book-action-pill active">Saved</span>;
    } else if (read) {
      actionContent = <span className="book-action-pill active">Read</span>;
    } else {
      actionContent = (
        <>
          <button className="book-action-pill" onClick={() => onSave(book)}>
            Save
          </button>
          <button className="book-action-pill" onClick={() => onRead(book)}>
            Read
          </button>
          <button className="book-action-pill" onClick={() => onSkip(book)}>
            Pass
          </button>
        </>
      );
    }
  }

  if (mode === 'saved') {
    actionContent = (
      <>
        <span className="book-action-pill active">Saved</span>
        <button className="book-action-pill" onClick={() => onRead(book)}>
          Read
        </button>
        <button className="book-action-pill" onClick={() => onSkip(book)}>
          Pass
        </button>
      </>
    );
  }

  if (mode === 'read') {
    actionContent = (
      <>
        <button className="book-action-pill" onClick={() => onSave(book)}>
          Save
        </button>
        <span className="book-action-pill active">Read</span>
        <button className="book-action-pill" onClick={() => onSkip(book)}>
          Pass
        </button>
      </>
    );
  }

  if (mode === 'skipped') {
    actionContent = (
      <>
        <button className="book-action-pill" onClick={() => onSave(book)}>
          Save
        </button>
        <button className="book-action-pill" onClick={() => onRead(book)}>
          Read
        </button>
        <span className="book-action-pill active">Passed</span>
      </>
    );
  }

  return (
    <article className="book-card">
      <div className="book-card-header">
        <div className="book-main">
          <h3 className="book-title">
            <a href={`${amazonBase}${query}`} target="_blank" rel="noopener noreferrer">
              {book.title}
            </a>
          </h3>

          <p className="book-author">{book.author}</p>
          <p className="book-meta">{book.year} • {book.pages} pages • {book.genre}</p>
        </div>

        <div className="book-actions">
          {actionContent}
        </div>
      </div>

      <p className="book-summary">{book.what}</p>

      <div className="book-why">
        <span className="prompt-kicker">Why we picked it</span>
        <p>{book.why}</p>
      </div>
    </article>
  );
}