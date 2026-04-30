import { useState } from 'react';

const STEPS = [
  {
    id: 'hero',
    type: 'hero',
  },
  {
    id: 'books',
    type: 'books',
    title: 'What books have you loved?',
    placeholders: [
      'Add a book title',
      'Add another (optional)',
      'Add another (optional)',
    ],
  },
  {
    id: 'genre',
    type: 'pills',
    title: 'Looking for a particular genre?',
    name: 'genre',
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
    id: 'mood',
    type: 'pills',
    title: 'What two moods are you feeling?',
    name: 'mood',
    maxSelect: 2,
    options: [
      'Easy Reading',
      'Page Turner',
      'Suspenseful',
      'Funny',
      'Thought Provoking',
      'Dark & Heavy',
      'Light & Hopeful',
    ],
  },
  // {
  //   id: 'length',
  //   type: 'pills',
  //   title: 'Have a preferred length?',
  //   name: 'length',
  //   options: [
  //     'Under 300 pages',
  //     '300-500 pages',
  //     'Over 500 pages'
  //   ],
  // },
];

const nonHeroSteps = STEPS.filter(s => s.type !== 'hero');

const buildInitialFormData = () => {
  const data = {};
  STEPS.forEach(step => {
    if (step.type === 'books') data.books = Array(step.placeholders.length).fill('');
    if (step.type === 'pills') data[step.name] = step.maxSelect > 1 ? [] : '';
  });
  return data;
};

export default function Wizard({ onSubmit, onReset }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState(buildInitialFormData);

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
    setFormData(buildInitialFormData());
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
      [name]: prev[name] === value ? '' : value,
    }));
  };

  const handleMultiFieldChange = (name, value, maxSelect) => {
    setFormData(prev => {
      const selected = prev[name];
      if (selected.includes(value)) return { ...prev, [name]: selected.filter(v => v !== value) };
      if (selected.length >= maxSelect) return prev;
      return { ...prev, [name]: [...selected, value] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {};
    STEPS.forEach(step => {
      if (step.type === 'books') payload.books = formData.books.map(b => b.trim()).filter(Boolean);
      if (step.type === 'pills') {
        const val = formData[step.name];
        payload[step.name] = Array.isArray(val) ? (val.length ? val : null) : (val || null);
      }
    });
    await onSubmit(payload);
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

  const renderStep = () => {
    const stepNum = nonHeroSteps.indexOf(current) + 1;
    const stepLabel = `${String(stepNum).padStart(2, '0')} / ${String(nonHeroSteps.length).padStart(2, '0')}`;
    const fieldValue = current.type === 'pills' ? formData[current.name] : null;
    const isEmpty = Array.isArray(fieldValue) ? fieldValue.length === 0 : !fieldValue;

    return (
      <section className="wizard-section active" id={`s-${current.id}`}>
        <div className="step-inner">
          <div className="step-meta">
            {stepIndex > 0 ? (
              <button type="button" className="step-back" onClick={handleBack}>
                ← Back · {stepLabel}
              </button>
            ) : (
              <p className="micro-label">{stepLabel}</p>
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
                const isMulti = current.maxSelect > 1;
                const checked = isMulti ? fieldValue.includes(value) : fieldValue === value;
                const disabled = isMulti && !checked && fieldValue.length >= current.maxSelect;

                return (
                  <label key={value} className={`pill${disabled ? ' disabled' : ''}`}>
                    <input
                      type={isMulti ? 'checkbox' : 'radio'}
                      name={current.name}
                      value={value}
                      checked={checked}
                      disabled={disabled}
                      onChange={isMulti ? () => handleMultiFieldChange(current.name, value, current.maxSelect) : undefined}
                      onClick={!isMulti ? () => handleFieldChange(current.name, value) : undefined}
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
                {current.type === 'pills' && isEmpty ? 'Skip' : 'Continue'}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div id="wizard">
      <div id="book-form" onKeyDown={handleKeyDown}>
        {current.type === 'hero' && renderHero()}
        {current.type !== 'hero' && renderStep()}
      </div>
    </div>
  );
}
