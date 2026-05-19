// Grid Open Access API
// Central Data:  /grid-api/central-data/graphql        — seri listesi
// Series State:  /grid-api/live-data-feed/series-state/graphql — oyuncu stats

const CENTRAL = '/grid-api/central-data/graphql'
const SERIES  = '/grid-api/live-data-feed/series-state/graphql'
const LS_PFX  = 'grid_'
const TTL     = 60 * 60 * 1000  // 1 saat
const MIN_GAP = 300              // ~3 req/s

let lastReq = 0

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

async function gqlFetch(url, query, variables = {}) {
  const gap = MIN_GAP - (Date.now() - lastReq)
  if (gap > 0) await new Promise(r => setTimeout(r, gap))
  lastReq = Date.now()

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`Grid HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data
}

// ── Queries ───────────────────────────────────────────────────────────────────

// Son 30 günün serileri
const Q_RECENT_SERIES = `
  query RecentSeries($from: String!, $to: String!) {
    allSeries(
      filter: {
        startTimeScheduled: { gte: $from, lte: $to }
      }
      orderBy: StartTimeScheduled
      first: 50
    ) {
      edges {
        node {
          id
          teams {
            baseInfo { name }
          }
        }
      }
    }
  }
`

// Bir serinin oyuncu istatistikleri
const Q_SERIES_STATE = `
  query SeriesState($id: ID!) {
    seriesState(id: $id) {
      finished
      teams {
        won
        players {
          name
          kills
          deaths
        }
      }
    }
  }
`

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * CS2 oyuncusunun son serilerden aggregate istatistiklerini döner.
 * nickname — oyuncunun in-game ismi (Liquipedia id)
 * teamName — şu anki takım adı (Liquipedia player.team)
 */
export async function getGridPlayerStats(nickname, teamName) {
  if (!nickname || !teamName) return null
  const key = `stats_${nickname.toLowerCase()}`
  const hit = lsGet(key)
  if (hit !== null) return hit

  try {
    const to      = new Date().toISOString()
    const from    = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const teamLow = teamName.toLowerCase()

    const d1 = await gqlFetch(CENTRAL, Q_RECENT_SERIES, { from, to })
    const seriesIds = (d1?.allSeries?.edges ?? [])
      .filter(({ node }) =>
        (node.teams ?? []).some(t => t.baseInfo?.name?.toLowerCase() === teamLow)
      )
      .map(({ node }) => node.id)
      .slice(-10)

    console.log('[Grid] series for', teamName, '->', seriesIds)
    if (!seriesIds.length) { lsSet(key, null); return null }

    // Her seri için oyuncu istatistiklerini topla
    let kills = 0, deaths = 0, wins = 0, n = 0

    for (const id of seriesIds) {
      const sd = await gqlFetch(SERIES, Q_SERIES_STATE, { id })
      for (const team of sd?.seriesState?.teams ?? []) {
        const p = (team.players ?? []).find(
          pl => pl.name?.toLowerCase() === nickname.toLowerCase()
        )
        if (!p) continue
        kills  += p.kills  ?? 0
        deaths += p.deaths ?? 0
        if (team.won) wins++
        n++
      }
    }

    console.log('[Grid] aggregated:', { n, kills, deaths, wins })
    if (n < 2) { lsSet(key, null); return null }  // yetersiz veri

    const stats = {
      matches: n,
      kd:      deaths > 0 ? +(kills / deaths).toFixed(2) : null,
      winRate: n      > 0 ? Math.round(wins / n * 100)   : null,
    }
    lsSet(key, stats)
    return stats
  } catch (e) {
    console.error('[Grid] error:', e.message)
    return null
  }
}
