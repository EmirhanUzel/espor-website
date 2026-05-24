// Mock API layer — mirrors real Liquipedia API response shapes

export const FLAG_EMOJI = {
  "afghanistan":"🇦🇫","albania":"🇦🇱","algeria":"🇩🇿","argentina":"🇦🇷",
  "australia":"🇦🇺","austria":"🇦🇹","belgium":"🇧🇪","brazil":"🇧🇷",
  "bulgaria":"🇧🇬","canada":"🇨🇦","chile":"🇨🇱","china":"🇨🇳",
  "colombia":"🇨🇴","croatia":"🇭🇷","czech republic":"🇨🇿","denmark":"🇩🇰",
  "egypt":"🇪🇬","england":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","estonia":"🇪🇪","finland":"🇫🇮",
  "france":"🇫🇷","germany":"🇩🇪","greece":"🇬🇷","hungary":"🇭🇺",
  "india":"🇮🇳","indonesia":"🇮🇩","israel":"🇮🇱","italy":"🇮🇹",
  "japan":"🇯🇵","kazakhstan":"🇰🇿","latvia":"🇱🇻","lithuania":"🇱🇹",
  "malaysia":"🇲🇾","mexico":"🇲🇽","netherlands":"🇳🇱","new zealand":"🇳🇿",
  "norway":"🇳🇴","philippines":"🇵🇭","poland":"🇵🇱","portugal":"🇵🇹",
  "romania":"🇷🇴","russia":"🇷🇺","saudi arabia":"🇸🇦","scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "serbia":"🇷🇸","singapore":"🇸🇬","slovakia":"🇸🇰","south korea":"🇰🇷",
  "spain":"🇪🇸","sweden":"🇸🇪","switzerland":"🇨🇭","taiwan":"🇹🇼",
  "thailand":"🇹🇭","turkey":"🇹🇷","ukraine":"🇺🇦","united kingdom":"🇬🇧",
  "united states":"🇺🇸","vietnam":"🇻🇳","wales":"🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "bosnia and herzegovina":"🇧🇦",
};

export function getFlag(nat) {
  return FLAG_EMOJI[nat?.toLowerCase()] || "🌐";
}

