import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1200;
const TEMPERATURE = 0.7;
const RECOMMENDATION_COUNT = 3;
const MAX_BOOKS_INPUT = 20;
const MAX_BOOK_STRING_LENGTH = 200;

// ─── Client ──────────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Validation ──────────────────────────────────────────────────────────────

function validateRequestBody({ books, moods }) {
  if (!Array.isArray(books) || books.length === 0) {
    return 'At least one book is required';
  }

  if (books.length > MAX_BOOKS_INPUT) {
    return `Too many books — maximum ${MAX_BOOKS_INPUT}`;
  }

  if (!books.every((b) => typeof b === 'string' && b.length <= MAX_BOOK_STRING_LENGTH)) {
    return 'Each book must be a string under 200 characters';
  }

  if (moods !== undefined && !Array.isArray(moods)) {
    return 'Moods must be an array';
  }

  if (Array.isArray(moods) && !moods.every((m) => typeof m === 'string')) {
    return 'Each mood must be a string';
  }

  return null;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildPrompt(books, genre, moods) {
  const bookList = books.map((b) => `- ${b}`).join('\n');

  const genreNote = genre
    ? `The reader wants ${genre} specifically. Only recommend books from this genre. Fiction means contemporary or literary fiction — not Historical Fiction, not Speculative.`
    : '';

  const moodNote = Array.isArray(moods) && moods.length > 0
    ? `The reader is in the mood for something: ${moods.join(' and ')}. Let this guide the emotional tone and reading experience of your recommendations.`
    : '';

  return `You are an expert literary book recommender with deep knowledge of writing styles, literary fiction, and reader taste.

A reader loved these books:
${bookList}

${genreNote}
${moodNote}

Recommend exactly ${RECOMMENDATION_COUNT} books.

Respond ONLY with raw JSON:
{
  "recommendations": [
    {
      "id": "lowercase-title-author-slug",
      "title": "Book Title",
      "author": "Author Name",
      "year": 2020,
      "pages": 320,
      "what": "One sentence capturing the soul of this book — atmospheric, specific, evocative. Not a plot summary. Under 20 words.",
      "why": "One sentence connecting this book to the specific books they loved — name the actual titles, precise, not generic praise. Under 20 words."
    }
  ]
}

Rules:
- id must be deterministic and based on title plus author
- Never recommend books the reader already listed
- Only recommend books that actually exist
- Never recommend YA or middle grade unless the reader's books were YA or middle grade
- Never recommend nonfiction unless the genre is Nonfiction or Memoir
- Pay close attention to emotional tone and mood over genre defaults`;
}

// ─── Response Parsing ────────────────────────────────────────────────────────

function makeBookId(title, author) {
  return `${title}-${author}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseRecommendationResponse(text) {
  const clean = text.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse JSON from Claude response');
  }

  if (!Array.isArray(parsed.recommendations) || parsed.recommendations.length === 0) {
    throw new Error('Invalid recommendation payload');
  }

  return parsed.recommendations.map((book) => ({
    ...book,
    id: book.id || makeBookId(book.title, book.author),
  }));
}

// ─── Route ───────────────────────────────────────────────────────────────────

app.post('/api/recommend', async (req, res) => {
  const { books, genre, moods } = req.body;

  const validationError = validateRequestBody({ books, moods });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  console.log(`[recommend] request — ${books.length} book(s), genre: ${genre || 'any'}`);

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: buildPrompt(books, genre, moods),
        },
      ],
    });

    const rawText = message.content?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Claude');

    const recommendations = parseRecommendationResponse(rawText);

    console.log(`[recommend] success — ${recommendations.length} recommendation(s) returned`);
    res.json({ recommendations });
  } catch (error) {
    console.error('[recommend] error:', error.message);

    if (error.status === 429) {
      return res.status(429).json({ error: 'quota_exceeded' });
    }

    if (error.status >= 400 && error.status < 500) {
      return res.status(error.status).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || 'Failed to get recommendations' });
  }
});

// ─── Server ──────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});