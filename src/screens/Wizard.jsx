import { useState } from 'react';

const FOCUS_OPTIONS = [
  { value: 'mood', label: 'The same mood' },
  { value: 'topic', label: 'The same topic' },
  { value: 'writing style', label: 'The same writing style' },
];

export default function Wizard({ onSubmit }) {
  const [books, setBooks] = useState([{ title: '' }, { title: '' }]);
  const [focus, setFocus] = useState(null);

  const canSubmit = books.some(b => b.title.trim());

  const update = (index, value) => {
    setBooks(prev => prev.map((b, i) => i === index ? { ...b, title: value } : b));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const filled = books.filter(b => b.title.trim());
    await onSubmit({ books: filled.map(b => b.title.trim()), focus });
  };

  return (
    <div id="input-form">
      <h1>Tell us two books you love and discover <span className="accent">what to read next.</span></h1>

      <form onSubmit={handleSubmit}>
        <div class="book-section">
        {[
          { label: 'First book', placeholder: 'Station Eleven' },
          { label: 'Second book', placeholder: 'The Great Alone' },
        ].map(({ label, placeholder }, i) => (
          <div key={i} className="book-entry">
              <label className="label" htmlFor={`book-${i}`}>{label}</label>
              <input
                id={`book-${i}`}
                type="text"
                className="field-input"
                placeholder={placeholder}
                value={books[i].title}
                onChange={e => update(i, e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
          </div>
        ))}
                  </div>

        <div className="focus-section">
          <p className="label">What do you want more of?</p>
          <div className="focus-pills">
            {FOCUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`focus-pill${focus === opt.value ? ' active' : ''}`}
                onClick={() => setFocus(focus === opt.value ? null : opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-action" disabled={!canSubmit}>
            Find my next read
          </button>
        </div>
      </form>
    </div>
  );
}
