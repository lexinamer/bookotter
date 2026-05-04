import { useState } from 'react';

const FOCUS_OPTIONS = [
  { value: 'mood', label: 'Mood' },
  { value: 'topic', label: 'Topic' },
  { value: 'style', label: 'Writing Style' },
];

export default function Wizard({ onSubmit }) {
  const [books, setBooks] = useState([{ title: '' }, { title: '' }]);
  const [focus, setFocus] = useState('mood');

  const canSubmit = books.some(book => book.title.trim());

  const updateBook = (index, value) => {
    setBooks(prev =>
      prev.map((book, i) => (i === index ? { ...book, title: value } : book))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const filledBooks = books
      .filter(book => book.title.trim())
      .map(book => book.title.trim());

    await onSubmit({ books: filledBooks, focus });
  };

  return (
    <main className="wizard-screen">
      <section className="wizard-hero">
        <h1>
          Tell us two books you love and discover <span className="accent">what to read next.</span>
        </h1>
      </section>

      <form className="wizard-form" onSubmit={handleSubmit}>
        <div className="book-row">
          {[
            { label: 'First book', placeholder: 'Station Eleven' },
            { label: 'Second book', placeholder: 'The Great Alone' },
          ].map(({ label, placeholder }, i) => (
            <div key={i} className="form-group">
              <label className="form-label" htmlFor={`book-${i}`}>{label}</label>
              <input
                id={`book-${i}`}
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={books[i].title}
                onChange={(e) => updateBook(i, e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          ))}
        </div>

        <div className="focus-group">
          <p className="form-label">What do you want more of?</p>

          <div className="pill-row">
            {FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`pill-button${focus === opt.value ? ' active' : ''}`}
                onClick={() => setFocus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cta-row">
          <button type="submit" className="primary-action" disabled={!canSubmit}>
            Find my next read
          </button>
        </div>
      </form>
    </main>
  );
}