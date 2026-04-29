const API_BASE = '/api';

export async function getRecommendations(books, genre, length) {
  const response = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ books, genre, length }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get recommendations');
  }

  return response.json();
}
