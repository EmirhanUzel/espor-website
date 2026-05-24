const CACHE_TTL = 15 * 60 * 1000; // 15 min

function cacheKey(query) {
  return `x_search_${btoa(query).slice(0, 40)}`;
}

function fromCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function toCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

// Searches recent tweets. Requires VITE_X_BEARER_TOKEN (X API Basic tier).
export async function searchTweets(query, limit = 6) {
  const key = cacheKey(query + limit);
  const cached = fromCache(key);
  if (cached) return cached;

  const params = new URLSearchParams({
    query,
    max_results: String(Math.min(limit, 10)),
    'tweet.fields': 'created_at,public_metrics,attachments,author_id',
    'expansions': 'author_id,attachments.media_keys',
    'user.fields': 'name,username,profile_image_url,verified',
    'media.fields': 'url,preview_image_url,type',
  });

  const res = await fetch(`/x-api/2/tweets/search/recent?${params}`);
  if (!res.ok) return null;

  const json = await res.json();
  const tweets = (json.data || []).map(t => {
    const author = (json.includes?.users || []).find(u => u.id === t.author_id);
    const mediaKeys = t.attachments?.media_keys || [];
    const media = mediaKeys
      .map(k => (json.includes?.media || []).find(m => m.media_key === k))
      .filter(Boolean)
      .filter(m => m.type === 'photo')
      .map(m => m.url || m.preview_image_url);

    return {
      id: t.id,
      text: t.text,
      createdAt: t.created_at,
      metrics: t.public_metrics,
      author: author ? {
        name: author.name,
        username: author.username,
        avatar: author.profile_image_url,
        verified: author.verified,
      } : null,
      photos: media,
    };
  });

  toCache(key, tweets);
  return tweets;
}
