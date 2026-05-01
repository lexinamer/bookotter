import { X } from 'lucide-react';
import BookCard from '../components/BookCard';

export default function Shelf({ isOpen, onClose, savedBooks, onRemoveSaved }) {
  return (
    <>
      {isOpen && <div className="shelf-overlay" onClick={onClose} />}

      <div className={`shelf-panel ${isOpen ? 'open' : ''}`}>
        <div className="shelf-header">
          <p className="label">Bookshelf</p>
          <button className="icon-toggle" onClick={onClose}>
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        <div className="shelf-body">
          {savedBooks.length === 0 ? (
            <p>No saved books yet.</p>
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
      </div>
    </>
  );
}
