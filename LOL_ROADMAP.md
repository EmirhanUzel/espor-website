# eSPORMAX — League of Legends Bölümü Kapsamlı Analiz

> **Nasıl kullanılır:** Her maddenin başındaki `[ ]` kutusunu `[x]` yaparak tamamlandı olarak işaretle.

## Context
Bugün **2026-05-18**. Önceki görevde LoL için mock→API geçişi yapıldı. Bu belge yapılabileceklerin tüm envanterini içerir.

---

## 🔴 BÖLÜM 1 — Kritik Buglar

- [x] **1.1** `getLoLPlayerAllPlacements` tüm career takımlarını tek OR query'ye birleştiriyor → 2KB+ querystring → Liquipedia **502** — `liquipediaApi.js:1721-1733` — Caps/Faker gibi çok takımlı profillerde trophy çöküyor
- [x] **1.2** PlayerProfile LoL fetch'lerinde `.catch()` YOK — 6 paralel call sessizce hata yutuyor — `PlayerProfile.jsx:335-368`
- [x] **1.3** `{("home.comments")}` — `t()` çağrısı eksik, ekrana `home.comments` literal düşüyor — `Home.jsx:222`
- [x] **1.4** `common.loading` i18n key'i `translations.js`'de tanımsız; TR modunda da "Loading…" görünür — `PlayerProfile.jsx:555`, `TeamsRanking.jsx:284`
- [x] **1.5** MatchPage LoL `playerStats` her zaman undefined — `mapLoLMatch` üretmiyor — `MatchPage.jsx:204`
- [x] **1.6** `lqFetch` queue var ama retry/backoff yok — 429/502 sonrası manuel refresh gerekiyor — `liquipediaApi.js` lqFetch
- [x] **1.7** `player.id[0]` optional chaining yok, id boşsa crash — `PlayerProfile.jsx:236`

---

## 🌐 BÖLÜM 2 — i18n Eksiklikleri (TR/EN switch sorunları)

### A) Hardcoded string'ler — switch yapmıyor

- [x] **2.1** `"League of Legends — Tier 1 Tournaments"` — EN/TR aynı, çevrilmemiş → key: `tournaments.subtitleLoL` — `TournamentsPage.jsx:185-187`
- [x] **2.2** `"League of Legends — Tier 1 & 2 Maçlar"` — TR sabit, EN'de de TR çıkar → key: `matches.subtitleLoL` — `MatchesPage.jsx:271-272`
- [x] **2.3** `"LoL maç istatistikleri yakında…"` — hardcoded TR → key: `stats.lolComingSoon` — `PlayerStats.jsx:164`
- [x] **2.4** `"League of Legends turnuva verisi yükleniyor…"` — hardcoded TR → key: `home.loadingTournaments` — `Home.jsx:453`
- [x] **2.5** `"CS2 turnuva verisi yükleniyor…"` — hardcoded TR → aynı key — `Home.jsx:443`
- [x] **2.6** `<span>Piyasa Değeri</span>` — hardcoded TR → `t("player.marketValue")` — `Home.jsx:246`
- [x] **2.7** `"Yükleniyor…"` / `"API şu an yanıt vermiyor…"` — hardcoded TR → `common.loading`, `common.apiError` — `TournamentsPage.jsx:141,144`
- [x] **2.8** aynı hardcoded TR string'ler → aynı keyler — `MatchesPage.jsx:216,218`
- [x] **2.9** `"Loading…"` — hardcoded EN → `common.loading` — `TeamPage.jsx:321`, `TeamsRankingFull.jsx:116`, `TournamentPage.jsx:87`
- [x] **2.10** `"← Back to forum"` — hardcoded EN → `forum.backToForum` — `ForumTopicPage.jsx:248`

### B) Eklenecek yeni i18n key'leri

