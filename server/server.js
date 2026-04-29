import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = new Anthropic();

function makeBookId(title, author) {
  return `${title}-${author}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

app.post('/api/recommend', async (req, res) => {
  try {
    const { books, genre, length, readBooks = [] } = req.body;

    if (!books || !Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: 'At least one book is required' });
    }

    const bookList = books.map((b, i) => `${i + 1}. ${b}`).join('\n');

    const readList = readBooks.length
      ? `The reader has already read these and should NEVER receive them again:\n${readBooks.join('\n')}`
      : '';

    const genreNote = genre ? `Genre preference: ${genre}.` : '';

    const lengthNote =
      length && length !== 'No preference'
        ? length === 'Short'
          ? 'Prefer books under 300 pages.'
          : length === 'Medium'
            ? 'Prefer books between 300–500 pages.'
            : length === 'Long'
              ? 'Prefer immersive books over 500 pages.'
              : `Length preference: ${length}.`
        : '';

    const prompt = `You are an expert literary book recommender with deep knowledge of writing styles, literary fiction, and reader taste.

A reader loved these books:
${bookList}
${readList}
${genreNote}
${lengthNote}

Recommend exactly 3 books.

Respond ONLY with raw JSON:

{
  "recommendations": [
    {
      "id": "lowercase-title-author-slug",
      "title": "Book Title",
      "author": "Author Name",
      "year": "Publication year as a number",
      "pages": "Approximate page count as a number",
      "what": "One sentence capturing the soul of this book — atmospheric, specific, evocative. Not a plot summary. Under 20 words.",
      "why": "One sentence connecting this book to the specific books they loved — name the actual titles by name, precise, not generic praise. Under 20 words."
    }
  ]
}

Rules:
- id must be deterministic and based on title plus author
- Never recommend books the reader already listed
- Never recommend books from the already-read list
- Pay close attention to emotional tone over genre
- Only recommend books that actually exist`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1400,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const { recommendations } = JSON.parse(clean);

    const normalized = recommendations.map((book) => ({
      ...book,
      id: book.id || makeBookId(book.title, book.author),
    }));

    res.json({ recommendations: normalized });

  } catch (error) {
    console.error('Error:', error);

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