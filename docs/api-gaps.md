# API'den Çekilip Kullanılmayan / Gösterilmeyen Veri

> Analiz tarihi: 2026-05-17  
> Tüm servis dosyaları ve sayfalar karşılaştırıldı.

---

## TIER 1 — Tamamen Ölü Kod

### 1. PandaScore API — `src/services/pandascoreApi.js`
4 export fonksiyon (`findPandaScorePlayer`, `getPlayerStatsFromPandaScore`, `findLoLPlayer`, `getLoLPlayerStatsFromPandaScore`), `VITE_PANDASCORE_API_KEY` env tanımlı — **hiçbir `.jsx` dosyası import etmiyor.**  
**Potansiyel:** CS2/LoL oyuncu istatistikleri → PlayerProfile entegrasyonu.

### 2. `getCS2PlayersEarnings(playerIds)` — `liquipediaApi.js:996`
Batch earnings fonksiyonu mevcut, hiçbir sayfada kullanılmıyor.  
**Potansiyel:** TeamPage'de squad earnings'i tek seferde çekmek (şu an her oyuncu için ayrı `getCS2PlayerProfile`).

### 3. `getLoLOngoingMatches(tournamentNames)` — `liquipediaApi.js:1219`
CS2 muadili (`getCS2OngoingMatches`) Home.jsx'te kullanılıyor, LoL versiyonu hiç çağrılmıyor.  
**Potansiyel:** Home'da LoL "LIVE" maç göstergesi.

### 4. `normLolName()` — `src/services/lolesportsApi.js:107`
Export ediliyor, hiçbir dosyada import yok. `liquipediaApi.js` kendi `_normLolName`'ini kullanıyor.  
**Öneri:** Kaldırılabilir (dead export).

---

## TIER 2 — Çekiliyor ama UI'da Gösterilmiyor

### 5. VOD Linkleri — `match2games[].vod`
`mapMatch` ve `mapLoLMatch` her ikisi de çekiyor. LoL'de hiçbir yerde gösterilmiyor. CS2'de sadece fallback blokta var, ana `CsMapPanel` bile göstermiyor.  
**Potansiyel:** MatchPage'de oyun bazında "📺 VOD İzle" butonu.

### 6. Dark Mode Logolar — `textlesslogodarkurl`, `logodarkurl`
Tüm takım API fonksiyonları dark URL doldururyor. Hiçbir component kullanmıyor — her yerde daima `textlesslogourl` (light).  
**Potansiyel:** Dark mode'da farklı logo versiyonu (site `.dark` class'ı zaten destekliyor).

### 7. Dark Mode Banner — `bannerdarkurl`
`mapTournament` ve LoL banner fallback dolduruyor. `Home.jsx` sadece `bannerurl` kullanıyor.  
**Potansiyel:** Dark modda hero banner değişimi.

### 8. Dark Mode Kupa İkonu — `placement.icondarkurl`
`PlayerProfile.jsx:455`'te map'leniyor ama `<img>` her zaman light `iconurl` kullanıyor.

### 9. FACEIT `winRate`
`faceitApi.js` `winRate` döndürüyor. Ne PlayerProfile ne TeamPage göstermiyor.  
**Potansiyel:** FACEIT stats kartına "Win Rate: 58%" eklemek.

### 10. `calcPlayerValue` Breakdown — `playerValuation.js`
`{usd, value, score, breakdown}` döndürüyor. `breakdown` içinde `stats/earnings/prestige/age` alt skorları var. UI sadece `usd`, `value`, `score` gösteriyor.  
**Potansiyel:** "ESM Skoru Nasıl Hesaplandı?" tooltip/accordion.

### 11. CS2 Squad `joindate`
`getCS2TeamSquad` `joindate` döndürüyor (`liquipediaApi.js:972`). LoL'de "Since YYYY" eklendi ama CS2 squad mapping'e alınmıyor bile.  
**Potansiyel:** CS2 takım sayfasında da katılım yılı.

### 12. `match2opponents[].match2players` (Roster Snapshot)
Her maçta sahaya çıkan oyuncu listesi çekiliyor ama hiçbir component kullanmıyor.  
**Potansiyel:** MatchPage'de "Bu maçtaki kadro" bölümü.

### 13. Tournament `shortname`
`mapTournament:102`'de çekiliyor, her yerde uzun `name` kullanılıyor.  
**Potansiyel:** Mobil görünümlerde kısa turnuva adı.

---

## TIER 3 — Kısmi Kullanım

### 14. Sosyal Linkler: YouTube, TikTok, Discord, Facebook
`PlayerProfile.jsx` — `ALLOWED_SOCIALS = ["twitter","x","instagram","steam","twitch"]`.  
`SocialIcon`'da youtube/tiktok/discord ikonları tanımlı ama liste dışı → API'den gelen bu linkler gösterilmiyor.  
`TeamPage.jsx`'te de discord/facebook allowed set'te yok.

### 15. `match2bracketdata` Tam Obje
Sadece `header` ve `type` kullanılıyor. `round`, `bestof`, `thirdplace`, parent/sibling ID'leri kullanılmıyor.  
**Potansiyel:** Daha gelişmiş bracket görüntüsü.

### 16. Maç Süresi (`match2games[].length`) — Liste Sayfasında Yok
MatchPage detayında gösteriliyor ama MatchesPage listesinde ve MatchCard'da yok.

### 17. `logourl` (Background'lu Logo)
Çekiliyor, hiç kullanılmıyor. `textlesslogourl` olmadığında fallback olarak kullanılabilir.

---

## Öncelik Tablosu

| # | Eksiklik | Zorluk | Görsel Etki |
|---|----------|--------|-------------|
| 5 | VOD linkleri MatchPage'de | Kolay | Orta |
| 3 | LoL canlı maç Home'da | Orta | Yüksek |
| 9 | FACEIT winRate | Çok Kolay | Düşük |
| 11 | CS2 squad joindate | Çok Kolay | Düşük |
| 14 | YouTube/TikTok/Discord linkler | Kolay | Orta |
| 6/7/8 | Dark mode logo/banner | Orta | Yüksek |
| 10 | ESM breakdown detayı | Orta | Düşük |
| 1 | PandaScore entegrasyonu | Zor | Yüksek |
| 2 | Batch earnings optimizasyonu | Kolay | Sıfır (perf) |
