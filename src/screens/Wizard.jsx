import { useState } from 'react';

const BOOK_FIELDS = [
  { label: 'First book', placeholder: 'Station Eleven' },
  { label: 'Second book', placeholder: 'The Great Alone' },
];

const FOCUS_OPTIONS = [
  { value: 'mood', label: 'Mood' },
  { value: 'topic', label: 'Topic' },
  { value: 'style', label: 'Writing Style' },
];

export default function Wizard({ onSubmit }) {
  const [books, setBooks] = useState(['', '']);
  const [focus, setFocus] = useState('mood');

  const canSubmit = books.some((book) => book.trim());

  function updateBook(index, value) {
    setBooks((prev) => prev.map((book, i) => (i === index ? value : book)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const filledBooks = books
      .filter((book) => book.trim())
      .map((book) => book.trim());

    await onSubmit({ books: filledBooks, focus });
  }

  return (
    <main className="wizard-screen">
      <section className="wizard-hero">
        <h1>
          Tell us two books you love and discover <span>what to read next.</span>
        </h1>
      </section>

      <form className="wizard-form" onSubmit={handleSubmit}>
        <div className="wizard-books">
          {BOOK_FIELDS.map(({ label, placeholder }, index) => (
            <div className="wizard-group" key={label}>
              <label htmlFor={`book-${index}`}>{label}</label>

              <input
                id={`book-${index}`}
                type="text"
                className="input-text"
                placeholder={placeholder}
                value={books[index]}
                onChange={(e) => updateBook(index, e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          ))}
        </div>

        <div className="wizard-focus">
          <label>What do you want more of?</label>

          <div className="wizard-pills">
            {FOCUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`button-pill${focus === option.value ? ' active' : ''}`}
                onClick={() => setFocus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="wizard-cta">
          <button type="submit" className="button-primary" disabled={!canSubmit}>
            Find my next read
          </button>
        </div>
      </form>
    </main>
  );
}