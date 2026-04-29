import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function makeBookId(title, author) {
  return `${title}-${author}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

app.post('/api/recommend', async (req, res) => {
  try {
    const { books, mood, length } = req.body;

    if (!books || !Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: 'At least one book is required' });
    }

    const moodInstruction = mood ? `Preferred mood: ${mood}` : '';

    const lengthInstruction =
      length && length !== 'No preference'
        ? length === 'Short'
          ? 'Favor books generally under 300 pages.'
          : length === 'Medium'
            ? 'Favor books generally between 300 and 500 pages.'
            : length === 'Long'
              ? 'Favor books generally over 500 pages.'
              : ''
        : '';

    const systemPrompt = `
You are an obsessive independent bookseller with exceptional skill at matching readers to books.

Your recommendations should feel uncannily precise, as if you immediately understood what the reader actually loved.

You prioritize:
- prose feel
- emotional atmosphere
- narrative pressure
- psychological intimacy
- setting texture
- literary vs commercial sensibility
- darkness, tenderness, menace, loneliness, warmth, brutality

You do NOT prioritize:
- broad mood alone
- bestseller popularity
- famous award winners unless exact fits
- vague "similar vibe" recommendations
- books that are merely plot-adjacent

Hard rules:
- never recommend books the reader listed
- only recommend real existing books
- avoid fantasy, sci-fi, magical realism, and speculative drift unless clearly justified by the user's books
- recommendations should feel hand-sold, not algorithmic

Example of recommendation quality:

Input books:
- The Great Alone
- Wild Dark Shore

Good recommendation behavior:
Prefer tense, isolated, psychologically severe literary fiction rooted in hostile environments, family pressure, loneliness, and emotional survival.

Bad recommendation behavior:
Do not jump to random atmospheric fantasy, speculative fiction, or simply "beautifully written" literary novels.

Return only valid raw JSON.
`;

    const userPrompt = `
Reader loved:
${books.map((b) => `- ${b}`).join('\n')}
${moodInstruction}
${lengthInstruction}

Silently infer the reader's hidden taste profile, then recommend exactly 3 books that are the closest experiential matches.

Respond in this exact format:

{
  "recommendations": [
    {
      "id": "lowercase-title-author-slug",
      "title": "Book Title",
      "author": "Author Name",
      "year": 2020,
      "pages": 320,
      "what": "One vivid concrete sentence describing the reading experience. No plot summary. Under 16 words.",
      "why": "One precise sentence explaining why this strongly matches the user's listed books, naming at least one listed title. Under 16 words."
    },
    {
      "id": "lowercase-title-author-slug",
      "title": "Book Title",
      "author": "Author Name",
      "year": 2020,
      "pages": 320,
      "what": "One vivid concrete sentence describing the reading experience. No plot summary. Under 16 words.",
      "why": "One precise sentence explaining why this strongly matches the user's listed books, naming at least one listed title. Under 16 words."
    },
    {
      "id": "lowercase-title-author-slug",
      "title": "Book Title",
      "author": "Author Name",
      "year": 2020,
      "pages": 320,
      "what": "One vivid concrete sentence describing the reading experience. No plot summary. Under 16 words.",
      "why": "One precise sentence explaining why this strongly matches the user's listed books, naming at least one listed title. Under 16 words."
    }
  ]
}
`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      temperature: 0.35,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const text = message.content[0].text.trim();
    const clean = text.replace(/```json|```/g, '').trim();

    const parsed = JSON.parse(clean);

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid recommendation payload');
    }

    const normalized = parsed.recommendations.map((book) => ({
      ...book,
      id: book.id || makeBookId(book.title, book.author),
    }));

    res.json({ recommendations: normalized });

  } catch (error) {
    console.error('Recommendation Error:', error);

    if (error.status === 429) {
      return res.status(429).json({ error: 'quota_exceeded' });
    }

    res.status(500).json({
      error: error.message || 'Failed to get recommendations',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});