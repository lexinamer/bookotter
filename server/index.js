import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2000;
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

function validateRequestBody({ books }) {
  if (!Array.isArray(books) || books.length === 0) {
    return 'At least one book is required';
  }

  if (books.length > MAX_BOOKS_INPUT) {
    return `Too many books — maximum ${MAX_BOOKS_INPUT}`;
  }

  if (!books.every((b) => typeof b === 'string' && b.length <= MAX_BOOK_STRING_LENGTH)) {
    return 'Each book must be a string under 200 characters';
  }

  return null;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────
const FOCUS_INSTRUCTIONS = {
  mood: 'The reader wants books with the same immersive vibe and mood, emotional payoff, pacing, and overall feeling. Prioritize reader experience over exact plot similarity.',
  topic: 'The reader wants books with the same topic, premise, setting, historical lane, or central story dynamic. Lean confidently into subject similarity.',
  style: 'The reader wants books with the same writing style, readability, storytelling rhythm, and prose accessibility. Prioritize a similar reading experience even if the topic changes.',
};

function buildPrompt(
  books,
  mode = 'mood',
  excludeBooks = [],
  savedBooks = [],
  readBooks = [],
  skippedBooks = []
) {
  const bookList = books.map(b => `- ${b}`).join('\n');

  const excludeNote = excludeBooks.length > 0
    ? `\nDo NOT recommend any of these books (already suggested):\n${excludeBooks.map(b => `- ${b}`).join('\n')}`
    : '';

  const userMemory = [...savedBooks, ...readBooks, ...skippedBooks].map(book =>
    typeof book === 'string' ? book : book.title
  );

  const memoryNote = userMemory.length > 0
    ? `\nDo NOT recommend any of these books the reader has already saved, marked as read, or skipped:\n${userMemory.map(b => `- ${b}`).join('\n')}`
    : '';

  const modeInstruction = {
    vibe: `Prioritize matching the same emotional mood, immersive feeling, pacing, atmosphere, and reader satisfaction over exact plot similarities.`,

    topic: `Prioritize matching the same subject matter, historical lane, premise, relationship dynamics, or central story situation while keeping the books highly readable and compelling.`,

    style: `Prioritize matching the same writing style, prose accessibility, storytelling rhythm, character depth, and overall reading experience even if the subject matter differs.`
  };

  return `You are a high-conviction next-read recommender. Your job is to suggest books the reader will be excited to start immediately — highly readable, emotionally immersive, satisfying, and strongly aligned with what they loved.

A reader loved these books:
${bookList}
${excludeNote}
${memoryNote}

${modeInstruction[mode]}

Silently identify what specific reading itch these books satisfy, then recommend exactly ${RECOMMENDATION_COUNT} books that scratch that same itch.

Rules for choosing:
- Prioritize books that are absorbing, easy to get into, emotionally rewarding, and hard to put down
- Strongly prefer books published in 1990 or later
- Choose books that are well-loved, dependable, and likely to keep reading momentum high
- Avoid obscure, dusty, overly academic, or difficult literary choices
- At least one recommendation should feel like an immediate obvious yes
- The three recommendations should provide slightly different options, not three versions of the exact same book
- Never recommend a book the reader already listed
- Do NOT recommend any book already suggested above
- Do NOT recommend any book the reader has already saved, read, or passed on
- Only recommend books you are certain exist

For the "what" field: one vivid sentence that clearly explains what the book is about and why it feels compelling. Under 35 words.

For the "why" field: explain specifically why this scratches the same itch as the input books. Mention the actual input titles. Under 22 words.

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
      "what": "What it's about and why it's compelling.",
      "why": "Why it scratches the same itch."
    }
  ]
}`;
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
  const { books, excludeBooks = [], focus = null, readBooks = [], skippedBooks = [] } = req.body;

  const validationError = validateRequestBody({ books });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  console.log(
    `[recommend] request — ${books.length} book(s), focus: ${focus || 'none'}, excluding: ${excludeBooks.length}`
  );

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: buildPrompt(books, focus, excludeBooks, [], readBooks, skippedBooks),
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
