# eSPORMAX — LoL Final Roadmap (Kapsamlı & Kalıcı)

> **Nasıl kullanılır:** Her maddenin başındaki `[ ]` kutusunu `[x]` yaparak tamamlandı olarak işaretle.
> **Context:** 3 paralel agent (bug audit, API audit, data audit) + graphify ile tüm codebase tarandı. SADECE LoL'e özgü sorunlar. Bu son roadmap — bundan sonra yeni madde eklenmeyecek.

---

## 🔴 BÖLÜM 1 — Kritik Buglar (Veri/Mantık)

- [x] **1.1** `mapLoLMatch.objectives` bazı turnuvalarda raw string `"3-2-1-9-1"` geliyor, parse edilmiyor → MatchPage `o1.dragons` undefined → her şey 0 gösterir — `liquipediaApi.js:1298-1302` — Fix: hem object hem string handle et
- [x] **1.2** DDragon patch `15.10.1` hardcoded — eskidikçe tüm şampiyon ikonları broken olur — `MatchPage.jsx:126` — Fix: `https://ddragon.leagueoflegends.com/api/versions.json` ile dinamik fetch veya periyodik güncelleme
- [x] **1.3** ChampionIcon name sanitizer eksik alias: Wukong→`MonkeyKing`, Nunu & Willump→`Nunu`, Renata Glasc→`Renata` — `MatchPage.jsx:131` — Fix: alias map ekle
- [x] **1.4** Objectives mavi/kırmızı tag background kayıp: duplicate `color` key → background hiç render edilmiyor — `MatchPage.jsx:293` — Fix: `color: "#1a3a6a"` → `background: "#1a3a6a"`
- [x] **1.5** KDA tablosu takım swap bug: `team1` boşken `team2` doluysa data swap yapılıyor ama header hâlâ `opp1Name` gösteriyor — `MatchPage.jsx:318-321` — Fix: header'ı swap'a uyumlu yap
- [x] **1.6** `getLoLTournamentStandings` tanımlı ama hiç import edilmiyor (dead code) — `liquipediaApi.js:1503` — Fix: `TournamentPage`'e ekle veya kaldır. Ayrıca `Number("3-4")` → `NaN` → placement 0 bug'ı var
- [x] **1.7** `getLoLHeadToHead` broken query: `[[opponent1::T1]]` field'ı Liquipedia'da yok, doğrusu `[[opponent::T1]]` — `liquipediaApi.js:1565` — Ayrıca hiçbir yerde import da edilmiyor — Fix: koşulu düzelt veya kaldır
- [x] **1.8** LoL turnuva MVP `isCS2` guard arkasında: `mapTournament` LoL için de `mvp` döndürüyor ama `TournamentPage.jsx:258` `isCS2 && tournament.mvp` diye kontrol ediyor — Fix: `isApiWiki && tournament.mvp` yap
- [x] **1.9** LoL prize distribution `isCS2` guard arkasında: `TournamentPage.jsx:217` `{isCS2 && prizes.length > 0}` — LoL turnuvaları için ödül dağılımı hiç gösterilmiyor — Fix: `prizepoolentry` tablosu ekle + koşulu güncelle
- [x] **1.10** LoL group stage `isCS2` guard arkasında: `TournamentPage.jsx:276` — LCK, LEC, LCS, LPL grup maçları görünmüyor — Fix: `getLoLGroupStageMatches` ekle, koşulu güncelle
- [x] **1.11** Home hero "Grand Final" lookup LoL için çalışmıyor: Liquipedia LoL verisi `!gf` notasyonu kullanır, `"Grand Final"` string'i bulunamaz — `Home.jsx:64` — Fix: `cleanHeader()` normalize + "Final" içereni ara
- [x] **1.12** Home.jsx `t` variable shadow: `const { t } = useLanguage()` (line 31) → carousel callback `(t, i) =>` ile shadow — `Home.jsx:139` — Fix: parametreyi `(tournament, i)` olarak yeniden adlandır
- [x] **1.13** `participant` table LoL için yanlışlıkla skip ediliyor: comment yanlış "only CS2 wiki has this table" — LoL wiki'de de var — `liquipediaApi.js:1151` — `getLoLTeamOngoingEvents` sürekli placement fallback'e düşüyor → yeni Worlds/MSI qualifier takımlar invisible — Fix: LoL için de sorgula
- [x] **1.14** `getLoLTeamUpcomingMatches` over-fetch: 50 global maç çekip client-side filter → aktif sezonda sadece 36 saati kapsar — `liquipediaApi.js:1945` — Fix: `[[opponent::${teamName}]]` ile server-side filter
- [x] **1.15** `getLoLTeamRecentMatches` yeni takımlarda boş dönüyor: `placement` sorgusu boş → `[]` return — `liquipediaApi.js:1907` — Worlds qualifier olan yeni takımlar invisible — Fix: placement boşsa direkt `[[opponent::${teamName}]]` ile sorgula
- [x] **1.16** `getLoLTeamSquad` case mismatch: `[[status::active]]` ama bazı Liquipedia kayıtları `Active` (büyük A) — `liquipediaApi.js:1845` — Fix: `[[status::Active]]` kullan
- [x] **1.17** `placement::1..4` range bug: `[[placement::3]]` — Liquipedia'daki "3-4" range string'ini yakalamaz; MSI/Worlds yarı finalist görünmez — `liquipediaApi.js:2062` — Fix: `[[placement::3-4]], [[placement::5-8]]` vb. de ekle
- [x] **1.18** `PlayerProfile` `localStorage.setItem` render içinde çalışıyor (side effect) — `PlayerProfile.jsx:684` — Fix: `useEffect` içine taşı
- [x] **1.19** `mapLoLMatch` participant key parsing fragile: non-standard key'lerde (`"opp1_p1"`) `parseInt` → `NaN` → `|| 1` → tüm 10 oyuncu team1'e atanır — `liquipediaApi.js:1267` — Fix: regex `^(\d+)_(\d+)$` match; uymayan key'leri skip et
- [x] **1.20** `getLoLTeamsForRanking` race condition: `Promise.all` içinde `getLoLGPRList()` + `getLoLRankPoints()` (içinde de `getLoLGPRList()` var) → cold start'ta 2 paralel request → 429 → 30 dakika ban — `liquipediaApi.js:1668`, `lolesportsApi.js:79` — Fix: önceden tek seferinde çağır
- [x] **1.21** `_blockedUntil` tüm wiki'leri blokluyor: CS2 sorgusu 429 alırsa LoL de 30 dk bloklanıyor — `liquipediaApi.js:9, 60` — Fix: `{ counterstrike: ts, leagueoflegends: ts }` per-wiki yap
- [x] **1.22** `match.stream` string olursa crash: `Object.entries("twitch_url")` → karakter çiftleri — `MatchPage.jsx:437` — Fix: `typeof match.stream === 'object' && match.stream !== null` guard ekle

