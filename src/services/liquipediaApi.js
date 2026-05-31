// Liquipedia API v3 â€” CS2 only
const BASE = '/liquipedia-api'
const _memCache = new Map()
const CACHE_TTL = 10 * 60 * 1000   // 10 min in-memory
const LS_CACHE_TTL = 30 * 60 * 1000 // 30 min localStorage (survives page refresh)
const LS_PREFIX = 'lq_cache_'

// After a 429/403, back off for 30 minutes before retrying (per-wiki)
const _blockedUntil = {}

// Serial request queue â€” ensures max 1 in-flight request at a time
// with a 1.1s gap between requests (Liquipedia allows 1 req/sec)
let _queue = Promise.resolve()
function enqueue(fn) {
  const p = _queue
    .then(() => new Promise(resolve => setTimeout(resolve, 1100)))
    .then(fn)
  _queue = p.catch(() => {})  // hata olsa bile queue Ã§alÄ±ÅŸmaya devam eder
  return p
}

function lsGet(key) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > LS_CACHE_TTL) { localStorage.removeItem(LS_PREFIX + key); return null }
    return data
  } catch { return null }
}

function lsSet(key, data) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

async function lqFetch(endpoint, params = {}) {
  const wiki = params.wiki || 'global'
  const blockedTs = _blockedUntil[wiki] || 0
  if (Date.now() < blockedTs) {
    const minsLeft = Math.ceil((blockedTs - Date.now()) / 60000)
    throw new Error('Liquipedia API rate-limited (' + wiki + ') — retry in ~' + minsLeft + ' min')
  }

  const sortedParams = Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)))
  const key = endpoint + '|' + new URLSearchParams(sortedParams).toString()

  // 1. In-memory cache
  const memHit = _memCache.get(key)
  if (memHit && Date.now() - memHit.ts < CACHE_TTL) return memHit.data

  // 2. localStorage cache (survives page refresh â€” avoids re-fetching on dev reload)
  const lsHit = lsGet(key)
  if (lsHit) { _memCache.set(key, { data: lsHit, ts: Date.now() }); return lsHit }

  // 3. Network â€” serialized through queue so requests don't fire in parallel
  return enqueue(async () => {
    const qs = new URLSearchParams(params).toString()
    let lastErr
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
      const res = await fetch(`${BASE}/${endpoint}?${qs}`)
      if (res.status === 429 || res.status === 403) {
        _blockedUntil[wiki] = Date.now() + 30 * 60 * 1000
        throw new Error('Liquipedia API ' + res.status + ' (' + wiki + ') — blocked for 30 min')
      }
      if (res.status === 404) {
        return { result: [] }  // no results — not an error
      }
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        lastErr = new Error(`Liquipedia API ${res.status}`)
        continue
      }
      if (!res.ok) throw new Error(`Liquipedia API ${res.status}`)
      const data = await res.json()
      _memCache.set(key, { data, ts: Date.now() })
      lsSet(key, data)
      return data
    }
    throw lastErr
  })
}

function stripMarkup(str) {
  if (!str) return ''
  // Strip HTML tags like <abbr title="...">TBD</abbr>
  // Strip wiki link syntax like [http://... Text]
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, '$1')
    .trim()
}

// API returns locations as a flat object: { venue1, city1, region1, country1 }
function mapLocation(loc) {
  if (!loc) return null
  if (Array.isArray(loc)) {
    const l = loc[0] || {}
    return {
      venue: stripMarkup(l.venue || ''),
      city: stripMarkup(l.city || ''),
      country: stripMarkup(l.country || ''),
      region: stripMarkup(l.region || l.country || ''),
    }
  }
  return {
    venue: stripMarkup(loc.venue1 || loc.venue || ''),
    city: stripMarkup(loc.city1 || loc.city || ''),
    country: stripMarkup(loc.country1 || loc.country || ''),
    region: stripMarkup(loc.region1 || loc.region || ''),
  }
}

function mapTournament(t) {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: (t.pagename || t.name || '').replace(/\//g, '_').replace(/\s/g, '_'),
    pagename: t.pagename || '',
    name: t.name || t.shortname || '',
    shortname: t.shortname || '',
    liquipediatier: String(t.liquipediatier ?? '1'),
    liquipediatiertype: t.publishertier || t.liquipediatiertype || '',
    startdate: t.startdate || '',
    enddate: t.enddate || '',
    prizepool: typeof t.prizepool === 'string'
      ? Number(t.prizepool.replace(/[^0-9]/g, ''))
      : (t.prizepool || 0),
    participantsnumber: t.participantsnumber || 0,
    locations: mapLocation(t.locations),
    bannerurl: t.bannerurl || t.bannerdarkurl || '',
    bannerdarkurl: t.bannerdarkurl || t.bannerurl || '',
    iconurl: t.iconurl || '',
    format: t.format || '',
    patch: t.patch || '',
    mvp: t.mvp || t.mostvaluableplayer || '',
    wiki: 'counterstrike',
    _ongoing: t.startdate <= today && t.enddate >= today,
    _upcoming: t.startdate > today,
    _raw: t,
  }
}

// A "real" tournament: has confirmed participants AND runs â‰¤ 90 days.
// Filters out year-long circuits/programs (e.g. BLAST Frequent Flyers) that
// technically span today but are not active events.
function isDiscreteEvent(raw) {
  if ((raw.participantsnumber ?? -1) <= 0) return false
  const days = (new Date(raw.enddate) - new Date(raw.startdate)) / 86400000
  return days <= 90
}

function mapMatch(m) {
  return {
    id: m.match2id || m.pagename || '',
    tournament: m.tournament || '',
    liquipediatier: String(m.liquipediatier ?? '1'),
    bestof: m.bestof || 3,
    winner: String(m.winner ?? ''),
    finished: m.finished ? 1 : 0,
    date: m.date || '',
    match2bracketdata: (() => { const r = m.match2bracketdata; if (!r) return {}; if (typeof r === 'object') return r; try { return JSON.parse(r); } catch { return {}; } })(),
    match2opponents: (m.match2opponents || []).map(o => ({
      type: o.type || 'team',
      // Strip HTML from names (e.g. "Group B 2<sup>nd</sup> Place" â†’ "Group B 2nd Place")
      name: (o.name || o.template || '').replace(/<[^>]+>/g, '').trim(),
      template: o.template || '',
      score: o.score ?? 0,
      iconurl: '',
      match2players: o.match2players || [],
    })),
    match2games: (m.match2games || []).map(g => {
      let playerStats = null
      const rawParticipants = g.participants || null
      if (rawParticipants && Object.keys(rawParticipants).length) {
        const team1 = [], team2 = []
        const KEY_RE = /^(\d+)_(\d+)$/
        const cleanName = raw => (raw || '').replace(/_\([^)]+\)$/, '').replace(/_/g, ' ').trim()
        for (const [key, p] of Object.entries(rawParticipants)) {
          const match = KEY_RE.exec(key)
          if (!match) continue
          const teamIdx = parseInt(match[1], 10)
          const name = cleanName(p.player || p.displayname || p.id || '')
          if (!name) continue
          const kills  = Number(p.kills  ?? 0)
          const deaths = Number(p.deaths ?? 0)
          const entry = {
            name,
            kills,
            deaths,
            assists: Number(p.assists ?? 0),
            kd:      deaths > 0 ? kills / deaths : kills,
            adr:     Number(p.adr ?? 0),
            rating:  Number(p.rating ?? 0),
            kast:    Number(p.kast   ?? 0),
            hs:      Number(p.hs ?? p.headshots ?? 0),
          }
          if (teamIdx === 1) team1.push(entry)
          else team2.push(entry)
        }
        if (team1.length || team2.length) playerStats = { team1, team2 }
      }
      return {
        map: g.map || '',
        scores: [g.score1 ?? g.scores?.[0] ?? 0, g.score2 ?? g.scores?.[1] ?? 0],
        winner: String(g.winner ?? ''),
        date: g.date || '',
        length: g.length || '',
        vod: g.vod || null,
        playerStats,
        extradata: g.extradata || null,
      }
    }),
    wiki: 'counterstrike',
  }
}

// Returns featured CS2 tournaments for the hero banner:
// Slide 1 â€” currently ongoing Tier 1 event (e.g. PGL Astana 2026)
// Slide 2+ â€” upcoming Tier 1 / Major events
export async function getCS2FeaturedTournaments() {
  const today = new Date().toISOString().slice(0, 10)
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)
  const sixMonthsAhead = new Date(Date.now() + 183 * 86400000).toISOString().slice(0, 10)

  const data = await lqFetch('tournament', {
    wiki: 'counterstrike',
    conditions: `[[liquipediatier::1]] AND [[startdate::>${twoWeeksAgo}]] AND [[startdate::<${sixMonthsAhead}]] AND [[enddate::>${today}]]`,
    limit: '20',
    order: 'startdate asc',
  })

  const tournaments = (data.result || []).map(mapTournament)

  const isMajor = t => t.liquipediatiertype === 'Major Championship'

  const sorted = tournaments
    .filter(t => (t._ongoing && isDiscreteEvent(t._raw)) || (t._upcoming && isDiscreteEvent(t._raw)))
    .sort((a, b) => {
      // Ongoing first; within ongoing, higher prize pool first
      if (a._ongoing && !b._ongoing) return -1
      if (!a._ongoing && b._ongoing) return 1
      if (a._ongoing && b._ongoing) return b.prizepool - a.prizepool
      // Among upcoming: majors before regular tier-1, then by date
      if (a._upcoming && b._upcoming) {
        if (isMajor(a) && !isMajor(b)) return -1
        if (!isMajor(a) && isMajor(b)) return 1
      }
      return a.startdate.localeCompare(b.startdate)
    })

  // Keep max 2 ongoing + 2 upcoming to avoid too many hero slides
  const ongoing  = sorted.filter(t => t._ongoing).slice(0, 2)
  const upcoming = sorted.filter(t => t._upcoming).slice(0, 2)
  return [...ongoing, ...upcoming]
}

// Fetch CS2 Tier-1 tournaments by status: 'completed' | 'ongoing' | 'upcoming'
export async function getCS2TournamentsByStatus(status, limit = 30) {
  const today     = new Date().toISOString().slice(0, 10)
  const tomorrow  = new Date(Date.now() +  86400000).toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() -  86400000).toISOString().slice(0, 10)

  const condMap = {
    completed: `[[liquipediatier::1]] AND [[enddate::<${today}]]`,
    ongoing:   `[[liquipediatier::1]] AND [[startdate::<${tomorrow}]] AND [[enddate::>${yesterday}]]`,
    upcoming:  `[[liquipediatier::1]] AND [[startdate::>${today}]]`,
  }
  const orderMap = {
    completed: 'enddate desc',
    ongoing:   'startdate asc',
    upcoming:  'startdate asc',
  }

  const data = await lqFetch('tournament', {
    wiki: 'counterstrike',
    conditions: condMap[status],
    limit: String(limit),
    order: orderMap[status],
  })

  let results = (data.result || []).map(mapTournament)

  if (status === 'ongoing') {
    results = results.filter(t => isDiscreteEvent(t._raw))
  }
  if (status === 'completed') {
    results = results.filter(t => t._raw?.status !== 'cancelled' && isDiscreteEvent(t._raw))
  }

  return results
}

// Returns 5 most recently finished Tier-1 CS2 tournaments (excludes cancelled)
export async function getCS2RecentTournaments() {
  const today = new Date().toISOString().slice(0, 10)
  const data = await lqFetch('tournament', {
    wiki: 'counterstrike',
    conditions: `[[liquipediatier::1]] AND [[enddate::<${today}]]`,
    limit: '15',
    order: 'enddate desc',
  })
  return (data.result || [])
    .filter(t => t.status !== 'cancelled' && isDiscreteEvent(t))
    .slice(0, 5)
    .map(mapTournament)
}

