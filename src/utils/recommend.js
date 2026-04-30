import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 1200;
const TEMPERATURE = 0.65;
const RECOMMENDATION_COUNT = 3;
const MAX_BOOKS_INPUT = 20;
const MAX_BOOK_STRING_LENGTH = 200;

// ─── Client ──────────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Validation ──────────────────────────────────────────────────────────────

function validateRequestBody({ books, readingExperience }) {
  if (!Array.isArray(books) || books.length === 0) {
    return 'At least one book is required';
  }

  if (books.length > MAX_BOOKS_INPUT) {
    return `Too many books — maximum ${MAX_BOOKS_INPUT}`;
  }

  if (!books.every((b) => typeof b === 'string' && b.length <= MAX_BOOK_STRING_LENGTH)) {
    return 'Each book must be a string under 200 characters';
  }

  if (readingExperience != null && typeof readingExperience !== 'string') {
    return 'Reading experience must be a string';
  }

  return null;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildPrompt(books, genre, style) {
  const bookList = books.map((b) => `- ${b}`).join('\n');

  const genreNote = genre
    ? `Keep every recommendation clearly inside the ${genre} shelf. Genre is a boundary filter, not the main source of taste.`
    : `Stay in the same general reading lane suggested by the input books. Do not drift into mismatched genres.`;

  const styleNote = style
    ? `Recommendation style preference: ${style}. Use this only to control how familiar versus unexpected the picks feel, but never overpower similarity to the input books.`
    : '';

  return `You are an expert contemporary book recommendation engine with deep knowledge of real reader taste, bestseller readalikes, genre boundaries, and highly satisfying next-book comps.

A reader loved these books:
${bookList}

The input books are the primary recommendation signal and should drive most of the recommendation logic.
Recommend books that readers of these exact titles would realistically love next.
Prioritize readership overlap, emotional similarity, prose sensibility, pacing, setting energy, and overall reading experience.

Do not match books on surface themes alone.
First determine the shared center of gravity across the input titles: common readership, tonal overlap, prose style, emotional intensity, and likely next-read satisfaction.
Recommend from that shared overlap rather than pulling isolated traits from only one title.

${genreNote}
${styleNote}

Recommend exactly ${RECOMMENDATION_COUNT} books.

If the style is Reader Favorites, favor highly recognizable, widely loved, bestselling, discussion-friendly recommendations.
If the style is Off the Beaten Path, favor more surprising, underrecommended, but still highly credible and satisfying recommendations.
If the style is A Mix of Both, blend familiar favorites with one or two fresher choices.

Respond ONLY with raw JSON:
{
  "recommendations": [
    {
      "id": "lowercase-title-author-slug",
      "title": "Book Title",
      "author": "Author Name",
      "year": 2020,
      "pages": 320,
      "genre": "One of: Fiction, Historical Fiction, Fantasy, Romance, Speculative, Horror, Mystery & Thriller, Nonfiction",
      "what": "One vivid sentence capturing the reading experience or soul of this book. Not a plot summary. Under 20 words.",
      "why": "One precise sentence explaining why fans of the listed input books would love this next. Name the actual input titles when relevant. Under 20 words."
    }
  ]
}

Rules:
- id must be deterministic and based on title plus author
- Never recommend books the reader already listed
- Only recommend books that actually exist
- Never recommend YA or middle grade unless the reader's input books were YA or middle grade
- Never recommend nonfiction unless the genre is Nonfiction
- Never recommend horror unless the genre is Horror or the input books clearly justify horror
- Never recommend romance unless the genre is Romance or the input books clearly justify romance
- Never let recommendation style overpower core similarity to the input books
- Avoid random obscure books chosen only for novelty
- Recommendations should feel like highly satisfying next reads, not merely thematically adjacent books`;
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
  const { books, genre, readingExperience } = req.body;

  const validationError = validateRequestBody({ books, readingExperience });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  console.log(
    `[recommend] request — ${books.length} book(s), genre: ${genre || 'any'}, readingExperience: ${readingExperience || 'any'}`
  );

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: buildPrompt(books, genre, readingExperience),
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