---

## 🟡 BÖLÜM 2 — Mock Data Düzeltmeleri

- [x] **2.1** T1 squad support yanlış: `BeryL` değil `Keria` olmalı — `api.js:1809` — Fix: `{ id: "BeryL" }` → `{ id: "Keria" }`
- [x] **2.2** Bilibili Gaming ve Weibo Gaming TEAMS'de yok: maçlarda ve standings'te referans ediliyor ama `/team/Bilibili Gaming` 404 — `api.js` TEAMS array — Fix: her iki takım için minimal stub ekle
- [x] **2.3** WORLDS25SF2 maçı eksik: T1 finali nasıl geçti belirsiz (SF1: G2 def. Cloud9, SF2 yok) — `api.js` MATCHES — Fix: WORLDS25SF2 mock ekle (T1 vs Gen.G?)
- [x] **2.4** Caps kariyer duplikat "Worlds Finalist" notu: 2024 entry'de yazıyor ama G2'nin 2024 finali veri setinde yok — `api.js:1348` — Fix: 2024 satırından "Worlds finalist" kaldır
- [x] **2.5** Gen.G squad boş (`squad: []`): MSI final oynuyor ama takım sayfasında oyuncu yok — `api.js:1858` — Fix: Chovy + 4 placeholder ekle
- [x] **2.6** Cloud9 LoL squad PLAYERS ile uyumsuz: `[Jensen, Fudge, Blaber]` PLAYERS'da yok; SF1 maçında `Tenacity, Jojopyun` farklı oyuncular — `api.js:1835` — Fix: squad'ı PLAYERS'daki oyuncularla senkronize et
- [x] **2.7** ShowMaker dead team link: `teampagename: "Dplus"` ama TEAMS'de Dplus KIA yok — `api.js:1561` — Fix: TEAMS'e Dplus KIA stub ekle
- [x] **2.8** Mock LoL fallback devre dışı: `getMatches('leagueoflegends')` → `[]`, `getTournaments('leagueoflegends')` → `[]` — `api.js:2018, 2025` — Liquipedia down olunca Home, MatchesPage, TournamentsPage tamamen boş — Fix: bu `return []` satırlarını kaldır, mock veriler LoL için de dönsün
- [x] **2.9** Mock LoL maçlarda picks/bans yok: tüm mock LoL game objeleri `picks`/`bans` field içermez → MatchPage'de bu section hiç render edilmez — `api.js` LoL match2games — Fix: WORLDS25GF gibi önemli maçlara örnek picks/bans ekle
- [x] **2.10** Home PandaScore fallback asla tetiklenmiyor: fallback sadece `Promise.all` catch'inde çalışır; Liquipedia 200 ama boş array dönerse devreye girmez — `Home.jsx:373-389` — Fix: `if (!lolMatches.length) { fetchFromPandaScore() }` mantığı
- [x] **2.11** `lolesportsApi.js` kişisel email exposed: `'EsporMax/1.0 (emiruzel01@gmail.com)'` client-side bundle'da görünür — `lolesportsApi.js:25` — Fix: generic URL veya placeholder kullan
- [x] **2.12** Faker earnings sum mismatch: `earnings: 4800000` ama `earningsbyyear` toplamı ~$3.3M ($1.5M açık) — `api.js:1298-1299` — Fix: pre-2019 yıllar ekle veya total'i düzelt

