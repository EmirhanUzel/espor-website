# eSPORMAX — Session Handoff

> Son güncelleme: 2026-05-17  
> Sonraki Claude Code session'una başlamadan önce bu dosyayı oku.

---

## Proje Özeti

React 19 + React Router v7 + Vite esports sitesi. Backend yok — tüm veri Liquipedia API v3, FACEIT API, PandaScore API (henüz bağlanmamış) ve mock data'dan geliyor. Üç oyun destekleniyor: **VALORANT**, **CS2**, **League of Legends**.

```
npm run dev      # port 5175
npm run build    # dist/
```

`.env.local` gerekiyor:
```
VITE_LIQUIPEDIA_API_KEY=...
VITE_PANDASCORE_API_KEY=...
```

---

## Bu Session'da Yapılanlar

### Kritik Düzeltmeler
| Fix | Dosya | Açıklama |
|-----|-------|----------|
| PlayerProfile wiki tespiti | `PlayerProfile.jsx` | `wiki` prop'u App.jsx'ten geçirildi; mock'ta olmayan LoL oyuncuları artık doğru API'den çekiliyor |
| TournamentPage LoL API | `TournamentPage.jsx`, `liquipediaApi.js` | `getCS2/LoLTournamentByPagename()` eklendi; router state ile turnuva objesi geçiriliyor (pagename slash sorunu çözüldü) |
| TeamsRankingFull LoL | `TeamsRankingFull.jsx` | `getLoLTeamsForRanking()` entegre edildi |
| Banner bitmiş turnuva | `liquipediaApi.js`, `Home.jsx` | `[[enddate::>${today}]]` sorgu filtresi + `carouselTournaments` tarih filtresi |
| Banner index crash | `Home.jsx` | `safeIdx = idx % tournaments.length` — array küçüldüğünde undefined crash |

### LoL Eksiklik Giderimleri
| Fix | Dosya | Açıklama |
|-----|-------|----------|
| TeamPage GPR rank | `TeamPage.jsx` | `getLoLTeamsForRanking()` çağrısı + hero'da "GPR #X" rozeti |
| TeamPage transfer logoları | `TeamPage.jsx` | `if (isCS2 && ...)` → `if (transfers?.length)` |
| TeamPage squad joindate | `TeamPage.jsx`, `.module.css` | LoL oyuncu kartlarında "Since YYYY" |
| PlayerProfile match stats | `PlayerProfile.jsx` | `calcLoLFormStats()` — maç sonuçlarından Win Rate, W-L, Game Win% hesabı |
| TransfersPage canlı veri | `TransfersPage.jsx`, `liquipediaApi.js` | `getCS2Transfers(15)` + `getLoLTransfers(15)` entegrasyonu; mock Valorant/Dota2 korundu |

---

## Mimari & Önemli Dosyalar

```
src/
├── App.jsx                    # Route tanımları, wiki/region state
├── services/
│   ├── api.js                 # Mock data (VALORANT + fallback)
│   ├── liquipediaApi.js       # Ana API servisi (CS2 + LoL)
│   ├── lolesportsApi.js       # LoL GPR listesi (Liquipedia MediaWiki)
│   ├── pandascoreApi.js       # BAĞLANMAMIŞ — 4 fonksiyon var, hiç import yok
│   ├── faceitApi.js           # CS2 player stats (FACEIT)
│   └── playerValuation.js     # ESM Bonservis hesabı
├── pages/
│   ├── Home.jsx               # CS2 + LoL live data
│   ├── TournamentsPage.jsx    # CS2 + LoL API tabs
│   ├── TournamentPage.jsx     # CS2 + LoL API (router state ile)
│   ├── MatchesPage.jsx        # CS2 + LoL tarih bazlı
│   ├── TeamsRanking.jsx       # CS2 VRS + LoL GPR
│   ├── TeamsRankingFull.jsx   # CS2 + LoL tam liste
│   ├── PlayersRanking.jsx     # Sadece mock (API entegrasyonu yok)
│   ├── PlayerProfile.jsx      # CS2 (FACEIT) + LoL (match stats)
│   ├── TeamPage.jsx           # CS2 + LoL (GPR rank, transfers, squad)
│   ├── TransfersPage.jsx      # CS2 + LoL API + mock Valorant/Dota
│   ├── NewsPage.jsx           # Sadece mock
│   └── PlayerStats.jsx        # Mock + LoL tablosu UI var ama veri yok
└── i18n/translations.js       # TR/EN, her yeni string buraya eklenecek
```

