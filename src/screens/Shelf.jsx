import { X } from 'lucide-react';
import BookCard from '../components/BookCard';

export default function Shelf({ isOpen, onClose, savedBooks, onRemoveSaved }) {
  return (
    <>
      {isOpen && <div className="overlay" onClick={onClose} />}

      <aside className={`shelf-panel ${isOpen ? 'open' : ''}`}>
        <div className="shelf-header">
          <p className="form-label">Bookshelf</p>

          <button className="close-button" onClick={onClose}>
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="shelf-body">
          {savedBooks.length === 0 ? (
            <div className="empty-shelf">
              <p>No saved books yet.</p>
            </div>
          ) : (
            savedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onRemoveSaved={onRemoveSaved}
                mode="saved"
                saved={true}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}