---

## 🌐 BÖLÜM 3 — i18n Eksiklikleri

### A) Hardcoded Türkçe (kritik — switch'te kırılır)

- [x] **3.1** `"Top Şampiyonlar"` hardcoded Türkçe — `PlayerProfile.jsx:~932` — Fix: `t("player.champPool")` key ekle
- [x] **3.2** `"Teknik Kadro"` hardcoded Türkçe — `TeamPage.jsx:~561` — Fix: `t("team.staff")` key ekle
- [x] **3.3** `"Bonservis Değişimi"` hardcoded Türkçe — `PlayerProfile.jsx:~1023` — Fix: `t("player.transferFeeChange")` key ekle
- [x] **3.4** `"Son Maçlar"` / `"Yaklaşan Maçlar"` hardcoded Türkçe — `TeamPage.jsx:~344, 353` — Fix: mevcut `t("team.recentMatches")`, `t("team.upcomingMatches")` keylerini kullan
- [x] **3.5** `"oyuncu"` hardcoded Türkçe (stat label) — `TeamPage.jsx:~459` — Fix: `t()` ile çek
- [x] **3.6** `"${n} Maç"` hardcoded Türkçe — `TournamentBracket.jsx:~119` — Fix: `t("bracket.matches", { count: n })` key ekle
- [x] **3.7** `"Win Rate"`, `"W – L"`, `"Seriler"`, `"Game Win%"` karışık dil — `PlayerProfile.jsx:917-921` — Fix: hepsini `t()` ile çek

