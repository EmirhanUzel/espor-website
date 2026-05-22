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
  if (res.status === 401 || res.status === 403) return null  // token invalid/expired — fail silently
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

function isoToLqDate(iso) {
  if (!iso) return ''
  return iso.replace('T', ' ').replace('Z', '').slice(0, 19)
}

function mapPsLoLMatch(m) {
  const opp1 = m.opponents?.[0]?.opponent
  const opp2 = m.opponents?.[1]?.opponent
  const finished = m.status === 'finished' ? 1 : 0
  const winnerId = m.winner_id
  const winnerIdx = winnerId && opp1?.id === winnerId ? '1'
    : winnerId && opp2?.id === winnerId ? '2' : ''
  const tier = ['s', 'a'].includes(m.tournament?.tier) ? '1' : '2'

  return {
    id: `ps_${m.id}`,
    tournament: m.tournament?.name || m.league?.name || '',
    liquipediatier: tier,
    liquipediatiertype: m.league?.name || '',
    bestof: m.number_of_games || 1,
    winner: winnerIdx,
    finished,
    date: isoToLqDate(m.begin_at || m.scheduled_at || ''),
    match2bracketdata: {},
    match2opponents: [
      { type: 'team', name: opp1?.name || '', score: m.results?.[0]?.score ?? 0, iconurl: opp1?.image_url || '' },
      { type: 'team', name: opp2?.name || '', score: m.results?.[1]?.score ?? 0, iconurl: opp2?.image_url || '' },
    ],
    match2games: (m.games || []).map(g => ({
      map: "Summoner's Rift",
      scores: [0, 0],
      winner: g.winner_id === opp1?.id ? '1' : g.winner_id === opp2?.id ? '2' : '',
      date: isoToLqDate(g.begin_at || ''),
      length: g.length ? `${Math.floor(g.length / 60)}:${String(g.length % 60).padStart(2, '0')}` : '',
      vod: null,
      playerStats: null,
    })),
    wiki: 'leagueoflegends',
  }
}

// Belirli bir tarih için LoL maçlarını PandaScore'dan çeker.
// dateStr: "YYYY-MM-DD" veya undefined (son 7 günün upcoming/running maçları)
export async function getLoLMatchesFromPandaScore(dateStr) {
  try {
    const params = {
      per_page: 25,
      sort: '-begin_at',
      'filter[videogame_title]': 'league-of-legends',
    }
    if (dateStr) {
      params['range[begin_at]'] = `${dateStr}T00:00:00Z,${dateStr}T23:59:59Z`
    }
    const data = await psFetch('/lol/matches', params)
    return (data || []).map(mapPsLoLMatch)
  } catch { return [] }
}

// Yaklaşan LoL maçlarını PandaScore'dan çeker (limit adet)
export async function getLoLUpcomingMatchesFromPandaScore(limit = 6) {
  try {
    const data = await psFetch('/lol/matches/upcoming', {
      per_page: limit,
      sort: 'begin_at',
      'filter[videogame_title]': 'league-of-legends',
    })
    return (data || []).map(mapPsLoLMatch)
  } catch { return [] }
}

// LoL turnuvalarını PandaScore'dan çeker (Liquipedia fallback veya ek veri)
export async function getLoLTournamentsFromPandaScore({ status } = {}) {
  try {
    const params = { per_page: 20, sort: '-begin_at', 'filter[videogame_title]': 'league-of-legends' }
    if (status) params['filter[status]'] = status
    const data = await psFetch('/lol/tournaments', params)
    return (data || []).map(t => ({
      id: `ps_${t.id}`,
      name: t.name || '',
      startdate: t.begin_at?.slice(0, 10) || '',
      enddate: t.end_at?.slice(0, 10) || '',
      prizepool: t.prize_pool_amount || 0,
      participantsnumber: t.teams_count || 0,
      liquipediatier: ['s', 'a'].includes(t.tier) ? '1' : '2',
      liquipediatiertype: t.league?.name || '',
      locations: { region: t.league?.region || '' },
      wiki: 'leagueoflegends',
    }))
  } catch { return [] }
}

// LoL takım istatistiklerini PandaScore'dan çeker
export async function getLoLTeamStatsFromPandaScore(teamName) {
  try {
    const teams = await psFetch('/lol/teams', { 'search[name]': teamName, per_page: 5, 'filter[videogame_title]': 'league-of-legends' })
    if (!teams?.length) return null
    const team = teams.find(t => t.name?.toLowerCase() === teamName.toLowerCase()) || teams[0]
    const stats = await psFetch(`/lol/teams/${team.id}/stats`)
    if (!stats) return null
    return {
      teamId: team.id,
      slug: team.slug,
      wins: stats.wins ?? null,
      losses: stats.losses ?? null,
      winRate: stats.win_rate ?? null,
      avgGameLength: stats.average_game_length ?? null,
    }
  } catch { return null }
}

// LoL oyuncusunun champion pool'unu PandaScore'dan çeker
export async function getLoLPlayerChampionPoolFromPandaScore(playerName) {
  try {
    const player = await findLoLPlayer(playerName)
    if (!player) return []
    const stats = await psFetch(`/lol/players/${player.id}/stats`)
    if (!stats?.champions_stats?.length) return []
    return stats.champions_stats
      .sort((a, b) => (b.games_count ?? 0) - (a.games_count ?? 0))
      .slice(0, 5)
      .map(c => ({
        name: c.champion?.name || '',
        imageUrl: c.champion?.image_url || '',
        games: c.games_count ?? 0,
        wins: c.wins ?? 0,
        kda: c.kill_death_assist_ratio ?? null,
        cs: c.average_cs_per_game ?? null,
      }))
  } catch { return [] }
}

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