// Fetches upcoming (unfinished) matches from multiple ongoing tournaments
export async function getCS2OngoingMatches(tournamentNames) {
  if (!tournamentNames.length) return []
  const cond = tournamentNames.map(n => `[[tournament::${n}]]`).join(' OR ')
  const data = await lqFetch('match', {
    wiki: 'counterstrike',
    conditions: `(${cond}) AND [[finished::0]]`,
    limit: '20',
    order: 'date asc',
  })
  return (data.result || [])
    .map(mapMatch)
    .filter(m =>
      m.match2opponents[0]?.name &&
      m.match2opponents[1]?.name &&
      !m.date.startsWith('0000')
    )
}

// Maps local team name â†’ Liquipedia pagename for teams where names don't match exactly.
// Extend this map whenever a new team's logo fails to resolve via the default derivation.
const TEAM_PAGENAMES = {
  'NAVI':       'Natus_Vincere',
  'Complexity': 'Complexity_Gaming',
  'Heroic':     'HEROIC',
}

// â”€â”€ VRS â€” Valve's official GitHub repo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Normalises a team display name for fuzzy matching between GitHub and Liquipedia.
// "Team Vitality" â†’ "vitality", "Natus Vincere" â†’ "natusvincere", "G2 Esports" â†’ "g2"
function _normName(n) {
  return (n || '')
    .toLowerCase()
    .replace(/^team\s+/, '')                                   // strip leading "Team "
    .replace(/\s+(esports?|gaming|e-sports?)\s*$/i, '')       // strip trailing "Esports" / "Gaming"
    .replace(/[^a-z0-9]/g, '')                                // remove all non-alphanumeric
}

const _VRS_LS_KEY = 'vrs_github'
const _VRS_TTL    = 6 * 60 * 60 * 1000   // 6-hour cache

// Fetches the latest CS2 global VRS standings from Valve's official GitHub repo.
// Returns { normalizedName: points } or null on failure.
// Cached 6 hours in localStorage â€” no API key required.
async function _fetchVRSFromGitHub() {
  try {
    const raw = localStorage.getItem(_VRS_LS_KEY)
    if (raw) {
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts < _VRS_TTL) return data
    }
  } catch {}

  try {
    const year     = new Date().getFullYear()
    const listRes  = await fetch(
      `https://api.github.com/repos/ValveSoftware/counter-strike_regional_standings/contents/live/${year}`
    )
    if (!listRes.ok) return null
    const files = await listRes.json()

    // Pick the most-recent standings_global_*.md (sorted descending by filename = date)
    const latest = (Array.isArray(files) ? files : [])
      .filter(f => f.name.startsWith('standings_global_') && f.name.endsWith('.md'))
      .sort((a, b) => b.name.localeCompare(a.name))[0]
    if (!latest) return null

    const mdRes = await fetch(
      `https://raw.githubusercontent.com/ValveSoftware/counter-strike_regional_standings/main/live/${year}/${latest.name}`
    )
    if (!mdRes.ok) return null
    const md = await mdRes.text()

    // Parse markdown table: | Standing | Points | Team Name | â€¦
    const map = {}
    for (const line of md.split('\n')) {
      if (!line.startsWith('|') || /---/.test(line) || /standing/i.test(line)) continue
      const cols = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length < 3) continue
      const pts = parseInt(cols[1].replace(/,/g, ''), 10)
      if (!isNaN(pts) && pts > 0) map[_normName(cols[2])] = pts
    }

    if (!Object.keys(map).length) return null
    try { localStorage.setItem(_VRS_LS_KEY, JSON.stringify({ data: map, ts: Date.now() })) } catch {}
    return map
  } catch {
    return null
  }
}

// Returns { localTeamName: textlesslogourl } for a list of CS2 team names.
// Uses TEAM_PAGENAMES to resolve teams whose local names differ from Liquipedia names.
export async function getCS2TeamLogos(teamNames) {
  if (!teamNames.length) return {}
  try {
    // Build conditions using alias pagenames where available
    const conds = teamNames.flatMap(n => {
      const pg = TEAM_PAGENAMES[n] || n.replace(/ /g, '_')
      return [`[[pagename::${pg}]]`, `[[name::${n}]]`]
    })
    const data = await lqFetch('team', {
      wiki: 'counterstrike',
      conditions: [...new Set(conds)].join(' OR '),
      limit: String(teamNames.length * 3),
    })

    // Intermediate lookup by pagename and API name
    const byPage = {}, byName = {}
    for (const t of data.result || []) {
      const url = t.textlesslogourl || t.logourl || ''
      if (!url) continue
      if (t.pagename) byPage[t.pagename] = url
      if (t.name)     byName[t.name]     = url
    }

    // Build result map keyed by local names (what TeamsRanking uses)
    const map = {}
    for (const n of teamNames) {
      const pg = TEAM_PAGENAMES[n] || n.replace(/ /g, '_')
      map[n] = byPage[pg] || byName[n] || ''
    }
    return map
  } catch {
    return {}
  }
}

// Strips versioned suffix from Liquipedia templates: "team vitality 2023" â†’ "team vitality"
const _stripVersion = tpl =>
  (tpl || '').trim().replace(/\s+(?:[a-z]{3}\s+)?\d{4}(?:\s+\d{2})?$/, '').trim()

// â”€â”€ eSPORMAX Algorithm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Score based on last 5 tournament placements. Factors: placement, tier, recency, major bonus.
const _ESM_PTS = {
  '1': 100, '2': 75,
  '3': 55, '4': 55, '3-4': 55,
  '5': 35, '6': 35, '5-6': 35,
  '7': 25, '8': 25, '7-8': 25, '5-8': 30,
  '9': 15, '10': 15, '11': 15, '12': 15, '9-12': 15,
  '13': 8, '14': 8, '15': 8, '16': 8, '13-16': 8,
  '17-24': 3,
}
const _ESM_TIER_W    = { '1': 1.0, '2': 0.5 }
const _ESM_RECENCY_W = [1.0, 0.85, 0.70, 0.55, 0.40]
const _ESM_MAX       = 100 * 1.5 * _ESM_RECENCY_W.reduce((s, w) => s + w, 0) // 525

function _calcESM(placements) {
  // placements: sorted date desc, already filtered for this team
  const recent = placements.filter(p => p.placement && p.placement !== '').slice(0, 5)
  if (!recent.length) return 0
  let raw = 0
  for (let i = 0; i < recent.length; i++) {
    const p      = recent[i]
    const pts    = _ESM_PTS[String(p.placement).trim()] ?? 0
    const tierW  = _ESM_TIER_W[String(p.liquipediatier)] ?? 0.25
    const majorW = p.publishertier === 'Major Championship' ? 1.5 : 1.0
    raw += pts * tierW * majorW * (_ESM_RECENCY_W[i] ?? 0.3)
  }
  return Math.min(Math.round(raw / _ESM_MAX * 100), 100)
}

// Recent match results (W/L). limit = how many matches to consider.
function _calcForm(matches, strippedTpl, teamName, limit = 5) {
  const nameLower = (teamName || '').toLowerCase()
  return matches
    .filter(m => (m.match2opponents || []).some(o =>
      _stripVersion((o.template || '').toLowerCase()) === strippedTpl ||
      (o.name || '').toLowerCase() === nameLower
    ))
    .slice(0, limit)
    .map(m => {
      const idx = (m.match2opponents || []).findIndex(o =>
        _stripVersion((o.template || '').toLowerCase()) === strippedTpl ||
        (o.name || '').toLowerCase() === nameLower
      )
      return idx !== -1 && String(m.winner) === String(idx + 1) ? 'W' : 'L'
    })
}

// Normalises a raw Liquipedia team API object into the shape used by TeamsRanking.
function _mapApiTeam(t, vrsMap) {
  const vrs = (vrsMap && vrsMap[_normName(t.name)]) || 0
  return {
    id:                  t.pagename,
    pagename:            t.pagename,
    name:                t.name,
    region:              t.region || t.locations?.region1 || '',
    textlesslogourl:     t.textlesslogourl || '',
    textlesslogodarkurl: t.textlesslogodarkurl || t.textlesslogourl || '',
    logourl:             t.logourl || '',
    logodarkurl:         t.logodarkurl || t.logourl || '',
    earnings:            t.earnings || 0,
    earningsbyyear:      t.earningsbyyear || {},
    links:               t.links || {},
    template:            t.template || '',
    rankpoints:          vrs,
    rankchange:          0,
    status:              t.status || 'active',
    createdate:          t.createdate || '',
    disbanddate:         t.disbanddate || '0000-01-01',
    squad:               [],
    wiki:                'counterstrike',
  }
}

// Fetches the top CS2 teams from Liquipedia for the rankings page.
// - Team list & ESM: Tier 1+2 placements (12 months) â€” dynamic, always current.
// - Logos, earnings, region: Liquipedia team API.
// - Form: recent finished Tier 1+2 matches (3 months).
// - VRS points: Valve's official GitHub repo (cached 6 h, no key needed).
// Teams sorted VRS desc â†’ earnings desc.
export async function getCS2TeamsForRanking(limit = 30) {
  const today           = new Date().toISOString().slice(0, 10)
  const twelveMonthsAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)
  const threeMonthsAgo  = new Date(Date.now() -  90 * 86400000).toISOString().slice(0, 10)

  const vrsPromise = _fetchVRSFromGitHub()

  // 1. Tier 1+2 placements (12 months) â€” used for team discovery AND ESM calculation
  const placements = await lqFetch('placement', {
    wiki:       'counterstrike',
    conditions: `([[liquipediatier::1]] OR [[liquipediatier::2]]) AND [[date::>${twelveMonthsAgo}]] AND [[date::<${today}]] AND [[opponenttype::team]] AND [[opponentname::!TBD]]`,
    limit:      '300',
    order:      'date desc',
  })

  // Group placements by stripped template; flag which teams appeared in Tier-1
  const byTpl = {}
  for (const p of placements.result || []) {
    const raw = (p.opponenttemplate || '').trim().toLowerCase()
    if (!raw || raw === 'tbd') continue
    const tpl = _stripVersion(raw)
    if (!tpl) continue
    if (!byTpl[tpl]) byTpl[tpl] = { placements: [], hasTier1: false }
    byTpl[tpl].placements.push(p)
    if (String(p.liquipediatier) === '1') byTpl[tpl].hasTier1 = true
  }

  // Team list = templates that played in at least 1 Tier-1 event
  const tier1Tpls = Object.entries(byTpl)
    .filter(([, v]) => v.hasTier1)
    .map(([tpl]) => tpl)
    .slice(0, limit)

  if (!tier1Tpls.length) return []

  // 2. Team details (logos, earnings, region)
  const conds    = tier1Tpls.map(tpl => `[[template::${tpl}]]`).join(' OR ')
  const teamData = await lqFetch('team', {
    wiki:       'counterstrike',
    conditions: conds,
    limit:      String(limit),
  })

  // 3. Recent matches for form (Tier 1+2, last 3 months, finished)
  const matchData = await lqFetch('match', {
    wiki:       'counterstrike',
    conditions: `([[liquipediatier::1]] OR [[liquipediatier::2]]) AND [[finished::1]] AND [[date::>${threeMonthsAgo}]]`,
    limit:      '200',
    order:      'date desc',
  })

  const vrsMap = await vrsPromise.catch(() => null)

  return (teamData.result || [])
    .map(t => {
      const tpl  = _stripVersion((t.template || '').toLowerCase())
      const data = byTpl[tpl] || { placements: [] }
      return {
        ..._mapApiTeam(t, vrsMap),
        esm:      _calcESM(data.placements),
        form:     _calcForm(matchData.result || [], tpl, t.name, 5),
        formLong: _calcForm(matchData.result || [], tpl, t.name, 10),
      }
    })
    .sort((a, b) =>
      b.rankpoints !== a.rankpoints
        ? b.rankpoints - a.rankpoints
        : b.earnings  - a.earnings
    )
}

