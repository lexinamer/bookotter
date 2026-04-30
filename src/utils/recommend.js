import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1200;
const TEMPERATURE = 0.28;
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

// ─── Prompt Builders ─────────────────────────────────────────────────────────

function buildRecommendationSchema() {
  return `
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
The selected genre is a hard boundary. Do not cross it under any circumstances.

Genre boundaries are strict and distinct:
- Fiction means contemporary or literary fiction only. Do not recommend Historical Fiction when the user selected Fiction.
- Historical Fiction means books set in a specific historical period. Do not bleed into contemporary Fiction.
- Speculative means literary speculative fiction — think Emily St. John Mandel, Susanna Clarke, Kazuo Ishiguro. Not hard sci-fi or space opera.
- Fantasy means genre fantasy. Not literary speculative fiction.
- Mystery and Thriller are separate genres. Stay within the one selected.

Mood definitions:
- Beach Read: accessible, propulsive, highly readable — fun and immersive without being demanding
- Book Club: substantive, emotional, discussable, polished mainstream fiction — think Ferrante, Hannah, Patchett, Towles
- Inspiring: uplifting, life-affirming, leaves the reader moved and energized
- Unhinged: darkly funny, strange, audacious, narratively surprising, tonally offbeat in an entertaining way
- Laugh Out Loud: genuinely comic — wit or humor is central, not a footnote
- Suspenseful: tension-driven, high stakes, strong forward pull
- Atmospheric: immersive, textured, sensory — mood, setting, and prose feel as important as plot
- Devastating: emotionally brutal, tragic, or deeply devastating — will leave the reader wrecked

Favor well-known and widely loved books, but do not avoid a lesser-known title if it is a genuinely perfect fit.
Prioritize variety — do not default to the most obvious comp title.

Do not drift into:
- academic nonfiction
- obscure speculative fiction
- strange niche genre picks

Recommendations should feel cohesive together.

Hard rules:
- never recommend books the reader already entered
- only recommend real existing books
- never recommend YA or middle grade unless the user's input books were YA or middle grade
- never recommend nonfiction unless the user selected Nonfiction or Memoir as their genre
- never recommend Historical Fiction when the user selected Fiction
- if Beach Read is selected, do not recommend slow, dense, structurally difficult, or meditative books
- if Devastating is selected, do not recommend light, cozy, or redemptive books

Return only valid raw JSON.
`;
}

function buildUserPrompt(books, genre, moods) {
  const genreInstruction = genre ? `Required genre: ${genre}. This is a hard boundary — do not recommend books from any other genre.` : '';
  const moodInstruction = Array.isArray(moods) && moods.length > 0
    ? `Required moods (PRIMARY constraint): ${moods.join(', ')}.`
    : '';

  return `
Reader loved these books:
${books.map((b) => `- ${b}`).join('\n')}

${genreInstruction}
${moodInstruction}

Recommend exactly ${RECOMMENDATION_COUNT} books this reader would most likely love next.

Respond in this exact format:
${buildRecommendationSchema()}
`;
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
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(books, genre, moods),
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