### Kilit Kurallar
- **CSS Modules** — Tailwind yok. Hex renk yok, CSS değişkenleri kullan (`--bg`, `--text-1`, `--surface`, `--border`)
- **Breakpoint:** 768px
- **`.wrap`** utility class: `max-width: 1280px`, auto margin
- **Wiki prop:** Navbar'da seçilen oyun (`"valorant"` | `"counterstrike"` | `"leagueoflegends"`) App.jsx'ten sayfalara prop olarak geçiyor
- **i18n:** Her yeni UI string `translations.js`'e hem `en` hem `tr` olarak eklenecek
- **API rate limit:** Liquipedia 1 req/sn — `enqueue()` kuyruğu var, paralel fetch yapma

---

## Kalan Yapılacaklar

### Yüksek Öncelik
- [ ] **LoL canlı maç** — Home.jsx'te `getLoLOngoingMatches()` entegrasyonu (CS2'de var, LoL'de yok)
- [ ] **VOD linkleri** — MatchPage'de `match2games[].vod` gösterimi (CS2 + LoL)
- [ ] **Dark mode logo/banner** — `textlesslogodarkurl` ve `bannerdarkurl` API'den çekiliyor ama hiç kullanılmıyor

### Orta Öncelik
- [ ] **PlayersRanking API** — LoL için gerçek oyuncu listesi (marketvalue/views mock'a özgü, tasarım kararı gerekiyor)
- [ ] **PandaScore entegrasyonu** — `pandascoreApi.js` tamamen ölü, `VITE_PANDASCORE_API_KEY` boşa gidiyor
- [ ] **ESM skoru LoL için** — `getLoLTeamsForRanking` şu an `esm: 0` sabit döndürüyor

### Kolay / Küçük
- [ ] **CS2 squad joindate** — `getCS2TeamSquad` `joindate` döndürüyor ama TeamPage'de gösterilmiyor (LoL için eklendi)
- [ ] **FACEIT winRate** — `faceitApi.js` döndürüyor ama PlayerProfile göstermiyor
- [ ] **Sosyal linkler genişletme** — YouTube/TikTok/Discord `ALLOWED_SOCIALS`'tan filtreleniyor ama API'den geliyor
- [ ] **PlayerStats LoL verisi** — UI tablosu hazır (`LoLTable`), `playerStats.js`'te LoL datası yok

---

## Bilinen Sorunlar / Gotcha'lar

1. **Liquipedia cache:** `lq_cache_` prefix'li localStorage key'leri 30 dakika cache'liyor. API değişikliklerini test ederken DevTools → Application → Local Storage'dan temizlemek gerekebilir.

2. **TournamentPage pagename sorunu:** Liquipedia pagename'leri slash içeriyor (`LEC/2026_Spring`), URL'de underscore oluyor. Bu yüzden direct URL erişiminde `getLoLTournamentByPagename(id)` bazen boş dönebilir — çözüm: TournamentsPage/TournamentCard'dan router state ile `tournament` objesi geçiriliyor.

3. **LoL banner fallback:** `_lolBannerFallback()` turnuva adındaki "worlds"/"lck"/vb. keyword'e göre hardcoded banner URL atıyor. Liquipedia LoL turnuvalarının çoğunda `bannerurl` boş geliyor.

4. **Rate limit:** Liquipedia 429/403 sonrası 30 dakika bloke ediyor (`_blockedUntil`). Development'ta sık sayfa yenileme yapma.

5. **Mock fallback:** LoL API 0 sonuç döndürürse (`lolTournaments.length === 0`) mock'a düşüyor. Banner'da `carouselTournaments` tarih filtresi ile düzeltildi ama turnuva/maç listelerinde mock hala devreye girebilir.

---

## Faydalı Komutlar

```bash
npm run dev      # Dev server (port 5175)
npm run build    # Hata var mı kontrol
npm run lint     # ESLint
```

```
# LocalStorage cache temizliği (tarayıcı console):
Object.keys(localStorage).filter(k => k.startsWith('lq_')).forEach(k => localStorage.removeItem(k))
```
