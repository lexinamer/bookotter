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

function buildMoodInstruction(moods) {
  if (!moods || !Array.isArray(moods) || moods.length === 0) return '';
  return `Current reading mood modifiers: ${moods.join(', ')}.`;
}

function buildRecommendationSchema() {
  return `
{
  "recommendations": [
    {
      "id": "lowercase-title-author-slug",
      "title": "Book Title",
      "author": "Author Name",
      "genre": "Broad reader-facing genre label",
      "year": 2020,
      "pages": 320,
      "what": "One vivid concrete sentence describing the reading experience. No plot summary. Under 16 words.",
      "why": "One precise sentence explaining why this strongly matches the user's listed books, naming at least one listed title. Under 16 words."
    }
  ]
}`;
}

app.post('/api/recommend', async (req, res) => {
  try {
    const { books, genre, moods } = req.body;

    if (!books || !Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: 'At least one book is required' });
    }

    const genreInstruction = genre ? `Preferred genre lane: ${genre}.` : '';
    const moodInstruction = buildMoodInstruction(moods);

    const systemPrompt = `
You are an obsessive independent bookseller with exceptional skill at matching readers to books.

Your job is to produce three highly targeted recommendations that feel hand-sold and uncannily precise.

Infer:
- prose feel
- emotional atmosphere
- pacing
- psychological intensity
- literary vs commercial sensibility
- setting texture
- thematic concerns

Use the user's selected genre as a broad shelf boundary.
Use the user's selected moods as refinement modifiers.

Stay inside adult mainstream reading lanes unless clearly directed otherwise.

Do not drift into:
- horror
- academic nonfiction
- obscure speculative fiction
- strange niche genre picks

Recommendations should feel cohesive together.

Hard rules:
- never recommend books the reader already listed
- only recommend real existing books

Return only valid raw JSON.
`;

    const userPrompt = `
Reader loved:
${books.map((b) => `- ${b}`).join('\n')}
${genreInstruction}
${moodInstruction}

Recommend exactly 3 books that best fit this reader.

Respond in this exact format:
${buildRecommendationSchema()}
`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      temperature: 0.32,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
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