export function formatDate(dateStr, locale = "en-US") {
  if (!dateStr || dateStr.startsWith("0000")) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

export function formatPrize(amount) {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function tierLabel(tier) {
  return { "1": "S", "2": "A", "3": "B", "4": "C" }[tier] || tier;
}

// ── TICKER ────────────────────────────────────────────────────────────────────
export const TICKER_ITEMS = [
  "NRG def. Fnatic 3–1 · VALORANT Champions 2025 Grand Final",
  "T1 def. G2 Esports 3–1 · Worlds 2025 Grand Final · Shanghai",
  "NAVI def. G2 Esports 2–0 · ESL Pro League Season 21 Final",
  "Champions 2025 Prize Pool · $2,250,000 · 16 Teams · Paris",
  "tOfu joins Team Liquid from Gaimin Gladiators · Dota 2",
  "Worlds 2025 · Prize Pool $2,500,000 · 22 Teams · Shanghai",
  "Faker wins 5th World Championship with T1 · Historic run",
  "ardiis signs with NRG from Fnatic · VALORANT Americas",
];

// ── GUESTS ───────────────────────────────────────────────────────────────────
export const GUESTS = [
  { id: "PAL", name: "Gregor Morton", position: "Guest", language: "English", flag: "scotland", date: "2025-10-05", wiki: "valorant" },
  { id: "Yinsu", name: "Yinsu Collins", position: "Host", language: "English", flag: "england", date: "2025-10-05", wiki: "valorant" },
  { id: "Pansy", name: "Lauren Scott", position: "Caster", language: "English", flag: "england", date: "2025-09-12", wiki: "valorant" },
  { id: "Pimp", name: "Jacob Winneche", position: "Analyst", language: "English", flag: "denmark", date: "2025-09-20", wiki: "valorant" },
  { id: "Caedrel", name: "Marc Robert Lamont", position: "Caster", language: "English", flag: "england", date: "2025-10-05", wiki: "leagueoflegends" },
  { id: "Vedius", name: "Daniel Drakos", position: "Analyst", language: "English", flag: "england", date: "2025-10-04", wiki: "leagueoflegends" },
];

// ── INTERVIEWS ────────────────────────────────────────────────────────────────
export const INTERVIEWS = [
  { pagename: "Alfajer", title: "Everyone's having fun and is in form right now", link: "https://www.vlr.gg/474462", date: "2025-04-17", language: "en", publisher: "VLR.gg", type: "Interview", wiki: "valorant" },
  { pagename: "Boaster", title: "We came here to win — nothing less", link: "https://www.vlr.gg/474000", date: "2025-10-04", language: "en", publisher: "VLR.gg", type: "Interview", wiki: "valorant" },
  { pagename: "NRG", title: "NRG reflect on Champions run: 'We were the best team in the world'", link: "https://www.thespike.gg/123456", date: "2025-10-06", language: "en", publisher: "The Spike", type: "Article", wiki: "valorant" },
  { pagename: "s0m", title: "s0m on NRG's explosive year: 'We never stopped believing'", link: "https://www.vlr.gg/475000", date: "2025-09-30", language: "en", publisher: "VLR.gg", type: "Interview", wiki: "valorant" },
  { pagename: "Paper Rex", title: "Paper Rex's high-speed Valorant is here to stay, says f0rsakeN", link: "https://www.vlr.gg/473000", date: "2025-09-20", language: "en", publisher: "VLR.gg", type: "Interview", wiki: "valorant" },
  { pagename: "VALORANT Champions 2025", title: "Champions 2025: The complete preview — who wins Paris?", link: "https://www.thespike.gg/112233", date: "2025-09-10", language: "en", publisher: "The Spike", type: "Article", wiki: "valorant" },
  { pagename: "Derke", title: "Derke: 'Fnatic is the hungriest team I've ever been on'", link: "https://www.vlr.gg/476000", date: "2025-09-28", language: "en", publisher: "VLR.gg", type: "Interview", wiki: "valorant" },
  { pagename: "s1mple", title: "s1mple after Major: 'I proved I still belong at the top'", link: "https://www.hltv.org/news/1001", date: "2025-10-02", language: "en", publisher: "HLTV.org", type: "Interview", wiki: "counterstrike" },
  { pagename: "NiKo", title: "NiKo on G2's title run: 'Finally everything clicked'", link: "https://www.hltv.org/news/1002", date: "2025-09-25", language: "en", publisher: "HLTV.org", type: "Interview", wiki: "counterstrike" },
  { pagename: "Faker", title: "Faker on 5th World Championship: 'I just wanted to prove it one more time'", link: "https://www.lolesports.com/interview/faker2025", date: "2025-10-06", language: "en", publisher: "LoL Esports", type: "Interview", wiki: "leagueoflegends" },
  { pagename: "Caps", title: "Caps: 'We pushed T1 harder than anyone expected in that final'", link: "https://www.lolesports.com/interview/caps2025", date: "2025-10-05", language: "en", publisher: "LoL Esports", type: "Interview", wiki: "leagueoflegends" },
  { pagename: "Worlds 2025", title: "Worlds 2025 Preview: Can anyone stop T1's five-peat?", link: "https://www.oneesports.gg/lol/worlds-2025-preview", date: "2025-09-08", language: "en", publisher: "ONE Esports", type: "Article", wiki: "leagueoflegends" },
];

// ── MATCHES ───────────────────────────────────────────────────────────────────
export const MATCHES = [
  // VALORANT
  {
    id: "CHAMP25GF",
    tournament: "VALORANT Champions 2025",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 5, winner: "1", finished: 1,
    date: "2025-10-05 11:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/VALORANT" },
    match2bracketdata: { type: "bracket", header: "Grand Final" },
    match2opponents: [
      { type: "team", name: "NRG", score: 3, match2players: [] },
      { type: "team", name: "Fnatic", score: 1, match2players: [] },
    ],
    match2games: [
      { map: "Corrode", scores: [13, 3], winner: "1", date: "2025-10-05 11:00:00", length: "40:34", vod: "https://youtu.be/WPm6FMkZ3Qo?t=151" },
      { map: "Abyss", scores: [13, 8], winner: "1", date: "2025-10-05 12:30:00", length: "45:12", vod: "https://youtu.be/WPm6FMkZ3Qo?t=3600" },
      { map: "Bind", scores: [10, 13], winner: "2", date: "2025-10-05 14:00:00", length: "52:08", vod: "https://youtu.be/WPm6FMkZ3Qo?t=7200" },
      { map: "Haven", scores: [13, 7], winner: "1", date: "2025-10-05 15:45:00", length: "41:30", vod: "https://youtu.be/WPm6FMkZ3Qo?t=10800" },
    ],
    wiki: "valorant",
  },
  {
    id: "CHAMP25SF1",
    tournament: "VALORANT Champions 2025",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 5, winner: "1", finished: 1,
    date: "2025-10-03 11:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/VALORANT" },
    match2bracketdata: { type: "bracket", header: "Upper Final" },
    match2opponents: [
      { type: "team", name: "NRG", score: 3, match2players: [] },
      { type: "team", name: "Paper Rex", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Ascent", scores: [13, 5], winner: "1", date: "2025-10-03 11:00:00", length: "35:22", vod: null },
      { map: "Icebox", scores: [13, 9], winner: "1", date: "2025-10-03 12:20:00", length: "48:05", vod: null },
      { map: "Split", scores: [13, 11], winner: "1", date: "2025-10-03 14:00:00", length: "55:30", vod: null },
    ],
    wiki: "valorant",
  },
  {
    id: "CHAMP25SF2",
    tournament: "VALORANT Champions 2025",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 5, winner: "1", finished: 1,
    date: "2025-10-04 11:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/VALORANT" },
    match2bracketdata: { type: "bracket", header: "Lower Final" },
    match2opponents: [
      { type: "team", name: "Fnatic", score: 3, match2players: [] },
      { type: "team", name: "Team Liquid", score: 1, match2players: [] },
    ],
    match2games: [
      { map: "Pearl", scores: [13, 11], winner: "1", date: "2025-10-04 11:00:00", length: "58:44", vod: null },
      { map: "Lotus", scores: [9, 13], winner: "2", date: "2025-10-04 13:00:00", length: "50:22", vod: null },
      { map: "Sunset", scores: [13, 6], winner: "1", date: "2025-10-04 14:45:00", length: "42:10", vod: null },
      { map: "Bind", scores: [13, 8], winner: "1", date: "2025-10-04 16:00:00", length: "44:00", vod: null },
    ],
    wiki: "valorant",
  },
  {
    id: "CHAMP25GrA_0001",
    tournament: "VALORANT Champions 2025",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 3, winner: "1", finished: 1,
    date: "2025-09-14 09:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/VALORANT" },
    match2bracketdata: { type: "league", header: "Group A" },
    match2opponents: [
      { type: "team", name: "Paper Rex", score: 2, match2players: [] },
      { type: "team", name: "Team Liquid", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Pearl", scores: [13, 7], winner: "1", date: "2025-09-14 09:00:00", length: "38:44", vod: null },
      { map: "Lotus", scores: [13, 6], winner: "1", date: "2025-09-14 10:30:00", length: "36:15", vod: null },
    ],
    wiki: "valorant",
  },
  {
    id: "CHAMP25GrB_0001",
    tournament: "VALORANT Champions 2025",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 3, winner: "1", finished: 1,
    date: "2025-09-14 13:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/VALORANT" },
    match2bracketdata: { type: "league", header: "Group B" },
    match2opponents: [
      { type: "team", name: "NRG", score: 2, match2players: [] },
      { type: "team", name: "ZETA DIVISION", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Ascent", scores: [13, 4], winner: "1", date: "2025-09-14 13:00:00", length: "34:10", vod: null },
      { map: "Haven", scores: [13, 7], winner: "1", date: "2025-09-14 14:20:00", length: "40:05", vod: null },
    ],
    wiki: "valorant",
  },
  // CS2
  {
    id: "EPL21F",
    tournament: "ESL Pro League Season 21",
    liquipediatier: "2", liquipediatiertype: "",
    bestof: 3, winner: "1", finished: 1,
    date: "2025-10-01 15:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/ESL_CSGO" },
    match2bracketdata: { type: "bracket", header: "Grand Final" },
    match2opponents: [
      { type: "team", name: "NAVI", score: 2, match2players: [] },
      { type: "team", name: "G2 Esports", score: 0, match2players: [] },
    ],
    veto: [
      { type: "ban", team: "1", map: "Anubis" },
      { type: "ban", team: "2", map: "Vertigo" },
      { type: "pick", team: "1", map: "Mirage" },
      { type: "pick", team: "2", map: "Inferno" },
      { type: "ban", team: "1", map: "Ancient" },
      { type: "ban", team: "2", map: "Nuke" },
      { type: "decider", team: null, map: "Dust2" },
    ],
    match2games: [
      {
        map: "Mirage", scores: [16, 11], winner: "1", date: "2025-10-01 15:00:00", length: "42:30", vod: null,
        playerStats: {
          team1: [
            { name: "w0nderful", kills: 27, deaths: 14, adr: 96.2, kd: 1.93, swing: 13 },
            { name: "Aleksib",   kills: 18, deaths: 16, adr: 71.4, kd: 1.13, swing:  2 },
            { name: "iM",        kills: 21, deaths: 15, adr: 84.8, kd: 1.40, swing:  6 },
            { name: "jL",        kills: 22, deaths: 17, adr: 88.0, kd: 1.29, swing:  5 },
            { name: "b1t",       kills: 20, deaths: 18, adr: 78.6, kd: 1.11, swing:  2 },
          ],
          team2: [
            { name: "NiKo",      kills: 22, deaths: 19, adr: 84.0, kd: 1.16, swing:  3 },
            { name: "huNter-",   kills: 19, deaths: 20, adr: 72.4, kd: 0.95, swing: -1 },
            { name: "m0NESY",    kills: 24, deaths: 18, adr: 88.6, kd: 1.33, swing:  6 },
            { name: "HooXi",     kills: 11, deaths: 22, adr: 51.2, kd: 0.50, swing:-11 },
            { name: "malbsMd",   kills: 16, deaths: 22, adr: 65.8, kd: 0.73, swing: -6 },
          ],
        },
      },
      {
        map: "Inferno", scores: [16, 12], winner: "1", date: "2025-10-01 17:00:00", length: "48:55", vod: null,
        playerStats: {
          team1: [
            { name: "w0nderful", kills: 25, deaths: 18, adr: 89.4, kd: 1.39, swing:  7 },
            { name: "Aleksib",   kills: 17, deaths: 19, adr: 68.0, kd: 0.89, swing: -2 },
            { name: "iM",        kills: 23, deaths: 17, adr: 86.5, kd: 1.35, swing:  6 },
            { name: "jL",        kills: 24, deaths: 18, adr: 91.2, kd: 1.33, swing:  6 },
            { name: "b1t",       kills: 22, deaths: 19, adr: 80.4, kd: 1.16, swing:  3 },
          ],
          team2: [
            { name: "NiKo",      kills: 24, deaths: 20, adr: 86.2, kd: 1.20, swing:  4 },
            { name: "huNter-",   kills: 18, deaths: 21, adr: 70.0, kd: 0.86, swing: -3 },
            { name: "m0NESY",    kills: 25, deaths: 19, adr: 92.4, kd: 1.32, swing:  6 },
            { name: "HooXi",     kills: 12, deaths: 22, adr: 48.0, kd: 0.55, swing:-10 },
            { name: "malbsMd",   kills: 14, deaths: 22, adr: 62.4, kd: 0.64, swing: -8 },
          ],
        },
      },
    ],
    wiki: "counterstrike",
  },
  {
    id: "EPL21SF1",
    tournament: "ESL Pro League Season 21",
    liquipediatier: "2", liquipediatiertype: "",
    bestof: 3, winner: "2", finished: 1,
    date: "2025-09-29 15:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/ESL_CSGO" },
    match2bracketdata: { type: "bracket", header: "Semi-Final" },
    match2opponents: [
      { type: "team", name: "FaZe Clan", score: 0, match2players: [] },
      { type: "team", name: "G2 Esports", score: 2, match2players: [] },
    ],
    veto: [
      { type: "ban", team: "1", map: "Vertigo" },
      { type: "ban", team: "2", map: "Anubis" },
      { type: "pick", team: "1", map: "Ancient" },
      { type: "pick", team: "2", map: "Nuke" },
      { type: "ban", team: "1", map: "Dust2" },
      { type: "ban", team: "2", map: "Inferno" },
      { type: "decider", team: null, map: "Mirage" },
    ],
    match2games: [
      {
        map: "Ancient", scores: [12, 16], winner: "2", date: "2025-09-29 15:00:00", length: "44:20", vod: null,
        playerStats: {
          team1: [
            { name: "broky",   kills: 19, deaths: 21, adr: 74.0, kd: 0.90, swing: -2 },
            { name: "rain",    kills: 14, deaths: 22, adr: 60.4, kd: 0.64, swing: -8 },
            { name: "ropz",    kills: 22, deaths: 19, adr: 86.2, kd: 1.16, swing:  3 },
            { name: "Twistzz", kills: 17, deaths: 20, adr: 70.8, kd: 0.85, swing: -3 },
            { name: "frozen",  kills: 16, deaths: 21, adr: 68.0, kd: 0.76, swing: -5 },
          ],
          team2: [
            { name: "NiKo",    kills: 24, deaths: 16, adr: 92.4, kd: 1.50, swing:  8 },
            { name: "huNter-", kills: 20, deaths: 18, adr: 80.6, kd: 1.11, swing:  2 },
            { name: "m0NESY",  kills: 26, deaths: 17, adr: 98.2, kd: 1.53, swing:  9 },
            { name: "HooXi",   kills: 13, deaths: 18, adr: 56.4, kd: 0.72, swing: -5 },
            { name: "malbsMd", kills: 18, deaths: 18, adr: 76.0, kd: 1.00, swing:  0 },
          ],
        },
      },
      {
        map: "Nuke", scores: [10, 16], winner: "2", date: "2025-09-29 17:00:00", length: "40:05", vod: null,
        playerStats: {
          team1: [
            { name: "broky",   kills: 18, deaths: 20, adr: 71.6, kd: 0.90, swing: -2 },
            { name: "rain",    kills: 12, deaths: 22, adr: 54.8, kd: 0.55, swing:-10 },
            { name: "ropz",    kills: 21, deaths: 19, adr: 82.0, kd: 1.11, swing:  2 },
            { name: "Twistzz", kills: 16, deaths: 21, adr: 67.2, kd: 0.76, swing: -5 },
            { name: "frozen",  kills: 14, deaths: 21, adr: 60.4, kd: 0.67, swing: -7 },
          ],
          team2: [
            { name: "NiKo",    kills: 25, deaths: 14, adr: 96.8, kd: 1.79, swing: 11 },
            { name: "huNter-", kills: 19, deaths: 16, adr: 78.0, kd: 1.19, swing:  3 },
            { name: "m0NESY",  kills: 23, deaths: 15, adr: 90.2, kd: 1.53, swing:  8 },
            { name: "HooXi",   kills: 12, deaths: 16, adr: 52.6, kd: 0.75, swing: -4 },
            { name: "malbsMd", kills: 18, deaths: 16, adr: 74.4, kd: 1.13, swing:  2 },
          ],
        },
      },
    ],
    wiki: "counterstrike",
  },
  // EPL S21 — Semi-Final 2 (NAVI vs MOUZ)
  {
    id: "EPL21SF2",
    tournament: "ESL Pro League Season 21",
    liquipediatier: "2", liquipediatiertype: "",
    bestof: 3, winner: "1", finished: 1,
    date: "2025-09-29 19:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/ESL_CSGO" },
    match2bracketdata: { type: "bracket", header: "Semi-Final" },
    match2opponents: [
      { type: "team", name: "NAVI", score: 2, match2players: [] },
      { type: "team", name: "MOUZ", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Inferno", scores: [16, 11], winner: "1", date: "2025-09-29 19:00:00", length: "43:18", vod: null },
      { map: "Mirage",  scores: [16,  9], winner: "1", date: "2025-09-29 21:00:00", length: "39:42", vod: null },
    ],
    wiki: "counterstrike",
  },
  // EPL S21 — Quarterfinals
  {
    id: "EPL21QF1",
    tournament: "ESL Pro League Season 21",
    liquipediatier: "2", liquipediatiertype: "",
    bestof: 3, winner: "1", finished: 1,
    date: "2025-09-27 15:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/ESL_CSGO" },
    match2bracketdata: { type: "bracket", header: "Quarterfinal" },
    match2opponents: [
      { type: "team", name: "G2 Esports", score: 2, match2players: [] },
      { type: "team", name: "Team Liquid", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Mirage",  scores: [16, 12], winner: "1", date: "2025-09-27 15:00:00", length: "42:10", vod: null },
      { map: "Ancient", scores: [16, 14], winner: "1", date: "2025-09-27 17:00:00", length: "51:05", vod: null },
    ],
    wiki: "counterstrike",
  },
  {
    id: "EPL21QF2",
    tournament: "ESL Pro League Season 21",
    liquipediatier: "2", liquipediatiertype: "",
    bestof: 3, winner: "1", finished: 1,
    date: "2025-09-27 18:30:00",
    stream: { twitch_en_1: "https://www.twitch.tv/ESL_CSGO" },
    match2bracketdata: { type: "bracket", header: "Quarterfinal" },
    match2opponents: [
      { type: "team", name: "FaZe Clan", score: 2, match2players: [] },
      { type: "team", name: "Cloud9", score: 1, match2players: [] },
    ],
    match2games: [
      { map: "Inferno", scores: [16, 11], winner: "1", date: "2025-09-27 18:30:00", length: "44:55", vod: null },
      { map: "Nuke",    scores: [13, 16], winner: "2", date: "2025-09-27 20:30:00", length: "47:20", vod: null },
      { map: "Mirage",  scores: [16,  9], winner: "1", date: "2025-09-27 22:30:00", length: "39:08", vod: null },
    ],
    wiki: "counterstrike",
  },
  {
    id: "EPL21QF3",
    tournament: "ESL Pro League Season 21",
    liquipediatier: "2", liquipediatiertype: "",
    bestof: 3, winner: "1", finished: 1,
    date: "2025-09-28 15:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/ESL_CSGO" },
    match2bracketdata: { type: "bracket", header: "Quarterfinal" },
    match2opponents: [
      { type: "team", name: "NAVI", score: 2, match2players: [] },
      { type: "team", name: "Vitality", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Ancient", scores: [16, 13], winner: "1", date: "2025-09-28 15:00:00", length: "45:30", vod: null },
      { map: "Mirage",  scores: [16,  9], winner: "1", date: "2025-09-28 17:00:00", length: "38:12", vod: null },
    ],
    wiki: "counterstrike",
  },
  {
    id: "EPL21QF4",
    tournament: "ESL Pro League Season 21",
    liquipediatier: "2", liquipediatiertype: "",
    bestof: 3, winner: "1", finished: 1,
    date: "2025-09-28 18:30:00",
    stream: { twitch_en_1: "https://www.twitch.tv/ESL_CSGO" },
    match2bracketdata: { type: "bracket", header: "Quarterfinal" },
    match2opponents: [
      { type: "team", name: "MOUZ", score: 2, match2players: [] },
      { type: "team", name: "Team Spirit", score: 1, match2players: [] },
    ],
    match2games: [
      { map: "Mirage",  scores: [16, 14], winner: "1", date: "2025-09-28 18:30:00", length: "49:20", vod: null },
      { map: "Inferno", scores: [10, 16], winner: "2", date: "2025-09-28 20:30:00", length: "43:05", vod: null },
      { map: "Ancient", scores: [16, 11], winner: "1", date: "2025-09-28 22:30:00", length: "41:40", vod: null },
    ],
    wiki: "counterstrike",
  },
  // League of Legends — MSI 2026
  {
    id: "MSI26GF",
    tournament: "Mid-Season Invitational 2026",
    liquipediatier: "1", liquipediatiertype: "Mid-Season Invitational",
    bestof: 5, winner: "1", finished: 1,
    date: "2026-06-01 10:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "bracket", header: "Grand Final" },
    match2opponents: [
      { type: "team", name: "Gen.G", score: 3, match2players: [] },
      { type: "team", name: "Bilibili Gaming", score: 2, match2players: [] },
    ],
    match2games: [
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-06-01 10:00:00", length: "29:14", vod: null },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2026-06-01 11:15:00", length: "33:48", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-06-01 12:40:00", length: "27:32", vod: null },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2026-06-01 13:55:00", length: "41:05", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-06-01 15:20:00", length: "36:22", vod: null },
    ],
    wiki: "leagueoflegends",
  },
  {
    id: "MSI26SF1",
    tournament: "Mid-Season Invitational 2026",
    liquipediatier: "1", liquipediatiertype: "Mid-Season Invitational",
    bestof: 5, winner: "1", finished: 1,
    date: "2026-05-29 10:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "bracket", header: "Semi-Final" },
    match2opponents: [
      { type: "team", name: "Gen.G", score: 3, match2players: [] },
      { type: "team", name: "G2 Esports", score: 1, match2players: [] },
    ],
    match2games: [
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-05-29 10:00:00", length: "25:44", vod: null },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2026-05-29 11:10:00", length: "38:12", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-05-29 12:30:00", length: "31:05", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-05-29 13:45:00", length: "28:40", vod: null },
    ],
    wiki: "leagueoflegends",
  },
  {
    id: "MSI26SF2",
    tournament: "Mid-Season Invitational 2026",
    liquipediatier: "1", liquipediatiertype: "Mid-Season Invitational",
    bestof: 5, winner: "2", finished: 1,
    date: "2026-05-29 14:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "bracket", header: "Semi-Final" },
    match2opponents: [
      { type: "team", name: "T1", score: 2, match2players: [] },
      { type: "team", name: "Bilibili Gaming", score: 3, match2players: [] },
    ],
    match2games: [
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-05-29 14:00:00", length: "34:22", vod: null },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2026-05-29 15:15:00", length: "29:18", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-05-29 16:30:00", length: "32:40", vod: null },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2026-05-29 17:50:00", length: "43:15", vod: null },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2026-05-29 19:20:00", length: "38:50", vod: null },
    ],
    wiki: "leagueoflegends",
  },
  // League of Legends — MSI 2026 upcoming (group stage, starts Jun 28)
  {
    id: "MSI26_GRP_1",
    tournament: "Mid-Season Invitational 2026",
    liquipediatier: "1", liquipediatiertype: "Mid-Season Invitational",
    bestof: 1, winner: "", finished: 0,
    date: "2026-06-28 09:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "league", header: "Group Stage" },
    match2opponents: [
      { type: "team", name: "Bilibili Gaming", score: 0, match2players: [] },
      { type: "team", name: "Gen.G", score: 0, match2players: [] },
    ],
    match2games: [],
    wiki: "leagueoflegends",
  },
  {
    id: "MSI26_GRP_2",
    tournament: "Mid-Season Invitational 2026",
    liquipediatier: "1", liquipediatiertype: "Mid-Season Invitational",
    bestof: 1, winner: "", finished: 0,
    date: "2026-06-28 12:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "league", header: "Group Stage" },
    match2opponents: [
      { type: "team", name: "G2 Esports", score: 0, match2players: [] },
      { type: "team", name: "T1", score: 0, match2players: [] },
    ],
    match2games: [],
    wiki: "leagueoflegends",
  },
  {
    id: "MSI26_GRP_3",
    tournament: "Mid-Season Invitational 2026",
    liquipediatier: "1", liquipediatiertype: "Mid-Season Invitational",
    bestof: 1, winner: "", finished: 0,
    date: "2026-06-28 15:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "league", header: "Group Stage" },
    match2opponents: [
      { type: "team", name: "Cloud9", score: 0, match2players: [] },
      { type: "team", name: "Hanwha Life Esports", score: 0, match2players: [] },
    ],
    match2games: [],
    wiki: "leagueoflegends",
  },
  // League of Legends — Worlds 2025
  {
    id: "WORLDS25GF",
    tournament: "Worlds 2025",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 5, winner: "1", finished: 1,
    date: "2025-11-02 10:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "bracket", header: "Grand Final" },
    match2opponents: [
      { type: "team", name: "T1", score: 3, match2players: [] },
      { type: "team", name: "G2 Esports", score: 1, match2players: [] },
    ],
    match2games: [
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-11-02 10:00:00", length: "31:45", vod: null,
        picks: { team1: ["Azir", "Vi", "Garen", "Jinx", "Thresh"], team2: ["Orianna", "Sejuani", "Aatrox", "Jhin", "Nautilus"] },
        bans: { team1: ["Viktor", "Kalista", "Rumble", "Caitlyn", "Syndra"], team2: ["Zeri", "Leblanc", "Karma", "Rakan", "Jayce"] },
        playerStats: {
          team1: [
            { name: "Zeus",  champion: "Garen",   kills: 6, deaths: 2, assists: 9,  cs: 248, gold: 13200, damage: 21600, visionScore: 18 },
            { name: "Oner",  champion: "Vi",      kills: 5, deaths: 1, assists: 14, cs: 136, gold: 11100, damage: 13800, visionScore: 42 },
            { name: "Faker", champion: "Azir",    kills: 9, deaths: 1, assists: 11, cs: 304, gold: 15400, damage: 31200, visionScore: 24 },
            { name: "Ruler", champion: "Jinx",    kills: 8, deaths: 0, assists: 8,  cs: 318, gold: 16200, damage: 33400, visionScore: 14 },
            { name: "Keria", champion: "Thresh",  kills: 1, deaths: 2, assists: 20, cs: 26,  gold: 7600,  damage: 6400,  visionScore: 58 },
          ],
          team2: [
            { name: "BrokenBlade", champion: "Aatrox",   kills: 2, deaths: 5, assists: 4, cs: 204, gold: 10800, damage: 18200, visionScore: 16 },
            { name: "Yike",        champion: "Sejuani",  kills: 1, deaths: 5, assists: 5, cs: 112, gold: 8800,  damage: 9200,  visionScore: 34 },
            { name: "Caps",        champion: "Orianna",  kills: 5, deaths: 6, assists: 5, cs: 268, gold: 12600, damage: 24800, visionScore: 22 },
            { name: "Hans sama",   champion: "Jhin",     kills: 4, deaths: 6, assists: 3, cs: 278, gold: 13200, damage: 22600, visionScore: 12 },
            { name: "Mikyx",       champion: "Nautilus", kills: 0, deaths: 7, assists: 9, cs: 22,  gold: 7000,  damage: 5800,  visionScore: 50 },
          ],
        },
      },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2025-11-02 11:20:00", length: "38:22", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-11-02 12:50:00", length: "28:10", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-11-02 14:05:00", length: "35:40", vod: null },
    ],
    wiki: "leagueoflegends",
  },
  {
    id: "WORLDS25SF1",
    tournament: "Worlds 2025",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 5, winner: "1", finished: 1,
    date: "2025-10-30 10:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "bracket", header: "Semi-Final" },
    match2opponents: [
      { type: "team", name: "G2 Esports", score: 3, match2players: [] },
      { type: "team", name: "Cloud9", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-10-30 10:00:00", length: "25:44", vod: null,
        playerStats: {
          team1: [
            { name: "Caps",    champion: "Azir",    kills: 8, deaths: 2, assists: 10, cs: 287, gold: 14200, damage: 28400, visionScore: 22 },
            { name: "Yike",    champion: "Vi",      kills: 4, deaths: 1, assists: 14, cs: 142, gold: 10800, damage: 12100, visionScore: 38 },
            { name: "BrokenBlade", champion: "Aatrox", kills: 5, deaths: 3, assists: 9, cs: 241, gold: 13100, damage: 19800, visionScore: 18 },
            { name: "Hans sama", champion: "Jinx",  kills: 9, deaths: 1, assists: 7,  cs: 312, gold: 15600, damage: 32100, visionScore: 14 },
            { name: "Mikyx",   champion: "Nautilus", kills: 1, deaths: 2, assists: 18, cs: 28, gold: 7400,  damage: 6200,  visionScore: 54 },
          ],
          team2: [
            { name: "Tenacity", champion: "Rumble",  kills: 2, deaths: 4, assists: 3, cs: 198, gold: 10200, damage: 15300, visionScore: 16 },
            { name: "Blaber",   champion: "Viego",   kills: 1, deaths: 5, assists: 5, cs: 118, gold: 8600,  damage: 9400,  visionScore: 28 },
            { name: "Jojopyun",  champion: "Viktor",  kills: 3, deaths: 5, assists: 4, cs: 224, gold: 11300, damage: 21700, visionScore: 20 },
            { name: "Berserker", champion: "Caitlyn", kills: 2, deaths: 5, assists: 3, cs: 268, gold: 12100, damage: 18900, visionScore: 12 },
            { name: "Zven",      champion: "Lulu",    kills: 0, deaths: 8, assists: 8, cs: 24,  gold: 6800,  damage: 4800,  visionScore: 46 },
          ],
        },
      },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-10-30 11:10:00", length: "29:18", vod: null,
        playerStats: {
          team1: [
            { name: "Caps",    champion: "Orianna",  kills: 6, deaths: 1, assists: 12, cs: 298, gold: 14800, damage: 24600, visionScore: 24 },
            { name: "Yike",    champion: "Sejuani",  kills: 3, deaths: 2, assists: 15, cs: 128, gold: 10200, damage: 9800,  visionScore: 42 },
            { name: "BrokenBlade", champion: "Garen", kills: 7, deaths: 2, assists: 8, cs: 255, gold: 13700, damage: 22400, visionScore: 20 },
            { name: "Hans sama", champion: "Xayah",   kills: 8, deaths: 0, assists: 9, cs: 328, gold: 16200, damage: 30800, visionScore: 16 },
            { name: "Mikyx",   champion: "Rakan",    kills: 1, deaths: 1, assists: 20, cs: 22, gold: 7100,   damage: 5600,  visionScore: 58 },
          ],
          team2: [
            { name: "Tenacity", champion: "Jayce",   kills: 1, deaths: 5, assists: 2, cs: 187, gold: 9800,  damage: 13100, visionScore: 14 },
            { name: "Blaber",   champion: "Elise",   kills: 2, deaths: 4, assists: 4, cs: 105, gold: 8100,  damage: 8200,  visionScore: 30 },
            { name: "Jojopyun",  champion: "Syndra",  kills: 3, deaths: 6, assists: 3, cs: 214, gold: 10900, damage: 19400, visionScore: 22 },
            { name: "Berserker", champion: "Jhin",    kills: 2, deaths: 6, assists: 2, cs: 252, gold: 11500, damage: 17200, visionScore: 10 },
            { name: "Zven",      champion: "Thresh",  kills: 0, deaths: 4, assists: 7, cs: 18,  gold: 6400,  damage: 4100,  visionScore: 44 },
          ],
        },
      },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-10-30 12:20:00", length: "32:05", vod: null,
        playerStats: {
          team1: [
            { name: "Caps",    champion: "Cassiopeia", kills: 10, deaths: 2, assists: 8,  cs: 312, gold: 15400, damage: 31200, visionScore: 26 },
            { name: "Yike",    champion: "Hecarim",    kills: 5,  deaths: 1, assists: 16, cs: 155, gold: 11400, damage: 14600, visionScore: 40 },
            { name: "BrokenBlade", champion: "Malphite", kills: 3, deaths: 3, assists: 14, cs: 228, gold: 12600, damage: 17800, visionScore: 22 },
            { name: "Hans sama", champion: "Aphelios",  kills: 11, deaths: 1, assists: 7, cs: 341, gold: 17100, damage: 35600, visionScore: 18 },
            { name: "Mikyx",   champion: "Alistar",    kills: 0,  deaths: 2, assists: 22, cs: 20, gold: 7600,   damage: 5400,  visionScore: 62 },
          ],
          team2: [
            { name: "Tenacity", champion: "Darius",   kills: 2, deaths: 6, assists: 3, cs: 202, gold: 10400, damage: 16200, visionScore: 18 },
            { name: "Blaber",   champion: "Nidalee",  kills: 3, deaths: 5, assists: 4, cs: 134, gold: 9200,  damage: 11400, visionScore: 32 },
            { name: "Jojopyun",  champion: "Zed",      kills: 4, deaths: 7, assists: 2, cs: 236, gold: 11800, damage: 22800, visionScore: 20 },
            { name: "Berserker", champion: "Ezreal",   kills: 3, deaths: 6, assists: 3, cs: 278, gold: 12400, damage: 20100, visionScore: 12 },
            { name: "Zven",      champion: "Karma",    kills: 0, deaths: 5, assists: 9, cs: 22,  gold: 6900,  damage: 5200,  visionScore: 48 },
          ],
        },
      },
    ],
    wiki: "leagueoflegends",
  },
  {
    id: "WORLDS25SF2",
    tournament: "Worlds 2025",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 5, winner: "1", finished: 1,
    date: "2025-10-31 10:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "bracket", header: "Semi-Final" },
    match2opponents: [
      { type: "team", name: "T1", score: 3, match2players: [] },
      { type: "team", name: "Gen.G", score: 2, match2players: [] },
    ],
    match2games: [
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-10-31 10:00:00", length: "34:12", vod: null },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2025-10-31 11:30:00", length: "29:44", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-10-31 13:00:00", length: "41:05", vod: null },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2025-10-31 14:40:00", length: "27:33", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-10-31 16:00:00", length: "38:20", vod: null },
    ],
    wiki: "leagueoflegends",
  },
  {
    id: "WORLDS25GrA_0001",
    tournament: "Worlds 2025",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 1, winner: "1", finished: 1,
    date: "2025-10-15 09:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/riotgames" },
    match2bracketdata: { type: "league", header: "Group A" },
    match2opponents: [
      { type: "team", name: "T1", score: 1, match2players: [] },
      { type: "team", name: "Cloud9", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2025-10-15 09:00:00", length: "28:33", vod: null },
    ],
    wiki: "leagueoflegends",
  },

  // ── TODAY'S MATCHES (2026-04-29) ──────────────────────────────────────────
  // LIVE — VALORANT
  {
    id: "VCT2026K_QF1",
    tournament: "VCT 2026 Kickoff",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 3, winner: null, finished: 0,
    date: "2026-04-29 13:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/VALORANT" },
    match2bracketdata: { type: "bracket", header: "Quarterfinal" },
    match2opponents: [
      { type: "team", name: "NRG", score: 1, match2players: [] },
      { type: "team", name: "Paper Rex", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Ascent", scores: [13, 8], winner: "1", date: "2026-04-29 13:00:00", length: "38:22", vod: null },
    ],
    wiki: "valorant",
  },
  // LIVE — CS2
  {
    id: "BLAST26_QF1",
    tournament: "BLAST Premier Spring 2026",
    liquipediatier: "2", liquipediatiertype: "",
    bestof: 3, winner: null, finished: 0,
    date: "2026-04-29 14:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/BLASTPremier" },
    match2bracketdata: { type: "bracket", header: "Quarterfinal" },
    match2opponents: [
      { type: "team", name: "FaZe Clan", score: 0, match2players: [] },
      { type: "team", name: "NAVI", score: 1, match2players: [] },
    ],
    veto: [
      { type: "ban", team: "1", map: "Vertigo" },
      { type: "ban", team: "2", map: "Anubis" },
      { type: "pick", team: "1", map: "Mirage" },
      { type: "pick", team: "2", map: "Inferno" },
      { type: "ban", team: "1", map: "Ancient" },
      { type: "ban", team: "2", map: "Nuke" },
      { type: "decider", team: null, map: "Dust2" },
    ],
    match2games: [
      {
        map: "Mirage", scores: [9, 16], winner: "2", date: "2026-04-29 14:00:00", length: "41:05", vod: null,
        playerStats: {
          team1: [
            { name: "broky",   kills: 17, deaths: 22, adr: 70.4, kd: 0.77, swing: -5 },
            { name: "rain",    kills: 13, deaths: 22, adr: 58.2, kd: 0.59, swing: -9 },
            { name: "ropz",    kills: 22, deaths: 19, adr: 84.6, kd: 1.16, swing:  3 },
            { name: "Twistzz", kills: 16, deaths: 21, adr: 68.0, kd: 0.76, swing: -5 },
            { name: "frozen",  kills: 14, deaths: 22, adr: 60.8, kd: 0.64, swing: -8 },
          ],
          team2: [
            { name: "w0nderful", kills: 26, deaths: 14, adr: 95.4, kd: 1.86, swing: 12 },
            { name: "Aleksib",   kills: 17, deaths: 16, adr: 70.0, kd: 1.06, swing:  1 },
            { name: "iM",        kills: 22, deaths: 15, adr: 86.2, kd: 1.47, swing:  7 },
            { name: "jL",        kills: 23, deaths: 17, adr: 89.6, kd: 1.35, swing:  6 },
            { name: "b1t",       kills: 18, deaths: 17, adr: 76.4, kd: 1.06, swing:  1 },
          ],
        },
      },
    ],
    wiki: "counterstrike",
  },
  // COMPLETED TODAY — VALORANT
  {
    id: "VCT2026K_R2_1",
    tournament: "VCT 2026 Kickoff",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 3, winner: "1", finished: 1,
    date: "2026-04-29 09:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/VALORANT" },
    match2bracketdata: { type: "bracket", header: "Round of 16" },
    match2opponents: [
      { type: "team", name: "Fnatic", score: 2, match2players: [] },
      { type: "team", name: "Team Liquid", score: 0, match2players: [] },
    ],
    match2games: [
      { map: "Haven", scores: [13, 7], winner: "1", date: "2026-04-29 09:00:00", length: "39:12", vod: null },
      { map: "Sunset", scores: [13, 9], winner: "1", date: "2026-04-29 10:30:00", length: "44:05", vod: null },
    ],
    wiki: "valorant",
  },
  // COMPLETED TODAY — LoL
  {
    id: "LCK26SPL_SF1",
    tournament: "LCK Spring 2026 Playoffs",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 5, winner: "1", finished: 1,
    date: "2026-04-29 10:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/lck" },
    match2bracketdata: { type: "bracket", header: "Semi-Final" },
    match2opponents: [
      { type: "team", name: "T1", score: 3, match2players: [] },
      { type: "team", name: "Gen.G", score: 1, match2players: [] },
    ],
    match2games: [
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-04-29 10:00:00", length: "28:44", vod: null },
      { map: "Summoner's Rift", scores: [0, 1], winner: "2", date: "2026-04-29 11:15:00", length: "35:20", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-04-29 12:40:00", length: "31:05", vod: null },
      { map: "Summoner's Rift", scores: [1, 0], winner: "1", date: "2026-04-29 13:50:00", length: "26:30", vod: null },
    ],
    wiki: "leagueoflegends",
  },
  // UPCOMING — VALORANT
  {
    id: "VCT2026K_QF2",
    tournament: "VCT 2026 Kickoff",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 3, winner: null, finished: null,
    date: "2026-04-29 17:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/VALORANT" },
    match2bracketdata: { type: "bracket", header: "Quarterfinal" },
    match2opponents: [
      { type: "team", name: "Sentinels", score: null, match2players: [] },
      { type: "team", name: "100 Thieves", score: null, match2players: [] },
    ],
    match2games: [],
    wiki: "valorant",
  },
  // UPCOMING — CS2
  {
    id: "BLAST26_QF2",
    tournament: "BLAST Premier Spring 2026",
    liquipediatier: "2", liquipediatiertype: "",
    bestof: 3, winner: null, finished: null,
    date: "2026-04-29 19:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/BLASTPremier" },
    match2bracketdata: { type: "bracket", header: "Quarterfinal" },
    match2opponents: [
      { type: "team", name: "G2 Esports", score: null, match2players: [] },
      { type: "team", name: "Vitality", score: null, match2players: [] },
    ],
    match2games: [],
    wiki: "counterstrike",
  },
  // UPCOMING — LoL
  {
    id: "LCK26SPL_SF2",
    tournament: "LCK Spring 2026 Playoffs",
    liquipediatier: "1", liquipediatiertype: "",
    bestof: 5, winner: null, finished: null,
    date: "2026-04-29 20:00:00",
    stream: { twitch_en_1: "https://www.twitch.tv/lck" },
    match2bracketdata: { type: "bracket", header: "Semi-Final" },
    match2opponents: [
      { type: "team", name: "G2 Esports", score: null, match2players: [] },
      { type: "team", name: "KT Rolster", score: null, match2players: [] },
    ],
    match2games: [],
    wiki: "leagueoflegends",
  },
];

