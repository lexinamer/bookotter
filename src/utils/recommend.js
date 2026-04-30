import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1200;
const TEMPERATURE = 0.32;
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

// ─── Prompt builders ─────────────────────────────────────────────────────────

function buildMoodInstruction(moods) {
  if (!Array.isArray(moods) || moods.length === 0) return '';
  return `Current reading mood modifiers: ${moods.join(', ')}.`;
}

function buildRecommendationSchema() {
  return `
Every book object must include all fields below — omitting any field is an error.

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
    }
  ]
}`;
}

function buildSystemPrompt() {
  return `
    You are an obsessive independent bookseller with exceptional skill at matching readers to books.

    Your job is to produce ${RECOMMENDATION_COUNT} highly targeted recommendations that feel hand-sold and uncannily precise.

    Infer from the books the reader loved:
    - prose feel
    - emotional atmosphere
    - pacing
    - psychological intensity
    - literary vs commercial sensibility
    - setting texture
    - thematic concerns

    The user's selected moods are the PRIMARY constraint. Satisfy them first.
    Genre is a soft boundary — bend it slightly if needed to honor the mood.

    Mood definitions:
    - Easy Reading: accessible prose, fast chapters, not demanding — think book club or beach read
    - Page Turner: plot-driven, hard to put down, high forward momentum
    - Suspenseful: tension-driven, something is always at stake
    - Funny: genuinely comic, wit or humor is a core feature not a footnote
    - Thought Provoking: ideas-forward, lingers in the mind after finishing
    - Dark & Heavy: emotionally or thematically difficult, slow burn is fine
    - Light & Hopeful: uplifting, warm, low stakes

    Stay inside adult mainstream reading lanes unless clearly directed otherwise.

    Do not drift into:
    - academic nonfiction
    - obscure speculative fiction
    - strange niche genre picks

    Recommendations should feel cohesive together.

    Hard rules:
    - never recommend books the reader already listed
    - only recommend real existing books
    - if the mood signals accessible and fast-paced, do not recommend slow, literary, or meditative books regardless of thematic fit

    Return only valid raw JSON.
  `;
}

function buildUserPrompt(books, genre, moods) {
  const genreInstruction = genre ? `Preferred genre lane: ${genre}.` : '';
  const moodInstruction = buildMoodInstruction(moods);
  return `
Reader loved:
${books.map((b) => `- ${b}`).join('\n')}
${genreInstruction}
${moodInstruction}

Recommend exactly ${RECOMMENDATION_COUNT} books that best fit this reader.

Respond in this exact format:
${buildRecommendationSchema()}
`;
}

// ─── Response parsing ────────────────────────────────────────────────────────

// Fallback slug in case Claude omits the id field despite schema instructions
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
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildUserPrompt(books, genre, moods) }],
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