- [x] **2.11** `common.loading` → EN: "Loading…" / TR: "Yükleniyor…"
- [x] **2.12** `common.apiError` → EN: "API is currently unavailable, please try again shortly." / TR: "API şu an yanıt vermiyor, lütfen biraz bekleyin."
- [x] **2.13** `forum.backToForum` → EN: "← Back to forum" / TR: "← Foruma dön"
- [x] **2.14** `home.loadingCS2` / `home.loadingLoL` → EN/TR her iki dil için eklendi
- [x] **2.15** `tournaments.subtitleCS2` → EN: "CS2 — Tier 1 Tournaments" / TR: "CS2 — Tier 1 Turnuvalar"
- [x] **2.16** `tournaments.subtitleLoL` → EN: "League of Legends — Tier 1 Tournaments" / TR: "League of Legends — Tier 1 Turnuvalar"
- [x] **2.17** `matches.subtitleCS2` → EN: "CS2 — Tier 1 & 2 Matches" / TR: "CS2 — Tier 1 & 2 Maçlar"
- [x] **2.18** `matches.subtitleLoL` → EN: "League of Legends — Tier 1 & 2 Matches" / TR: "League of Legends — Tier 1 & 2 Maçlar"
- [x] **2.19** `stats.lolComingSoon` → EN: "LoL match statistics will be available soon via PandaScore integration." / TR: "LoL maç istatistikleri yakında PandaScore entegrasyonuyla eklenecek."

### C) Çevrilmemesi gerekenler

- LCK, LEC, LCS, LPL, MSI, Worlds — resmi marka
- Tier 1/2 — sektör standardı
- Top/Jungle/Mid/Bot/Support — TR yayınlarda da İngilizce
- KDA, CS, CS/min, Vision — sektör standardı
- Şampiyon isimleri — uluslararası

---

## 🟠 BÖLÜM 3 — LoL Fonksiyonel Eksikler (yeni özellikler)

### 3.1 PandaScore endpoint'leri kullanılmıyor

- [x] **3.1.1** `/lol/matches`, `/lol/matches/upcoming`, `/lol/matches/running` → Liquipedia 502 fallback için ideal — `pandascoreApi.js`
- [x] **3.1.2** `/lol/tournaments` — `getLoLTournamentsFromPandaScore()` eklendi — `pandascoreApi.js`
- [x] **3.1.3** `/lol/teams/{id}/stats` — `getLoLTeamStatsFromPandaScore()` eklendi — `pandascoreApi.js`
- [x] **3.1.4** `/lol/players/{id}` champion pool — `getLoLPlayerChampionPoolFromPandaScore()` eklendi — `pandascoreApi.js`
- [ ] **3.1.5** `/lol/champions` — meta ban/pick rates (yeni sayfa/section gerektirir)

### 3.2 Champion-merkezli içerik

- [x] **3.2.1** PlayerProfile → "Top Şampiyonlar" kartı — `getLoLPlayerChampionPoolFromPandaScore` ile 5 şampiyon (kazanma oranı + KDA) gösteriliyor
- [x] **3.2.2** MatchPage → Pick/ban listesi — `match2games[].extradata` parse edildi, picks/bans kartı eklendi
- [ ] **3.2.3** TeamPage → Takım champion pool / meta tercih

### 3.3 MatchPage LoL detay

- [ ] **3.3.1** Her game için KDA tablosu — `match2players[].champion/kills/deaths/assists/cs` — `MatchPage.jsx:367`
- [ ] **3.3.2** Vision score, dragon/baron objektif sayısı — `match2games[].extradata`
- [ ] **3.3.3** Gold lead grafiği

### 3.4 PlayerStats sayfası

- [ ] **3.4.1** Veri kaynağını `playerStats.js` mock'tan Liquipedia/PandaScore'a taşı — `PlayerStats.jsx:128`

### 3.5 Trophy / yer sayıları

- [ ] **3.5.1** `getLoLPlayerAllPlacements` filtresini top-4'e genişlet (şu an sadece 1. yer) — `liquipediaApi.js:1721`
- [ ] **3.5.2** Finalist/2./3. yer rozetleri PlayerProfile trophy bölümünde göster
- [ ] **3.5.3** MVP rozeti — `mvp` Liquipedia endpoint'i

### 3.6 News / Articles

