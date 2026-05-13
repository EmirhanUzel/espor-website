// Liquipedia API v3 — CS2 only
const BASE = '/liquipedia-api'
const _cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 min

async function lqFetch(endpoint, params = {}) {
  const key = endpoint + '|' + new URLSearchParams(params).toString()
  const hit = _cache.get(key)
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data

  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/${endpoint}?${qs}`)
  if (!res.ok) throw new Error(`Liquipedia API ${res.status}`)
  const data = await res.json()
  _cache.set(key, { data, ts: Date.now() })
  return data
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
    wiki: 'counterstrike',
    _ongoing: t.startdate <= today && t.enddate >= today,
    _upcoming: t.startdate > today,
    _raw: t,
  }
}

// A "real" tournament: has confirmed participants AND runs ≤ 90 days.
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
    match2bracketdata: m.match2bracketdata || {},
    match2opponents: (m.match2opponents || []).map(o => ({
      type: o.type || 'team',
      // Strip HTML from names (e.g. "Group B 2<sup>nd</sup> Place" → "Group B 2nd Place")
      name: (o.name || o.template || '').replace(/<[^>]+>/g, '').trim(),
      template: o.template || '',
      score: o.score ?? 0,
      iconurl: '',
      match2players: o.match2players || [],
    })),
    match2games: (m.match2games || []).map(g => ({
      map: g.map || '',
      scores: [g.score1 ?? g.scores?.[0] ?? 0, g.score2 ?? g.scores?.[1] ?? 0],
      winner: String(g.winner ?? ''),
      date: g.date || '',
      length: g.length || '',
      vod: g.vod || null,
    })),
    wiki: 'counterstrike',
  }
}

// Returns featured CS2 tournaments for the hero banner:
// Slide 1 — currently ongoing Tier 1 event (e.g. PGL Astana 2026)
// Slide 2+ — upcoming Tier 1 / Major events
export async function getCS2FeaturedTournaments() {
  const today = new Date().toISOString().slice(0, 10)
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)
  const sixMonthsAhead = new Date(Date.now() + 183 * 86400000).toISOString().slice(0, 10)

  const data = await lqFetch('tournament', {
    wiki: 'counterstrike',
    conditions: `[[liquipediatier::1]] AND [[startdate::>${twoWeeksAgo}]] AND [[startdate::<${sixMonthsAhead}]]`,
    limit: '20',
    order: 'startdate asc',
  })

  const tournaments = (data.result || []).map(mapTournament)

  const isMajor = t => t.liquipediatiertype === 'Major Championship'

  const sorted = tournaments
    .filter(t => (t._ongoing && isDiscreteEvent(t._raw)) || t._upcoming)
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

// Returns { teamName: textlesslogourl } map for a list of CS2 team names
export async function getCS2TeamLogos(teamNames) {
  if (!teamNames.length) return {}
  try {
    const conds = [
      ...teamNames.map(n => `[[name::${n}]]`),
      ...teamNames.map(n => `[[pagename::${n.replace(/ /g, '_')}]]`),
    ]
    const data = await lqFetch('team', {
      wiki: 'counterstrike',
      conditions: conds.join(' OR '),
      limit: String(teamNames.length * 2),
    })
    const map = {}
    for (const t of data.result || []) {
      const url = t.textlesslogourl || t.logourl || ''
      if (!url) continue
      if (t.name)     map[t.name]     = url
      if (t.pagename) map[t.pagename.replace(/_/g, ' ')] = url
    }
    return map
  } catch {
    return {}
  }
}

// Returns last 5 CS2 player transfers
export async function getCS2Transfers() {
  const data = await lqFetch('transfer', {
    wiki: 'counterstrike',
    limit: '5',
    order: 'date desc',
  })
  return data.result || []
}

// Builds a lookup map: { lowerCaseName: url, template: url }
// Queries by both name and template to handle case mismatches & obscure teams
async function fetchTeamIconMap(opponents) {
  if (!opponents.length) return {}
  try {
    const names     = [...new Set(opponents.map(o => o.name).filter(Boolean))]
    const templates = [...new Set(opponents.map(o => o.template).filter(Boolean))]

    // Query by name, pagename (spaces→underscores, handles case), and template
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
      // Try: exact name → lowercase name → template name
      iconurl: iconMap[o.name]
            || iconMap[o.name.toLowerCase()]
            || iconMap[o.template]
            || '',
    })),
  }))
}

// Fetches finished + upcoming matches for a tournament by its display name
export async function getCS2TournamentMatches(tournamentName) {
  if (!tournamentName) return []
  const data = await lqFetch('match', {
    wiki: 'counterstrike',
    conditions: `[[tournament::${tournamentName}]]`,
    limit: '50',
    order: 'date desc',
  })
  return (data.result || []).map(mapMatch)
}
