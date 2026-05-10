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
    <main>
      <h1 className="tagline">
        Tell us two books you love. We'll tell you <span>what's next.</span>
      </h1>

      <form onSubmit={handleSubmit}  className="wizard">
        {BOOK_FIELDS.map(({ label, placeholder }, index) => (
          <section key={label}>
            <label htmlFor={`book-${index}`}>{label}</label>
            <input
              id={`book-${index}`}
              type="text"
              placeholder={placeholder}
              value={books[index]}
              onChange={(e) => updateBook(index, e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
          </section>
        ))}

        <section>
          <label>Recommend by</label>
          {FOCUS_OPTIONS.map((option) => (
            <radio
              key={option.value}
              className={focus === option.value ? 'active' : ''}
              onClick={() => setFocus(option.value)}
            >
              {option.label}
            </radio>
          ))}
        </section>

        <button className="submit" type="submit" disabled={!canSubmit}>
          Find my next read →
        </button>
      </form>
    </main>
  );
}