- [ ] **3.6.1** NewsPage'e LoL branch ekle — `NewsPage.jsx`
- [ ] **3.6.2** Liquipedia `news` endpoint'ini sorgula
- [ ] **3.6.3** ArticlePage.jsx oluştur (mevcut değil)

### 3.7 Standings / Group stage

- [ ] **3.7.1** TournamentPage'e standings sekmesi ekle
- [ ] **3.7.2** GroupStandings component'ini LoL için aktif et

### 3.8 Transfer filtreleri

- [ ] **3.8.1** TransfersPage'e rol filtresi ekle (Top/Jungle/Mid/ADC/Support) — `TransfersPage.jsx:127`
- [ ] **3.8.2** Region filtresi ekle (LCK/LEC/LCS/LPL/Wildcard)

### 3.9 Head-to-head

- [ ] **3.9.1** Takım vs takım geçmiş skorları — hiçbir sayfada yok

### 3.10 Market Value chart

- [ ] **3.10.1** `AURORA_PLAYER_MV_DATA` LoL oyuncuları için genişlet (şu an sadece CS2) — `PlayerProfile.jsx:419-438`

---

## 🟡 BÖLÜM 4 — Kalan Mock Veriler

- [ ] **4.1** GUESTS — Caedrel, Vedius hardcoded → `api.js:60-62` → Home event guests
- [ ] **4.2** INTERVIEWS — Faker/Caps/Worlds 2025 preview, sahte linkler → `api.js:75-77` → Home interview grid
- [ ] **4.3** STANDINGS — Worlds 2025 Group A/B fake skorlar → `api.js:1687-1709`
- [ ] **4.4** Faker social links — hardcoded → `api.js:1288` → PlayerProfile
- [ ] **4.5** LoL PLAYERS `marketvalue` ve `recentstats` uydurma → `api.js:1283-1642` → PlayersRanking, Player Spotlight
- [ ] **4.6** TICKER_ITEMS — "T1 def. G2 Esports 3-1 · Worlds 2025 Grand Final" hardcoded → `api.js:43-52` → Home ticker
- [ ] **4.7** PLAYER_MOCK_NEWS sadece CS2 için tanımlı → `PlayerProfile.jsx:383-417` → LoL oyuncu profili news bölümü boş

---

## 🟢 BÖLÜM 5 — Code Quality & UX

- [ ] **5.1** Home.jsx CS2 ve LoL useEffect'lerini generic `useEsportsHome(wiki, fetchers)` hook'a taşı — `Home.jsx:282-374`
- [ ] **5.2** Global team logo cache yok — `getLoLTeamLogos` aynı takımlar için defalarca çağrılıyor
- [ ] **5.3** `lqFetch` etrafına `retry(3, expBackoff)` wrapper ekle — `liquipediaApi.js`
- [ ] **5.4** Loading skeleton component'i ekle (şu an her yerde plain text "Loading…")
- [ ] **5.5** React Error Boundary component ekle — tüm sayfa beyaz olmasın
- [x] **5.6** `TeamsRanking.jsx` ve `TeamsRankingFull.jsx` `TeamLogoImg`'e `useTheme()` + `darkUrl` prop eklendi — dark modda `textlesslogodarkurl` kullanılıyor
- [ ] **5.7** `MatchCard`, `TournamentCard` `<img>` tag'lerine `onError` handler ekle
- [ ] **5.8** Logo `<img>`'larda `alt={team.name}` yap (şu an `alt=""`)
- [ ] **5.9** `PlayerStats.module.css` LoL 8-sütun tablosu için 768px responsive kontrol et
- [ ] **5.10** Breadcrumb ekle — turnuva → maç → oyuncu zinciri yok
- [ ] **5.11** Lolesports GPR / Liquipedia / PandaScore takım ismi normalizasyonunu PandaScore tarafına extend et — `lolesportsApi.js:91-104`
- [ ] **5.12** LoL 502 için tüm sayfalarda tutarlı error state + `common.apiError` key'i kullan

---

## 🔵 BÖLÜM 6 — Liquipedia API'de Var Ama Kullanılmayan Özellikler

