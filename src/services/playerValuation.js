function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function calcAge(birthdate) {
  if (!birthdate || birthdate.startsWith('0000')) return null
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (365.25 * 86400000))
}

// Turnuva ödülünden tier puanı tahmin et
function prizeToPrestigePts(prize) {
  if (prize >= 1_000_000) return 20   // Major / büyük finale
  if (prize >= 500_000)   return 14   // Büyük Tier 1
  if (prize >= 100_000)   return 8    // Tier 1
  if (prize >= 30_000)    return 3    // Tier 2
  return 0
}

// Kaç ay önce olduğuna göre decay çarpanı
function decayFactor(dateStr) {
  if (!dateStr) return 0.2
  const monthsAgo = (Date.now() - new Date(dateStr).getTime()) / (30 * 86400000)
  if (monthsAgo < 12) return 1.0
  if (monthsAgo < 24) return 0.6
  return 0.2
}

// earnings'i log scale ile 0-1 arasına normalize et ($3M = max)
function earningsNorm(earnings) {
  if (!earnings || earnings <= 0) return 0
  return clamp(Math.log10(earnings) / Math.log10(3_000_000), 0, 1)
}

/*
 * Ana algoritma.
 * @param {object} player      - Liquipedia player objesi (earnings, birthdate, roles, status)
 * @param {object|null} faceitStats - getFaceitPlayerStats() çıktısı (kd, hs, adr, vb.) — opsiyonel
 * @param {Array}  placements  - Turnuva birincilikleri [{prizemoney, date}, ...]
 * @returns {{ score, value, usd, breakdown }}
 */