export async function getCS2Transfers(limit = 5) {
  const data = await lqFetch('transfer', {
    wiki: 'counterstrike',
    limit: String(limit),
    order: 'date desc',
  })
  return data.result || []
}

export async function getCS2TopTeamNames(limit = 20) {
  const today          = new Date().toISOString().slice(0, 10)
  const sixMonthsAgo   = new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10)
  const data = await lqFetch('placement', {
    wiki:       'counterstrike',
    conditions: '[[liquipediatier::1]] AND [[date::>' + sixMonthsAgo + ']] AND [[date::<' + today + ']] AND [[opponenttype::team]] AND [[opponentname::!TBD]]',
    limit:      '200',
    order:      'date desc',
  })
  const seen = new Set()
  const names = []
  for (const p of (data.result || [])) {
    const name = p.opponentname
    if (!name || name === 'TBD' || seen.has(name)) continue
    seen.add(name)
    names.push(name)
    if (names.length >= limit) break
  }
  return names
}


// Builds a lookup map: { lowerCaseName: url, template: url }
// Queries by both name and template to handle case mismatches & obscure teams
async function fetchTeamIconMap(opponents) {
  if (!opponents.length) return {}
  try {
    const names     = [...new Set(opponents.map(o => o.name).filter(Boolean))]
    const templates = [...new Set(opponents.map(o => o.template).filter(Boolean))]

    // Query by name, pagename (spacesâ†’underscores, handles case), and template
    const conds = [
      ...names.map(n => `[[name::${n}]]`),
      ...names.map(n => `[[pagename::${n.replace(/ /g, '_')}]]`),
      ...templates.map(t => `[[template::${t}]]`),
    ]
    const cond = conds.join(' OR ')

    const data = await lqFetch('team', {
      wiki: 'counterstrike',
      conditions: cond,
      limit: '50',
    })
    const map = {}
    for (const t of data.result || []) {
      const url = t.textlesslogourl || t.logourl || ''
      if (!url) continue
      if (t.name) {
        map[t.name] = url
        map[t.name.toLowerCase()] = url
      }
      if (t.pagename) map[t.pagename.replace(/_/g, ' ')] = url
      if (t.template) map[t.template] = url
    }
    return map
  } catch {
    return {}
  }
}

// Fetches all CS2 Tier 1-2 matches for a given date string (YYYY-MM-DD)
export async function getCS2MatchesByDate(date) {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  const next = d.toISOString().slice(0, 10)

  const data = await lqFetch('match', {
    wiki: 'counterstrike',
    conditions: `([[liquipediatier::1]] OR [[liquipediatier::2]]) AND [[date::>${date}]] AND [[date::<${next}]]`,
    limit: '50',
    order: 'date asc',
  })

  const matches = (data.result || [])
    .map(mapMatch)
    .filter(m => m.match2opponents[0]?.name && m.match2opponents[1]?.name)

  // Batch-fetch team icons (one extra API call, cached 5 min)
  const opponents = matches.flatMap(m => m.match2opponents.filter(o => o.name))
  const iconMap   = await fetchTeamIconMap(opponents)

  return matches.map(m => ({
    ...m,
    match2opponents: m.match2opponents.map(o => ({
      ...o,
      // Try: exact name â†’ lowercase name â†’ template name
      iconurl: iconMap[o.name]
            || iconMap[o.name.toLowerCase()]
            || iconMap[o.template]
            || '',
    })),
  }))
}

// â”€â”€ CS2 Player Profile API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Fetches the player's featured photo via Liquipedia MediaWiki parse API.
// Uses prop=properties to get metaimageurl, then derives a 400px thumbnail.
// No API key required; uses origin=* for CORS. Cached 24 h in localStorage.
export async function getCS2PlayerImage(pagename) {
  const LS_KEY = `lq_playerimg_${pagename}`
  const TTL    = 24 * 60 * 60 * 1000
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const { url, ts } = JSON.parse(raw)
      if (Date.now() - ts < TTL) return url
    }
  } catch {}

  try {
    const r = await fetch(
      `https://liquipedia.net/counterstrike/api.php?action=parse&page=${encodeURIComponent(pagename)}&prop=properties&format=json&origin=*`,
      { headers: { 'User-Agent': 'EsporMax/1.0 (espormax-bot)' } }
    )
    if (!r.ok) return ''
    const data  = await r.json()
    const props = data?.parse?.properties || []
    const meta  = props.find(p => p.name === 'metaimageurl')
    const fullUrl = meta?.['*'] || ''
    if (!fullUrl) { localStorage.setItem(LS_KEY, JSON.stringify({ url: '', ts: Date.now() })); return '' }

    // Derive 400px thumbnail: /commons/images/{hash}/{file} â†’ /commons/images/thumb/{hash}/{file}/400px-{file}
    const m = fullUrl.match(/\/commons\/images\/([a-f0-9]\/[a-f0-9]{2})\/(.+)$/)
    const thumbUrl = m
      ? `https://liquipedia.net/commons/images/thumb/${m[1]}/${m[2]}/400px-${m[2]}`
      : fullUrl

    try { localStorage.setItem(LS_KEY, JSON.stringify({ url: thumbUrl, ts: Date.now() })) } catch {}
    return thumbUrl
  } catch {
    return ''
  }
}

// Fetches a CS2 player's base data from Liquipedia.
// id: URL id (in-game nickname, e.g. "s1mple"). Tries [[id::X]] then [[pagename::X]].
export async function getCS2PlayerProfile(id) {
  const data = await lqFetch('player', {
    wiki:       'counterstrike',
    conditions: `[[id::${id}]] OR [[pagename::${id}]]`,
    limit:      '1',
  })
  const p = data.result?.[0]
  if (!p) return null

  // Normalise team name: "Team_Vitality" â†’ "Team Vitality"
  const teamName = (p.teampagename || p.team || '').replace(/_/g, ' ')

  // Normalise social links: API uses "steam64ID" key, we expose it as "steam"
  const rawLinks = p.links || {}
  const links = { ...rawLinks }
  if (rawLinks.steam64ID && !rawLinks.steam) links.steam = rawLinks.steam64ID
  delete links.steam64ID

  // FACEIT player UUID â€” faceitdb.com/profile/faceit/{uuid}
  const faceitId = rawLinks.faceitdb
    ? (rawLinks.faceitdb.match(/faceit\/([a-f0-9-]{36})/)?.[1] || null)
    : null

  // Roles from extradata (e.g. { "1": "awp", "2": "rifle" })
  const ROLE_NAMES = {
    awp: 'AWPer', rifle: 'Rifler', igl: 'IGL', support: 'Support',
    entry: 'Entry Fragger', lurker: 'Lurker', coach: 'Coach',
    analyst: 'Analyst', fragging: 'Fragger',
  }
  const rawRoles = p.extradata?.roles || (p.extradata?.role ? { '1': p.extradata.role } : {})
  const roles = [...new Set(Object.values(rawRoles).filter(Boolean))]
    .map(r => ROLE_NAMES[r.toLowerCase()] || r)

  return {
    id:             p.id       || p.pagename,
    pagename:       p.pagename,
    name:           p.name     || '',
    nationality:    p.nationality || '',
    region:         p.region   || p.nationality || '',
    birthdate:      p.birthdate || '',
    imageurl:       '',  // not exposed by Liquipedia API v3
    team:           teamName,
    teampagename:   teamName,
    teamtemplate:   _stripVersion((p.teamtemplate || '').toLowerCase()),
    earnings:       p.earnings || 0,
    earningsbyyear: p.earningsbyyear || {},
    links,
    faceitId,
    roles,
    status:         p.status   || 'Active',
    wiki:           'counterstrike',
  }
}

// Fetches career timeline for a CS2 player from the transfer table.
// Transfer table uses [[player::pagename]], NOT [[pagename::pagename]].
export async function getCS2PlayerCareer(pagename) {
  const data = await lqFetch('transfer', {
    wiki:       'counterstrike',
    conditions: `[[player::${pagename}]]`,
    limit:      '40',
    order:      'date asc',
  })
  const SKIP = new Set(['retired', 'free agent', 'inactive', 'substitute', 'coach', 'analyst', 'streamer'])
  return (data.result || [])
    .filter(t => {
      const name = (t.toteam || '').trim().toLowerCase()
      return name && !SKIP.has(name)
    })
    .map(t => ({
      year: (t.date || '').slice(0, 4),
      date: t.date || '',
      team: t.toteam || '',
      note: t.role1  || t.role2 || '',
    }))
}

// Fetches all 1st-place placements across multiple teams (player's full career).
// teamNames: array of all team names the player has played for.
export async function getCS2PlayerAllPlacements(teamNames) {
  const names = [...new Set(teamNames.filter(Boolean))]
  if (!names.length) return []
  const today = new Date().toISOString().slice(0, 10)
  const cond  = names.map(t => `[[opponentname::${t}]]`).join(' OR ')
  const data  = await lqFetch('placement', {
    wiki:       'counterstrike',
    conditions: `(${cond}) AND ([[liquipediatier::1]] OR [[liquipediatier::2]]) AND [[placement::1]] AND [[opponenttype::team]] AND [[date::<${today}]]`,
    limit:      '100',
    order:      'date desc',
  })
  return data.result || []
}

// Fetches recent finished matches for a CS2 team.
// Uses tournament names from recent placements to avoid a direct team-filter query.
export async function getCS2TeamRecentMatches(teamName, limit = 30) {
  if (!teamName) return []
  const teamLow    = teamName.toLowerCase()
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)

  // Step 1: find tournaments this team participated in (small, team-specific query)
  const placements = await lqFetch('placement', {
    wiki:       'counterstrike',
    conditions: `[[opponentname::${teamName}]] AND [[date::>${oneYearAgo}]]`,
    limit:      '25',
    order:      'date desc',
  })
  const tournaments = [...new Set(
    (placements.result || []).map(p => p.tournament).filter(Boolean)
  )].slice(0, 10)

  if (!tournaments.length) return []

  // Step 2: fetch finished matches only from those specific tournaments
  const tournCond = tournaments.map(t => `[[tournament::${t}]]`).join(' OR ')
  const data = await lqFetch('match', {
    wiki:       'counterstrike',
    conditions: `(${tournCond}) AND [[finished::1]]`,
    limit:      String(limit * 2),
    order:      'date desc',
  })

  return (data.result || [])
    .map(mapMatch)
    .filter(m => m.match2opponents.some(o => (o.name || '').toLowerCase() === teamLow))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
}

// Fetches last N finished matches for map win rate stats â€” direct opponent filter.
export async function getCS2TeamMapMatches(teamName, limit = 30) {
  if (!teamName) return []
  const teamLow    = teamName.toLowerCase()
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)
  const data = await lqFetch('match', {
    wiki:       'counterstrike',
    conditions: `[[opponent::${teamName}]] AND [[finished::1]] AND ([[liquipediatier::1]] OR [[liquipediatier::2]]) AND [[date::>${oneYearAgo}]]`,
    limit:      String(limit),
    order:      'date desc',
  })
  return (data.result || [])
    .map(mapMatch)
    .filter(m => m.match2opponents?.some(o => (o.name || '').toLowerCase() === teamLow))
    .slice(0, limit)
}

export async function getCS2TeamUpcomingMatches(teamName, limit = 5) {
  if (!teamName) return []
  const teamLow       = teamName.toLowerCase()
  const today         = new Date().toISOString().slice(0, 10)
  const twoWeeksAhead = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)

  // Upcoming matches are few globally (Tier1+2 has ~5-10/day), limit 50 is safe
  const data = await lqFetch('match', {
    wiki:       'counterstrike',
    conditions: `([[liquipediatier::1]] OR [[liquipediatier::2]]) AND [[finished::0]] AND [[date::>${today}]] AND [[date::<${twoWeeksAhead}]]`,
    limit:      '50',
    order:      'date asc',
  })

  return (data.result || [])
    .map(mapMatch)
    .filter(m => m.match2opponents.some(o => (o.name || '').toLowerCase() === teamLow))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, limit)
}