### B) Hardcoded İngilizce (LoL-specific UI)

- [x] **3.8** MatchPage stat başlıkları tümü hardcoded: `"Match Statistics"`, `"Game {i+1}"`, `"PICKS"`, `"BANS"`, `"OBJECTIVES"`, `"No player stats available for this game."`, `"Map Results"` — Fix: translation key'leri ekle
- [x] **3.9** Objectives row labels hardcoded: `"Dragon"`, `"Baron"`, `"Tower"`, `"Grub"`, `"Herald"` — Fix: translation key'leri ekle
- [x] **3.10** TournamentBracket tüm label'lar hardcoded: `"Grand Final"`, `"Semi-Final"`, `"Quarter-Final"`, `"3rd Place"`, `"Group Stage"`, `"Bracket"` — Fix: translation key'leri ekle
- [x] **3.11** GroupStandings tüm header'lar hardcoded: `"Team"`, `"MW"`, `"ML"`, `"GW"`, `"GL"`, `"Pts"`, `"Round Robin"`, `"Bracket"`, `"matches played"` — Fix: translation key'leri ekle
- [x] **3.12** Breadcrumb hardcoded: `"Home"`, `"Players"`, `"Teams"` — `PlayerProfile.jsx:711-715`, `TeamPage.jsx` — Fix: translation key'leri ekle
- [x] **3.13** `"Patch {value}"` hardcoded — `TournamentPage.jsx:169`, `MatchPage.jsx:470` — Fix: `t("common.patch", { version: v })` key ekle

### C) Eksik Translation Key'leri

- [x] **3.14** Bu keyler kodda kullanılıyor ama `translations.js`'de tanımlı değil (EN/TR ekle):
  ```
  stats.searchChampion      // PlayerStats.jsx:173
  stats.filterByChampion    // PlayerStats.jsx:244
  players.subtitleLoL       // PlayersRanking subtitle
  teams.subtitleLoL         // TeamsRanking subtitle
  transfers.subtitleLoL     // TransfersPage subtitle
  match.gameResults         // "Map Results" LoL versiyonu
  match.picks               // "PICKS"
  match.bans                // "BANS"
  match.objectives          // "OBJECTIVES"
  match.noPlayerStats       // "No player stats available"
  tournament.champion       // hero "Champion" badge
  team.staff                // "Teknik Kadro"
  player.champPool          // "Top Şampiyonlar"
  player.transferFeeChange  // "Bonservis Değişimi"
  common.patch              // "Patch {version}"
  bracket.matches           // "{count} matches"
  ```

### D) Diğer i18n

- [x] **3.15** Korean dil flag yanlış: `ko` → Fransa bayrağı (🇫🇷) — `NewsPage.jsx:23-25` — LoL haberleri sıklıkla Korece — Fix: `ko: "south korea"` ekle

---

## ⚡ BÖLÜM 4 — Eksik API Fonksiyonları (CS2 eşdeğerleri)