### 6.1 Hiç fetch edilmeyen endpoint'ler / tablolar

- [ ] **6.1.1** **`patch`** — LoL patch geçmişi, turnuva sırasındaki patch bilgisi. `mapTournament` (satır 115) `t.patch` alıyor ama TournamentPage'de gösterim yok. → "Patch 15.X" rozeti banner altına eklenebilir
- [ ] **6.1.2** **`broadcasters` / `streaming`** — Turnuva yayıncı listeleri (Twitch/YouTube linkleri). Hiç sorgu yok. → TournamentPage / MatchPage'de "Canlı İzle" butonu
- [ ] **6.1.3** **`series`** — Çoklu split serileri (LCK Spring + Summer parent organizasyon). Hiç sorgu yok. → TournamentsPage'de sezon/split gruplaması
- [ ] **6.1.4** **`prizepoolentry` / `playerprize`** — Oyuncu/takım bazlı detaylı ödül dağıtımı. Hiç sorgu yok. → TournamentPage kazanç tablosunu `getLoLPlayerAllPlacements`'ın ötesine taşır
- [ ] **6.1.5** **`news` / `article`** — Liquipedia haber feed'i. Hiç sorgu yok. → NewsPage LoL branch'ine gerçek içerik
- [ ] **6.1.6** **`mvp`** — Turnuva MVP rozetleri. Hiç sorgu yok. → TournamentPage/PlayerProfile MVP badge
- [ ] **6.1.7** **`coach`** — `getLoLTeamSquad` (satır 1531-1548) `LOL_STAFF_ROLES` ile coach/analyst/manager EXCLUDE ediliyor. `squadplayer` endpoint'i coach verisini de döndürüyor. → TeamPage'de "Teknik Kadro" bölümü

### 6.2 API'den geliyor ama mapper IGNORE ediyor (kayıp veri)

- [x] **6.2.1** **`match2games[].extradata`** — picks/bans parse edildi, MatchPage'de gösteriliyor — `liquipediaApi.js mapLoLMatch`
- [x] **6.2.2** **`match2opponents[].match2players[]`** — `participants` alanından KDA/CS tablosu parse edildi, MatchPage'de gösteriliyor — `liquipediaApi.js:1106`
- [ ] **6.2.3** **`m.patch`** ATLANIYOR — Maçın oynandığı LoL patch → MatchPage'de patch bilgisi
- [ ] **6.2.4** **`m.mvp`** ATLANIYOR — Maç MVP'si → MatchPage/PlayerProfile
- [ ] **6.2.5** **`m.streams` / `m.vod`** — Match-level VOD ve stream linkleri atlanıyor (sadece per-game VOD alınıyor) — `liquipediaApi.js:1114`
- [ ] **6.2.6** **`m.match2bracketdata.bracketsection` / `lowerheader`** — Bracket bölüm adı (Upper/Lower Final vs.) atlanıyor — MatchPage bracket konumu gösterimi
- [ ] **6.2.7** **`player.extradata.signaturechampion1..5`** ATLANIYOR — Oyuncunun imza şampiyonları (Faker→Azir, Caps→Viktor vs.) — `getLoLPlayerProfile:1665` → PlayerProfile'da "İmza Şampiyonları" kartı

### 6.3 API çağrılıyor ama kısmen kullanılıyor

- [ ] **6.3.1** **`getLoLPlayerAllPlacements`** sadece `[[placement::1]]` filtreliyor — top-4 (finalist/3rd/4th) atlanıyor — `liquipediaApi.js:1721`
- [ ] **6.3.2** **`getLoLTeamByName`** `coaches`, `locations`, `sponsors`, `parent` alanlarını almıyor — `liquipediaApi.js:1504`
- [ ] **6.3.3** **`_calcLoLCircuit`** fonksiyonu tanımlı ama hiç çağrılmıyor (ölü kod) — `liquipediaApi.js:1339` → `getLoLTeamsForRanking` placement bazlı circuit puan hesabına geçilebilir