// Fetches the player's per-map stats from the last 4 months of Tier-1 matches.
// Returns { maps, rating, kd, kast, hs } or null if data is unavailable.
export async function getCS2PlayerMatchStats(playerPagename, teamName) {
  if (!playerPagename || !teamName) return null
  const today          = new Date().toISOString().slice(0, 10)
  const oneMonthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

  // 1. Get recent Tier-1 tournament names for this team
  const placements = await lqFetch('placement', {
    wiki:       'counterstrike',
    conditions: `[[opponentname::${teamName}]] AND [[liquipediatier::1]] AND [[date::>${oneMonthAgo}]] AND [[date::<${today}]]`,
    limit:      '10',
    order:      'date desc',
  })

  const tournaments = [...new Set(
    (placements.result || []).map(p => p.tournament).filter(Boolean)
  )].slice(0, 6)

  if (!tournaments.length) return null

  // 2. Fetch finished matches from those tournaments
  const cond = tournaments.map(t => `[[tournament::${t}]]`).join(' OR ')
  const matchData = await lqFetch('match', {
    wiki:       'counterstrike',
    conditions: `(${cond}) AND [[finished::1]]`,
    limit:      '60',
    order:      'date desc',
  })

  // 3. Extract per-map player stats from match2players
  const playerIdLow = playerPagename.toLowerCase()
  const maps = []
  for (const m of matchData.result || []) {
    for (const opp of m.match2opponents || []) {
      if ((opp.name || '') !== teamName) continue
      for (const mp of opp.match2players || []) {
        const mpId = (mp.player || mp.displayname || mp.id || '').toLowerCase()
        if (mpId && mpId === playerIdLow) maps.push(mp)
      }
    }
  }

  if (!maps.length) return null

  const avg = key => {
    const vals = maps.map(m => parseFloat(m[key])).filter(v => !isNaN(v) && v > 0)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  const totalKills  = maps.reduce((s, m) => s + (parseInt(m.kills)  || 0), 0)
  const totalDeaths = maps.reduce((s, m) => s + (parseInt(m.deaths) || 0), 0)

  return {
    maps:   maps.length,
    rating: avg('rating'),
    kd:     totalDeaths > 0 ? totalKills / totalDeaths : null,
    kast:   avg('kast'),
    hs:     avg('hs'),
  }
}

// Fetches a single CS2 tournament by Liquipedia pagename (e.g. "PGL_Astana_2026")
export async function getCS2TournamentByPagename(pagename) {
  const data = await lqFetch('tournament', {
    wiki:       'counterstrike',
    conditions: `[[pagename::${pagename}]]`,
    limit:      '1',
  })
  const t = data.result?.[0]
  return t ? mapTournament(t) : null
}

// Returns MVP player name for a tournament from Liquipedia's award table, or null.
export async function getCS2TournamentMVP(tournamentName) {
  if (!tournamentName) return null
  try {
    const data = await lqFetch('award', {
      wiki:       'counterstrike',
      conditions: `[[tournament::${tournamentName}]]`,
      limit:      '10',
    })
    console.log('[MVP award raw]', JSON.stringify(data?.result?.slice(0,3)))
    if (!data?.result?.length) return null
    // MVP tipini bul â€” "mvp", "most valuable player" gibi
    const mvpRow = data.result.find(r => {
      const type = (r.type || r.award || r.name || '').toLowerCase()
      return type.includes('mvp') || type.includes('valuable') || type.includes('star')
    }) || data.result[0]
    return mvpRow?.player || mvpRow?.recipient || mvpRow?.name || null
  } catch (e) {
    console.log('[MVP award error]', e.message)
    return null
  }
}

// Returns sorted prize distribution rows (with logos) for a tournament.
export async function getCS2TournamentPrizes(tournamentName) {
  if (!tournamentName) return []
  const data = await lqFetch('placement', {
    wiki:       'counterstrike',
    conditions: `[[tournament::${tournamentName}]] AND [[opponenttype::team]]`,
    limit:      '16',
    order:      'placement asc',
  })
  const rows = (data.result || [])
    .filter(p => p.opponentname && p.placement)
    .map(p => ({
      placement: String(p.placement).trim(),
      team:      p.opponentname,
      prize:     typeof p.prizemoney === 'string'
                   ? Number(p.prizemoney.replace(/[^0-9]/g, '')) || 0
                   : (p.prizemoney || 0),
      logoUrl:   '',
    }))
  rows.sort((a, b) => {
    const n = s => parseInt(s.split(/[-â€“]/)[0]) || 99
    return n(a.placement) - n(b.placement)
  })
  // Batch-fetch logos
  const teamNames = [...new Set(rows.map(r => r.team))]
  const logos = await getCS2TeamLogos(teamNames).catch(() => ({}))
  rows.forEach(r => { r.logoUrl = logos[r.team] || '' })
  return rows
}

// Returns { name, logoUrl } of 1st-place team for a finished tournament, or null.
export async function getCS2TournamentWinner(tournamentName) {
  if (!tournamentName) return null
  const data = await lqFetch('placement', {
    wiki:       'counterstrike',
    conditions: `[[tournament::${tournamentName}]] AND [[placement::1]] AND [[opponenttype::team]]`,
    limit:      '1',
  })
  const p = data.result?.[0]
  if (!p?.opponentname) return null
  const logos = await getCS2TeamLogos([p.opponentname])
  return { name: p.opponentname, logoUrl: logos[p.opponentname] || '' }
}

// Fetches finished + upcoming matches for a tournament by its display name
export async function getCS2TournamentMatches(tournamentName) {
  if (!tournamentName) return []
  const data = await lqFetch('match', {
    wiki:       'counterstrike',
    conditions: `[[tournament::${tournamentName}]]`,
    limit:      '50',
    order:      'date asc',
  })
  return (data.result || []).map(mapMatch)
}

// CS2 Major sub-event isimleri — sırayla denenir
const GROUP_STAGE_SUFFIXES = [
  'Challengers_Stage', 'Legends_Stage',
  'Opening_Stage', 'Group_Stage', 'Swiss_Stage',
  'Play-In', 'Qualifier',
]

// Grup aşaması maçları — bilinen sub-event isimlerini deneyerek bulur
export async function getCS2GroupStageMatches(tournamentName, pagename) {
  if (!tournamentName || !pagename) return []

  // Olası sub-event pagename'lerini oluştur
  const candidates = GROUP_STAGE_SUFFIXES.map(s => `${pagename}/${s}`)
  const cond = candidates.map(p => `[[pagename::${p}]]`).join(' OR ')

  const subData = await lqFetch('tournament', {
    wiki:       'counterstrike',
    conditions: cond,
    limit:      '10',
    order:      'startdate asc',
  }).catch(() => ({ result: [] }))

  const subNames = (subData.result || []).map(t => t.name).filter(Boolean)
  console.log('[GroupStage] sub-events found:', subNames)
  if (!subNames.length) return []

  const matchCond = subNames.map(n => `[[tournament::${n}]]`).join(' OR ')
  const data = await lqFetch('match', {
    wiki:       'counterstrike',
    conditions: matchCond,
    limit:      '200',
    order:      'date asc',
  })
  const matches = (data.result || []).map(m => ({ ...mapMatch(m), stageLabel: m.tournament || '' }))
  console.log('[GroupStage] matches:', matches.length)
  return matches
}

// â”€â”€ CS2 Team Page API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ROLE_DISPLAY = {
  awp: 'AWPer', rifle: 'Rifler', igl: 'IGL', support: 'Support',
  entry: 'Entry Fragger', lurker: 'Lurker', coach: 'Coach',
  analyst: 'Analyst', fragging: 'Fragger',
}

// Fetches a CS2 team by display name or pagename.
export async function getCS2TeamByName(name) {
  const pagename = name.replace(/ /g, '_')
  const data = await lqFetch('team', {
    wiki:       'counterstrike',
    conditions: `[[pagename::${pagename}]] OR [[name::${name}]]`,
    limit:      '1',
  })
  const t = data.result?.[0]
  if (!t) return null
  return {
    name:                t.name,
    pagename:            t.pagename,
    region:              t.region || t.locations?.region1 || '',
    status:              t.status || 'active',
    createdate:          t.createdate || '',
    disbanddate:         t.disbanddate || '0000-01-01',
    earnings:            t.earnings || 0,
    earningsbyyear:      t.earningsbyyear || {},
    links:               t.links || {},
    textlesslogourl:     t.textlesslogourl || '',
    textlesslogodarkurl: t.textlesslogodarkurl || t.textlesslogourl || '',
    logourl:             t.logourl || '',
    template:            t.template || '',
    wiki:                'counterstrike',
  }
}

// Coaching/staff roles to exclude from player roster display
const STAFF_ROLES = new Set([
  'coach','head coach','assistant coach','co-coach','analyst','manager',
  'team manager','general manager','performance manager','ceo','cso',
  'founder','co-founder','head of esports','content creator','streamer',
])

// Fetches the active player roster for a CS2 team using the squadplayer table.
// Filters type::player and excludes coaching/staff roles.
export async function getCS2TeamSquad(teamPagename) {
  const data = await lqFetch('squadplayer', {
    wiki:       'counterstrike',
    conditions: `[[pagename::${teamPagename}]] AND [[status::active]] AND [[type::player]]`,
    limit:      '15',
  })

  const players = (data.result || [])
    .filter(p => !STAFF_ROLES.has((p.role || '').toLowerCase()))
    .map(p => ({
      id:          p.id   || p.link || '',
      pagename:    p.link || p.id   || '',
      name:        p.name || '',
      nationality: p.nationality || '',
      role:        ROLE_DISPLAY[(p.role || '').toLowerCase()] || p.role || '',
      joindate:    p.joindate || '',
    }))

  // Fallback to player endpoint if squadplayer returns nothing
  if (!players.length) {
    const fallback = await lqFetch('player', {
      wiki:       'counterstrike',
      conditions: `[[teampagename::${teamPagename}]] AND [[status::Active]]`,
      limit:      '10',
    })
    return (fallback.result || []).map(p => {
      const rawRoles = p.extradata?.roles || {}
      const role = ROLE_DISPLAY[Object.values(rawRoles)[0]?.toLowerCase()] || ''
      return {
        id: p.id || p.pagename, pagename: p.pagename,
        name: p.name || '', nationality: p.nationality || '',
        role, joindate: '',
      }
    })
  }
  return players
}

// Batch-fetches earnings for a list of player IDs. Returns { [id]: earnings } map.
export async function getCS2PlayersEarnings(playerIds) {
  if (!playerIds?.length) return {}
  const conditions = playerIds.map(id => `[[id::${id}]]`).join(' OR ')
  const data = await lqFetch('player', {
    wiki:       'counterstrike',
    conditions,
    limit:      String(playerIds.length + 5),
  })
  const map = {}
  for (const p of data.result || []) {
    if (p.id && p.earnings) map[p.id] = p.earnings
  }
  return map
}

// Fetches recent transfers for a CS2 team.
export async function getCS2TeamTransfersAPI(teamName, limit = 15) {
  if (!teamName) return []
  const data = await lqFetch('transfer', {
    wiki:       'counterstrike',
    conditions: `[[fromteam::${teamName}]] OR [[toteam::${teamName}]]`,
    limit:      String(limit),
    order:      'date desc',
  })
  return data.result || []
}

