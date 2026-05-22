// LoL Global Power Rankings — Liquipedia MediaWiki API
// Liquipedia GPR sayfasından wikitext çekip parse ediyoruz.
// API key gerekmez, proxy gerekmez (public MediaWiki, origin=* destekliyor)
// Wikitext format: |{{PowerRankings/row|team=BILIBILI GAMING|league=lpl|score=1541|wl=25-6}}

const LS_LIST_KEY = 'lol_gpr_list'  // tam liste (ad + puan)
const LS_MAP_KEY  = 'lol_gpr_map'   // normalized map (lookup için)
const TTL         = 6 * 60 * 60 * 1000  // 6 saat

function lsGet(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    return Date.now() - ts < TTL ? data : null
  } catch { return null }
}
function lsSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

async function fetchWikitext() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(
        'https://liquipedia.net/leagueoflegends/api.php?action=parse&page=Global_Power_Rankings&prop=wikitext&format=json&origin=*',
        { headers: { 'User-Agent': 'EsporMax/1.0 (espormax-bot)' } }
      )
      if (!res.ok) throw new Error(`MediaWiki ${res.status}`)
      const json = await res.json()
      return json?.parse?.wikitext?.['*'] || ''
    } catch (e) {
      if (attempt === 1) throw e
      await new Promise(r => setTimeout(r, 1500))
    }
  }
}

function parseGPR(wikitext) {
  // Wikitext: |{{PowerRankings/row|team=BILIBILI GAMING|league=lpl|score=1541|wl=25-6}}
  const list = []
  const regex = /\|team=([^|}\n]+)\|league=([^|}\n]*)[^}]*?\|score=(\d+)/g
  let m
  while ((m = regex.exec(wikitext)) !== null) {
    const name  = m[1].trim()
    const league = m[2].trim()
    const score = parseInt(m[3], 10)
    if (!name || isNaN(score)) continue
    list.push({ name, league, score })
  }
  return list
}

// ── GPR Takım Listesi ─────────────────────────────────────────────────────────
// Her takımın adını, bölgesini ve GPR puanını döner.
// getLoLTeamsForRanking bu listeyi kullanarak Liquipedia'dan logo/bölge/kazanç çeker.
export async function getLoLGPRList() {
  const cached = lsGet(LS_LIST_KEY)
  if (cached) {
    console.log('[LoL GPR] List cache hit —', cached.length, 'teams')
    return cached
  }

  try {
    const wikitext = await fetchWikitext()
    if (!wikitext) throw new Error('Empty wikitext')
    const list = parseGPR(wikitext)
    if (!list.length) throw new Error('No teams parsed')

    console.log('[LoL GPR] Parsed', list.length, 'teams from wikitext')
    lsSet(LS_LIST_KEY, list)

    // Map'i de cache'le
    const map = buildMap(list)
    lsSet(LS_MAP_KEY, map)

    return list
  } catch (e) {
    console.log('[LoL GPR] Failed:', e.message)
    return null
  }
}

// ── GPR Puan Map'i (isim eşleştirme için) ─────────────────────────────────────
// { normalizedName: score } — Liquipedia team adlarıyla eşleştirmek için
export async function getLoLRankPoints() {
  const cached = lsGet(LS_MAP_KEY)
  if (cached) return cached

  const list = await getLoLGPRList()
  if (!list) return null

  const map = buildMap(list)
  lsSet(LS_MAP_KEY, map)
  return map
}

function buildMap(list) {
  const map = {}
  for (const { name, score } of list) {
    // Her takım için birden fazla key — isim varyantlarını yakala
    const norm = _norm(name)                                      // "bilibili"
    const lower = name.toLowerCase()                             // "bilibili gaming"
    const noSpecial = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim() // "geng esports"

    if (norm)      map[norm]      = score
    if (lower)     map[lower]     = score
    if (noSpecial) map[noSpecial] = score
  }
  return map
}

// "BILIBILI GAMING" → "bilibili", "Gen.G Esports" → "geng", "T1" → "t1"
export function normLolName(n) {
  return _norm(n)
}

function _norm(n) {
  return (n || '')
    .toLowerCase()
    .replace(/\s+(esports?|gaming|e-sports?)\s*$/i, '')
    .replace(/[^a-z0-9]/g, '')
}