// ── PRIZE RESULTS ─────────────────────────────────────────────────────────────
export const PRIZE_RESULTS = [
  // VALORANT
  { date: "2025-10-05 11:00:00", placement: "1", prizemoney: 1000000, opponentname: "NRG", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "Fnatic", score: 3 }, qualifier: "Americas Stage 2 (#2)", wiki: "valorant" },
  { date: "2025-10-05 11:00:00", placement: "2", prizemoney: 400000, opponentname: "Fnatic", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "NRG", score: 1 }, qualifier: "EMEA Stage 2 (#1)", wiki: "valorant" },
  { date: "2025-10-05", placement: "3-4", prizemoney: 200000, opponentname: "Paper Rex", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "NRG", score: 0 }, qualifier: "Pacific Stage 2 (#1)", wiki: "valorant" },
  { date: "2025-10-05", placement: "3-4", prizemoney: 200000, opponentname: "Team Liquid", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "Fnatic", score: 1 }, qualifier: "EMEA Stage 2 (#2)", wiki: "valorant" },
  { date: "2025-10-05", placement: "5-8", prizemoney: 85000, opponentname: "DRX", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "Paper Rex", score: 1 }, qualifier: "Pacific Stage 2 (#2)", wiki: "valorant" },
  { date: "2025-10-05", placement: "5-8", prizemoney: 85000, opponentname: "LOUD", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "Team Liquid", score: 0 }, qualifier: "Americas Stage 2 (#1)", wiki: "valorant" },
  { date: "2025-10-05", placement: "5-8", prizemoney: 85000, opponentname: "EDward Gaming", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "NRG", score: 1 }, qualifier: "Pacific Stage 1 (#1)", wiki: "valorant" },
  { date: "2025-10-05", placement: "5-8", prizemoney: 85000, opponentname: "ZETA DIVISION", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "Fnatic", score: 0 }, qualifier: "Pacific Stage 1 (#3)", wiki: "valorant" },
  // CS2
  { date: "2025-10-01", placement: "1",   prizemoney: 340000, opponentname: "NAVI",      opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "G2 Esports", score: 2 }, qualifier: "Europe (#1)", wiki: "counterstrike" },
  { date: "2025-10-01", placement: "2",   prizemoney: 170000, opponentname: "G2 Esports", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "NAVI", score: 0 }, qualifier: "Europe (#2)", wiki: "counterstrike" },
  { date: "2025-09-29", placement: "3-4", prizemoney:  85000, opponentname: "FaZe Clan", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "G2 Esports", score: 0 }, qualifier: "Europe (#3)", wiki: "counterstrike" },
  { date: "2025-04-20", placement: "1",   prizemoney: 280000, opponentname: "NAVI",      opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "FaZe Clan", score: 2 }, qualifier: "IEM Katowice 2025", wiki: "counterstrike" },
  { date: "2025-04-20", placement: "2",   prizemoney: 140000, opponentname: "G2 Esports", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "NAVI", score: 1 }, qualifier: "IEM Cologne 2025", wiki: "counterstrike" },
  // LoL
  { date: "2025-11-02", placement: "1",   prizemoney: 500000, opponentname: "T1", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "G2 Esports", score: 3 }, qualifier: "LCK 2025 Summer (#1)", wiki: "leagueoflegends" },
  { date: "2025-11-02", placement: "2", prizemoney: 200000, opponentname: "G2 Esports", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "T1", score: 1 }, qualifier: "LEC 2025 Summer (#1)", wiki: "leagueoflegends" },
  { date: "2025-11-02", placement: "3-4", prizemoney: 100000, opponentname: "Cloud9", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "G2 Esports", score: 0 }, qualifier: "LCS 2025 Summer (#1)", wiki: "leagueoflegends" },
  { date: "2025-11-02", placement: "3-4", prizemoney: 100000, opponentname: "Gen.G", opponenttype: "team", opponentplayers: {}, lastvsdata: { opponenttype: "team", opponentname: "T1", score: 2 }, qualifier: "LCK 2025 Summer (#2)", wiki: "leagueoflegends" },
];