// Resolves ongoing + upcoming tournaments for a team.
// Strategy 1 (primary): participant table â€” has confirmed registrations including future events.
// Strategy 2 (fallback): placement table (past 60 days) â€” catches ongoing events.
// Strategy 3 (fallback): tournament names from already-fetched upcoming matches.
async function _resolveTeamEvents(wiki, teamName, fallbackTournNames = []) {
  if (!teamName) return []
  const pastTwo = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10)

  // Primary: participant table
  const participantData = await lqFetch('participant', {
    wiki,
    conditions: `[[name::${teamName}]] AND [[type::team]]`,
    limit:      '20',
    order:      'pagename desc',
  })
  let tournNames = (participantData.result || []).map(p => p.pagename).filter(Boolean)

  // Fallback: recent placements
  if (!tournNames.length) {
    const placementData = await lqFetch('placement', {
      wiki,
      conditions: `[[opponentname::${teamName}]] AND [[date::>${pastTwo}]]`,
      limit:      '25',
      order:      'date desc',
    })
    tournNames = (placementData.result || []).map(p => p.tournament).filter(Boolean)
  }

  tournNames = [...new Set([...tournNames, ...fallbackTournNames])].slice(0, 20)
  if (!tournNames.length) return []

  const cond = `(${tournNames.map(t => `[[pagename::${t}]]`).join(' OR ')}) AND ([[liquipediatier::1]] OR [[liquipediatier::2]])`
  const tournData = await lqFetch('tournament', { wiki, conditions: cond, limit: '20' })
  return (tournData.result || [])
    .map(t => ({ ...mapTournament(t), wiki }))
    .filter(t => (t._ongoing || t._upcoming) && isDiscreteEvent(t._raw))
    .sort((a, b) => {
      if (a._ongoing && !b._ongoing) return -1
      if (!a._ongoing && b._ongoing) return 1
      return new Date(a.startdate) - new Date(b.startdate)
    })
}

export async function getCS2TeamOngoingEvents(teamName, fallbackTournNames = []) {
  return _resolveTeamEvents('counterstrike', teamName, fallbackTournNames)
}

export async function getLoLTeamOngoingEvents(teamName, fallbackTournNames = []) {
  return _resolveTeamEvents('leagueoflegends', teamName, fallbackTournNames)
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â”€â”€ League of Legends â€” Liquipedia API v3
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Same shared lqFetch / cache / queue as CS2 above.
// wiki parameter is 'leagueoflegends' throughout.

const LOL_ROLE_DISPLAY = {
  top: 'Top', jungle: 'Jungler', mid: 'Mid', bot: 'Bot', adc: 'Bot', support: 'Support',
  coach: 'Coach', analyst: 'Analyst',
}

const LOL_STAFF_ROLES = new Set([
  'coach', 'head coach', 'assistant coach', 'co-coach', 'analyst', 'manager',
  'team manager', 'general manager', 'performance manager', 'content creator', 'streamer',
])

function mapLoLMatch(m) {
  return {
    id: m.match2id || m.pagename || '',
    tournament: m.tournament || '',
    liquipediatier: String(m.liquipediatier ?? '1'),
    bestof: m.bestof || 1,
    winner: String(m.winner ?? ''),
    finished: m.finished ? 1 : 0,
    date: m.date || '',
    match2bracketdata: (() => { const r = m.match2bracketdata; if (!r) return {}; if (typeof r === 'object') return r; try { return JSON.parse(r); } catch { return {}; } })(),
    match2opponents: (m.match2opponents || []).map(o => ({
      type: o.type || 'team',
      name: (o.name || o.template || '').replace(/<[^>]+>/g, '').trim(),
      template: o.template || '',
      score: o.score ?? 0,
      iconurl: '',
      match2players: o.match2players || [],
    })),
    match2games: (m.match2games || []).filter(g =>
      // Sadece oynanan game'leri gÃ¶ster (kazanan var veya sÃ¼re var)
      g.winner === '1' || g.winner === '2' || (g.length && g.length !== '')
    ).map(g => {
      let playerStats = null
      // participants: keyed by "teamIdx_playerIdx" (e.g. "1_1", "2_3")
      // Fallback: bazÄ± maÃ§larda match.match2players altÄ±nda dÃ¼z liste olabilir
      const rawParticipants = g.participants
        || (g.match2players?.length ? Object.fromEntries(g.match2players.map((p, i) => [`${p.team || Math.floor(i / 5) + 1}_${(i % 5) + 1}`, p])) : null)
      if (rawParticipants && Object.keys(rawParticipants).length) {
        const team1 = [], team2 = []
        const PARTICIPANT_KEY_RE = /^(\d+)_(\d+)$/
        // Clean pagename → display name: "Soopers_(Korean_player)" → "Soopers"
        const cleanPlayerName = (raw) => {
          if (!raw) return ''
          return raw.replace(/_\([^)]+\)$/, '').replace(/_/g, ' ').trim()
        }
        for (const [key, p] of Object.entries(rawParticipants)) {
          const match = PARTICIPANT_KEY_RE.exec(key)
          if (!match) continue
          const teamIdx = parseInt(match[1], 10)
          const rawName = p.player || p.name || p.link || ''
          const name = cleanPlayerName(rawName)
          if (!name) continue  // skip empty entries (causes the extra "—" row)
          const entry = {
            name,
            champion: p.champion || p.char1 || p.pick || p.heroname || p.character || '',
            kills:       Number(p.kills ?? 0),
            deaths:      Number(p.deaths ?? 0),
            assists:     Number(p.assists ?? 0),
            cs:          Number(p.cs ?? p.creepscore ?? p.minionkills ?? 0),
            gold:        Number(p.gold ?? p.totalgold ?? 0),
            damage:      Number(p.damagedone ?? p.damage ?? p.totaldamagedealt ?? 0),
            visionScore: Number(p.visionscore ?? p.visionScore ?? p.wardsplaced ?? 0),
          }
          if (teamIdx === 1) team1.push(entry)
          else team2.push(entry)
        }
        if (team1.length || team2.length) playerStats = { team1, team2 }
      }
      // Picks/bans from extradata (team1picks1..5, team1bans1..5, team2picks1..5, team2bans1..5)
      let picks = null
      let bans  = null
      if (g.extradata) {
        const ed = g.extradata
        const t1picks = [1,2,3,4,5].map(n => ed[`team1champion${n}`]).filter(Boolean)
        const t2picks = [1,2,3,4,5].map(n => ed[`team2champion${n}`]).filter(Boolean)
        const t1bans  = [1,2,3,4,5].map(n => ed[`team1ban${n}`]).filter(Boolean)
        const t2bans  = [1,2,3,4,5].map(n => ed[`team2ban${n}`]).filter(Boolean)
        if (t1picks.length || t2picks.length) picks = { team1: t1picks, team2: t2picks }
        if (t1bans.length  || t2bans.length)  bans  = { team1: t1bans,  team2: t2bans  }
      }

      const parseObjectives = (raw) => {
        if (!raw) return null
        if (typeof raw === 'object') return raw
        const [dragons, barons, towers, grubs, heralds] = String(raw).split('-').map(Number)
        return { dragons, barons, towers, grubs, heralds }
      }
      const objectives = g.extradata ? {
        team1: parseObjectives(g.extradata.team1objectives),
        team2: parseObjectives(g.extradata.team2objectives),
        team1side: g.extradata.team1side || null,
      } : null

      return {
        map: g.map || "Summoner's Rift",
        scores: [g.score1 ?? g.scores?.[0] ?? 0, g.score2 ?? g.scores?.[1] ?? 0],
        winner: String(g.winner ?? ''),
        date: g.date || '',
        length: g.length || '',
        vod: g.vod || null,
        playerStats,
        picks,
        bans,
        objectives,
      }
    }),
    wiki: 'leagueoflegends',
  }
}

async function fetchLoLTeamIconMap(opponents) {
  if (!opponents.length) return {}
  try {
    const names     = [...new Set(opponents.map(o => o.name).filter(Boolean))]
    const templates = [...new Set(opponents.map(o => o.template).filter(Boolean))]
    const conds = [
      ...names.map(n => `[[name::${n}]]`),
      ...names.map(n => `[[pagename::${n.replace(/ /g, '_')}]]`),
      ...templates.map(t => `[[template::${t}]]`),
    ]
    const data = await lqFetch('team', {
      wiki: 'leagueoflegends',
      conditions: conds.join(' OR '),
      limit: '50',
    })
    const map = {}
    for (const t of data.result || []) {
      const url = t.textlesslogourl || t.logourl || ''
      if (!url) continue
      if (t.name) { map[t.name] = url; map[t.name.toLowerCase()] = url }
      if (t.pagename) map[t.pagename.replace(/_/g, ' ')] = url
      if (t.template) map[t.template] = url
    }
    return map
  } catch { return {} }
}

// â”€â”€ LoL Tournament API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Turnuva ismine gÃ¶re bilinen Liquipedia banner URL'si dÃ¶ner
function _lolBannerFallback(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('msi') || n.includes('mid-season'))
    return 'https://liquipedia.net/commons/images/thumb/f/f7/MSI_2021_lightmode.png/600px-MSI_2021_lightmode.png'
  if (n.includes('worlds') || n.includes('world championship'))
    return 'https://liquipedia.net/commons/images/thumb/9/96/Worlds_2025_lightmode.png/400px-Worlds_2025_lightmode.png'
  if (n.includes('lck'))
    return 'https://liquipedia.net/commons/images/thumb/e/e2/LCK_2021_lightmode.png/600px-LCK_2021_lightmode.png'
  if (n.includes('lec'))
    return 'https://liquipedia.net/commons/images/thumb/0/03/LEC_lightmode.png/600px-LEC_lightmode.png'
  if (n.includes('lcs'))
    return 'https://liquipedia.net/commons/images/thumb/3/34/LCS_2021_lightmode.png/600px-LCS_2021_lightmode.png'
  if (n.includes('lpl'))
    return 'https://liquipedia.net/commons/images/thumb/9/9e/LPL_2021_lightmode.png/600px-LPL_2021_lightmode.png'
  return ''
}

export async function getLoLFeaturedTournaments() {
  const today          = new Date().toISOString().slice(0, 10)
  const twoWeeksAgo    = new Date(Date.now() - 14  * 86400000).toISOString().slice(0, 10)
  const sixMonthsAhead = new Date(Date.now() + 183 * 86400000).toISOString().slice(0, 10)

  const data = await lqFetch('tournament', {
    wiki:       'leagueoflegends',
    conditions: `[[liquipediatier::1]] AND [[startdate::>${twoWeeksAgo}]] AND [[startdate::<${sixMonthsAhead}]] AND [[enddate::>${today}]]`,
    limit:      '20',
    order:      'startdate asc',
  })

  const isWorlds = t =>
    (t.name || '').toLowerCase().includes('worlds') ||
    (t.liquipediatiertype || '').toLowerCase().includes('world')

  const tournaments = (data.result || []).map(t => {
    const base = { ...mapTournament(t), wiki: 'leagueoflegends' }
    if (!base.bannerurl) base.bannerurl = _lolBannerFallback(base.name)
    if (!base.bannerdarkurl) base.bannerdarkurl = _lolBannerFallback(base.name)
    return base
  })

  const sorted = tournaments
    .filter(t => (t._ongoing && isDiscreteEvent(t._raw)) || (t._upcoming && isDiscreteEvent(t._raw)))
    .sort((a, b) => {
      if (a._ongoing && !b._ongoing) return -1
      if (!a._ongoing && b._ongoing) return 1
      if (a._ongoing && b._ongoing) return b.prizepool - a.prizepool
      if (a._upcoming && b._upcoming) {
        if (isWorlds(a) && !isWorlds(b)) return -1
        if (!isWorlds(a) && isWorlds(b)) return 1
      }
      return a.startdate.localeCompare(b.startdate)
    })

  return [...sorted.filter(t => t._ongoing).slice(0, 2), ...sorted.filter(t => t._upcoming).slice(0, 2)]
}

