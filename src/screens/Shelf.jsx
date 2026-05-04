import { X } from 'lucide-react';
import BookCard from '../components/BookCard';

export default function Shelf({ isOpen, onClose, savedBooks, skippedBooks, onRemoveSaved, onRemoveSkipped }) {
  const isEmpty = savedBooks.length === 0 && skippedBooks.length === 0;

  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose} />}

      <aside className={`shelf-panel ${isOpen ? 'open' : ''}`}>
        <div className="shelf-header">
          <p className="form-label">My Bookshelf</p>

          <button className="close-button" onClick={onClose}>
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="shelf-body">
          {isEmpty ? (
            <div className="empty-shelf">
              <p>No books here yet.</p>
            </div>
          ) : (
            <>
              {savedBooks.length > 0 && (
                <div className="shelf-section">
                  <p className="form-label shelf-section-label">Save for Later</p>
                  {savedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onRemoveSaved={onRemoveSaved}
                      mode="saved"
                    />
                  ))}
                </div>
              )}

              {skippedBooks.length > 0 && (
                <div className="shelf-section">
                  <p className="form-label shelf-section-label">Not This One</p>
                  {skippedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onRemoveSkipped={onRemoveSkipped}
                      mode="skipped"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