### 6.4 Öncelikli eklenecek UI bileşenleri (Liquipedia verisi hazır)

- [ ] **6.4.1** **MatchPage → "Picks & Bans" kartı** — `match2games[].extradata` parse edilirse her game için 5v5 şampiyon ikonları (LoL maç sayfasının olmazsa olmazı)
- [ ] **6.4.2** **MatchPage → Per-game KDA tablosu** — `match2players[].kills/deaths/assists/cs/champion`
- [ ] **6.4.3** **MatchPage → Patch rozeti** — `m.patch`
- [ ] **6.4.4** **MatchPage → VOD linkleri** — `m.streams` / `m.vod`
- [ ] **6.4.5** **TournamentPage → Patch Info** — `t.patch` zaten çekiliyor, sadece gösterim ekle
- [ ] **6.4.6** **TournamentPage → MVP kartı** — `mvp` endpoint sorgusu
- [ ] **6.4.7** **TournamentPage → Canlı yayın butonları** — `streaming` endpoint
- [ ] **6.4.8** **TeamPage → Teknik Kadro bölümü** — `squadplayer` coach filtresi kaldırılır
- [ ] **6.4.9** **PlayerProfile → İmza Şampiyonları** — `extradata.signaturechampionN`
- [ ] **6.4.10** **PlayerProfile → Tüm yer sayıları** (finalist/3rd) — `getLoLPlayerAllPlacements` genişletilir

---

## 📋 Öncelik Sırası

**Hemen (kritik buglar):**
- [ ] 1.1 `getLoLPlayerAllPlacements` chunk + retry
- [ ] 1.2 PlayerProfile `.catch()` ekle
- [ ] 1.3 `Home.jsx:222` `t()` fix
- [ ] 1.4 `common.loading` key ekle

**Kısa vadeli (high impact):**
- [ ] 2.1–2.19 Tüm hardcoded i18n string'leri çevir
- [ ] 3.1.1 PandaScore `/lol/matches` fallback
- [ ] 6.2.1 `match2games[].extradata` picks/bans — MatchPage
- [ ] 6.2.2 `match2players` KDA tablosu — MatchPage
- [ ] 6.4.9 İmza şampiyonları — PlayerProfile
- [ ] 5.3 lqFetch retry/backoff

**Orta vadeli:**
- [ ] 3.2.1 Champion pool kartları
- [ ] 3.5.1–3.5.3 Trophy genişletme
- [ ] 6.1.7 Coach bölümü
- [ ] 6.3.2 Team profil eksik alanlar
- [ ] 5.1 `useEsportsHome` hook refactor

**Uzun vadeli:**
- [ ] 3.6 News/Articles
- [ ] 3.7 Standings UI
- [ ] 6.1.3 Series gruplamak
- [ ] 6.1.4 Detaylı prize pool
- [ ] 5.4 Loading skeleton

---

## Kritik Dosyalar
- `src/services/liquipediaApi.js` — `lqFetch`, `getLoLPlayerAllPlacements`, `mapLoLMatch`, `getLoLPlayerProfile`, `getLoLTeamByName`
- `src/services/pandascoreApi.js` — yeni endpoint'ler
- `src/i18n/translations.js` — yeni key'ler
- `src/pages/Home.jsx`, `MatchPage.jsx`, `MatchesPage.jsx`, `TournamentsPage.jsx`, `TournamentPage.jsx`, `TeamPage.jsx`, `PlayerProfile.jsx`, `PlayerStats.jsx`, `TransfersPage.jsx`
- `src/services/api.js` — kalan LoL mock'lar

## Doğrulama
1. **i18n switch:** Navbar TR↔EN → hiçbir hardcoded string kalmamalı
2. **502 dayanıklılığı:** Liquipedia block et → anlamlı hata mesajı veya PandaScore fallback
3. **LoL oyuncu profili:** Trophy 502 vermeden yüklenmeli, console temiz
4. **MatchPage:** Picks/bans ve KDA tablosu görünmeli (6.4.1-6.4.2 sonrası)
5. **Console temiz:** key warning, nested anchor, undefined access yok