export async function getLoLTournamentsByStatus(status, limit = 30) {
  const today     = new Date().toISOString().slice(0, 10)
  const tomorrow  = new Date(Date.now() +  86400000).toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() -  86400000).toISOString().slice(0, 10)

  const condMap = {
    completed: `[[liquipediatier::1]] AND [[enddate::<${today}]]`,
    ongoing:   `[[liquipediatier::1]] AND [[startdate::<${tomorrow}]] AND [[enddate::>${yesterday}]]`,
    upcoming:  `[[liquipediatier::1]] AND [[startdate::>${today}]]`,
  }
  const orderMap = { completed: 'enddate desc', ongoing: 'startdate asc', upcoming: 'startdate asc' }

  const data = await lqFetch('tournament', {
    wiki:       'leagueoflegends',
    conditions: condMap[status],
    limit:      String(limit),
    order:      orderMap[status],
  })

  let results = (data.result || []).map(t => ({ ...mapTournament(t), wiki: 'leagueoflegends' }))
  if (status === 'ongoing')   results = results.filter(t => isDiscreteEvent(t._raw))
  if (status === 'completed') results = results.filter(t => t._raw?.status !== 'cancelled' && isDiscreteEvent(t._raw))
  return results
}

export async function getLoLRecentTournaments() {
  const today = new Date().toISOString().slice(0, 10)
  const data = await lqFetch('tournament', {
    wiki:       'leagueoflegends',
    conditions: `[[liquipediatier::1]] AND [[enddate::<${today}]]`,
    limit:      '15',
    order:      'enddate desc',
  })
  return (data.result || [])
    .filter(t => t.status !== 'cancelled' && isDiscreteEvent(t))
    .slice(0, 5)
    .map(t => ({ ...mapTournament(t), wiki: 'leagueoflegends' }))
}

// Fetches a single LoL tournament by Liquipedia pagename
export async function getLoLTournamentByPagename(pagename) {
  const data = await lqFetch('tournament', {
    wiki:       'leagueoflegends',
    conditions: `[[pagename::${pagename}]]`,
    limit:      '1',
  })
  const t = data.result?.[0]
  if (!t) return null
  const base = { ...mapTournament(t), wiki: 'leagueoflegends' }
  if (!base.bannerurl) base.bannerurl = _lolBannerFallback(base.name)
  return base
}

export async function getLoLTournamentWinner(tournamentName) {
  if (!tournamentName) return null
  const data = await lqFetch('placement', {
    wiki:       'leagueoflegends',
    conditions: `[[tournament::${tournamentName}]] AND [[placement::1]] AND [[opponenttype::team]]`,
    limit:      '1',
  })
  const p = data.result?.[0]
  if (!p?.opponentname) return null
  const logos = await getLoLTeamLogos([p.opponentname]).catch(() => ({}))
  return { name: p.opponentname, logoUrl: logos[p.opponentname] || '' }
}

export async function getLoLTournamentPrizes(tournamentName) {
  if (!tournamentName) return []
  const data = await lqFetch('placement', {
    wiki:       'leagueoflegends',
    conditions: `[[tournament::${tournamentName}]] AND [[opponenttype::team]]`,
    limit:      '16',
    order:      'placement asc',
  })
  const rows = (data.result || [])
    .filter(p => p.opponentname && p.placement)
    .map(p => ({
      placement: String(p.placement).trim(),
      team:      p.opponentname,
      prize:     typeof p.prizemoney === 'string'
                   ? Number(p.prizemoney.replace(/[^0-9]/g, '')) || 0
                   : (p.prizemoney || 0),
      logoUrl:   '',
    }))
  rows.sort((a, b) => {
    const n = s => parseInt(s.split(/[-–]/)[0]) || 99
    return n(a.placement) - n(b.placement)
  })
  const teamNames = [...new Set(rows.map(r => r.team))]
  const logos = await getLoLTeamLogos(teamNames).catch(() => ({}))
  rows.forEach(r => { r.logoUrl = logos[r.team] || '' })
  return rows
}

export async function getLoLTournamentMVP(tournamentName) {
  if (!tournamentName) return null
  try {
    const data = await lqFetch('award', {
      wiki:       'leagueoflegends',
      conditions: `[[tournament::${tournamentName}]]`,
      limit:      '10',
    })
    if (!data?.result?.length) return null
    const mvpRow = data.result.find(r => {
      const type = (r.type || r.award || r.name || '').toLowerCase()
      return type.includes('mvp') || type.includes('valuable') || type.includes('star')
    }) || data.result[0]
    return mvpRow?.player || mvpRow?.recipient || mvpRow?.name || null
  } catch { return null }
}

const LOL_GROUP_STAGE_SUFFIXES = [
  'Play-In', 'Swiss_Stage', 'Group_Stage', 'Regional_Qualifier',
  'Opening_Stage', 'Playoff', 'Qualifier',
]

export async function getLoLGroupStageMatches(tournamentName, pagename) {
  if (!tournamentName || !pagename) return []
  const candidates = LOL_GROUP_STAGE_SUFFIXES.map(s => `${pagename}/${s}`)
  const cond = candidates.map(p => `[[pagename::${p}]]`).join(' OR ')
  const subData = await lqFetch('tournament', {
    wiki:       'leagueoflegends',
    conditions: cond,
    limit:      '10',
    order:      'startdate asc',
  }).catch(() => ({ result: [] }))
  const subNames = (subData.result || []).map(t => t.name).filter(Boolean)
  if (!subNames.length) return []
  const matchCond = subNames.map(n => `[[tournament::${n}]]`).join(' OR ')
  const data = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: matchCond,
    limit:      '100',
    order:      'date asc',
  }).catch(() => ({ result: [] }))
  return (data.result || []).map(m => ({
    ...mapLoLMatch(m),
    stageLabel: subNames.find(n => n === m.tournament) || subNames[0],
  }))
}

export async function getLoLTournamentMatches(tournamentName) {
  if (!tournamentName) return []
  const data = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: `[[tournament::${tournamentName}]]`,
    limit:      '50',
    order:      'date desc',
  })
  return (data.result || []).map(mapLoLMatch)
}

export async function getLoLTournamentStreams(tournamentName) {
  try {
    const data = await lqFetch('streaming', {
      wiki:       'leagueoflegends',
      conditions: `[[tournament::${tournamentName}]]`,
      limit:      '20',
    })
    return (data.result || [])
      .filter(s => s.platform && s.link)
      .map(s => ({
        platform: s.platform,
        link:     s.link.startsWith('http') ? s.link : `https://${s.link}`,
        language: s.language || 'EN',
      }))
  } catch { return [] }
}

export async function getLoLOngoingMatches(tournamentNames) {
  if (!tournamentNames.length) return []
  const cond = tournamentNames.map(n => `[[tournament::${n}]]`).join(' OR ')
  const data = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: `(${cond}) AND [[finished::0]]`,
    limit:      '20',
    order:      'date asc',
  })
  return (data.result || [])
    .map(mapLoLMatch)
    .filter(m => m.match2opponents[0]?.name && m.match2opponents[1]?.name && !m.date.startsWith('0000'))
}

// YaklaÅŸan tier 1-2 LoL maÃ§larÄ±nÄ± Ã§eker (tÃ¼m turnuvalardan, tier'a gÃ¶re sÄ±ralÄ±)
export async function getLoLNextMatches(limit = 6) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const data = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: `([[liquipediatier::1]] OR [[liquipediatier::2]]) AND [[finished::0]] AND [[date::>${now}]] AND [[date::<${weekAhead}]]`,
    limit:      String(limit),
    order:      'date asc',
  })

  const matches = (data.result || [])
    .map(mapLoLMatch)
    .filter(m => m.match2opponents[0]?.name && m.match2opponents[1]?.name && !m.date.startsWith('0000'))

  // Tier 1 Ã¶nce, sonra tier 2
  return matches.sort((a, b) =>
    Number(a.liquipediatier) - Number(b.liquipediatier) || a.date.localeCompare(b.date)
  )
}

// â”€â”€ LoL Match API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getLoLMatchesByDate(date) {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  const next = d.toISOString().slice(0, 10)

  const data = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: `([[liquipediatier::1]] OR [[liquipediatier::2]]) AND [[date::>${date}]] AND [[date::<${next}]]`,
    limit:      '50',
    order:      'date asc',
  })

  const matches = (data.result || [])
    .map(mapLoLMatch)
    .filter(m => m.match2opponents[0]?.name && m.match2opponents[1]?.name)

  const opponents = matches.flatMap(m => m.match2opponents.filter(o => o.name))
  const iconMap   = await fetchLoLTeamIconMap(opponents)

  return matches.map(m => ({
    ...m,
    match2opponents: m.match2opponents.map(o => ({
      ...o,
      iconurl: iconMap[o.name] || iconMap[o.name.toLowerCase()] || iconMap[o.template] || '',
    })),
  }))
}

export async function getLoLBroadcasters(tournamentName) {
  if (!tournamentName) return []
  try {
    const data = await lqFetch('broadcasters', {
      wiki:       'leagueoflegends',
      conditions: `[[tournament::${tournamentName}]]`,
      limit:      '20',
    })
    return (data.result || [])
      .filter(b => b.name && (b.twitch || b.youtube || b.link))
      .map(b => ({
        name:     b.name || '',
        role:     b.role || 'Caster',
        language: b.language || 'EN',
        link:     b.twitch ? `https://twitch.tv/${b.twitch}` : b.youtube ? `https://youtube.com/@${b.youtube}` : (b.link || ''),
      }))
  } catch { return [] }
}

export async function getLoLMatchVods(matchId) {
  if (!matchId) return []
  try {
    const data = await lqFetch('matchvod', {
      wiki:       'leagueoflegends',
      conditions: `[[match::${matchId}]]`,
      limit:      '10',
    })
    return (data.result || [])
      .filter(v => v.vod || v.link)
      .map(v => ({
        language: v.language || 'EN',
        url:      v.vod || v.link || '',
        platform: v.platform || 'youtube',
      }))
  } catch { return [] }
}

export async function getLoLMatchById(matchId) {
  const data = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: `[[match2id::${matchId}]]`,
    limit:      '1',
  })
  const m = data.result?.[0]
  if (!m) return null
  const match = mapLoLMatch(m)
  const iconMap = await fetchLoLTeamIconMap(match.match2opponents).catch(() => ({}))
  return {
    ...match,
    match2opponents: match.match2opponents.map(o => ({
      ...o,
      iconurl: iconMap[o.name] || iconMap[o.name.toLowerCase()] || '',
    })),
  }
}

export async function getCS2MatchById(matchId) {
  const data = await lqFetch('match', {
    wiki:       'counterstrike',
    conditions: `[[match2id::${matchId}]]`,
    limit:      '1',
  })
  const m = data.result?.[0]
  if (!m) return null
  const match = mapMatch(m)
  const iconMap = await fetchTeamIconMap(match.match2opponents).catch(() => ({}))
  return {
    ...match,
    match2opponents: match.match2opponents.map(o => ({
      ...o,
      iconurl: iconMap[o.name] || iconMap[o.name.toLowerCase()] || '',
    })),
  }
}

// â”€â”€ LoL Team Rankings API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Points from Worlds/MSI placements â€” LoL equivalent of VRS circuit points.
function _calcLoLCircuit(placements) {
  const pts    = { '1': 100, '2': 75, '3': 50, '3-4': 50, '5': 25, '5-8': 25, '9-12': 10, '13-16': 5 }
  const tierW  = { '1': 1.0, '2': 0.5 }
  const recent = placements.filter(p => p.placement).slice(0, 5)
  let total = 0
  recent.forEach((p, i) => {
    total += (pts[String(p.placement).trim()] ?? 0) * (tierW[String(p.liquipediatier)] ?? 0.2) * (1 - i * 0.15)
  })
  return Math.round(total)
}

// Normalise team name for fuzzy matching against lolesports API names.
function _normLolName(n) {
  return (n || '')
    .toLowerCase()
    .replace(/\s+(esports?|gaming|e-sports?)\s*$/i, '')
    .replace(/[^a-z0-9]/g, '')
}

