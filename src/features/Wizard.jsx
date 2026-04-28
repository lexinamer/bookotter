import { useState } from 'react';
import { STEPS } from '../core/steps';

export default function Wizard({ onSubmit, onReset }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    books: ['', '', ''],
    genre: '',
    length: '',
  });

  const current = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const canAdvance = (() => {
    if (current.type === 'hero') return true;
    if (current.type === 'books') return formData.books[0].trim();
    return true;
  })();

  const handleNext = () => {
    if (!canAdvance) return;
    setStepIndex(prev => prev + 1);
  };

  const handleStartOver = () => {
    setStepIndex(0);
    setFormData({
      books: ['', '', ''],
      genre: '',
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
      genre: formData.genre || null,
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
        <p>Tell us the books you love.</p>
        <h1>We'll tell you what to read next.</h1>

        <button type="button" id="hero-btn" onClick={handleNext}>
          Get Started
        </button>
      </div>
    </section>
  );

  const renderBooks = () => (
    <section className="wizard-section active" id="s-books">
      <div className="step-inner">
        <div className="step-meta">
          <p className="step-label">{current.label}</p>
        </div>

        <h2>{current.title}</h2>
        <p className="step-hint">{current.hint}</p>

        <div className="book-inputs">
          {current.placeholders.map((placeholder, index) => (
            <input
              key={index}
              type="text"
              placeholder={placeholder}
              value={formData.books[index]}
              onChange={(e) => handleBookChange(index, e.target.value)}
              autoComplete="on"
              spellCheck="false"
            />
          ))}
        </div>

        <div className="step-actions">
          <button
            type="button"
            className="btn-next"
            onClick={handleNext}
            disabled={!canAdvance}
          >
            Next
          </button>

          <button
            type="button"
            className="btn-start-over"
            onClick={handleStartOver}
          >
            Start Over
          </button>
        </div>
      </div>
    </section>
  );

  const renderPills = () => (
    <section className="wizard-section active" id={`s-${current.id}`}>
      <div className="step-inner">
        <div className="step-meta">
          <p className="step-label">{current.label}</p>
        </div>

        <h2>{current.title}</h2>
        <p className="step-hint">{current.hint}</p>

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
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>

        <div className="step-actions">
          <button
            type="button"
            className="btn-start-over"
            onClick={handleStartOver}
          >
            Start Over
          </button>

          {isLast ? (
            <button type="submit" id="submit-btn">
              Find my next book →
            </button>
          ) : (
            <button
              type="button"
              className="btn-next"
              onClick={handleNext}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div id="wizard">
      <form id="book-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {current.type === 'hero' && renderHero()}
        {current.type === 'books' && renderBooks()}
        {current.type === 'pills' && renderPills()}
      </form>
    </div>
  );
}