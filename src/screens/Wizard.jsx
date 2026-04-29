import { useState } from 'react';

const STEPS = [
  {
    id: 'hero',
    type: 'hero',
  },
  {
    id: 'books',
    type: 'books',
    label: '01 / 03',
    title: 'What books have you loved?',
    placeholders: [
      'Add a book title',
      'Add another (optional)',
      'Add another (optional)',
    ],
  },
  {
    id: 'mood',
    type: 'pills',
    label: '02 / 03',
    title: 'What are you in the mood for?',
    name: 'mood',
    options: [
      'Fiction',
      'Historical Fiction',
      'Nonfiction',
      'Memoir',
      'Fantasy',
      'Sci-Fi',
      'Mystery',
      'Thriller',
      'Romance',
    ],
  },
  {
    id: 'length',
    type: 'pills',
    label: '03 / 03',
    title: 'Have a preferred length?',
    name: 'length',
    options: [
      'Under 300 pages',
      '300-500 pages',
      'Over 500 pages'
    ],
  },
];

export default function Wizard({ onSubmit, onReset }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    books: ['', '', ''],
    mood: '',
    length: '',
  });

  const current = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const canAdvance = (() => {
    if (current.type === 'hero') return true;
    if (current.type === 'books') return formData.books[0].trim();
    return true;
  })();

  const handleBack = () => {
    setStepIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (!canAdvance) return;
    setStepIndex(prev => prev + 1);
  };

  const handleStartOver = () => {
    setStepIndex(0);
    setFormData({
      books: ['', '', ''],
      mood: '',
      length: '',
    });

    if (onReset) onReset();
  };

  const handleBookChange = (index, value) => {
    const nextBooks = [...formData.books];
    nextBooks[index] = value;

    setFormData(prev => ({
      ...prev,
      books: nextBooks,
    }));
  };

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSubmit({
      books: formData.books.map(b => b.trim()).filter(Boolean),
      mood: formData.mood || null,
      length: formData.length || null,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;

    e.preventDefault();

    if (isLast) {
      handleSubmit(e);
    } else {
      handleNext();
    }
  };

  const renderHero = () => (
    <section className="wizard-section active" id="s-hero">
      <div className="step-inner">
        <p className="meta-label">Tell us a few books you loved.</p>
        <h1 className="display-title">We'll tell you what to read next.</h1>

        <button type="button" className="primary-action" onClick={handleNext}>
          Get Started
        </button>
      </div>
    </section>
  );

  const renderStep = () => (
    <section className="wizard-section active" id={`s-${current.id}`}>
      <div className="step-inner">
        <div className="step-meta">
          {stepIndex > 0 ? (
            <button type="button" className="step-back" onClick={handleBack}>
              ← Back · {current.label}
            </button>
          ) : (
            <p className="micro-label">{current.label}</p>
          )}
        </div>

        <h2 className="display-title">{current.title}</h2>
        {/* {current.hint && <p className="micro-label">{current.hint}</p>} */}

        {current.type === 'books' && (
          <div className="book-inputs">
            {current.placeholders.map((placeholder, index) => (
              <input
                key={index}
                type="text"
                className="field-input field-text"
                placeholder={placeholder}
                value={formData.books[index]}
                onChange={(e) => handleBookChange(index, e.target.value)}
                autoComplete="on"
                spellCheck="false"
              />
            ))}
          </div>
        )}

        {current.type === 'pills' && (
          <div className="pills">
            {current.options.map((option) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;

              return (
                <label key={value} className="pill">
                  <input
                    type="radio"
                    name={current.name}
                    value={value}
                    checked={formData[current.name] === value}
                    onChange={() => handleFieldChange(current.name, value)}
                    onClick={() => {
                      if (formData[current.name] === value) handleFieldChange(current.name, '');
                    }}
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        )}

        <div className="step-actions">
          {isLast ? (
            <button type="button" className="primary-action" onClick={handleSubmit}>
              Find my next book →
            </button>
          ) : (
            <button
              type="button"
              className="primary-action"
              onClick={handleNext}
              disabled={!canAdvance}
            >
              {current.type === 'pills' && !formData[current.name] ? 'Skip' : 'Continue'}
            </button>
          )}

        </div>
      </div>
    </section>
  );

  return (
    <div id="wizard">
      <div id="book-form" onKeyDown={handleKeyDown}>
        {current.type === 'hero' && renderHero()}
        {current.type !== 'hero' && renderStep()}
      </div>
    </div>
  );
}