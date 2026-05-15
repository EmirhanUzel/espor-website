// Vercel serverless proxy — forwards /api/lq/<endpoint>?... to Liquipedia API v3.
// Liquipedia sees Vercel's IP, not the client's. API key is injected server-side.
export default async function handler(req, res) {
  const parts    = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean)
  const endpoint = parts.join('/')
  if (!endpoint) { res.status(400).json({ error: 'endpoint required' }); return }

  const { path: _p, ...params } = req.query
  const qs = new URLSearchParams(params).toString()

  try {
    const upstream = await fetch(
      `https://api.liquipedia.net/api/v3/${endpoint}?${qs}`,
      {
        headers: {
          Authorization: `Apikey ${process.env.LIQUIPEDIA_API_KEY}`,
          'User-Agent':  'EsporMax/1.0 (emiruzel01@gmail.com)',
          Accept:        'application/json',
        },
      }
    )
    const body = await upstream.text()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300')
    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(body)
  } catch (err) {
    res.status(502).json({ error: 'proxy error', message: err.message })
  }
}