- [x] **4.1** `getLoLTournamentWinner(tournamentName)` eksik — CS2 eşdeğeri: `getCS2TournamentWinner` (`liquipediaApi.js:967`) — TournamentPage'de LoL turnuvaları için "Champion" badge hiç görünmüyor
- [x] **4.2** `getLoLTournamentPrizes(tournamentName)` eksik — CS2 eşdeğeri: `getCS2TournamentPrizes` (line 937) — `prizepoolentry` tablosunu sorgula — LoL'de `placement.prizemoney` çoğunlukla null, ayrı tablo gerekli
- [x] **4.3** `getLoLTournamentMVP(tournamentName)` eksik — CS2 eşdeğeri: `getCS2TournamentMVP` (line 914) — `award` tablosunu sorgula — Worlds Finals MVP, Split MVP hiç görünmüyor
- [x] **4.4** `getLoLGroupStageMatches(tournamentName, pagename)` eksik — CS2 eşdeğeri: `getCS2GroupStageMatches` (line 1000) — LoL sub-event suffix'leri: `Play-In`, `Swiss_Stage`, `Group_Stage`, `Regional_Qualifier`
- [x] **4.5** `getLoLPlayerMatchStats(playerPagename, teamName)` eksik — CS2 eşdeğeri: `getCS2PlayerMatchStats` (line 843) — `match.match2games[].participants` verisi zaten parse ediliyor ama aggregatör yok — PlayerProfile'da KDA ort., CS/dk, damage/dk gösterilebilir
- [x] **4.6** `LOL_TEAM_PAGENAMES` alias map eksik — CS2 eşdeğeri: `TEAM_PAGENAMES` const (line 288) — `toTitleCase` bug: `Gen.G` → `"Gen.g"`, pagename farklılıkları: `T1_(South_Korean_Team)`, `JD_Gaming`, `Bilibili_Gaming` — `getLoLTeamLogos` logo çekemiyor — Fix:
  ```js
  const LOL_TEAM_PAGENAMES = {
    'Gen.G': 'Gen.G_Esports',
    'T1': 'T1_(South_Korean_Team)',
    'JDG': 'JD_Gaming',
    'BLG': 'Bilibili_Gaming',
    'NRG': 'NRG_(League_of_Legends)',
    // ...
  }
  ```
- [x] **4.7** `getLoLPlayerProfile` LoL-specific social links normalize eksik: `lolpros`, `op.gg`, `proplay`, `weibo`, `bilibili` key'leri `ALLOWED_SOCIALS` filter tarafından düşürülüyor — `liquipediaApi.js:2022`, `PlayerProfile.jsx:104` — Fix: LoL-specific social filter + URL normalizasyon

---

## 🗄️ BÖLÜM 5 — Kullanılmayan Liquipedia Tabloları