export async function getLoLTeamsForRanking(limit = 30) {
  const { getLoLGPRList } = await import('./lolesportsApi.js')

  const threeMonthsAgo = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)

  // 1. GPR listesi önce tek seferinde çek — race condition'ı önlemek için
  const gprList = await getLoLGPRList().catch(() => null)

  const [, matchData] = await Promise.all([
    Promise.resolve(gprList ? Object.fromEntries(gprList.map(r => [r.name.toLowerCase(), r.score])) : null),
    lqFetch('match', {
      wiki:       'leagueoflegends',
      conditions: `([[liquipediatier::1]] OR [[liquipediatier::2]]) AND [[finished::1]] AND [[date::>${threeMonthsAgo}]]`,
      limit:      '200',
      order:      'date desc',
    }),
  ])

  if (!gprList?.length) {
    console.log('[LoL] GPR list empty â€” falling back to placement-based ranking')
    return []
  }

  // GPR'deki ilk `limit` takÄ±mla Ã§alÄ±ÅŸ
  const topTeams = gprList.slice(0, limit)

  // 2. Liquipedia'dan logo/bÃ¶lge/kazanÃ§ Ã§ek â€” isimle ara
  // Her takÄ±m adÄ±nÄ±n birden fazla varyantÄ±nÄ± dene
  const nameConditions = topTeams.flatMap(({ name }) => [
    `[[name::${name}]]`,
    // Title-case versiyonu da dene (BILIBILI GAMING â†’ Bilibili Gaming)
    `[[name::${toTitleCase(name)}]]`,
  ])
  const uniqueConds = [...new Set(nameConditions)]

  const teamData = await lqFetch('team', {
    wiki:       'leagueoflegends',
    conditions: uniqueConds.join(' OR '),
    limit:      String(limit * 2),
  })

  // Liquipedia takÄ±mlarÄ±nÄ± isimle indeksle (normalize ederek)
  const liqByNorm = {}
  for (const t of teamData.result || []) {
    liqByNorm[_normLolName(t.name)]     = t
    liqByNorm[_normLolName(t.pagename)] = t
  }

  // 3. Her GPR takÄ±mÄ±nÄ± Liquipedia verisiyle birleÅŸtir
  return topTeams
    .map(({ name, league, score }) => {
      const normN = _normLolName(name)
      const t = liqByNorm[normN] || null

      // Liquipedia'dan bulunamazsa minimal obje yap
      const teamObj = t ? {
        id:                  t.pagename,
        pagename:            t.pagename,
        name:                t.name,
        region:              t.region || leagueToRegion(league),
        textlesslogourl:     t.textlesslogourl || '',
        textlesslogodarkurl: t.textlesslogodarkurl || t.textlesslogourl || '',
        logourl:             t.logourl || '',
        earnings:            t.earnings || 0,
        earningsbyyear:      t.earningsbyyear || {},
        links:               t.links || {},
        template:            t.template || '',
      } : {
        id:                  normN,
        pagename:            name.replace(/ /g, '_'),
        name,
        region:              leagueToRegion(league),
        textlesslogourl:     '',
        textlesslogodarkurl: '',
        logourl:             '',
        earnings:            0,
        earningsbyyear:      {},
        links:               {},
        template:            '',
      }

      const tpl = _stripVersion((teamObj.template || '').toLowerCase())

      return {
        ...teamObj,
        rankpoints:  score,
        rankchange:  0,
        status:      'active',
        wiki:        'leagueoflegends',
        esm:         0,
        form:        _calcForm(matchData.result || [], tpl, teamObj.name, 5),
        formLong:    _calcForm(matchData.result || [], tpl, teamObj.name, 10),
      }
    })
    .sort((a, b) => b.rankpoints - a.rankpoints)
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function leagueToRegion(league) {
  const map = {
    lck: 'Korea', lpl: 'China', lec: 'Europe',
    lcs: 'North America', lcp: 'Pacific', cblol: 'Brazil',
  }
  return map[(league || '').toLowerCase()] || ''
}

const _lolLogoCache = {}  // { name: { url, ts } }
const _LOL_LOGO_TTL = 10 * 60 * 1000  // 10 min

const LOL_TEAM_PAGENAMES = {
  'Gen.G':            'Gen.G_Esports',
  'T1':               'T1_(South_Korean_Team)',
  'JDG':              'JD_Gaming',
  'JD Gaming':        'JD_Gaming',
  'BLG':              'Bilibili_Gaming',
  'Bilibili Gaming':  'Bilibili_Gaming',
  'NRG':              'NRG_(League_of_Legends)',
  'Weibo Gaming':     'Weibo_Gaming',
  'Hanwha Life':      'Hanwha_Life_Esports',
  'KT':               'KT_Rolster',
  'Cloud9':           'Cloud9_(League_of_Legends)',
}

export async function getLoLTeamLogos(teamNames) {
  if (!teamNames.length) return {}
  try {
    const now = Date.now()
    const missing = teamNames.filter(n => !_lolLogoCache[n] || now - _lolLogoCache[n].ts > _LOL_LOGO_TTL)
    if (missing.length) {
      try {
        const conds = missing.flatMap(n => {
          const pg = LOL_TEAM_PAGENAMES[n] || n.replace(/ /g, '_')
          return [`[[pagename::${pg}]]`, `[[name::${n}]]`]
        })
        const data = await lqFetch('team', {
          wiki:       'leagueoflegends',
          conditions: [...new Set(conds)].join(' OR '),
          limit:      String(missing.length * 3),
        })
        const byPage = {}, byName = {}
        for (const t of data.result || []) {
          const url = t.textlesslogourl || t.logourl || ''
          if (!url) continue
          if (t.pagename) byPage[t.pagename] = url
          if (t.name)     byName[t.name]     = url
        }
        for (const n of missing) {
          const pg = LOL_TEAM_PAGENAMES[n] || n.replace(/ /g, '_')
          _lolLogoCache[n] = { url: byPage[pg] || byName[n] || '', ts: Date.now() }
        }
      } catch {
        for (const n of missing) _lolLogoCache[n] = { url: '', ts: Date.now() }
      }
    }
    return Object.fromEntries(teamNames.map(n => [n, _lolLogoCache[n]?.url || '']))
  } catch { return {} }
}

export async function getLoLTransfers(limit = 5) {
  const data = await lqFetch('transfer', {
    wiki:  'leagueoflegends',
    limit: String(limit),
    order: 'date desc',
  })
  return data.result || []
}

// â”€â”€ LoL Team Page API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getLoLTeamByName(name) {
  const pagename = name.replace(/ /g, '_')
  const data = await lqFetch('team', {
    wiki:       'leagueoflegends',
    conditions: `[[pagename::${pagename}]] OR [[name::${name}]]`,
    limit:      '1',
  })
  const t = data.result?.[0]
  if (!t) return null
  return {
    name:                t.name,
    pagename:            t.pagename,
    region:              t.region || '',
    status:              t.status || 'active',
    createdate:          t.createdate || '',
    disbanddate:         t.disbanddate || '0000-01-01',
    earnings:            t.earnings || 0,
    earningsbyyear:      t.earningsbyyear || {},
    links:               t.links || {},
    textlesslogourl:     t.textlesslogourl || '',
    textlesslogodarkurl: t.textlesslogodarkurl || t.textlesslogourl || '',
    logourl:             t.logourl || '',
    template:            t.template || '',
    wiki:                'leagueoflegends',
  }
}

export async function getLoLTeamSquad(teamPagename) {
  const data = await lqFetch('squadplayer', {
    wiki:       'leagueoflegends',
    conditions: `[[pagename::${teamPagename}]] AND ([[status::active]] OR [[status::Active]]) AND [[type::player]]`,
    limit:      '10',
  })

  const players = (data.result || [])
    .filter(p => !LOL_STAFF_ROLES.has((p.role || '').toLowerCase()))
    .map(p => ({
      id:          p.id   || p.link || '',
      pagename:    p.link || p.id   || '',
      name:        p.name || '',
      nationality: p.nationality || '',
      role:        LOL_ROLE_DISPLAY[(p.role || '').toLowerCase()] || p.role || '',
      joindate:    p.joindate || '',
    }))

  if (!players.length) {
    const fallback = await lqFetch('player', {
      wiki:       'leagueoflegends',
      conditions: `[[teampagename::${teamPagename}]] AND [[status::Active]]`,
      limit:      '10',
    })
    return (fallback.result || []).map(p => ({
      id:          p.id || p.pagename,
      pagename:    p.pagename,
      name:        p.name || '',
      nationality: p.nationality || '',
      role:        LOL_ROLE_DISPLAY[(p.extradata?.role || '').toLowerCase()] || '',
      joindate:    '',
    }))
  }
  return players
}

export async function getLoLTeamTransfersAPI(teamName, limit = 15) {
  if (!teamName) return []
  const data = await lqFetch('transfer', {
    wiki:       'leagueoflegends',
    conditions: `[[fromteam::${teamName}]] OR [[toteam::${teamName}]]`,
    limit:      String(limit),
    order:      'date desc',
  })
  return data.result || []
}

export async function getLoLTeamRecentMatches(teamName, limit = 30) {
  if (!teamName) return []
  const teamLow    = teamName.toLowerCase()
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)

  // Try direct opponent filter first (works for new teams without placement history)
  const direct = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: `([[opponent1::${teamName}]] OR [[opponent2::${teamName}]]) AND [[finished::1]] AND [[date::>${oneYearAgo}]]`,
    limit:      String(limit),
    order:      'date desc',
  }).catch(() => ({ result: [] }))

  if (direct.result?.length) {
    return direct.result.map(mapLoLMatch).slice(0, limit)
  }

  // Fallback: placement-based lookup for established teams
  const placements = await lqFetch('placement', {
    wiki:       'leagueoflegends',
    conditions: `[[opponentname::${teamName}]] AND [[date::>${oneYearAgo}]]`,
    limit:      '25',
    order:      'date desc',
  }).catch(() => ({ result: [] }))
  const tournaments = [...new Set(
    (placements.result || []).map(p => p.tournament).filter(Boolean)
  )].slice(0, 10)

  if (!tournaments.length) return []

  const tournCond = tournaments.map(t => `[[tournament::${t}]]`).join(' OR ')
  const data = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: `(${tournCond}) AND [[finished::1]]`,
    limit:      String(limit * 2),
    order:      'date desc',
  })

  return (data.result || [])
    .map(mapLoLMatch)
    .filter(m => m.match2opponents.some(o => (o.name || '').toLowerCase() === teamLow))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
}

export async function getLoLTeamUpcomingMatches(teamName, limit = 5) {
  if (!teamName) return []
  const today         = new Date().toISOString().slice(0, 10)
  const twoWeeksAhead = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)

  const data = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: `([[opponent1::${teamName}]] OR [[opponent2::${teamName}]]) AND [[finished::0]] AND [[date::>${today}]] AND [[date::<${twoWeeksAhead}]]`,
    limit:      String(limit),
    order:      'date asc',
  })

  return (data.result || [])
    .map(mapLoLMatch)
    .slice(0, limit)
}

// â”€â”€ LoL Player Profile API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getLoLPlayerImage(pagename) {
  const LS_KEY = `lq_lolimg_${pagename}`
  const TTL    = 24 * 60 * 60 * 1000
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const { url, ts } = JSON.parse(raw)
      if (Date.now() - ts < TTL) return url
    }
  } catch {}

  try {
    const r = await fetch(
      `https://liquipedia.net/leagueoflegends/api.php?action=parse&page=${encodeURIComponent(pagename)}&prop=properties&format=json&origin=*`,
      { headers: { 'User-Agent': 'EsporMax/1.0 (espormax-bot)' } }
    )
    if (!r.ok) return ''
    const data  = await r.json()
    const props = data?.parse?.properties || []
    const meta  = props.find(p => p.name === 'metaimageurl')
    const fullUrl = meta?.['*'] || ''
    if (!fullUrl) { try { localStorage.setItem(LS_KEY, JSON.stringify({ url: '', ts: Date.now() })) } catch {}; return '' }

    const m = fullUrl.match(/\/commons\/images\/([a-f0-9]\/[a-f0-9]{2})\/(.+)$/)
    const thumbUrl = m
      ? `https://liquipedia.net/commons/images/thumb/${m[1]}/${m[2]}/400px-${m[2]}`
      : fullUrl

    try { localStorage.setItem(LS_KEY, JSON.stringify({ url: thumbUrl, ts: Date.now() })) } catch {}
    return thumbUrl
  } catch { return '' }
}

