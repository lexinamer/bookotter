export const STEPS = [
  {
    id: 'hero',
    type: 'hero',
  },
  {
    id: 'books',
    type: 'books',
    label: '01 / 03',
    title: 'What books have you loved?',
    hint: 'Enter up to three — the more you share, the better the match.',
    placeholders: [
      'Little Fires Everywhere',
      'Station Eleven',
      'Gone Girl',
    ],
  },
  {
    id: 'genre',
    type: 'pills',
    label: '02 / 03',
    title: 'Any genre in mind?',
    hint: 'Optional — skip if you are open to anything.',
    name: 'genre',
    options: [
      'Fiction',
      'Historical Fiction',
      'Nonfiction',
      'Fantasy / Sci-fi',
      'Mystery / Thriller',
      'Romance',
    ],
  },
  {
    id: 'length',
    type: 'pills',
    label: '03 / 03',
    title: 'How long a read?',
    hint: 'Optional — no preference is totally fine.',
    name: 'length',
    options: [
      { value: 'Short', label: 'Short (under 300 pages)' },
      { value: 'Medium', label: 'Medium (300–500 pages)' },
      { value: 'Long', label: 'Long (500+ pages)' },
      { value: 'No preference', label: 'No preference' },
    ],
  },
];