- [x] **5.1** `prizepoolentry` — hiç sorgulanmıyor — LoL Worlds $2.5M prize pool ama kim ne aldı görünmez — Kullanım: TournamentPage prize pyramid (CS2'de mevcut, LoL için `isCS2` gated)
- [x] **5.2** `award` — CS2 için `getCS2TournamentMVP` var, LoL için yok — Worlds Finals MVP, Split MVP, All-Pro Team hiçbiri görünmüyor — Kullanım: TournamentPage MVP badge, PlayerProfile award history
- [x] **5.3** `broadcasters` — hiç sorgulanmıyor — Home'da Caedrel/Vedius hardcoded mock; gerçek veri Liquipedia'da var — Kullanım: TournamentPage "Broadcast Team" bölümü
- [x] **5.4** `matchvod` — hiç sorgulanmıyor — `match.vod` tek URL; Kore yayını, İngilizce yayın ayrı URL'ler kaçıyor — Kullanım: MatchPage multi-language VOD butonları (`🇰🇷 VOD`, `🇬🇧 VOD`)
- [x] **5.5** `playerprize` — hiç sorgulanmıyor — sadece `player.earnings` toplam var; "Faker Worlds 2025'te $300K kazandı" gösterilemiyor — Kullanım: PlayerProfile trophy'de her kazanımın yanında ödül
- [x] **5.6** `news` / `article` — hiç sorgulanmıyor — `PLAYER_MOCK_NEWS` hardcoded; Liquipedia LoL `news` tablosu: `title`, `date`, `author`, `tournament` alanları — Kullanım: NewsPage gerçek LoL haberleri
- [x] **5.7** `series` — hiç sorgulanmıyor — `TournamentCard.jsx:16` `t.seriespage` var ama kullanılmıyor — tüm LCK splitleri, tüm Worlds edisyonları parent altında gruplandırılabilir — Kullanım: TournamentsPage sezon/split gruplaması
- [x] **5.8** `playerrecord` / `teamrecord` — hiç sorgulanmıyor — career W/L, total games, earnings aggregate — Kullanım: PlayerProfile "Career Stats" özet kartı

---

## 🎨 BÖLÜM 6 — UI/UX İyileştirmeleri

- [x] **6.1** PlayersRanking: LoL API oyuncuları hiç görünmüyor — tüm sayfa `getPlayers(wiki)` mock'una bağlı — `PlayersRanking.jsx` — Fix: `getLoLPlayersForRanking()` fonksiyonu ekle (Liquipedia `squadplayer` + `player` tablosu entegrasyonu)
- [x] **6.2** TournamentsPage + TeamsRanking: LoL bölge filtresi yok — LCK/LEC/LCS/LPL ayrı görüntülenemiyor — Fix: LoL seçiliyken "All / LCK / LEC / LCS / LPL / Other" filtre bar ekle
- [x] **6.3** MatchCard: LoL game duration gösterilmiyor — CS2 branch `g.length` gösteriyor, LoL branch göstermiyor ama veri mevcut — `MatchCard.jsx:87-96` — Fix: `{g.length && <span>{g.length}</span>}` ekle
- [x] **6.4** MatchCard: `LOL_MAPS` dead code — `MatchCard.jsx:20` — Fix: kaldır
- [x] **6.5** TrophyGrid: Mobile'da 10 kolonlu, okunaksız — `PlayerProfile.module.css:508` — Fix: `@media (max-width: 768px) { .trophyGrid { grid-template-columns: repeat(4, 1fr); } }`
- [x] **6.6** LoL stat table: Mobile'da CS/KDA kolonu gizleniyor — CS2 ve LoL aynı `.csStatTable` CSS sınıfını paylaşıyor; mobilde colonlar 5-6 gizlenince LoL'de KDA/CS kaybolur — `MatchPage.module.css:866-867` — Fix: LoL tablosuna ayrı sınıf ver
- [x] **6.7** LoL Objectives: Emoji yerine doğru ikonlar + eksik objeler — `🪲 Grub` (böcek), `🦅 Herald` (kartal); Atakhan ve Elder Dragon 2025+ meta'da eksik — `MatchPage.jsx:283-287` — Fix: SVG/DDragon monster ikonları, Atakhan/Elder rows ekle
- [x] **6.8** PlayerStats: LoL için dead-end sayfayı gizle — tüm LoL oyuncular için "coming soon" gösteriyor ama link PlayerProfile'da görünüyor — `PlayerStats.jsx:160-171` — Fix: `isLoL` ise "View Stats" linkini gizle
- [x] **6.9** TournamentPage: LoL grup aşaması maçları görünmüyor — tüm Group Stage bölümü `isCS2` gated — LCK regular season, Worlds Play-Ins görünmez (4.4 ile birlikte fix)
- [x] **6.10** TeamsRanking: Roster MV API takımlar için 0 — `rosterMV` mock `PLAYERS` tablosuna bakıyor; API LoL takımları squad shape farklı — `TeamsRanking.jsx:17`
- [x] **6.11** MatchPage: CS2 stat table başlıkları LoL için yanlış — aynı `csStatTable` CSS sınıfı; LoL'de `Round Swing`, `ADR` gibi CS2-specific kolonlar var — `MatchPage.jsx:131-142` — Fix: LoL tablosuna `lolStatTable` sınıfı ver
- [x] **6.12** Home: LoL için API down olunca tamamen boş sayfa — Tournaments + Matches + Transfers için mock fallback yok (2.8 ile birlikte fix)
- [x] **6.13** MatchPage: Game tab label "Game {i+1} · {g.length}" — CS2'de "Map {i+1} · {g.map}" formatı; LoL'de `g.map = "Summoner's Rift"` her game için aynı → tab'lar anlamsız tekrar — Fix: LoL için sadece "Game {i+1} · {g.length}" göster

---

## 🔧 BÖLÜM 7 — Kod Kalitesi

- [x] **7.1** `e.target.style.display = 'none'` antipattern: React'ta DOM mutation — 5+ yerde var (MatchPage, TeamPage, TournamentPage, TournamentBracket, PlayerProfile) — Fix: `useState` ile yönet
- [x] **7.2** `<div onClick>` keyboard erişilebilirlik eksik — MatchPage, TeamPage, TournamentPage, TournamentBracket, PlayerProfile — Fix: `role="button"`, `tabIndex={0}`, `onKeyDown` ekle
- [x] **7.3** Skeleton erişilebilirlik eksik — `aria-busy="true"` ve `role="progressbar"` yok, `prefers-reduced-motion` desteği yok — `Skeleton.jsx`
- [x] **7.4** Hero carousel: `prefers-reduced-motion` desteği yok, tab hidden olunca da `setInterval` çalışıyor — `Home.jsx:38-47`
- [x] **7.5** SVG gradient ID conflict: `id="mvGrad"` ve `id="playerMvGrad"` birden fazla component aynı sayfada render edilince çakışır — `PlayerProfile.jsx:50`, `TeamPage.jsx` — Fix: `id={\`mvGrad-${player.id}\`}` gibi unique ID
- [x] **7.6** `_lolLogoCache` TTL yok: tüm session boyunca stale kalır — `liquipediaApi.js:1770` — Fix: `{ url, ts }` formatında sakla, 10 dk sonra expire
- [x] **7.7** PlayerProfile IIFE'ler her render'da yeniden hesaplanıyor: `playerInterviews` ve `mvData` — `PlayerProfile.jsx:692, 1010` — Fix: `useMemo` ile wrap
- [x] **7.8** `lqFetch` cache key order unstable: `URLSearchParams.toString()` parametre sırasına bağımlı → aynı sorgu farklı key'ler → double fetch — `liquipediaApi.js:42` — Fix: key'leri sort et
- [x] **7.9** Dead code temizliği:
  - `getLoLHeadToHead` (`liquipediaApi.js:1565`) — broken + unused → kaldır veya düzelt
  - `getLoLTournamentStandings` (`liquipediaApi.js:1503`) — unused → ya kullan ya kaldır
  - `LOL_MAPS` const (`MatchCard.jsx:20`) → kaldır
  - picks/bans plural fallback `team1picks${n}`, `team1bans${n}` (`liquipediaApi.js:1290-1293`) → bu field'lar Liquipedia'da yok, kaldır
- [x] **7.10** `lolesportsApi.js` retry/error UI eksik: GPR fetch başarısız olunca sessizce `null` → TeamsRanking boş, kullanıcı bilgilendirilmiyor — `lolesportsApi.js:50-75` — Fix: retry-once + `common.apiError` göster

---

## 📋 Öncelik Sırası

**Hemen (Breaking / Veri Bozuk):**
- [x] 1.4 Objectives blue/red tag background bug
- [x] 1.5 KDA tablosu takım swap bug
- [x] 1.12 Home `t` variable shadow
- [x] 1.22 `match.stream` string crash
- [x] 2.8 Mock LoL fallback aktif et (getMatches/getTournaments `return []` kaldır)
- [x] 2.11 Kişisel email kaldır

**Kısa Vadeli (Yüksek Görsel Etki):**
- [x] 1.1 Objectives string parse
- [x] 1.2 + 1.3 DDragon dinamik patch + champion alias map
- [x] 1.8 + 1.9 + 1.10 TournamentPage LoL guards kaldır (MVP, Prizes, GroupStage)
- [x] 1.11 Home Grand Final lookup fix
- [x] 2.1 T1 BeryL → Keria
- [x] 2.2 Bilibili Gaming + Weibo Gaming TEAMS ekle
- [x] 3.1-3.7 Hardcoded Türkçe fix
- [x] 3.15 Korean flag fix
- [x] 6.5 TrophyGrid mobile fix

**Orta Vadeli:**
- [x] 4.1-4.4 CS2 eşdeğeri eksik fonksiyonlar (Winner, Prizes, MVP, GroupStage)
- [x] 4.6 `LOL_TEAM_PAGENAMES` alias map
- [x] 1.13 participant table LoL için aktif et
- [x] 1.14 + 1.15 Team matches queries iyileştir
- [x] 1.20 + 1.21 Race condition + per-wiki blocked flag
- [x] 6.1 PlayersRanking LoL API entegrasyonu
- [x] 6.2 LoL bölge filtresi
- [x] 3.14 Eksik translation key'leri ekle
- [x] 2.3-2.9 Mock data tamamen düzelt

**Uzun Vadeli:**
- [x] 5.1-5.8 Kullanılmayan Liquipedia tabloları (prizepoolentry, award, broadcasters, matchvod, playerprize, news, series, playerrecord)
- [x] 7.1-7.4, 7.10 Kod kalitesi iyileştirmeleri (erişilebilirlik, carousel, retry)
- [x] 6.6-6.13 Geri kalan UI/UX fixes (6.6, 6.8, 6.9, 6.11, 6.12, 6.13 tamamlandı)
- [x] 4.5 `getLoLPlayerMatchStats` aggregatör
- [x] 4.7 LoL social links normalize
- [x] 3.8-3.13 Tüm i18n düzeltmeleri

---

## Kritik Dosyalar
- `src/services/liquipediaApi.js` — mapLoLMatch (1234), objectives parsing (1298), getLoLTeamSquad (1845), getLoLPlayerProfile (1994), getLoLTournamentStandings (1503), getLoLHeadToHead (1565), _blockedUntil (9), _lolLogoCache (1770)
- `src/services/lolesportsApi.js` — GPR fetch, kişisel email (25), retry eksik
- `src/services/api.js` — Mock LoL data (players 1293–1651, teams 1800–1865), getMatches `return []` (2025), getTournaments `return []` (2018)
- `src/pages/MatchPage.jsx` — objectives (281-316), champion icons (126-131), stat table (156-167), stream crash (437), team swap (318-321)
- `src/pages/TournamentPage.jsx` — isCS2 guards (217, 258, 276)
- `src/pages/PlayerProfile.jsx` — localStorage side effect (684), IIFE renders (692, 1010), hardcoded Turkish strings
- `src/pages/Home.jsx` — Grand Final lookup (64), t shadow (139), PandaScore fallback (373-410)
- `src/pages/PlayersRanking.jsx` — mock-only, LoL API entegrasyonu yok
- `src/pages/NewsPage.jsx` — Korean flag (23-25)
- `src/pages/PlayerProfile.module.css` — trophyGrid mobile (508)
- `src/pages/MatchPage.module.css` — LoL stat table mobile (866-867)
- `src/i18n/translations.js` — eksik keyler (3.14 listesi)
- `src/components/MatchCard.jsx` — LoL duration (87-96), dead LOL_MAPS (20)
- `src/components/TournamentBracket.jsx` — hardcoded labels, round naming
- `src/components/GroupStandings.jsx` — hardcoded headers
- `src/components/Skeleton.jsx` — aria-busy, prefers-reduced-motion eksik

## Doğrulama
1. **Objectives:** LCK maç sayfasında dragon/baron sayıları doğru göstermeli
2. **Champion icons:** Wukong, Nunu & Willump, Renata picks'te icon yüklemeli
3. **Mock fallback:** Liquipedia offline iken Home'da mock LoL maçları/turnuvalar görünmeli
4. **T1 squad:** T1 team sayfasında Keria görünmeli, BeryL değil
5. **TournamentPage LoL:** Worlds 2025 sayfasında prize table + winner badge görünmeli
6. **Mobile trophy grid:** Telefonda trophy kartları okunabilir olmalı
7. **Korean flag:** LoL haberlerinde 🇰🇷 Kore bayrağı görünmeli
8. **i18n:** TR↔EN toggle'da hardcoded string kalmamalı
9. **stream crash:** `match.stream` string olduğunda sayfa çökmemeli
10. **Team swap:** KDA tablosunda takım adı ile oyuncu istatistikleri doğru eşleşmeli