export function calcPlayerValue({ player, faceitStats, placements = [] }) {
  const breakdown = { stats: 0, earnings: 0, prestige: 0, age: 0 }
  const age = calcAge(player?.birthdate)

  // ── Blok 1: Bireysel Stats (max 40 puan) ────────────────────────────────────
  // FACEIT yoksa kazanç bazlı profesyonel baseline kullan:
  // $50K kazanmış oyuncu minimum 10 pt, $1M+ kazanmış 26 pt alır
  let statsScore = 0
  if (!faceitStats && player?.earnings > 10_000) {
    statsScore = clamp(earningsNorm(player.earnings) * 26, 8, 26)
  }
  if (faceitStats) {
    // K/D: 0.8 → 0 puan, 2.0 → 20 puan
    const kdScore  = clamp((faceitStats.kd - 0.8) / 1.2, 0, 1) * 20

    // HS%: 0% → 0, 60% → 5 puan
    const hsScore  = clamp((faceitStats.hs ?? 0) / 60, 0, 1) * 5

    // ADR: 60 → 0, 120 → 8 puan
    const adrScore = clamp(((faceitStats.adr ?? 60) - 60) / 60, 0, 1) * 8

    // FACEIT Elo: 1500→0, 4000→7 puan (güncel form göstergesi)
    const eloScore = faceitStats.elo != null
      ? clamp((faceitStats.elo - 1500) / 2500, 0, 1) * 7
      : 0

    // Rol spesifik stat (max 5 puan)
    const roles  = player?.roles || []
    const isAWP  = roles.some(r => r === 'AWPer')
    const isUtil = roles.some(r => r === 'IGL' || r === 'Support')
    let roleScore = 0
    if (isAWP && faceitStats.sniperKillRate != null) {
      roleScore = clamp(faceitStats.sniperKillRate / 0.4, 0, 1) * 5
    } else if (isUtil && faceitStats.utilitySuccess != null) {
      roleScore = clamp(faceitStats.utilitySuccess / 0.7, 0, 1) * 5
    } else if (faceitStats.entrySuccessRate != null) {
      roleScore = clamp(faceitStats.entrySuccessRate / 0.8, 0, 1) * 5
    }

    statsScore = kdScore + hsScore + adrScore + eloScore + roleScore
  }
  breakdown.stats = Math.round(statsScore)

  // ── Blok 2: Kariyer Kazancı (max 22 puan) ───────────────────────────────────
  // Genç oyuncular (<23) için minimum floor: henüz büyük turnuvalarda değiller
  let earningsScore = earningsNorm(player?.earnings) * 22
  if (age != null && age <= 23 && earningsScore < 6) earningsScore = 6
  breakdown.earnings = Math.round(earningsScore)

  // ── Blok 3: Turnuva Prestiji (max 20 puan) ──────────────────────────────────
  let prestigeRaw = 0
  for (const p of placements) {
    const pts   = prizeToPrestigePts(p.prizemoney || 0)
    const decay = decayFactor(p.date || p.startdate || '')
    prestigeRaw += pts * decay
  }
  const prestigeScore = clamp(prestigeRaw, 0, 20)
  breakdown.prestige = Math.round(prestigeScore)

  // ── Blok 4: Yaş / Potansiyel (max 18 puan) ──────────────────────────────────
  const ageScore =
    age == null ? 10
    : age <= 19  ? 18
    : age <= 22  ? 14
    : age <= 25  ? 10
    : age <= 28  ? 7
    : age <= 31  ? 4
    : 2
  breakdown.age = ageScore

  // ── Ham skor ─────────────────────────────────────────────────────────────────
  let score = statsScore + earningsScore + prestigeScore + ageScore

  // ── Genç yetenek çarpanı: yaş ≤23 + iyi K/D + yüksek Elo ───────────────────
  if (
    age != null && age <= 23 &&
    faceitStats?.kd   != null && faceitStats.kd   >= 1.4 &&
    faceitStats?.elo  != null && faceitStats.elo  >= 2500
  ) {
    score *= 1.18
  }

  // ── Hard gate: inaktif oyuncu ────────────────────────────────────────────────
  const isActive = (player?.status || '').toLowerCase() === 'active'
  if (!isActive) score *= 0.2

  // ── FACEIT level cap: level 5 altı max 30 puan ───────────────────────────────
  if (faceitStats?.level != null && faceitStats.level < 5) {
    score = Math.min(score, 30)
  }

  score = Math.round(clamp(score, 0, 100))

  // ── Skor → Bonservis bedeli (bilinen transferlerle kalibre edilmiş) ──────────
  // Referanslar: m0NESY→Falcons ≈$2M(85), ropz FaZe dönemi ≈$750K(78),
  //              tier1 orta roster ≈$300K(65), NiKo/ZywOo seviyesi ≈$3M+(90+)
  // Log-lineer interpolasyon: [skor, USD]
  const ANCHORS = [
    [0,   0],
    [25,  5_000],
    [35,  15_000],
    [45,  50_000],
    [55,  130_000],
    [65,  320_000],
    [72,  620_000],
    [78,  1_050_000],
    [83,  1_700_000],
    [88,  2_600_000],
    [93,  3_800_000],
    [100, 5_500_000],
  ]

  let usd = 0
  for (let i = 1; i < ANCHORS.length; i++) {
    const [s0, v0] = ANCHORS[i - 1]
    const [s1, v1] = ANCHORS[i]
    if (score <= s1 || i === ANCHORS.length - 1) {
      const t = s1 === s0 ? 1 : (score - s0) / (s1 - s0)
      // log-lineer interpolasyon
      const logV = Math.log(Math.max(v0, 1)) + t * (Math.log(Math.max(v1, 1)) - Math.log(Math.max(v0, 1)))
      usd = Math.round(Math.exp(logV))
      break
    }
  }

  // Yuvarlama: büyük değerleri temiz göster
  if      (usd >= 1_000_000) usd = Math.round(usd / 100_000) * 100_000
  else if (usd >= 100_000)   usd = Math.round(usd / 10_000)  * 10_000
  else if (usd >= 10_000)    usd = Math.round(usd / 1_000)   * 1_000
  else                       usd = Math.round(usd / 100)      * 100

  const value = usd === 0
    ? 'Serbest Transfer'
    : usd >= 1_000_000
    ? `$${(usd / 1_000_000).toFixed(1)}M`
    : `$${Math.round(usd / 1_000)}K`

  return { score, value, usd, breakdown }
}
