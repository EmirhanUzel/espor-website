const BASE   = '/faceit-api'
const LS_PFX = 'faceit_'
const TTL    = 60 * 60 * 1000

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

function toNum(val) {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

async function faceitFetch(path) {
  const cached = lsGet(path)
  if (cached !== null) return cached

  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`FACEIT ${res.status}: ${path}`)
  const data = await res.json()
  lsSet(path, data)
  return data
}

function buildStats(player, lt) {
  return {
    matches:          toNum(lt['Matches']),
    kd:               toNum(lt['Average K/D Ratio']),
    hs:               toNum(lt['Average Headshots %']),
    adr:              toNum(lt['ADR']),
    entrySuccessRate: toNum(lt['Entry Success Rate']),
    sniperKillRate:   toNum(lt['Sniper Kill Rate per Round']),
    utilitySuccess:   toNum(lt['Utility Success Rate']),
    winRate:          toNum(lt['Win Rate %']),
    elo:              player.games?.cs2?.faceit_elo  ?? null,
    level:            player.games?.cs2?.skill_level ?? null,
  }
}

// faceitId: Liquipedia'dan gelen UUID (öncelikli)
// nickname: fallback — FACEIT'te aynı isimle kayıtlıysa çalışır
export async function getFaceitPlayerStats(nickname, faceitId = null) {
  try {
    let player
    if (faceitId) {
      player = await faceitFetch(`/players/${faceitId}`)
    } else {
      player = await faceitFetch(`/players?nickname=${encodeURIComponent(nickname)}&game=cs2`)
    }
    if (!player?.player_id) return null

    const stats = await faceitFetch(`/players/${player.player_id}/stats/cs2`)
    if (!stats?.lifetime) return null

    return buildStats(player, stats.lifetime)
  } catch { return null }
}