// ── PLAYERS ───────────────────────────────────────────────────────────────────
export const PLAYERS = [
  // VALORANT
  {
    id: "Boaster", name: "Jake Howlett", type: "player", views: 54000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Boaster&backgroundColor=b6e3f4",
    nationality: "United Kingdom", region: "Europe",
    birthdate: "1995-05-25", teampagename: "Fnatic",
    links: { tiktok: "https://tiktok.com/@officialboaster", instagram: "https://www.instagram.com/OfficialBoaster", youtube: "https://www.youtube.com/OfficialBoaster", twitch: "https://www.twitch.tv/OfficialBoaster" },
    status: "Active",
    earnings: 421988,
    earningsbyyear: { "2020": 5198, "2021": 38005, "2022": 42685, "2023": 136833, "2024": 44600, "2025": 154667 },
    marketvalue: 1500000,
    marketvaluehistory: [
      { date: "2021-01", value: 120000 }, { date: "2022-01", value: 380000 },
      { date: "2023-01", value: 750000 }, { date: "2024-01", value: 1100000 },
      { date: "2025-01", value: 1350000 }, { date: "2025-10", value: 1500000 },
    ],
    career: [
      { year: "2019", team: "exceL Esports", note: "CS:GO → Valorant transition" },
      { year: "2020", team: "Fish123", note: "Early VALORANT scene, EU qualifier runs" },
      { year: "2021", team: "Fnatic", note: "Joined Fnatic — VCT Masters Berlin" },
      { year: "2022", team: "Fnatic", note: "VCT EMEA Stage 2 — Champions Istanbul SF" },
      { year: "2023", team: "Fnatic", note: "Champions 2023 — VCT EMEA franchise debut" },
      { year: "2024", team: "Fnatic", note: "VCT EMEA — team captain & IGL" },
      { year: "2025", team: "Fnatic", note: "Champions 2025 Grand Finalist (Paris)" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 31, gamesLabel: "maps",
      stats: [
        { label: "ACS", value: "168" },
        { label: "K/D", value: "1.02" },
        { label: "HS %", value: "21%" },
        { label: "KAST", value: "74%" },
      ],
      highlight: { label: "Top Agent", value: "Gekko" },
    },
    wiki: "valorant",
  },
  {
    id: "Alfajer", name: "Emir Ali Beder", type: "player", views: 72000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Alfajer&backgroundColor=c0aede",
    nationality: "Turkey", region: "Europe",
    birthdate: "2004-07-27", teampagename: "Fnatic",
    links: { instagram: "https://www.instagram.com/alfajerval", twitter: "https://twitter.com/alfajerval", twitch: "https://www.twitch.tv/alfajer" },
    status: "Active",
    earnings: 312500,
    earningsbyyear: { "2022": 22000, "2023": 108000, "2024": 44600, "2025": 137900 },
    marketvalue: 1200000,
    marketvaluehistory: [
      { date: "2022-06", value: 80000 }, { date: "2023-01", value: 400000 },
      { date: "2023-06", value: 700000 }, { date: "2024-01", value: 950000 },
      { date: "2025-01", value: 1050000 }, { date: "2025-10", value: 1200000 },
    ],
    career: [
      { year: "2021", team: "BEST", note: "Turkish amateur scene — TCL VCT Challengers" },
      { year: "2022", team: "FUT Esports", note: "VCT EMEA Challengers — breakout year" },
      { year: "2023", team: "Fnatic", note: "Signed mid-season — Champions 2023 breakthrough" },
      { year: "2024", team: "Fnatic", note: "VCT EMEA franchise — consistent S-tier duelist" },
      { year: "2025", team: "Fnatic", note: "Champions 2025 finalist (Paris)" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 38, gamesLabel: "maps",
      stats: [
        { label: "ACS", value: "256" },
        { label: "K/D", value: "1.41" },
        { label: "HS %", value: "33%" },
        { label: "KAST", value: "71%" },
      ],
      highlight: { label: "Top Agent", value: "Jett" },
    },
    wiki: "valorant",
  },
  {
    id: "s0m", name: "Samuel Oh", type: "player", views: 58000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=s0m&backgroundColor=ffd5dc",
    nationality: "United States", region: "Americas",
    birthdate: "2001-08-16", teampagename: "NRG",
    links: { twitter: "https://twitter.com/s0mcs", twitch: "https://www.twitch.tv/s0m", instagram: "https://www.instagram.com/s0mval" },
    status: "Active",
    earnings: 587000,
    earningsbyyear: { "2021": 45000, "2022": 89000, "2023": 178000, "2024": 120000, "2025": 155000 },
    marketvalue: 1800000,
    marketvaluehistory: [
      { date: "2021-01", value: 150000 }, { date: "2022-01", value: 420000 },
      { date: "2023-01", value: 900000 }, { date: "2024-01", value: 1400000 },
      { date: "2025-01", value: 1600000 }, { date: "2025-10", value: 1800000 },
    ],
    career: [
      { year: "2020", team: "T1", note: "Early NA Valorant — T1 first roster" },
      { year: "2021", team: "NRG", note: "Joined NRG — NSG Tournament wins" },
      { year: "2022", team: "Cloud9", note: "Brief stint — VCT NA Stage 1" },
      { year: "2022", team: "NRG", note: "Returned to NRG mid-year" },
      { year: "2023", team: "NRG", note: "VCT Americas — Champions 2023 run" },
      { year: "2024", team: "NRG", note: "VCT Americas franchise" },
      { year: "2025", team: "NRG", note: "Champions 2025 Winner — Grand Final MVP" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 42, gamesLabel: "maps",
      stats: [
        { label: "ACS", value: "243" },
        { label: "K/D", value: "1.37" },
        { label: "HS %", value: "39%" },
        { label: "KAST", value: "72%" },
      ],
      highlight: { label: "Top Agent", value: "Neon" },
    },
    wiki: "valorant",
  },
  {
    id: "f0rsakeN", name: "Jason Susanto", type: "player", views: 45000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=f0rsakeN&backgroundColor=ffdfbf",
    nationality: "Singapore", region: "Pacific",
    birthdate: "2002-03-07", teampagename: "Paper Rex",
    links: { twitter: "https://twitter.com/f0rsakeNCS", twitch: "https://www.twitch.tv/f0rsaken", instagram: "https://www.instagram.com/f0rsaken" },
    status: "Active",
    earnings: 342000,
    earningsbyyear: { "2022": 28000, "2023": 96000, "2024": 80000, "2025": 138000 },
    marketvalue: 1100000,
    marketvaluehistory: [
      { date: "2022-01", value: 90000 }, { date: "2023-01", value: 380000 },
      { date: "2024-01", value: 700000 }, { date: "2025-01", value: 950000 },
      { date: "2025-10", value: 1100000 },
    ],
    career: [
      { year: "2021", team: "F4Q", note: "Singapore amateur — VCT SEA Challengers" },
      { year: "2022", team: "Paper Rex", note: "Joined PRX — VCT Stage 1 Masters Reykjavik" },
      { year: "2023", team: "Paper Rex", note: "Champions 2023 — Pacific franchise" },
      { year: "2024", team: "Paper Rex", note: "VCT Pacific — consistent high-level duelist" },
      { year: "2025", team: "Paper Rex", note: "Champions 2025 Semifinalist (Paris)" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 35, gamesLabel: "maps",
      stats: [
        { label: "ACS", value: "239" },
        { label: "K/D", value: "1.32" },
        { label: "HS %", value: "42%" },
        { label: "KAST", value: "69%" },
      ],
      highlight: { label: "Top Agent", value: "Jett" },
    },
    wiki: "valorant",
  },
  {
    id: "Derke", name: "Nikita Sirmitev", type: "player", views: 49000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Derke&backgroundColor=d1d4f9",
    nationality: "Finland", region: "Europe",
    birthdate: "2002-07-21", teampagename: "Fnatic",
    links: { twitter: "https://twitter.com/derkeCS", twitch: "https://www.twitch.tv/derke", instagram: "https://www.instagram.com/derke_val" },
    status: "Active",
    earnings: 268900,
    earningsbyyear: { "2021": 18000, "2022": 42000, "2023": 90000, "2024": 44600, "2025": 74300 },
    marketvalue: 1000000,
    marketvaluehistory: [
      { date: "2021-06", value: 60000 }, { date: "2022-06", value: 210000 },
      { date: "2023-01", value: 580000 }, { date: "2024-01", value: 800000 },
      { date: "2025-01", value: 900000 }, { date: "2025-10", value: 1000000 },
    ],
    career: [
      { year: "2021", team: "Fnatic", note: "CS:GO to Valorant — immediate first team spot" },
      { year: "2022", team: "Fnatic", note: "VCT Masters Copenhagen — standout performance" },
      { year: "2023", team: "Fnatic", note: "Champions 2023 — named top 3 player in EMEA" },
      { year: "2024", team: "Fnatic", note: "VCT EMEA franchise — leading fragger" },
      { year: "2025", team: "Fnatic", note: "Champions 2025 finalist — Grand Final vs NRG" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 34, gamesLabel: "maps",
      stats: [
        { label: "ACS", value: "250" },
        { label: "K/D", value: "1.38" },
        { label: "HS %", value: "30%" },
        { label: "KAST", value: "70%" },
      ],
      highlight: { label: "Top Agent", value: "Raze" },
    },
    wiki: "valorant",
  },
  {
    id: "Chronicle", name: "Timofey Khromov", type: "player", views: 31000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Chronicle&backgroundColor=b6e3f4",
    nationality: "Russia", region: "Europe", birthdate: "2002-04-17", teampagename: "Fnatic",
    links: { twitter: "https://twitter.com/ChronicleVAL", twitch: "https://www.twitch.tv/chronicle" },
    status: "Active", earnings: 198000,
    earningsbyyear: { "2021": 8000, "2022": 22000, "2023": 86000, "2024": 44600, "2025": 37400 },
    marketvalue: 750000,
    marketvaluehistory: [{ date: "2022-01", value: 80000 }, { date: "2023-01", value: 320000 }, { date: "2024-01", value: 600000 }, { date: "2025-01", value: 750000 }],
    career: [
      { year: "2021", team: "Guild Esports", note: "EMEA Challengers — support debut" },
      { year: "2022", team: "VALORANT CIS", note: "CIS scene — breakout controller player" },
      { year: "2023", team: "Fnatic", note: "Joined Fnatic — VCT EMEA franchise" },
      { year: "2025", team: "Fnatic", note: "Champions 2025 finalist (Paris)" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 31, gamesLabel: "maps",
      stats: [{ label: "ACS", value: "162" }, { label: "K/D", value: "1.08" }, { label: "HS %", value: "19%" }, { label: "KAST", value: "75%" }],
      highlight: { label: "Top Agent", value: "Omen" } },
    wiki: "valorant",
  },
  {
    id: "Leo", name: "Leo Jannesson", type: "player", views: 28000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Leo&backgroundColor=c0aede",
    nationality: "Sweden", region: "Europe", birthdate: "2000-07-10", teampagename: "Fnatic",
    links: { twitter: "https://twitter.com/LeoVAL", twitch: "https://www.twitch.tv/leoval" },
    status: "Active", earnings: 172000,
    earningsbyyear: { "2022": 18000, "2023": 82000, "2024": 44600, "2025": 27400 },
    marketvalue: 700000,
    marketvaluehistory: [{ date: "2022-06", value: 60000 }, { date: "2023-01", value: 280000 }, { date: "2024-01", value: 550000 }, { date: "2025-01", value: 700000 }],
    career: [
      { year: "2022", team: "NAVI", note: "EMEA Challengers — initiator specialist" },
      { year: "2023", team: "Fnatic", note: "VCT EMEA franchise debut" },
      { year: "2025", team: "Fnatic", note: "Champions 2025 finalist (Paris)" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 31, gamesLabel: "maps",
      stats: [{ label: "ACS", value: "171" }, { label: "K/D", value: "1.05" }, { label: "HS %", value: "23%" }, { label: "KAST", value: "76%" }],
      highlight: { label: "Top Agent", value: "Fade" } },
    wiki: "valorant",
  },
  {
    id: "ardiis", name: "Ardis Svarenieks", type: "player", views: 42000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=ardiis&backgroundColor=ffd5dc",
    nationality: "Latvia", region: "Europe", birthdate: "1999-04-16", teampagename: "NRG",
    links: { twitter: "https://twitter.com/ardiis", twitch: "https://www.twitch.tv/ardiis" },
    status: "Active", earnings: 412000,
    earningsbyyear: { "2021": 28000, "2022": 64000, "2023": 128000, "2024": 62000, "2025": 130000 },
    marketvalue: 1100000,
    marketvaluehistory: [{ date: "2021-01", value: 120000 }, { date: "2022-01", value: 380000 }, { date: "2023-01", value: 700000 }, { date: "2024-01", value: 900000 }, { date: "2025-01", value: 1100000 }],
    career: [
      { year: "2021", team: "Fnatic", note: "Early EMEA Valorant — standout duelist" },
      { year: "2022", team: "Fnatic", note: "VCT EMEA — top-rated duelist" },
      { year: "2024", team: "NRG", note: "Joined NRG from Fnatic" },
      { year: "2025", team: "NRG", note: "Champions 2025 Winner" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 42, gamesLabel: "maps",
      stats: [{ label: "ACS", value: "228" }, { label: "K/D", value: "1.28" }, { label: "HS %", value: "44%" }, { label: "KAST", value: "74%" }],
      highlight: { label: "Top Agent", value: "KAY/O" } },
    wiki: "valorant",
  },
  {
    id: "crashies", name: "Austin Roberts", type: "player", views: 38000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=crashies&backgroundColor=ffdfbf",
    nationality: "United States", region: "Americas", birthdate: "2000-07-30", teampagename: "NRG",
    links: { twitter: "https://twitter.com/crashies", twitch: "https://www.twitch.tv/crashies" },
    status: "Active", earnings: 340000,
    earningsbyyear: { "2021": 40000, "2022": 74000, "2023": 106000, "2024": 50000, "2025": 70000 },
    marketvalue: 900000,
    marketvaluehistory: [{ date: "2021-01", value: 100000 }, { date: "2022-01", value: 320000 }, { date: "2023-01", value: 600000 }, { date: "2024-01", value: 780000 }, { date: "2025-01", value: 900000 }],
    career: [
      { year: "2021", team: "Version1", note: "NA Valorant — consistent initiator" },
      { year: "2022", team: "NRG", note: "Joined NRG — VCT Americas" },
      { year: "2025", team: "NRG", note: "Champions 2025 Winner" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 42, gamesLabel: "maps",
      stats: [{ label: "ACS", value: "194" }, { label: "K/D", value: "1.14" }, { label: "HS %", value: "31%" }, { label: "KAST", value: "77%" }],
      highlight: { label: "Top Agent", value: "Sova" } },
    wiki: "valorant",
  },
  {
    id: "Jinggg", name: "Wang Jing Jie", type: "player", views: 35000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Jinggg&backgroundColor=d1d4f9",
    nationality: "Singapore", region: "Pacific", birthdate: "2001-08-14", teampagename: "Paper Rex",
    links: { twitter: "https://twitter.com/Jinggg_", twitch: "https://www.twitch.tv/jinggg" },
    status: "Active", earnings: 210000,
    earningsbyyear: { "2022": 24000, "2023": 76000, "2024": 34000, "2025": 76000 },
    marketvalue: 800000,
    marketvaluehistory: [{ date: "2022-01", value: 70000 }, { date: "2023-01", value: 320000 }, { date: "2024-01", value: 580000 }, { date: "2025-01", value: 800000 }],
    career: [
      { year: "2021", team: "Paper Rex", note: "Pacific scene debut — explosive duelist" },
      { year: "2023", team: "Paper Rex", note: "Champions 2023 — Pacific franchise" },
      { year: "2025", team: "Paper Rex", note: "Champions 2025 Semifinalist (Paris)" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 35, gamesLabel: "maps",
      stats: [{ label: "ACS", value: "231" }, { label: "K/D", value: "1.29" }, { label: "HS %", value: "38%" }, { label: "KAST", value: "70%" }],
      highlight: { label: "Top Agent", value: "Raze" } },
    wiki: "valorant",
  },
  // CS2
  {
    id: "s1mple", name: "Oleksandr Kostyliev", type: "player", views: 98000, imageurl: "https://liquipedia.net/commons/images/thumb/d/d5/S1mple_at_IEM_Cologne_2022.jpg/265px-S1mple_at_IEM_Cologne_2022.jpg",
    nationality: "Ukraine", region: "Europe",
    birthdate: "1997-10-02", teampagename: "NAVI",
    links: { twitter: "https://twitter.com/s1mpleO", twitch: "https://www.twitch.tv/s1mple", instagram: "https://www.instagram.com/s1mple" },
    status: "Active",
    earnings: 1842000,
    earningsbyyear: { "2019": 280000, "2020": 180000, "2021": 560000, "2022": 320000, "2023": 210000, "2024": 180000, "2025": 112000 },
    marketvalue: 3500000,
    marketvaluehistory: [
      { date: "2019-01", value: 1200000 }, { date: "2020-01", value: 1800000 },
      { date: "2021-01", value: 3000000 }, { date: "2022-01", value: 3800000 },
      { date: "2023-01", value: 3500000 }, { date: "2024-01", value: 3200000 },
      { date: "2025-01", value: 3500000 },
    ],
    career: [
      { year: "2013", team: "HellRaisers", note: "CS:GO professional debut" },
      { year: "2014", team: "Flipsid3 Tactics", note: "First tier-1 results" },
      { year: "2016", team: "Team Liquid", note: "Short stint — ESL Pro League" },
      { year: "2016", team: "NAVI", note: "Career-defining move — instant #1 ranking" },
      { year: "2018", team: "NAVI", note: "FACEIT Major champion — HLTV #1 for 2018" },
      { year: "2021", team: "NAVI", note: "PGL Major Stockholm champion — HLTV #1 again" },
      { year: "2022", team: "NAVI", note: "IEM Katowice & Cologne champion" },
      { year: "2025", team: "NAVI", note: "EPL Season 21 — continued dominance" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 44, gamesLabel: "maps",
      stats: [
        { label: "Rating", value: "1.31" },
        { label: "K/D", value: "1.44" },
        { label: "KAST", value: "75%" },
        { label: "HS %", value: "37%" },
      ],
      highlight: { label: "Best Map", value: "Mirage" },
    },
    wiki: "counterstrike",
  },
  {
    id: "NiKo", name: "Nikola Kovač", type: "player", views: 87000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=NiKo&backgroundColor=c0aede",
    nationality: "Bosnia and Herzegovina", region: "Europe",
    birthdate: "1997-02-16", teampagename: "G2 Esports",
    links: { twitter: "https://twitter.com/NiKoCSGO", twitch: "https://www.twitch.tv/niko", instagram: "https://www.instagram.com/niko" },
    status: "Active",
    earnings: 1690000,
    earningsbyyear: { "2019": 240000, "2020": 120000, "2021": 310000, "2022": 280000, "2023": 340000, "2024": 210000, "2025": 190000 },
    marketvalue: 3000000,
    marketvaluehistory: [
      { date: "2019-01", value: 900000 }, { date: "2020-01", value: 1200000 },
      { date: "2021-01", value: 2200000 }, { date: "2022-01", value: 2800000 },
      { date: "2023-01", value: 3200000 }, { date: "2024-01", value: 3000000 },
      { date: "2025-01", value: 3000000 },
    ],
    career: [
      { year: "2013", team: "mousesports", note: "CS:GO debut — youngest player in ESL" },
      { year: "2017", team: "FaZe Clan", note: "Joined FaZe — IEM Katowice champion" },
      { year: "2018", team: "FaZe Clan", note: "HLTV #2 player — FACEIT Major finalist" },
      { year: "2019", team: "FaZe Clan", note: "IGL role added alongside star play" },
      { year: "2021", team: "G2 Esports", note: "Joined G2 — PGL Major finalist" },
      { year: "2022", team: "G2 Esports", note: "IEM Katowice champion with G2" },
      { year: "2023", team: "G2 Esports", note: "HLTV #3 — consistent top-3 ranking" },
      { year: "2025", team: "G2 Esports", note: "EPL Season 21 finalist" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 48, gamesLabel: "maps",
      stats: [
        { label: "Rating", value: "1.21" },
        { label: "K/D", value: "1.28" },
        { label: "KAST", value: "73%" },
        { label: "HS %", value: "61%" },
      ],
      highlight: { label: "Best Map", value: "Inferno" },
    },
    wiki: "counterstrike",
  },
  {
    id: "ZywOo", name: "Mathieu Herbaut", type: "player", views: 91000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=ZywOo&backgroundColor=ffd5dc",
    nationality: "France", region: "Europe", birthdate: "2000-11-09", teampagename: "Team Vitality",
    links: { twitter: "https://twitter.com/ZywOo", twitch: "https://www.twitch.tv/zywoo" },
    status: "Active", earnings: 1240000,
    earningsbyyear: { "2019": 80000, "2020": 120000, "2021": 280000, "2022": 310000, "2023": 280000, "2024": 120000, "2025": 50000 },
    marketvalue: 4500000,
    marketvaluehistory: [{ date: "2019-01", value: 800000 }, { date: "2020-01", value: 1800000 }, { date: "2021-01", value: 3000000 }, { date: "2022-01", value: 3800000 }, { date: "2023-01", value: 4200000 }, { date: "2025-01", value: 4500000 }],
    career: [
      { year: "2018", team: "G2 Esports", note: "CS:GO pro debut at 17 — instant impact" },
      { year: "2019", team: "Team Vitality", note: "HLTV #1 player — youngest ever to achieve" },
      { year: "2022", team: "Team Vitality", note: "Multiple S-tier titles — HLTV #1 again" },
      { year: "2025", team: "Team Vitality", note: "Continued dominance — top AWPer in world" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 48, gamesLabel: "maps",
      stats: [{ label: "Rating", value: "1.38" }, { label: "K/D", value: "1.52" }, { label: "KAST", value: "77%" }, { label: "HS %", value: "34%" }],
      highlight: { label: "Best Map", value: "Dust2" } },
    wiki: "counterstrike",
  },
  {
    id: "device", name: "Nicolai Reedtz", type: "player", views: 76000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=device&backgroundColor=ffdfbf",
    nationality: "Denmark", region: "Europe", birthdate: "1996-08-08", teampagename: "Astralis",
    links: { twitter: "https://twitter.com/dev1ce", twitch: "https://www.twitch.tv/dev1ce" },
    status: "Active", earnings: 3200000,
    earningsbyyear: { "2019": 600000, "2020": 500000, "2021": 480000, "2022": 580000, "2023": 520000, "2024": 380000, "2025": 140000 },
    marketvalue: 2800000,
    marketvaluehistory: [{ date: "2019-01", value: 2000000 }, { date: "2020-01", value: 2800000 }, { date: "2021-01", value: 3200000 }, { date: "2023-01", value: 3000000 }, { date: "2025-01", value: 2800000 }],
    career: [
      { year: "2014", team: "Astralis", note: "HLTV Top 5 — AWPer debut" },
      { year: "2018", team: "Astralis", note: "4× Major champion — HLTV #1" },
      { year: "2021", team: "NIP", note: "Short stint — returned to Astralis" },
      { year: "2025", team: "Astralis", note: "Elder statesman — still world class" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 40, gamesLabel: "maps",
      stats: [{ label: "Rating", value: "1.18" }, { label: "K/D", value: "1.24" }, { label: "KAST", value: "74%" }, { label: "HS %", value: "32%" }],
      highlight: { label: "Best Map", value: "Nuke" } },
    wiki: "counterstrike",
  },
  {
    id: "electronic", name: "Denis Sharipov", type: "player", views: 54000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=electronic&backgroundColor=d1d4f9",
    nationality: "Russia", region: "Europe", birthdate: "1997-10-23", teampagename: "NAVI",
    links: { twitter: "https://twitter.com/electroNicCSGO", twitch: "https://www.twitch.tv/electronic" },
    status: "Active", earnings: 1400000,
    earningsbyyear: { "2019": 280000, "2020": 180000, "2021": 380000, "2022": 280000, "2023": 180000, "2024": 60000, "2025": 40000 },
    marketvalue: 2200000,
    marketvaluehistory: [{ date: "2019-01", value: 800000 }, { date: "2021-01", value: 1800000 }, { date: "2022-01", value: 2400000 }, { date: "2025-01", value: 2200000 }],
    career: [
      { year: "2017", team: "Flipsid3", note: "Rifler debut — CIS scene" },
      { year: "2018", team: "NAVI", note: "Joined s1mple — instant synergy" },
      { year: "2021", team: "NAVI", note: "PGL Major champion — HLTV #4" },
      { year: "2025", team: "NAVI", note: "EPL S21 champion" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 44, gamesLabel: "maps",
      stats: [{ label: "Rating", value: "1.22" }, { label: "K/D", value: "1.28" }, { label: "KAST", value: "76%" }, { label: "HS %", value: "58%" }],
      highlight: { label: "Best Map", value: "Mirage" } },
    wiki: "counterstrike",
  },
  {
    id: "b1t", name: "Valentin Vakhovskiy", type: "player", views: 48000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=b1t&backgroundColor=b6e3f4",
    nationality: "Ukraine", region: "Europe", birthdate: "2002-04-13", teampagename: "NAVI",
    links: { twitter: "https://twitter.com/b1t_cs", twitch: "https://www.twitch.tv/b1t" },
    status: "Active", earnings: 820000,
    earningsbyyear: { "2021": 180000, "2022": 220000, "2023": 180000, "2024": 120000, "2025": 120000 },
    marketvalue: 2000000,
    marketvaluehistory: [{ date: "2021-01", value: 400000 }, { date: "2022-01", value: 1200000 }, { date: "2023-01", value: 1800000 }, { date: "2025-01", value: 2000000 }],
    career: [
      { year: "2020", team: "Natus Vincere", note: "Youngest NAVI starter — immediate S-tier debut" },
      { year: "2021", team: "NAVI", note: "Major champion — HLTV #10 at just 19" },
      { year: "2025", team: "NAVI", note: "EPL S21 champion — maturing into elite rifler" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 44, gamesLabel: "maps",
      stats: [{ label: "Rating", value: "1.19" }, { label: "K/D", value: "1.22" }, { label: "KAST", value: "74%" }, { label: "HS %", value: "62%" }],
      highlight: { label: "Best Map", value: "Inferno" } },
    wiki: "counterstrike",
  },
  {
    id: "huNter-", name: "Nemanja Kovač", type: "player", views: 61000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=huNter&backgroundColor=c0aede",
    nationality: "Bosnia and Herzegovina", region: "Europe", birthdate: "1997-11-23", teampagename: "G2 Esports",
    links: { twitter: "https://twitter.com/huNtercsgo", twitch: "https://www.twitch.tv/hunter" },
    status: "Active", earnings: 1100000,
    earningsbyyear: { "2019": 180000, "2020": 120000, "2021": 260000, "2022": 240000, "2023": 180000, "2024": 80000, "2025": 40000 },
    marketvalue: 2400000,
    marketvaluehistory: [{ date: "2019-01", value: 600000 }, { date: "2021-01", value: 1600000 }, { date: "2022-01", value: 2200000 }, { date: "2025-01", value: 2400000 }],
    career: [
      { year: "2018", team: "FaZe Clan", note: "Breakout — NiKo's cousin joins tier-1" },
      { year: "2020", team: "G2 Esports", note: "Joined NiKo at G2 — powerful duo" },
      { year: "2022", team: "G2 Esports", note: "IEM Katowice champion" },
      { year: "2025", team: "G2 Esports", note: "EPL S21 finalist" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 48, gamesLabel: "maps",
      stats: [{ label: "Rating", value: "1.16" }, { label: "K/D", value: "1.21" }, { label: "KAST", value: "73%" }, { label: "HS %", value: "59%" }],
      highlight: { label: "Best Map", value: "Mirage" } },
    wiki: "counterstrike",
  },
  {
    id: "ropz", name: "Robin Kool", type: "player", views: 58000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=ropz&backgroundColor=ffd5dc",
    nationality: "Estonia", region: "Europe", birthdate: "2000-03-12", teampagename: "FaZe Clan",
    links: { twitter: "https://twitter.com/ropzCSGO", twitch: "https://www.twitch.tv/ropz" },
    status: "Active", earnings: 1200000,
    earningsbyyear: { "2019": 80000, "2020": 120000, "2021": 280000, "2022": 360000, "2023": 240000, "2024": 80000, "2025": 40000 },
    marketvalue: 2600000,
    marketvaluehistory: [{ date: "2019-01", value: 400000 }, { date: "2021-01", value: 1400000 }, { date: "2022-01", value: 2400000 }, { date: "2025-01", value: 2600000 }],
    career: [
      { year: "2019", team: "mousesports", note: "Debut — HLTV #8 in first full year" },
      { year: "2022", team: "FaZe Clan", note: "Joined FaZe — IEM Katowice finalist" },
      { year: "2023", team: "FaZe Clan", note: "IEM Sydney winner — HLTV #6" },
      { year: "2025", team: "FaZe Clan", note: "EPL S21 Semifinalist" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 46, gamesLabel: "maps",
      stats: [{ label: "Rating", value: "1.24" }, { label: "K/D", value: "1.32" }, { label: "KAST", value: "78%" }, { label: "HS %", value: "54%" }],
      highlight: { label: "Best Map", value: "Ancient" } },
    wiki: "counterstrike",
  },
  {
    id: "sh1ro", name: "Dmitry Sokolov", type: "player", views: 44000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=sh1ro&backgroundColor=ffdfbf",
    nationality: "Russia", region: "Europe", birthdate: "2001-08-09", teampagename: "Cloud9",
    links: { twitter: "https://twitter.com/sh1ro_cs", twitch: "https://www.twitch.tv/sh1ro" },
    status: "Active", earnings: 700000,
    earningsbyyear: { "2021": 80000, "2022": 180000, "2023": 220000, "2024": 140000, "2025": 80000 },
    marketvalue: 2100000,
    marketvaluehistory: [{ date: "2021-01", value: 300000 }, { date: "2022-01", value: 900000 }, { date: "2023-01", value: 1600000 }, { date: "2025-01", value: 2100000 }],
    career: [
      { year: "2021", team: "Cloud9", note: "Debut — instantly one of CIS's best AWPers" },
      { year: "2022", team: "Cloud9", note: "HLTV #8 — best AWPer outside top-2 org" },
      { year: "2025", team: "Cloud9", note: "Continued elite AWPing with C9" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 42, gamesLabel: "maps",
      stats: [{ label: "Rating", value: "1.28" }, { label: "K/D", value: "1.38" }, { label: "KAST", value: "75%" }, { label: "HS %", value: "36%" }],
      highlight: { label: "Best Map", value: "Vertigo" } },
    wiki: "counterstrike",
  },
  {
    id: "broky", name: "Helvijs Saukants", type: "player", views: 39000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=broky&backgroundColor=d1d4f9",
    nationality: "Latvia", region: "Europe", birthdate: "2000-09-20", teampagename: "FaZe Clan",
    links: { twitter: "https://twitter.com/brokyCSGO", twitch: "https://www.twitch.tv/broky" },
    status: "Active", earnings: 900000,
    earningsbyyear: { "2020": 80000, "2021": 180000, "2022": 260000, "2023": 220000, "2024": 100000, "2025": 60000 },
    marketvalue: 1800000,
    marketvaluehistory: [{ date: "2020-01", value: 300000 }, { date: "2021-01", value: 800000 }, { date: "2022-01", value: 1600000 }, { date: "2025-01", value: 1800000 }],
    career: [
      { year: "2020", team: "FaZe Clan", note: "Teen debut — youngest FaZe starter" },
      { year: "2021", team: "FaZe Clan", note: "HLTV #9 — elite AWP/rifle hybrid" },
      { year: "2025", team: "FaZe Clan", note: "EPL S21 Semifinalist" },
    ],
    recentstats: { period: "Jan – Apr 2026", games: 46, gamesLabel: "maps",
      stats: [{ label: "Rating", value: "1.14" }, { label: "K/D", value: "1.19" }, { label: "KAST", value: "72%" }, { label: "HS %", value: "38%" }],
      highlight: { label: "Best Map", value: "Inferno" } },
    wiki: "counterstrike",
  },
  // League of Legends
  {
    id: "Faker", name: "Lee Sang-hyeok", type: "player", views: 125000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Faker&backgroundColor=b6e3f4",
    nationality: "South Korea", region: "Korea",
    birthdate: "1996-05-07", teampagename: "T1",
    links: { twitter: "https://twitter.com/faker", twitch: "https://www.twitch.tv/faker", instagram: "https://www.instagram.com/faker", youtube: "https://www.youtube.com/c/Faker" },
    status: "Active",
    earnings: 4810000,
    earningsbyyear: { "2015": 120000, "2016": 180000, "2017": 240000, "2018": 180000, "2019": 380000, "2020": 290000, "2021": 520000, "2022": 680000, "2023": 820000, "2024": 420000, "2025": 200000 },
    marketvalue: 5000000,
    marketvaluehistory: [
      { date: "2019-01", value: 2500000 }, { date: "2020-01", value: 3000000 },
      { date: "2021-01", value: 3800000 }, { date: "2022-01", value: 4500000 },
      { date: "2023-01", value: 5200000 }, { date: "2024-01", value: 4800000 },
      { date: "2025-01", value: 5000000 },
    ],
    career: [
      { year: "2013", team: "SKT T1", note: "Pro debut — World Champion (1st title)" },
      { year: "2015", team: "SKT T1", note: "World Champion (2nd & 3rd title)" },
      { year: "2017", team: "SKT T1", note: "4x World Champion — undisputed GOAT" },
      { year: "2019", team: "T1", note: "Rebranded to T1 — continued LCK dominance" },
      { year: "2021", team: "T1", note: "Worlds finalist — returned to championship form" },
      { year: "2023", team: "T1", note: "World Champion (4th title) — historic run" },
      { year: "2025", team: "T1", note: "World Champion (5th title) — Worlds 2025 Shanghai" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 48, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "4.2" },
        { label: "Win Rate", value: "72%" },
        { label: "CS/min", value: "8.8" },
        { label: "Vision", value: "32" },
      ],
      highlight: { label: "Top Champion", value: "Azir" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "Caps", name: "Rasmus Borregaard Winther", type: "player", views: 68000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Caps&backgroundColor=c0aede",
    nationality: "Denmark", region: "Europe",
    birthdate: "1999-11-06", teampagename: "G2 Esports",
    links: { twitter: "https://twitter.com/G2Caps", twitch: "https://www.twitch.tv/caps", instagram: "https://www.instagram.com/g2caps" },
    status: "Active",
    earnings: 2100000,
    earningsbyyear: { "2020": 180000, "2021": 320000, "2022": 410000, "2023": 580000, "2024": 390000, "2025": 220000 },
    marketvalue: 2500000,
    marketvaluehistory: [
      { date: "2020-01", value: 600000 }, { date: "2021-01", value: 1200000 },
      { date: "2022-01", value: 1800000 }, { date: "2023-01", value: 2400000 },
      { date: "2024-01", value: 2200000 }, { date: "2025-01", value: 2500000 },
    ],
    career: [
      { year: "2017", team: "Fnatic", note: "LEC debut — immediate starter" },
      { year: "2018", team: "Fnatic", note: "Worlds finalist — 'Baby Faker' era" },
      { year: "2019", team: "G2 Esports", note: "Joined G2 — MSI & Worlds finalist" },
      { year: "2021", team: "G2 Esports", note: "3x LEC Champion — dominant split" },
      { year: "2022", team: "G2 Esports", note: "Worlds Semifinalist" },
      { year: "2024", team: "G2 Esports", note: "Worlds Semifinalist" },
      { year: "2025", team: "G2 Esports", note: "Worlds 2025 Finalist (Shanghai)" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 45, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "3.8" },
        { label: "Win Rate", value: "65%" },
        { label: "CS/min", value: "9.1" },
        { label: "Vision", value: "28" },
      ],
      highlight: { label: "Top Champion", value: "Viktor" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "Ruler", name: "Park Jae-hyuk", type: "player", views: 61000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Ruler&backgroundColor=ffd5dc",
    nationality: "South Korea", region: "Korea",
    birthdate: "2000-07-18", teampagename: "T1",
    links: { twitter: "https://twitter.com/RulerLoL", instagram: "https://www.instagram.com/ruler_lol" },
    status: "Active",
    earnings: 1650000,
    earningsbyyear: { "2021": 190000, "2022": 380000, "2023": 490000, "2024": 380000, "2025": 210000 },
    marketvalue: 2000000,
    marketvaluehistory: [
      { date: "2021-01", value: 400000 }, { date: "2022-01", value: 900000 },
      { date: "2023-01", value: 1400000 }, { date: "2024-01", value: 1800000 },
      { date: "2025-01", value: 2000000 },
    ],
    career: [
      { year: "2017", team: "Samsung Galaxy", note: "World Champion (Samsung) — rookie year" },
      { year: "2018", team: "Gen.G", note: "Samsung rebranded to Gen.G" },
      { year: "2022", team: "Gen.G", note: "Worlds finalist with Gen.G" },
      { year: "2023", team: "Gen.G", note: "LCK champion — top ADC in Korea" },
      { year: "2024", team: "T1", note: "Signed with T1 — superteam formed" },
      { year: "2025", team: "T1", note: "World Champion with T1 — 2nd title" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 51, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "5.1" },
        { label: "Win Rate", value: "68%" },
        { label: "CS/min", value: "9.8" },
        { label: "Vision", value: "18" },
      ],
      highlight: { label: "Top Champion", value: "Jinx" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "Jankos", name: "Marcin Jankowski", type: "player", views: 38000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Jankos&backgroundColor=ffdfbf",
    nationality: "Poland", region: "Europe",
    birthdate: "1996-03-17", teampagename: "G2 Esports",
    links: { twitter: "https://twitter.com/Jankos", twitch: "https://www.twitch.tv/jankos", instagram: "https://www.instagram.com/jankosprimus" },
    status: "Active",
    earnings: 1920000,
    earningsbyyear: { "2019": 280000, "2020": 310000, "2021": 390000, "2022": 340000, "2023": 420000, "2024": 180000 },
    marketvalue: 1200000,
    marketvaluehistory: [
      { date: "2019-01", value: 800000 }, { date: "2020-01", value: 1200000 },
      { date: "2021-01", value: 1600000 }, { date: "2022-01", value: 1500000 },
      { date: "2023-01", value: 1400000 }, { date: "2024-01", value: 1200000 },
    ],
    career: [
      { year: "2014", team: "H2K", note: "LCS EU debut — first pro contract" },
      { year: "2016", team: "Roccat", note: "EU LCS — rising jungle star" },
      { year: "2018", team: "G2 Esports", note: "Joined G2 — LEC champion x3" },
      { year: "2019", team: "G2 Esports", note: "MSI finalist — Worlds finalist" },
      { year: "2021", team: "G2 Esports", note: "LEC Spring & Summer champion" },
      { year: "2022", team: "Cloud9", note: "Brief NA stint — LCS" },
      { year: "2023", team: "G2 Esports", note: "Returned to G2 — Worlds Semifinalist" },
      { year: "2025", team: "G2 Esports", note: "Worlds 2025 Finalist (Shanghai)" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 43, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "3.2" },
        { label: "Win Rate", value: "62%" },
        { label: "CS/min", value: "4.9" },
        { label: "Vision", value: "44" },
      ],
      highlight: { label: "Top Champion", value: "Vi" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "Chovy", name: "Jeong Ji-hoon", type: "player", views: 72000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Chovy&backgroundColor=d1f4cc",
    nationality: "South Korea", region: "Korea",
    birthdate: "2000-04-04", teampagename: "Gen.G",
    links: { twitter: "https://twitter.com/chovy_lol", instagram: "https://www.instagram.com/chovy_lol" },
    status: "Active",
    earnings: 1800000,
    earningsbyyear: { "2020": 160000, "2021": 320000, "2022": 480000, "2023": 520000, "2024": 320000 },
    marketvalue: 2800000,
    marketvaluehistory: [
      { date: "2020-01", value: 500000 }, { date: "2021-01", value: 1000000 },
      { date: "2022-01", value: 1800000 }, { date: "2023-01", value: 2400000 },
      { date: "2024-01", value: 2800000 },
    ],
    career: [
      { year: "2019", team: "Griffin", note: "LCK debut — immediately considered top mid" },
      { year: "2021", team: "Hanwha Life Esports", note: "Consistent top LCK mid laner" },
      { year: "2022", team: "Gen.G", note: "Joined Gen.G — LCK champion" },
      { year: "2024", team: "Gen.G", note: "Worlds Semifinalist — best KDA in history" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 50, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "6.8" },
        { label: "Win Rate", value: "71%" },
        { label: "CS/min", value: "9.4" },
        { label: "Vision", value: "26" },
      ],
      highlight: { label: "Top Champion", value: "Taliyah" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "Zeus", name: "Choi Woo-je", type: "player", views: 55000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Zeus&backgroundColor=ffebc8",
    nationality: "South Korea", region: "Korea",
    birthdate: "2003-08-31", teampagename: "T1",
    links: { twitter: "https://twitter.com/T1Zeus", instagram: "https://www.instagram.com/zeus_t1" },
    status: "Active",
    earnings: 980000,
    earningsbyyear: { "2022": 180000, "2023": 320000, "2024": 280000, "2025": 200000 },
    marketvalue: 1800000,
    marketvaluehistory: [
      { date: "2022-01", value: 400000 }, { date: "2023-01", value: 900000 },
      { date: "2024-01", value: 1500000 }, { date: "2025-01", value: 1800000 },
    ],
    career: [
      { year: "2022", team: "T1", note: "Pro debut at T1 — World Champion (rookie)" },
      { year: "2023", team: "T1", note: "World Champion — dominant top laner" },
      { year: "2025", team: "T1", note: "World Champion (5th title with T1)" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 48, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "4.5" },
        { label: "Win Rate", value: "69%" },
        { label: "CS/min", value: "8.6" },
        { label: "Vision", value: "20" },
      ],
      highlight: { label: "Top Champion", value: "Garen" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "Keria", name: "Ryu Min-seok", type: "player", views: 48000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Keria&backgroundColor=c9e8ff",
    nationality: "South Korea", region: "Korea",
    birthdate: "2002-04-01", teampagename: "T1",
    links: { twitter: "https://twitter.com/T1Keria", instagram: "https://www.instagram.com/keria_t1" },
    status: "Active",
    earnings: 920000,
    earningsbyyear: { "2021": 140000, "2022": 220000, "2023": 310000, "2024": 250000 },
    marketvalue: 1600000,
    marketvaluehistory: [
      { date: "2021-01", value: 300000 }, { date: "2022-01", value: 700000 },
      { date: "2023-01", value: 1200000 }, { date: "2024-01", value: 1600000 },
    ],
    career: [
      { year: "2021", team: "T1", note: "Debut with T1 — instant impact as support" },
      { year: "2022", team: "T1", note: "World Champion — best support in the world" },
      { year: "2023", team: "T1", note: "World Champion (2nd)" },
      { year: "2025", team: "T1", note: "World Champion (3rd) — Worlds Shanghai" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 48, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "7.2" },
        { label: "Win Rate", value: "70%" },
        { label: "CS/min", value: "1.2" },
        { label: "Vision", value: "68" },
      ],
      highlight: { label: "Top Champion", value: "Thresh" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "BrokenBlade", name: "Sergen Çelik", type: "player", views: 41000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=BrokenBlade&backgroundColor=f5c6cb",
    nationality: "Germany", region: "Europe",
    birthdate: "2000-11-18", teampagename: "G2 Esports",
    links: { twitter: "https://twitter.com/BrokenBladeLol", twitch: "https://www.twitch.tv/brokenblade" },
    status: "Active",
    earnings: 1100000,
    earningsbyyear: { "2020": 140000, "2021": 220000, "2022": 260000, "2023": 300000, "2024": 180000 },
    marketvalue: 1400000,
    marketvaluehistory: [
      { date: "2020-01", value: 300000 }, { date: "2021-01", value: 700000 },
      { date: "2022-01", value: 1000000 }, { date: "2023-01", value: 1300000 },
      { date: "2024-01", value: 1400000 },
    ],
    career: [
      { year: "2019", team: "Schalke 04", note: "LEC debut — promising top laner" },
      { year: "2020", team: "Team Vitality", note: "Joined Vitality — LEC growth" },
      { year: "2023", team: "G2 Esports", note: "Signed with G2 — Worlds finalist" },
      { year: "2025", team: "G2 Esports", note: "Worlds 2025 Finalist (Shanghai)" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 44, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "3.6" },
        { label: "Win Rate", value: "63%" },
        { label: "CS/min", value: "8.3" },
        { label: "Vision", value: "22" },
      ],
      highlight: { label: "Top Champion", value: "Aatrox" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "ShowMaker", name: "Heo Su", type: "player", views: 44000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=ShowMaker&backgroundColor=e8d5ff",
    nationality: "South Korea", region: "Korea",
    birthdate: "2000-02-16", teampagename: "Dplus",
    links: { twitter: "https://twitter.com/ShowMakerLoL", instagram: "https://www.instagram.com/showmaker_lol" },
    status: "Active",
    earnings: 1550000,
    earningsbyyear: { "2020": 240000, "2021": 360000, "2022": 400000, "2023": 320000, "2024": 230000 },
    marketvalue: 1700000,
    marketvaluehistory: [
      { date: "2020-01", value: 600000 }, { date: "2021-01", value: 1200000 },
      { date: "2022-01", value: 1600000 }, { date: "2023-01", value: 1700000 },
      { date: "2024-01", value: 1500000 },
    ],
    career: [
      { year: "2019", team: "DAMWON Gaming", note: "LCK debut — mechanical prodigy" },
      { year: "2020", team: "DAMWON Gaming", note: "World Champion — dominant mid" },
      { year: "2021", team: "DWG KIA", note: "Worlds Finalist — 2x champion run" },
      { year: "2023", team: "Dplus KIA", note: "Worlds Semifinalist" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 46, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "5.4" },
        { label: "Win Rate", value: "64%" },
        { label: "CS/min", value: "9.2" },
        { label: "Vision", value: "24" },
      ],
      highlight: { label: "Top Champion", value: "Syndra" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "Hans sama", name: "Steven Liv", type: "player", views: 36000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Hanssama&backgroundColor=ffe4c4",
    nationality: "France", region: "Europe",
    birthdate: "1999-07-23", teampagename: "G2 Esports",
    links: { twitter: "https://twitter.com/Hans_sama", twitch: "https://www.twitch.tv/hanssama" },
    status: "Active",
    earnings: 980000,
    earningsbyyear: { "2020": 140000, "2021": 200000, "2022": 260000, "2023": 220000, "2024": 160000 },
    marketvalue: 1200000,
    marketvaluehistory: [
      { date: "2020-01", value: 350000 }, { date: "2021-01", value: 700000 },
      { date: "2022-01", value: 1000000 }, { date: "2023-01", value: 1200000 },
      { date: "2024-01", value: 1100000 },
    ],
    career: [
      { year: "2018", team: "Misfits", note: "LEC ADC debut" },
      { year: "2021", team: "Team Vitality", note: "Vitality move — LEC playoffs" },
      { year: "2022", team: "Team Liquid", note: "NA stint — LCS experience" },
      { year: "2023", team: "G2 Esports", note: "Returned to EU — Worlds finalist" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 44, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "4.1" },
        { label: "Win Rate", value: "64%" },
        { label: "CS/min", value: "9.6" },
        { label: "Vision", value: "16" },
      ],
      highlight: { label: "Top Champion", value: "Jinx" },
    },
    wiki: "leagueoflegends",
  },
  {
    id: "Oner", name: "Moon Hyeon-joon", type: "player", views: 39000, imageurl: "https://api.dicebear.com/7.x/micah/svg?seed=Oner&backgroundColor=d4f1c7",
    nationality: "South Korea", region: "Korea",
    birthdate: "2002-08-15", teampagename: "T1",
    links: { twitter: "https://twitter.com/T1Oner", instagram: "https://www.instagram.com/oner_t1" },
    status: "Active",
    earnings: 860000,
    earningsbyyear: { "2022": 160000, "2023": 290000, "2024": 230000, "2025": 180000 },
    marketvalue: 1500000,
    marketvaluehistory: [
      { date: "2022-01", value: 350000 }, { date: "2023-01", value: 800000 },
      { date: "2024-01", value: 1300000 }, { date: "2025-01", value: 1500000 },
    ],
    career: [
      { year: "2022", team: "T1", note: "Pro debut — World Champion (rookie jungler)" },
      { year: "2023", team: "T1", note: "World Champion — aggressive jungle style" },
      { year: "2025", team: "T1", note: "World Champion (3rd title)" },
    ],
    recentstats: {
      period: "Jan – Apr 2026", games: 48, gamesLabel: "games",
      stats: [
        { label: "KDA", value: "4.8" },
        { label: "Win Rate", value: "68%" },
        { label: "CS/min", value: "5.2" },
        { label: "Vision", value: "40" },
      ],
      highlight: { label: "Top Champion", value: "Viego" },
    },
    wiki: "leagueoflegends",
  },
];

// ── TOURNAMENT SERIES ─────────────────────────────────────────────────────────
export const TOURNAMENT_SERIES = [
  {
    name: "First Strike",
    abbreviation: "FS",
    imageurl: "https://liquipedia.net/commons/images/thumb/c/c7/Valorant_First_Strike_lightmode.png/400px-Valorant_First_Strike_lightmode.png",
    imagedarkurl: "https://liquipedia.net/commons/images/thumb/1/1b/Valorant_First_Strike_darkmode.png/400px-Valorant_First_Strike_darkmode.png",
    launcheddate: "0000-01-01",
    locations: '{"region1":"World"}',
    organizers: ["Riot Games"],
    prizepool: 613957,
    links: { home: "https://playvalorant.com/en-us/news/esports/announcing-valorant-first-strike/", twitter: "https://twitter.com/ValorantEsports" },
    wiki: "valorant",
  },
];

// ── STANDINGS ─────────────────────────────────────────────────────────────────
export const STANDINGS = [
  // VALORANT
  {
    title: "Group A", type: "league",
    matches: ["CHAMP25GrA_0001", "CHAMP25GrA_0002", "CHAMP25GrA_0003", "CHAMP25GrA_0004", "CHAMP25GrA_0005"],
    entries: [
      { opponenttype: "team", opponentname: "Paper Rex", placement: 1, placementchange: 0, roundindex: 1, scoreboard: { points: 6, diff: 20, game: { d: 0, w: 4, l: 1 }, match: { d: 0, w: 2, l: 0 } }, wiki: "valorant" },
      { opponenttype: "team", opponentname: "Team Liquid", placement: 2, placementchange: -1, roundindex: 1, scoreboard: { points: 3, diff: 2, game: { d: 0, w: 2, l: 2 }, match: { d: 0, w: 1, l: 1 } }, wiki: "valorant" },
      { opponenttype: "team", opponentname: "LOUD", placement: 3, placementchange: 1, roundindex: 1, scoreboard: { points: 3, diff: -5, game: { d: 0, w: 2, l: 3 }, match: { d: 0, w: 1, l: 1 } }, wiki: "valorant" },
      { opponenttype: "team", opponentname: "EDward Gaming", placement: 4, placementchange: 0, roundindex: 1, scoreboard: { points: 0, diff: -17, game: { d: 0, w: 1, l: 4 }, match: { d: 0, w: 0, l: 2 } }, wiki: "valorant" },
    ],
    wiki: "valorant",
  },
  {
    title: "Group B", type: "league",
    matches: ["CHAMP25GrB_0001", "CHAMP25GrB_0002", "CHAMP25GrB_0003", "CHAMP25GrB_0004", "CHAMP25GrB_0005"],
    entries: [
      { opponenttype: "team", opponentname: "NRG", placement: 1, placementchange: 0, roundindex: 1, scoreboard: { points: 6, diff: 18, game: { d: 0, w: 4, l: 0 }, match: { d: 0, w: 2, l: 0 } }, wiki: "valorant" },
      { opponenttype: "team", opponentname: "Fnatic", placement: 2, placementchange: 1, roundindex: 1, scoreboard: { points: 3, diff: 6, game: { d: 0, w: 3, l: 1 }, match: { d: 0, w: 1, l: 1 } }, wiki: "valorant" },
      { opponenttype: "team", opponentname: "DRX", placement: 3, placementchange: -1, roundindex: 1, scoreboard: { points: 3, diff: -4, game: { d: 0, w: 2, l: 3 }, match: { d: 0, w: 1, l: 1 } }, wiki: "valorant" },
      { opponenttype: "team", opponentname: "ZETA DIVISION", placement: 4, placementchange: 0, roundindex: 1, scoreboard: { points: 0, diff: -20, game: { d: 0, w: 0, l: 4 }, match: { d: 0, w: 0, l: 2 } }, wiki: "valorant" },
    ],
    wiki: "valorant",
  },
  // LoL
  {
    title: "Group A", type: "league",
    matches: ["WORLDS25GrA_0001", "WORLDS25GrA_0002", "WORLDS25GrA_0003"],
    entries: [
      { opponenttype: "team", opponentname: "T1", placement: 1, placementchange: 0, roundindex: 1, scoreboard: { points: 6, diff: 4, game: { d: 0, w: 3, l: 0 }, match: { d: 0, w: 3, l: 0 } }, wiki: "leagueoflegends" },
      { opponenttype: "team", opponentname: "Cloud9", placement: 2, placementchange: 1, roundindex: 1, scoreboard: { points: 3, diff: 1, game: { d: 0, w: 2, l: 1 }, match: { d: 0, w: 2, l: 1 } }, wiki: "leagueoflegends" },
      { opponenttype: "team", opponentname: "MAD Lions", placement: 3, placementchange: -1, roundindex: 1, scoreboard: { points: 3, diff: -1, game: { d: 0, w: 1, l: 2 }, match: { d: 0, w: 1, l: 2 } }, wiki: "leagueoflegends" },
      { opponenttype: "team", opponentname: "PSG Talon", placement: 4, placementchange: 0, roundindex: 1, scoreboard: { points: 0, diff: -4, game: { d: 0, w: 0, l: 3 }, match: { d: 0, w: 0, l: 3 } }, wiki: "leagueoflegends" },
    ],
    wiki: "leagueoflegends",
  },
  {
    title: "Group B", type: "league",
    matches: ["WORLDS25GrB_0001", "WORLDS25GrB_0002", "WORLDS25GrB_0003"],
    entries: [
      { opponenttype: "team", opponentname: "G2 Esports", placement: 1, placementchange: 0, roundindex: 1, scoreboard: { points: 6, diff: 3, game: { d: 0, w: 3, l: 0 }, match: { d: 0, w: 3, l: 0 } }, wiki: "leagueoflegends" },
      { opponenttype: "team", opponentname: "Gen.G", placement: 2, placementchange: 1, roundindex: 1, scoreboard: { points: 4, diff: 2, game: { d: 0, w: 2, l: 1 }, match: { d: 0, w: 2, l: 1 } }, wiki: "leagueoflegends" },
      { opponenttype: "team", opponentname: "Team Liquid", placement: 3, placementchange: -1, roundindex: 1, scoreboard: { points: 2, diff: -2, game: { d: 0, w: 1, l: 2 }, match: { d: 0, w: 1, l: 2 } }, wiki: "leagueoflegends" },
      { opponenttype: "team", opponentname: "NRG LoL", placement: 4, placementchange: 0, roundindex: 1, scoreboard: { points: 0, diff: -3, game: { d: 0, w: 0, l: 3 }, match: { d: 0, w: 0, l: 3 } }, wiki: "leagueoflegends" },
    ],
    wiki: "leagueoflegends",
  },
];

// ── TEAMS ─────────────────────────────────────────────────────────────────────
export const TEAMS = [
  // VALORANT
  {
    name: "Team Liquid", region: "Europe",
    logourl: "https://liquipedia.net/commons/images/thumb/f/f5/Team_Liquid_2024_full_lightmode.png/309px-Team_Liquid_2024_full_lightmode.png",
    logodarkurl: "https://liquipedia.net/commons/images/thumb/2/28/Team_Liquid_2024_full_darkmode.png/309px-Team_Liquid_2024_full_darkmode.png",
    textlesslogourl: "https://liquipedia.net/commons/images/thumb/0/01/Team_Liquid_2024_lightmode.png/351px-Team_Liquid_2024_lightmode.png",
    textlesslogodarkurl: "https://liquipedia.net/commons/images/thumb/5/59/Team_Liquid_2024_darkmode.png/351px-Team_Liquid_2024_darkmode.png",
    status: "active", createdate: "2020-08-07", disbanddate: "0000-01-01", rankpoints: 1400, rankchange: -1,
    earnings: 738104,
    earningsbyyear: { "2020": 18621, "2021": 257115, "2022": 103618, "2023": 185000, "2024": 3750, "2025": 170000 },
    links: { tiktok: "https://tiktok.com/@teamliquid", instagram: "https://www.instagram.com/teamliquid" },
    squad: [{ id: "soulcas", role: "Player" }, { id: "Jamppi", role: "Player" }, { id: "nAts", role: "Player" }, { id: "Redgar", role: "Coach" }],
    wiki: "valorant",
  },
  {
    name: "Fnatic", region: "Europe",
    logourl: "https://liquipedia.net/commons/images/thumb/9/90/Fnatic_2022_lightmode.png/363px-Fnatic_2022_lightmode.png",
    logodarkurl: "https://liquipedia.net/commons/images/thumb/a/a2/Fnatic_2022_darkmode.png/363px-Fnatic_2022_darkmode.png",
    textlesslogourl: "https://liquipedia.net/commons/images/thumb/c/c8/Fnatic_2022_icon.png/320px-Fnatic_2022_icon.png",
    textlesslogodarkurl: "https://liquipedia.net/commons/images/thumb/c/c8/Fnatic_2022_icon.png/320px-Fnatic_2022_icon.png",
    status: "active", createdate: "2021-01-01", disbanddate: "0000-01-01", rankpoints: 1850, rankchange: 1,
    earnings: 1245700,
    earningsbyyear: { "2021": 150000, "2022": 280000, "2023": 390000, "2024": 120700, "2025": 305000 },
    links: { twitter: "https://twitter.com/FNATIC", instagram: "https://www.instagram.com/fnatic", twitch: "https://www.twitch.tv/fnatic" },
    squad: [{ id: "Boaster", role: "IGL" }, { id: "Alfajer", role: "Player" }, { id: "Leo", role: "Player" }, { id: "Derke", role: "Player" }, { id: "Chronicle", role: "Player" }],
    wiki: "valorant",
  },
  {
    name: "NRG", region: "Americas",
    logourl: "https://liquipedia.net/commons/images/thumb/7/74/NRG_lightmode.png/380px-NRG_lightmode.png",
    logodarkurl: "https://liquipedia.net/commons/images/thumb/d/d6/NRG_darkmode.png/380px-NRG_darkmode.png",
    textlesslogourl: "https://liquipedia.net/commons/images/thumb/7/7a/NRG_icon.png/320px-NRG_icon.png",
    textlesslogodarkurl: "https://liquipedia.net/commons/images/thumb/7/7a/NRG_icon.png/320px-NRG_icon.png",
    status: "active", createdate: "2020-06-01", disbanddate: "0000-01-01", rankpoints: 2100, rankchange: 0,
    earnings: 1862000,
    earningsbyyear: { "2020": 50000, "2021": 200000, "2022": 350000, "2023": 540000, "2024": 122000, "2025": 600000 },
    links: { twitter: "https://twitter.com/NRGgg", instagram: "https://www.instagram.com/nrggg", twitch: "https://www.twitch.tv/nrg" },
    squad: [{ id: "s0m", role: "Player" }, { id: "ardiis", role: "Player" }, { id: "FNS", role: "IGL" }, { id: "eeiu", role: "Player" }, { id: "crashies", role: "Player" }],
    wiki: "valorant",
  },
  {
    name: "Paper Rex", region: "Pacific",
    logourl: "https://liquipedia.net/commons/images/thumb/c/cd/Paper_Rex_lightmode.png/375px-Paper_Rex_lightmode.png",
    logodarkurl: "https://liquipedia.net/commons/images/thumb/5/54/Paper_Rex_darkmode.png/375px-Paper_Rex_darkmode.png",
    textlesslogourl: "https://liquipedia.net/commons/images/thumb/c/cd/Paper_Rex_icon.png/280px-Paper_Rex_icon.png",
    textlesslogodarkurl: "https://liquipedia.net/commons/images/thumb/c/cd/Paper_Rex_icon.png/280px-Paper_Rex_icon.png",
    status: "active", createdate: "2020-10-01", disbanddate: "0000-01-01", rankpoints: 1600, rankchange: 2,
    earnings: 987500,
    earningsbyyear: { "2021": 80000, "2022": 195000, "2023": 290000, "2024": 84500, "2025": 338000 },
    links: { twitter: "https://twitter.com/paperrex", instagram: "https://www.instagram.com/paperrex", youtube: "https://www.youtube.com/paperrex" },
    squad: [{ id: "f0rsakeN", role: "Player" }, { id: "mindfreak", role: "Player" }, { id: "Jinggg", role: "Player" }, { id: "something", role: "Player" }, { id: "d4v41", role: "IGL" }],
    wiki: "valorant",
  },
  // CS2
  {
    name: "NAVI", region: "Europe",
    logourl: "", logodarkurl: "",
    textlesslogourl: "", textlesslogodarkurl: "",
    status: "active", createdate: "2009-12-17", disbanddate: "0000-01-01", rankpoints: 1850, rankchange: 0,
    earnings: 5820000,
    earningsbyyear: { "2019": 800000, "2020": 750000, "2021": 1200000, "2022": 1100000, "2023": 890000, "2024": 680000, "2025": 400000 },
    links: { twitter: "https://twitter.com/natusvincere", instagram: "https://www.instagram.com/natusvincere", twitch: "https://www.twitch.tv/navi" },
    squad: [{ id: "s1mple", role: "AWPer" }, { id: "electroNic", role: "Rifler" }, { id: "b1t", role: "Rifler" }, { id: "Perfecto", role: "Support" }, { id: "npl", role: "IGL" }],
    wiki: "counterstrike",
  },
  {
    name: "G2 Esports", region: "Europe",
    logourl: "", logodarkurl: "",
    textlesslogourl: "", textlesslogodarkurl: "",
    status: "active", createdate: "2014-08-04", disbanddate: "0000-01-01", rankpoints: 1420, rankchange: 1,
    earnings: 3200000,
    earningsbyyear: { "2020": 320000, "2021": 580000, "2022": 740000, "2023": 810000, "2024": 450000, "2025": 300000 },
    links: { twitter: "https://twitter.com/G2esports", instagram: "https://www.instagram.com/g2esports", twitch: "https://www.twitch.tv/g2esports" },
    squad: [{ id: "NiKo", role: "Rifler" }, { id: "huNter", role: "Rifler" }, { id: "jks", role: "Rifler" }, { id: "nexa", role: "IGL" }, { id: "Hooxi", role: "IGL" }],
    wiki: "counterstrike",
  },
  // League of Legends
  {
    name: "T1", region: "Korea",
    logourl: "https://liquipedia.net/commons/images/thumb/5/5c/T1_2019_logo.png/346px-T1_2019_logo.png",
    logodarkurl: "https://liquipedia.net/commons/images/thumb/5/5c/T1_2019_logo.png/346px-T1_2019_logo.png",
    textlesslogourl: "https://liquipedia.net/commons/images/thumb/e/e5/T1_icon.png/280px-T1_icon.png",
    textlesslogodarkurl: "https://liquipedia.net/commons/images/thumb/e/e5/T1_icon.png/280px-T1_icon.png",
    status: "active", createdate: "2013-02-12", disbanddate: "0000-01-01", rankpoints: 3600, rankchange: 0,
    earnings: 12500000,
    earningsbyyear: { "2019": 1200000, "2020": 950000, "2021": 1800000, "2022": 2100000, "2023": 2500000, "2024": 1900000, "2025": 2050000 },
    links: { twitter: "https://twitter.com/T1LoL", instagram: "https://www.instagram.com/t1lol", youtube: "https://www.youtube.com/c/T1" },
    squad: [{ id: "Zeus", role: "Top" }, { id: "Oner", role: "Jungle" }, { id: "Faker", role: "Mid" }, { id: "Ruler", role: "Bot" }, { id: "Keria", role: "Support" }],
    wiki: "leagueoflegends",
  },
  {
    name: "G2 Esports", region: "Europe",
    logourl: "https://liquipedia.net/commons/images/thumb/5/52/G2_Esports_2022_allmode.png/363px-G2_Esports_2022_allmode.png",
    logodarkurl: "https://liquipedia.net/commons/images/thumb/5/52/G2_Esports_2022_allmode.png/363px-G2_Esports_2022_allmode.png",
    textlesslogourl: "https://liquipedia.net/commons/images/thumb/0/04/G2_Esports_icon.png/280px-G2_Esports_icon.png",
    textlesslogodarkurl: "https://liquipedia.net/commons/images/thumb/0/04/G2_Esports_icon.png/280px-G2_Esports_icon.png",
    status: "active", createdate: "2015-01-24", disbanddate: "0000-01-01", rankpoints: 2800, rankchange: -1,
    earnings: 7800000,
    earningsbyyear: { "2020": 620000, "2021": 980000, "2022": 1200000, "2023": 1600000, "2024": 1800000, "2025": 1600000 },
    links: { twitter: "https://twitter.com/G2esports", instagram: "https://www.instagram.com/g2esports", twitch: "https://www.twitch.tv/g2esports_lol" },
    squad: [{ id: "BrokenBlade", role: "Top" }, { id: "Jankos", role: "Jungle" }, { id: "Caps", role: "Mid" }, { id: "Hans sama", role: "Bot" }, { id: "Mikyx", role: "Support" }],
    wiki: "leagueoflegends",
  },
  {
    name: "Cloud9", region: "Americas",
    logourl: "https://liquipedia.net/commons/images/thumb/b/b4/Cloud9_2020_lightmode.png/363px-Cloud9_2020_lightmode.png",
    logodarkurl: "https://liquipedia.net/commons/images/thumb/8/85/Cloud9_2020_darkmode.png/363px-Cloud9_2020_darkmode.png",
    textlesslogourl: "https://liquipedia.net/commons/images/thumb/2/20/Cloud9_icon.png/280px-Cloud9_icon.png",
    textlesslogodarkurl: "https://liquipedia.net/commons/images/thumb/2/20/Cloud9_icon.png/280px-Cloud9_icon.png",
    status: "active", createdate: "2012-09-02", disbanddate: "0000-01-01", rankpoints: 1800, rankchange: -1,
    earnings: 4200000,
    earningsbyyear: { "2020": 320000, "2021": 580000, "2022": 820000, "2023": 1100000, "2024": 880000, "2025": 500000 },
    links: { twitter: "https://twitter.com/Cloud9", instagram: "https://www.instagram.com/cloud9", twitch: "https://www.twitch.tv/cloud9" },
    squad: [{ id: "Tenacity", role: "Top" }, { id: "Contractz", role: "Jungle" }, { id: "Jojopyun", role: "Mid" }, { id: "Berserker", role: "Bot" }, { id: "Vulcan", role: "Support" }],
    wiki: "leagueoflegends",
  },

  // ── Valorant extra teams (for ranking) ────────────────────────────────────
  { name: "LOUD",          region: "Americas", status: "active", createdate: "2021-06-01", disbanddate: "0000-01-01", rankpoints: 1200, rankchange: -1, earnings: 870000,  earningsbyyear: {"2022":80000,"2023":280000,"2024":160000,"2025":350000}, squad: [], links: {}, wiki: "valorant" },
  { name: "DRX",           region: "Pacific",  status: "active", createdate: "2020-08-01", disbanddate: "0000-01-01", rankpoints: 1050, rankchange:  0, earnings: 720000,  earningsbyyear: {"2022":60000,"2023":210000,"2024":120000,"2025":330000}, squad: [], links: {}, wiki: "valorant" },
  { name: "EDward Gaming", region: "Pacific",  status: "active", createdate: "2021-03-01", disbanddate: "0000-01-01", rankpoints: 1100, rankchange:  1, earnings: 680000,  earningsbyyear: {"2022":50000,"2023":180000,"2024":110000,"2025":340000}, squad: [], links: {}, wiki: "valorant" },
  { name: "ZETA DIVISION", region: "Pacific",  status: "active", createdate: "2021-01-15", disbanddate: "0000-01-01", rankpoints:  900, rankchange: -1, earnings: 540000,  earningsbyyear: {"2022":40000,"2023":150000,"2024":110000,"2025":240000}, squad: [], links: {}, wiki: "valorant" },
  { name: "Cloud9",        region: "Americas", status: "active", createdate: "2021-02-01", disbanddate: "0000-01-01", rankpoints:  750, rankchange:  1, earnings: 410000,  earningsbyyear: {"2022":30000,"2023":120000,"2024":100000,"2025":160000}, squad: [], links: {}, wiki: "valorant" },
  { name: "Leviatán",      region: "Americas", status: "active", createdate: "2021-04-01", disbanddate: "0000-01-01", rankpoints:  680, rankchange:  2, earnings: 350000,  earningsbyyear: {"2022":20000,"2023":100000,"2024":90000,"2025":140000},  squad: [], links: {}, wiki: "valorant" },

  // ── CS2 extra teams ───────────────────────────────────────────────────────
  { name: "FaZe Clan",     region: "Europe",   status: "active", createdate: "2016-01-01", disbanddate: "0000-01-01", rankpoints: 1380, rankchange: -2, earnings: 4800000, earningsbyyear: {"2021":800000,"2022":1200000,"2023":1400000,"2024":900000,"2025":500000}, squad: [], links: {}, wiki: "counterstrike" },
  { name: "Team Spirit",   region: "Europe",   status: "active", createdate: "2019-01-01", disbanddate: "0000-01-01", rankpoints: 1210, rankchange:  3, earnings: 2200000, earningsbyyear: {"2022":400000,"2023":700000,"2024":600000,"2025":500000}, squad: [], links: {}, wiki: "counterstrike" },
  { name: "Heroic",        region: "Europe",   status: "active", createdate: "2018-01-01", disbanddate: "0000-01-01", rankpoints: 1080, rankchange:  0, earnings: 1800000, earningsbyyear: {"2022":300000,"2023":550000,"2024":560000,"2025":390000}, squad: [], links: {}, wiki: "counterstrike" },
  { name: "Virtus.pro",    region: "Europe",   status: "active", createdate: "2012-06-01", disbanddate: "0000-01-01", rankpoints:  950, rankchange: -1, earnings: 3100000, earningsbyyear: {"2022":500000,"2023":800000,"2024":700000,"2025":600000}, squad: [], links: {}, wiki: "counterstrike" },
  { name: "Complexity",    region: "Americas", status: "active", createdate: "2004-01-01", disbanddate: "0000-01-01", rankpoints:  820, rankchange:  2, earnings:  980000, earningsbyyear: {"2022":150000,"2023":280000,"2024":260000,"2025":290000}, squad: [], links: {}, wiki: "counterstrike" },
  { name: "ENCE",          region: "Europe",   status: "active", createdate: "2013-06-01", disbanddate: "0000-01-01", rankpoints:  740, rankchange: -1, earnings: 1400000, earningsbyyear: {"2022":220000,"2023":420000,"2024":410000,"2025":350000}, squad: [], links: {}, wiki: "counterstrike" },
  { name: "Astralis",      region: "Europe",   status: "active", createdate: "2016-08-01", disbanddate: "0000-01-01", rankpoints:  680, rankchange: -2, earnings: 5600000, earningsbyyear: {"2021":900000,"2022":1400000,"2023":1600000,"2024":1100000,"2025":600000}, squad: [], links: {}, wiki: "counterstrike" },
  { name: "Cloud9",        region: "Americas", status: "active", createdate: "2014-06-01", disbanddate: "0000-01-01", rankpoints:  580, rankchange:  1, earnings: 1100000, earningsbyyear: {"2022":180000,"2023":320000,"2024":310000,"2025":290000}, squad: [], links: {}, wiki: "counterstrike" },

  // ── LoL extra teams ───────────────────────────────────────────────────────
  { name: "Dplus KIA",           region: "Korea",   status: "active", createdate: "2019-01-01", disbanddate: "0000-01-01", rankpoints:  920, rankchange:  0, earnings: 1400000, earningsbyyear: {"2022":220000,"2023":380000,"2024":420000,"2025":380000}, squad: [], links: {}, wiki: "leagueoflegends" },
  { name: "Bilibili Gaming",     region: "China",   status: "active", createdate: "2017-11-01", disbanddate: "0000-01-01", rankpoints: 1900, rankchange:  1, earnings: 2600000, earningsbyyear: {"2022":400000,"2023":700000,"2024":800000,"2025":700000}, squad: [], links: {}, wiki: "leagueoflegends" },
  { name: "Weibo Gaming",        region: "China",   status: "active", createdate: "2020-11-01", disbanddate: "0000-01-01", rankpoints: 1750, rankchange: -1, earnings: 1800000, earningsbyyear: {"2022":300000,"2023":480000,"2024":560000,"2025":460000}, squad: [], links: {}, wiki: "leagueoflegends" },
  { name: "Gen.G",               region: "Korea",   status: "active", createdate: "2017-09-01", disbanddate: "0000-01-01", rankpoints: 2100, rankchange:  2, earnings: 3800000, earningsbyyear: {"2022":600000,"2023":900000,"2024":1100000,"2025":1200000}, squad: [{ id: "Doran", role: "Top" }, { id: "Peanut", role: "Jungle" }, { id: "Chovy", role: "Mid" }, { id: "Peyz", role: "Bot" }, { id: "Lehends", role: "Support" }], links: {}, wiki: "leagueoflegends" },
  { name: "Hanwha Life Esports", region: "Korea",   status: "active", createdate: "2017-01-01", disbanddate: "0000-01-01", rankpoints: 1400, rankchange: -1, earnings: 1200000, earningsbyyear: {"2022":180000,"2023":320000,"2024":360000,"2025":340000}, squad: [], links: {}, wiki: "leagueoflegends" },
  { name: "KT Rolster",          region: "Korea",   status: "active", createdate: "2012-01-01", disbanddate: "0000-01-01", rankpoints: 1280, rankchange:  2, earnings: 2100000, earningsbyyear: {"2022":320000,"2023":580000,"2024":620000,"2025":580000}, squad: [], links: {}, wiki: "leagueoflegends" },
  { name: "Fnatic",              region: "Europe",  status: "active", createdate: "2011-01-01", disbanddate: "0000-01-01", rankpoints:  980, rankchange:  1, earnings: 2800000, earningsbyyear: {"2022":450000,"2023":700000,"2024":820000,"2025":830000}, squad: [], links: {}, wiki: "leagueoflegends" },
  { name: "Team Vitality",       region: "Europe",  status: "active", createdate: "2017-03-01", disbanddate: "0000-01-01", rankpoints: 1150, rankchange: -2, earnings: 1600000, earningsbyyear: {"2022":240000,"2023":420000,"2024":480000,"2025":460000}, squad: [], links: {}, wiki: "leagueoflegends" },
  { name: "MAD Lions",           region: "Europe",  status: "active", createdate: "2019-04-01", disbanddate: "0000-01-01", rankpoints: 1550, rankchange:  1, earnings:  980000, earningsbyyear: {"2022":160000,"2023":280000,"2024":260000,"2025":280000}, squad: [], links: {}, wiki: "leagueoflegends" },
  { name: "Team Liquid",         region: "Americas",status: "active", createdate: "2015-07-01", disbanddate: "0000-01-01", rankpoints:  850, rankchange:  0, earnings: 3200000, earningsbyyear: {"2022":520000,"2023":820000,"2024":980000,"2025":880000}, squad: [], links: {}, wiki: "leagueoflegends" },
];

// ── TOURNAMENTS ───────────────────────────────────────────────────────────────
export const TOURNAMENTS = [
  {
    id: "VALORANT_Champions_2025",
    name: "VALORANT Champions 2025",
    bannerurl: "https://liquipedia.net/commons/images/thumb/a/a2/VCT_Champions_Paris_2025.png/400px-VCT_Champions_Paris_2025.png",
    iconurl: "https://liquipedia.net/commons/images/thumb/a/ae/VCT_Champions_icon_allmode.png/370px-VCT_Champions_icon_allmode.png",
    seriespage: "VALORANT_Champions_Tour", patch: "11.05",
    startdate: "2025-09-12", enddate: "2025-10-05",
    locations: { venue: "Accor Arena", venuelink: "http://www.accorarena.com/", city: "Paris", country: "fr", region: "Europe" },
    prizepool: 2250000, participantsnumber: 16,
    liquipediatier: "1", liquipediatiertype: "",
    format: "Groups + Double Elimination",
    wiki: "valorant",
  },
  {
    id: "VCT_EMEA_2025_Stage2",
    name: "VCT EMEA 2025: Stage 2",
    bannerurl: "",
    iconurl: "https://liquipedia.net/commons/images/thumb/a/ae/VCT_Champions_icon_allmode.png/370px-VCT_Champions_icon_allmode.png",
    seriespage: "VALORANT_Champions_Tour", patch: "10.08",
    startdate: "2025-06-14", enddate: "2025-07-27",
    locations: { venue: "Riot Berlin Studio", venuelink: "", city: "Berlin", country: "de", region: "Europe" },
    prizepool: 700000, participantsnumber: 8,
    liquipediatier: "2", liquipediatiertype: "Regional",
    format: "Double Round Robin + Playoffs",
    wiki: "valorant",
  },
  {
    id: "PGL_2026_Astana",
    name: "PGL Astana 2026",
    bannerurl: "https://liquipedia.net/commons/images/thumb/8/81/PGL_Astana_2026_lightmode.png/400px-PGL_Astana_2026_lightmode.png",
    iconurl: "https://liquipedia.net/commons/images/thumb/1/18/PGL_Astana_2026_icon_lightmode.png/400px-PGL_Astana_2026_icon_lightmode.png",
    seriespage: "", patch: "",
    startdate: "2026-05-09", enddate: "2026-05-17",
    locations: { venue: "Barys Arena", city: "Astana", country: "kz", region: "CIS" },
    prizepool: 800000, participantsnumber: 16,
    liquipediatier: "1", liquipediatiertype: "Tier 1",
    format: "Single Elimination",
    wiki: "counterstrike",
  },
  {
    id: "Intel_Extreme_Masters_2026_Cologne",
    name: "Intel Extreme Masters Cologne Major 2026",
    bannerurl: "https://liquipedia.net/commons/images/thumb/f/f2/Intel_Extreme_Masters_2022_lightmode.png/400px-Intel_Extreme_Masters_2022_lightmode.png",
    iconurl: "https://liquipedia.net/commons/images/thumb/4/4d/Intel_Extreme_Masters_2022_icon_allmode.png/400px-Intel_Extreme_Masters_2022_icon_allmode.png",
    seriespage: "Intel_Extreme_Masters", patch: "",
    startdate: "2026-06-02", enddate: "2026-06-21",
    locations: { venue: "LANXESS arena", city: "Cologne", country: "de", region: "Europe" },
    prizepool: 1250000, participantsnumber: 32,
    liquipediatier: "1", liquipediatiertype: "Major Championship",
    format: "Swiss + Single Elimination",
    wiki: "counterstrike",
  },
  {
    id: "Worlds_2025",
    name: "Worlds 2025",
    bannerurl: "https://liquipedia.net/commons/images/thumb/9/96/Worlds_2025_lightmode.png/400px-Worlds_2025_lightmode.png",
    bannerdarkurl: "https://liquipedia.net/commons/images/thumb/9/96/Worlds_2025_lightmode.png/400px-Worlds_2025_lightmode.png",
    iconurl: "https://liquipedia.net/commons/images/thumb/a/ae/Worlds_icon_allmode.png/370px-Worlds_icon_allmode.png",
    seriespage: "World_Championship", patch: "15.18",
    startdate: "2025-10-08", enddate: "2025-11-02",
    locations: { venue: "Mercedes-Benz Arena", city: "Shanghai", country: "cn", region: "Asia" },
    prizepool: 2500000, participantsnumber: 22,
    liquipediatier: "1", liquipediatiertype: "World Championship",
    format: "Play-Ins + Groups + Double Elimination",
    wiki: "leagueoflegends",
  },
  {
    id: "MSI_2026",
    name: "Mid-Season Invitational 2026",
    bannerurl: "https://liquipedia.net/commons/images/thumb/f/f7/MSI_2021_lightmode.png/600px-MSI_2021_lightmode.png",
    bannerdarkurl: "https://liquipedia.net/commons/images/thumb/7/72/MSI_2021_darkmode.png/600px-MSI_2021_darkmode.png",
    iconurl: "https://liquipedia.net/commons/images/thumb/0/05/MSI_2025_icon_darkmode.png/370px-MSI_2025_icon_darkmode.png",
    seriespage: "Mid-Season_Invitational", patch: "14.09",
    startdate: "2026-05-07", enddate: "2026-06-01",
    locations: { venue: "Fiserv Forum", city: "Milwaukee", country: "us", region: "North America" },
    prizepool: 2000000, participantsnumber: 13,
    liquipediatier: "1", liquipediatiertype: "Mid-Season Invitational",
    format: "Groups + Double Elimination",
    wiki: "leagueoflegends",
  },
  {
    id: "LCK_2026_Spring",
    name: "LCK 2026 Spring",
    bannerurl: "https://liquipedia.net/commons/images/thumb/e/e2/LCK_2021_lightmode.png/600px-LCK_2021_lightmode.png",
    bannerdarkurl: "https://liquipedia.net/commons/images/thumb/e/e2/LCK_2021_lightmode.png/600px-LCK_2021_lightmode.png",
    iconurl: "https://liquipedia.net/commons/images/thumb/a/a5/LCK_icon_2022.png/370px-LCK_icon_2022.png",
    seriespage: "LCK", patch: "14.04",
    startdate: "2026-01-08", enddate: "2026-03-29",
    locations: { venue: "LoL Park", city: "Seoul", country: "kr", region: "Korea" },
    prizepool: 390000, participantsnumber: 10,
    liquipediatier: "2", liquipediatiertype: "Regional",
    format: "Regular Season + Playoffs",
    wiki: "leagueoflegends",
  },
  {
    id: "LEC_2026_Winter",
    name: "LEC 2026 Winter",
    bannerurl: "https://liquipedia.net/commons/images/thumb/0/03/LEC_lightmode.png/600px-LEC_lightmode.png",
    bannerdarkurl: "https://liquipedia.net/commons/images/thumb/0/03/LEC_lightmode.png/600px-LEC_lightmode.png",
    iconurl: "https://liquipedia.net/commons/images/thumb/9/92/LEC_icon_2023.png/370px-LEC_icon_2023.png",
    seriespage: "LEC", patch: "14.02",
    startdate: "2026-01-10", enddate: "2026-02-23",
    locations: { venue: "LEC Studio", city: "Berlin", country: "de", region: "Europe" },
    prizepool: 200000, participantsnumber: 10,
    liquipediatier: "2", liquipediatiertype: "Regional",
    format: "Regular Season + Playoffs",
    wiki: "leagueoflegends",
  },
  {
    id: "LCK_2026_Spring_2025",
    name: "LCK 2025 Summer",
    bannerurl: "", iconurl: "",
    seriespage: "LCK", patch: "15.12",
    startdate: "2025-07-01", enddate: "2025-08-24",
    locations: { venue: "LoL Park", city: "Seoul", country: "kr", region: "Korea" },
    prizepool: 300000, participantsnumber: 10,
    liquipediatier: "2", liquipediatiertype: "Regional",
    format: "Regular Season + Playoffs",
    wiki: "leagueoflegends",
  },
];

// ── TRANSFERS ─────────────────────────────────────────────────────────────────
export const TRANSFERS = [
  { player: "tOfu", nationality: "Germany", fromteam: "Gaimin Gladiators", toteam: "Team Liquid", role1: "5", role2: "5", reference: { reference1: "https://x.com/teamliquiddota/status/1976180833196347673", reference1type: "web source" }, date: "2025-10-09 00:00:00", wiki: "dota2" },
  { player: "Alfajer", nationality: "Turkey", fromteam: "EMEA Rising", toteam: "Fnatic", role1: "duelist", role2: "duelist", reference: { reference1: "https://twitter.com/FNATIC/status/1234567", reference1type: "web source" }, date: "2025-01-15 00:00:00", wiki: "valorant" },
  { player: "nAts", nationality: "Russia", fromteam: "Natus Vincere", toteam: "Team Liquid", role1: "controller", role2: "controller", reference: { reference1: "https://twitter.com/TeamLiquid/status/1234568", reference1type: "web source" }, date: "2025-01-20 00:00:00", wiki: "valorant" },
  { player: "s0m", nationality: "United States", fromteam: "Cloud9", toteam: "NRG", role1: "duelist", role2: "duelist", reference: { reference1: "https://twitter.com/NRGgg/status/9876543", reference1type: "web source" }, date: "2024-11-28 00:00:00", wiki: "valorant" },
  { player: "ardiis", nationality: "Latvia", fromteam: "Fnatic", toteam: "NRG", role1: "initiator", role2: "initiator", reference: { reference1: "https://twitter.com/NRGgg/status/9876544", reference1type: "web source" }, date: "2024-12-05 00:00:00", wiki: "valorant" },
  { player: "f0rsakeN", nationality: "Singapore", fromteam: "F4Q", toteam: "Paper Rex", role1: "duelist", role2: "duelist", reference: { reference1: "https://twitter.com/paperrex/status/1111222", reference1type: "web source" }, date: "2024-10-15 00:00:00", wiki: "valorant" },
  { player: "NiKo", nationality: "Bosnia and Herzegovina", fromteam: "FaZe Clan", toteam: "G2 Esports", role1: "rifler", role2: "rifler", reference: { reference1: "https://twitter.com/G2esports/status/5432100", reference1type: "web source" }, date: "2024-09-01 00:00:00", wiki: "counterstrike" },
  { player: "BrokenBlade", nationality: "Germany", fromteam: "Team Vitality", toteam: "G2 Esports", role1: "top", role2: "top", reference: { reference1: "https://twitter.com/G2esports/status/7654321", reference1type: "web source" }, date: "2025-01-10 00:00:00", wiki: "leagueoflegends" },
  { player: "Ruler", nationality: "South Korea", fromteam: "Gen.G", toteam: "T1", role1: "bot", role2: "adc", reference: { reference1: "https://twitter.com/T1LoL/status/8888888", reference1type: "web source" }, date: "2024-11-15 00:00:00", wiki: "leagueoflegends" },
];

// ── API FUNCTIONS ─────────────────────────────────────────────────────────────
export function getPlayers(wiki = "valorant") {
  return PLAYERS.filter(p => p.wiki === wiki);
}
export function getPlayer(id) {
  return PLAYERS.find(p => p.id.toLowerCase() === id.toLowerCase()) || null;
}
export function getTeams(wiki = "valorant") {
  return TEAMS.filter(t => t.wiki === wiki);
}
export function getTeam(name) {
  return TEAMS.find(t => t.name.toLowerCase() === decodeURIComponent(name).toLowerCase()) || null;
}
export function getTournaments(wiki = "valorant") {
  return TOURNAMENTS.filter(t => t.wiki === wiki);
}
export function getTournament(id) {
  return TOURNAMENTS.find(t => t.id === id) || null;
}
export function getMatches(wiki = "valorant") {
  return MATCHES.filter(m => m.wiki === wiki);
}
export function getMatch(id) {
  return MATCHES.find(m => m.id === id) || null;
}

// Per-map player stats sourced from HLTV, keyed by Liquipedia match2id.
// Indexed by map order (0 = first map, 1 = second map, …).
// team1/team2 order matches match2opponents order from the API.
const MOCK_MATCH_STATS = {
  "Ffcq6omMBC_R01-M003": {
    veto: [
      { type: "ban",     team: "2",  map: "Ancient" },
      { type: "ban",     team: "1",  map: "Anubis" },
      { type: "pick",    team: "2",  map: "Dust2" },
      { type: "pick",    team: "1",  map: "Nuke" },
      { type: "ban",     team: "1",  map: "Overpass" },
      { type: "ban",     team: "2",  map: "Mirage" },
      { type: "decider", team: null, map: "Inferno" },
    ],
    games: [
    {
      // Map 0 — Dust II (MOUZ 13 – 11 Aurora, 24 rounds)
      playerStats: {
        team1: [
          { name: "xertioN", kills: 23, deaths: 15, assists: 7,  kd: 1.53, kast: 83.3, adr: 109.6, rating: 1.82, hs: 39.1 },
          { name: "Spinx",   kills: 17, deaths: 13, assists: 6,  kd: 1.31, kast: 75.0, adr:  77.8, rating: 1.32, hs: 47.1 },
          { name: "jL",      kills: 13, deaths: 15, assists: 12, kd: 0.87, kast: 87.5, adr:  62.8, rating: 0.97, hs: 53.8 },
          { name: "torzsi",  kills: 10, deaths: 11, assists: 5,  kd: 0.91, kast: 70.8, adr:  44.4, rating: 0.85, hs: 40.0 },
          { name: "xelex",   kills: 12, deaths: 15, assists: 4,  kd: 0.80, kast: 79.2, adr:  46.0, rating: 0.72, hs: 50.0 },
        ],
        team2: [
          { name: "Wicadia",  kills: 22, deaths: 17, assists: 2, kd: 1.29, kast: 66.7, adr:  98.8, rating: 1.36, hs: 72.7 },
          { name: "soulfly",  kills: 17, deaths: 18, assists: 4, kd: 0.94, kast: 75.0, adr:  73.7, rating: 1.33, hs: 70.6 },
          { name: "woxic",    kills: 15, deaths: 14, assists: 3, kd: 1.07, kast: 70.8, adr:  72.6, rating: 0.90, hs: 40.0 },
          { name: "MAJ3R",    kills:  6, deaths: 13, assists: 8, kd: 0.46, kast: 75.0, adr:  33.7, rating: 0.65, hs: 50.0 },
          { name: "XANTARES", kills:  8, deaths: 14, assists: 6, kd: 0.57, kast: 66.7, adr:  54.1, rating: 0.54, hs: 50.0 },
        ],
      },
    },
    {
      // Map 1 — Nuke (MOUZ 16 – 5 Aurora, 21 rounds)
      playerStats: {
        team1: [
          { name: "xertioN", kills: 21, deaths: 13, assists: 3, kd: 1.62, kast: 95.2, adr: 107.0, rating: 1.74, hs: 71.4 },
          { name: "xelex",   kills: 16, deaths: 11, assists: 4, kd: 1.45, kast: 76.2, adr:  65.8, rating: 1.40, hs: 62.5 },
          { name: "jL",      kills: 17, deaths: 16, assists: 4, kd: 1.06, kast: 66.7, adr:  87.1, rating: 1.22, hs: 58.8 },
          { name: "Spinx",   kills: 12, deaths: 13, assists: 3, kd: 0.92, kast: 66.7, adr:  57.7, rating: 0.91, hs: 66.7 },
          { name: "torzsi",  kills: 10, deaths: 13, assists: 4, kd: 0.77, kast: 81.0, adr:  56.0, rating: 0.87, hs: 20.0 },
        ],
        team2: [
          { name: "woxic",    kills: 19, deaths: 14, assists: 2, kd: 1.36, kast: 66.7, adr:  81.7, rating: 1.15, hs: 31.6 },
          { name: "MAJ3R",    kills: 16, deaths: 17, assists: 4, kd: 0.94, kast: 76.2, adr:  73.1, rating: 1.08, hs: 37.5 },
          { name: "Wicadia",  kills: 16, deaths: 16, assists: 5, kd: 1.00, kast: 47.6, adr:  82.2, rating: 1.00, hs: 75.0 },
          { name: "XANTARES", kills: 12, deaths: 14, assists: 6, kd: 0.86, kast: 81.0, adr:  75.8, rating: 0.78, hs: 66.7 },
          { name: "soulfly",  kills:  2, deaths: 15, assists: 4, kd: 0.13, kast: 66.7, adr:  29.3, rating: 0.48, hs: 100.0 },
        ],
      },
    },
    ],
  },
};

export function getMockMatchStats(matchId) {
  return MOCK_MATCH_STATS[matchId] || null;
}
export function getInterviews(wiki = "valorant") {
  return INTERVIEWS.filter(i => i.wiki === wiki);
}
export function getTransfers() {
  return TRANSFERS;
}
export function getStandings(wiki = "valorant") {
  return STANDINGS.filter(s => s.wiki === wiki);
}
export function getPrizeResults(wiki = "valorant") {
  return PRIZE_RESULTS.filter(p => p.wiki === wiki);
}
export function getGuests(wiki = "valorant") {
  return GUESTS.filter(g => g.wiki === wiki);
}
export function getTodayMatches(wiki = null) {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return MATCHES.filter(m => {
    if (!m.date || m.date.startsWith("0000")) return false;
    const dateMatch = m.date.slice(0, 10) === today;
    const wikiMatch = wiki === null || m.wiki === wiki;
    return dateMatch && wikiMatch;
  });
}
export function getMatchesByDate(dateStr, wiki = null) {
  return MATCHES.filter(m => {
    if (!m.date || m.date.startsWith("0000")) return false;
    const dateMatch = m.date.slice(0, 10) === dateStr;
    const wikiMatch = wiki === null || m.wiki === wiki;
    return dateMatch && wikiMatch;
  });
}
export function getLiveMatches() {
  return MATCHES.filter(m => m.finished === 0);
}
export function formatTime(dateStr) {
  if (!dateStr || dateStr.startsWith("0000")) return "—";
  // Liquipedia dates are UTC — append Z so JS parses correctly, then convert to Turkey time
  const d = new Date(dateStr.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Istanbul" });
}

const WIKI_SHORT = {
  valorant: "VAL",
  counterstrike: "CS2",
  leagueoflegends: "LoL",
};

export function searchEntities(query, perCategory = 5) {
  const q = query.trim().toLowerCase();
  if (!q) return { players: [], teams: [], tournaments: [], total: 0 };

  const players = PLAYERS
    .filter(p =>
      p.id.toLowerCase().includes(q) ||
      (p.name && p.name.toLowerCase().includes(q))
    )
    .slice(0, perCategory)
    .map(p => ({
      kind: "player",
      id: p.id,
      title: p.id,
      subtitle: [p.name, p.teampagename].filter(Boolean).join(" · "),
      wiki: p.wiki,
      wikiShort: WIKI_SHORT[p.wiki] || "",
      flag: getFlag(p.nationality),
      to: `/player/${encodeURIComponent(p.id)}`,
    }));

  const teamsRaw = TEAMS.filter(t => t.name.toLowerCase().includes(q));
  const teamSeen = new Set();
  const teams = [];
  for (const t of teamsRaw) {
    const key = t.name.toLowerCase();
    if (teamSeen.has(key)) continue;
    teamSeen.add(key);
    teams.push({
      kind: "team",
      id: t.name,
      title: t.name,
      subtitle: t.region || "",
      wiki: t.wiki,
      wikiShort: WIKI_SHORT[t.wiki] || "",
      logo: t.textlesslogourl || t.logourl || null,
      to: `/team/${encodeURIComponent(t.name)}`,
    });
    if (teams.length >= perCategory) break;
  }

  const tournaments = TOURNAMENTS
    .filter(t => t.name.toLowerCase().includes(q) || (t.id && t.id.toLowerCase().includes(q)))
    .slice(0, perCategory)
    .map(t => ({
      kind: "tournament",
      id: t.id,
      title: t.name,
      subtitle: [t.locations?.city, t.startdate?.slice(0, 4)].filter(Boolean).join(" · "),
      wiki: t.wiki,
      wikiShort: WIKI_SHORT[t.wiki] || "",
      icon: t.iconurl || null,
      to: `/tournament/${encodeURIComponent(t.id)}`,
    }));

  return { players, teams, tournaments, total: players.length + teams.length + tournaments.length };
}
