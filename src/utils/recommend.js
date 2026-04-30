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

function validateRequestBody({ books, length }) {
  if (!Array.isArray(books) || books.length === 0) {
    return 'At least one book is required';
  }

  if (books.length > MAX_BOOKS_INPUT) {
    return `Too many books — maximum ${MAX_BOOKS_INPUT}`;
  }

  if (!books.every((b) => typeof b === 'string' && b.length <= MAX_BOOK_STRING_LENGTH)) {
    return 'Each book must be a string under 200 characters';
  }

  if (length != null && typeof length !== 'string') {
    return 'Length must be a string';
  }

  return null;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildPrompt(books, genre, length, excludeBooks = []) {
  const bookList = books.map((b) => `- ${b}`).join('\n');

  const genreNote = genre
    ? `The reader would like ${genre}. Keep recommendations in this lane.`
    : '';

  const lengthNote = length
    ? `The reader prefers ${length} books. Let this gently guide pacing and overall reading commitment.`
    : '';

  const excludeNote = excludeBooks.length > 0
    ? `\nDo NOT recommend any of these books (already suggested):\n${excludeBooks.map((b) => `- ${b}`).join('\n')}`
    : '';

      return `You are a literary book recommender who thinks like a trusted bookseller —  someone who matches readers on emotional register, not just genre.

      A reader loved these books:
      ${bookList}

      ${genreNote}
      ${lengthNote}
      ${excludeNote}

      Recommend exactly ${RECOMMENDATION_COUNT} books that this reader would be genuinely excited to pick up next.

      When choosing: ask what emotional need unites the books this reader loved,  then find books that meet that need — even if surface details differ.

      For "what": capture the soul of the book in one sentence. Lead with mood or texture, not plot. Avoid starting with a noun-verb construction. Under 15 words.

      For "why": name a specific craft element — prose style, pacing, structural choice, emotional register — that connects this book to the ones they loved. Name the actual titles. Under 20 words.

      Prioritize writing sensibility, emotional depth, and reader satisfaction over obvious one-to-one similarities in setting, scenery, plot mechanics, or shared subject matter.

      Respond ONLY with raw JSON:
      {
        "recommendations": [
          {
            "id": "lowercase-title-author-slug",
            "title": "Book Title",
            "author": "Author Name",
            "year": 2020,
            "pages": 320,
            "genre": "One of: Fiction, Historical Fiction, Speculative, Dystopian, Fantasy, Romance, Horror, Mystery, Thriller, Memoir, Nonfiction",
            "what": "One sentence capturing the soul of this book — atmospheric, specific, evocative. Not a plot summary. Under 20 words.", 
            "why": "One sentence connecting this book to the specific books they loved — name the actual titles by name, precise, not generic praise. Under 20 words."
          }
        ]
      }

      Rules: 
      - id must be deterministic and based on title plus author 
      - Never recommend books the reader already listed
      - Pay close attention to emotional tone over genre 
      - Only recommend books that actually exist`
  ;}

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
  const { books, genre, length, excludeBooks = [] } = req.body;

  const validationError = validateRequestBody({ books, length });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  console.log(
    `[recommend] request — ${books.length} book(s), genre: ${genre || 'any'}, length: ${length || 'any'}, excluding: ${excludeBooks.length}`
  );

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: buildPrompt(books, genre, length, excludeBooks),
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