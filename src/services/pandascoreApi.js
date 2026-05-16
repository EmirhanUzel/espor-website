// PandaScore supports CORS — direct browser calls with token as query param.
// No proxy needed; key stays out of JS bundle because Vite strips VITE_ vars at build time.
const BASE   = 'https://api.pandascore.co'
const TOKEN  = import.meta.env.VITE_PANDASCORE_API_KEY
const LS_PFX = 'ps_'
const TTL    = 60 * 60 * 1000  // 1-hour cache

function lsGet(key) {
  try {
    const raw = localStorage.getItem(LS_PFX + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    return Date.now() - ts < TTL ? data : null
  } catch { return null }
}
function lsSet(key, data) {
  try { localStorage.setItem(LS_PFX + key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

async function psFetch(path, params = {}) {
  const cacheKey = path + JSON.stringify(params)
  const cached = lsGet(cacheKey)
  if (cached) return cached

  const qs  = new URLSearchParams({ ...params, token: TOKEN }).toString()
  const res = await fetch(`${BASE}${path}?${qs}`)
  if (!res.ok) throw new Error(`PandaScore ${res.status}: ${path}`)
  const data = await res.json()
  lsSet(cacheKey, data)
  return data
}

// Searches PandaScore for a CS2 player by in-game name.
export async function findPandaScorePlayer(name) {
  try {
    const results = await psFetch('/csgo/players', { 'search[name]': name, per_page: 5 })
    if (!results?.length) return null
    const exact = results.find(p =>
      p.slug?.toLowerCase()  === name.toLowerCase() ||
      p.name?.toLowerCase()  === name.toLowerCase()
    )
    return exact || results[0]
  } catch { return null }
}

// Fetches a CS2 player's aggregated stats from PandaScore.
// Returns normalised stat object or null.
export async function getPlayerStatsFromPandaScore(playerName) {
  try {
    const player = await findPandaScorePlayer(playerName)
    if (!player) return null

    const s = await psFetch(`/csgo/players/${player.id}/stats`)
    if (!s) return null

    return {
      playerId:  player.id,
      slug:      player.slug,
      maps:      s.games_count              ?? null,
      kd:        s.kills_deaths_ratio        ?? null,
      hs:        s.headshots_percentage != null
                   ? +(s.headshots_percentage * 100).toFixed(1)
                   : null,
      kills:     s.average_kills_per_game   ?? null,
      deaths:    s.average_deaths_per_game  ?? null,
      assists:   s.average_assists_per_game ?? null,
      // HLTV Rating and KAST not available in PandaScore free tier
      rating:    null,
      kast:      null,
    }
  } catch { return null }
}

// ── League of Legends ─────────────────────────────────────────────────────────

export async function findLoLPlayer(name) {
  try {
    const results = await psFetch('/lol/players', { 'search[name]': name, per_page: 5 })
    if (!results?.length) return null
    const exact = results.find(p =>
      p.slug?.toLowerCase() === name.toLowerCase() ||
      p.name?.toLowerCase() === name.toLowerCase()
    )
    return exact || results[0]
  } catch { return null }
}

export async function getLoLPlayerStatsFromPandaScore(playerName) {
  try {
    const player = await findLoLPlayer(playerName)
    if (!player) return null

    const s = await psFetch(`/lol/players/${player.id}/stats`)
    if (!s) return null

    return {
      playerId: player.id,
      slug:     player.slug,
      games:    s.games_count                           ?? null,
      kda:      s.kill_death_assist_ratio               ?? null,
      kills:    s.average_kills_per_game                ?? null,
      deaths:   s.average_deaths_per_game               ?? null,
      assists:  s.average_assists_per_game              ?? null,
      cs:       s.average_cs_per_game                   ?? null,
      gold:     s.average_gold_per_game                 ?? null,
      damage:   s.average_damage_dealt_to_champions     ?? null,
    }
  } catch { return null }
}