export async function getLoLPlayersForRanking(limit = 30) {
  const data = await lqFetch('squadplayer', {
    wiki:       'leagueoflegends',
    conditions: `([[status::active]] OR [[status::Active]]) AND [[type::player]]`,
    limit:      String(limit),
    order:      'joindate desc',
  })
  const seen = new Set()
  return (data.result || [])
    .filter(p => p.id || p.link)
    .filter(p => {
      const key = p.id || p.link
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(p => ({
      id:          p.id || p.link || '',
      pagename:    p.link || p.id || '',
      name:        p.name || p.id || '',
      nationality: p.nationality || '',
      role:        LOL_ROLE_DISPLAY?.[(p.role || '').toLowerCase()] || p.role || '',
      team:        p.pagename || '',
      earnings:    0,
      views:       0,
      wiki:        'leagueoflegends',
    }))
    .slice(0, limit)
}

export async function getLoLPlayerMatchStats(playerPagename, teamName) {
  if (!playerPagename) return null
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)

  // Get recent matches for the player's team
  const teamCond = teamName
    ? `([[opponent1::${teamName}]] OR [[opponent2::${teamName}]]) AND`
    : ''
  const data = await lqFetch('match', {
    wiki:       'leagueoflegends',
    conditions: `${teamCond} [[finished::1]] AND [[date::>${oneYearAgo}]] AND ([[liquipediatier::1]] OR [[liquipediatier::2]])`,
    limit:      '30',
    order:      'date desc',
  }).catch(() => ({ result: [] }))

  const matches = (data.result || []).map(mapLoLMatch)
  const stats = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, cs: 0, damage: 0, visionScore: 0 }

  for (const m of matches) {
    for (const g of m.match2games || []) {
      const ps = g.playerStats
      if (!ps) continue
      const allPlayers = [...(ps.team1 || []), ...(ps.team2 || [])]
      const player = allPlayers.find(p => {
        const name = (p.name || '').toLowerCase()
        const pg = playerPagename.toLowerCase().replace(/_/g, ' ')
        return name === pg || name === pg.split('_').join(' ')
      })
      if (!player) continue
      stats.games++
      const teamIdx = ps.team1.includes(player) ? 1 : 2
      if (String(g.winner) === String(teamIdx)) stats.wins++
      stats.kills += player.kills || 0
      stats.deaths += player.deaths || 0
      stats.assists += player.assists || 0
      stats.cs += player.cs || 0
      stats.damage += player.damage || 0
      stats.visionScore += player.visionScore || 0
    }
  }

  if (!stats.games) return null
  return {
    games:      stats.games,
    winRate:    Math.round((stats.wins / stats.games) * 100),
    avgKills:   (stats.kills / stats.games).toFixed(1),
    avgDeaths:  (stats.deaths / stats.games).toFixed(1),
    avgAssists: (stats.assists / stats.games).toFixed(1),
    kda:        stats.deaths === 0 ? 'Perfect' : ((stats.kills + stats.assists) / stats.deaths).toFixed(2),
    avgCs:      Math.round(stats.cs / stats.games),
    avgDamage:  Math.round(stats.damage / stats.games),
    avgVision:  Math.round(stats.visionScore / stats.games),
  }
}

export async function getLoLPlayerProfile(id) {
  const data = await lqFetch('player', {
    wiki:       'leagueoflegends',
    conditions: `[[id::${id}]] OR [[pagename::${id}]]`,
    limit:      '1',
  })
  const p = data.result?.[0]
  if (!p) return null

  const teamName = (p.teampagename || p.team || '').replace(/_/g, ' ')
  const rawLinks = p.links || {}
  const rawRoles = p.extradata?.roles || (p.extradata?.role ? { '1': p.extradata.role } : {})
  const roles = [...new Set(Object.values(rawRoles).filter(Boolean))]
    .map(r => LOL_ROLE_DISPLAY[r.toLowerCase()] || r)

  return {
    id:             p.id       || p.pagename,
    pagename:       p.pagename,
    name:           p.name     || '',
    nationality:    p.nationality || '',
    region:         p.region   || p.nationality || '',
    birthdate:      p.birthdate || '',
    imageurl:       '',
    team:           teamName,
    teampagename:   teamName,
    teamtemplate:   _stripVersion((p.teamtemplate || '').toLowerCase()),
    earnings:       p.earnings || 0,
    earningsbyyear: p.earningsbyyear || {},
    links:          { ...rawLinks },
    roles,
    status:         p.status   || 'Active',
    wiki:           'leagueoflegends',
  }
}

export async function getLoLPlayerCareer(pagename) {
  const data = await lqFetch('transfer', {
    wiki:       'leagueoflegends',
    conditions: `[[player::${pagename}]]`,
    limit:      '40',
    order:      'date asc',
  })
  const SKIP = new Set(['retired', 'free agent', 'inactive', 'substitute', 'coach', 'analyst', 'streamer'])
  return (data.result || [])
    .filter(t => {
      const name = (t.toteam || '').trim().toLowerCase()
      return name && !SKIP.has(name)
    })
    .map(t => ({
      year: (t.date || '').slice(0, 4),
      date: t.date || '',
      team: t.toteam || '',
      note: t.role1  || t.role2 || '',
    }))
}

export async function getLoLPlayerAllPlacements(teamNames) {
  const names = [...new Set(teamNames.filter(Boolean))]
  if (!names.length) return []
  const today = new Date().toISOString().slice(0, 10)
  const CHUNK = 4
  const chunks = []
  for (let i = 0; i < names.length; i += CHUNK) chunks.push(names.slice(i, i + CHUNK))
  const results = await Promise.all(chunks.map(async chunk => {
    const cond = chunk.map(t => `[[opponentname::${t}]]`).join(' OR ')
    try {
      const data = await lqFetch('placement', {
        wiki:       'leagueoflegends',
        conditions: `(${cond}) AND ([[liquipediatier::1]] OR [[liquipediatier::2]]) AND ([[placement::1]] OR [[placement::2]] OR [[placement::3]] OR [[placement::4]] OR [[placement::3-4]] OR [[placement::5-6]] OR [[placement::5-8]]) AND [[opponenttype::team]] AND [[date::<${today}]]`,
        limit:      '100',
        order:      'date desc',
      })
      return data.result || []
    } catch {
      return []
    }
  }))
  return results.flat()
}


// ── 5.5: playerprize — per-tournament prize earnings ──────────────────────────
export async function getLoLPlayerPrizes(pagename) {
  if (!pagename) return []
  try {
    const data = await lqFetch('placement', {
      wiki:       'leagueoflegends',
      conditions: `[[participants::${pagename}]] AND [[opponenttype::team]]`,
      limit:      '30',
      order:      'date desc',
    })
    return (data.result || [])
      .filter(p => p.prizemoney && Number(p.prizemoney) > 0)
      .map(p => ({
        tournament: p.tournament || '',
        date:       p.date || '',
        placement:  p.placement || '',
        prize:      Number(p.prizemoney) || 0,
      }))
  } catch { return [] }
}

// ── 5.6: news — Liquipedia LoL news table ─────────────────────────────────────
export async function getLoLNews(limit = 20) {
  try {
    const data = await lqFetch('news', {
      wiki:  'leagueoflegends',
      limit: String(limit),
      order: 'date desc',
    })
    return (data.result || [])
      .filter(n => n.title || n.pagename)
      .map(n => ({
        title:      n.title || n.pagename || '',
        date:       n.date || '',
        author:     n.author || '',
        tournament: n.tournament || '',
        pagename:   n.pagename || '',
        wiki:       'leagueoflegends',
        type:       'News',
        publisher:  'Liquipedia',
        language:   'en',
        link:       n.pagename ? `https://liquipedia.net/leagueoflegends/${n.pagename}` : '',
      }))
  } catch { return [] }
}

// ── 5.7: series — tournament series grouping ──────────────────────────────────
export async function getLoLSeries(limit = 10) {
  try {
    const data = await lqFetch('series', {
      wiki:  'leagueoflegends',
      limit: String(limit),
      order: 'startdate desc',
    })
    return (data.result || []).map(s => ({
      name:      s.name || s.pagename || '',
      pagename:  s.pagename || '',
      startdate: s.startdate || '',
      enddate:   s.enddate || '',
    }))
  } catch { return [] }
}

// ── 5.8: playerrecord — career win/loss statistics ────────────────────────────
export async function getLoLPlayerRecord(pagename) {
  if (!pagename) return null
  try {
    const data = await lqFetch('playerrecord', {
      wiki:       'leagueoflegends',
      conditions: `[[pagename::${pagename}]]`,
      limit:      '1',
    })
    const r = data.result?.[0]
    if (!r) return null
    return {
      totalWins:   Number(r.win || r.wins || 0),
      totalLosses: Number(r.loss || r.losses || 0),
      totalGames:  Number(r.total || r.games || 0),
      earnings:    Number(r.earnings || 0),
    }
  } catch { return null }
}


// Fetches last N head-to-head finished matches between two teams.
export async function getCS2H2HMatches(team1, team2, limit = 5) {
  if (!team1 || !team2) return []
  const data = await lqFetch('match', {
    wiki:       'counterstrike',
    conditions: `[[opponent::${team1}]] AND [[opponent::${team2}]] AND [[finished::1]]`,
    limit:      String(limit + 3),
    order:      'date desc',
  })
  return (data.result || []).map(mapMatch).slice(0, limit)
}


// Fetches tournament banner image via Liquipedia MediaWiki parse API. 24h cache.
export async function getCS2TournamentImage(pagename) {
  if (!pagename) return ''
  const LS_KEY = `lq_tournimg_${pagename}`
  const TTL    = 24 * 60 * 60 * 1000
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const { url, ts } = JSON.parse(raw)
      if (Date.now() - ts < TTL) return url
    }
  } catch {}
  try {
    const r = await fetch(
      `https://liquipedia.net/counterstrike/api.php?action=parse&page=${encodeURIComponent(pagename)}&prop=properties&format=json&origin=*`,
      { headers: { 'User-Agent': 'EsporMax/1.0 (espormax-bot)' } }
    )
    if (!r.ok) return ''
    const data  = await r.json()
    const props = data?.parse?.properties || []
    const meta  = props.find(p => p.name === 'metaimageurl')
    const fullUrl = meta?.['*'] || ''
    if (!fullUrl) return ''
    const m = fullUrl.match(/\/commons\/images\/([a-f0-9]\/[a-f0-9]{2})\/(.+)$/)
    const thumbUrl = m
      ? `https://liquipedia.net/commons/images/thumb/${m[1]}/${m[2]}/600px-${m[2]}`
      : fullUrl
    try { localStorage.setItem(LS_KEY, JSON.stringify({ url: thumbUrl, ts: Date.now() })) } catch {}
    return thumbUrl
  } catch { return '' }
}

// Fetches VOD links for a CS2 match from the matchvod table.
export async function getCS2MatchVods(matchId) {
  if (!matchId) return []
  try {
    const data = await lqFetch('matchvod', {
      wiki:       'counterstrike',
      conditions: `[[match::${matchId}]]`,
      limit:      '10',
    })
    return (data.result || [])
      .filter(v => v.vod || v.link)
      .map(v => ({
        language: v.language || 'EN',
        url:      v.vod || v.link || '',
        platform: v.platform || 'youtube',
      }))
  } catch { return [] }
}
