import styles from "./TeamPage.module.css";

const TEAM = {
  name: "NAVI",
  fullName: "Natus Vincere",
  logo: "https://upload.wikimedia.org/wikipedia/en/9/9c/Natus_Vincere_logo.png",
  country: "🇺🇦",
  countryName: "Ukrayna",
  value: "€12.4M",
  ranking: 1,
  rankChange: "+2",
  founded: "2009",
  region: "Avrupa",

  players: [
    { nick: "s1mple",  role: "AWPer",   age: 26, value: "€2.4M", country: "🇺🇦", rating: 1.27 },
    { nick: "electroNic", role: "Rifler", age: 24, value: "€1.8M", country: "🇷🇺", rating: 1.14 },
    { nick: "b1t",     role: "Rifler",  age: 21, value: "€1.2M", country: "🇺🇦", rating: 1.18 },
    { nick: "Perfecto", role: "Support", age: 23, value: "€0.9M", country: "🇷🇺", rating: 1.08 },
    { nick: "npl",     role: "IGL",     age: 22, value: "€0.8M", country: "🇺🇦", rating: 1.05 },
  ],

  recentMatches: [
    { opponent: "FaZe",     result: "W", score: "2-0", event: "ESL Pro League", date: "24 Nis" },
    { opponent: "G2",       result: "W", score: "2-1", event: "ESL Pro League", date: "22 Nis" },
    { opponent: "Vitality", result: "L", score: "0-2", event: "BLAST Premier",  date: "19 Nis" },
    { opponent: "NIP",      result: "W", score: "2-0", event: "BLAST Premier",  date: "17 Nis" },
    { opponent: "Heroic",   result: "W", score: "2-1", event: "IEM Dallas",     date: "14 Nis" },
  ],

  transfers: [
    { nick: "npl",     type: "in",  from: "Entropiq",  date: "Oca 2023" },
    { nick: "Perfecto", type: "in", from: "free agent", date: "Mar 2022" },
    { nick: "Boombl4",  type: "out", to: "Cloud9",     date: "May 2022" },
    { nick: "flamie",   type: "out", to: "free agent", date: "Ara 2021" },
  ],

  stats: {
    winRate: "68%",
    mapsPlayed: 184,
    avgRating: 1.14,
    pistolWin: "54%",
    ctWin: "52%",
    tWin: "48%",
  },
};

function WinBadge({ result }) {
  const isWin = result === "W";
  return (
    <span className={isWin ? styles.win : styles.loss}>{result}</span>
  );
}

export default function TeamPage({ gameColor = "#f0a500" }) {
  const t = TEAM;

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.logoWrapper}>
            <img src={t.logo} alt={t.name} className={styles.teamLogo} />
          </div>

          <div className={styles.heroInfo}>
            <div className={styles.heroMeta}>
              <span className={styles.flag}>{t.country} {t.countryName}</span>
              <span className={styles.region}>{t.region}</span>
              <span className={styles.founded}>Kuruluş: {t.founded}</span>
            </div>
            <h1 className={styles.teamName}>{t.name}</h1>
            <p className={styles.fullName}>{t.fullName}</p>
            <div className={styles.heroTags}>
              <span className={styles.tag}>Değer: <b style={{ color: gameColor }}>{t.value}</b></span>
              <span className={styles.tag}>Bölge: <b>{t.region}</b></span>
              <span className={styles.tag}>Kuruluş: <b>{t.founded}</b></span>
            </div>
          </div>

          {/* Sıralama */}
          <div className={styles.rankBadge} style={{ borderColor: gameColor + "55" }}>
            <span className={styles.rankHash} style={{ color: gameColor }}>#</span>
            <span className={styles.rankNum} style={{ color: gameColor }}>{t.ranking}</span>
            <span className={styles.rankChange} style={{ color: "#22c55e" }}>{t.rankChange}</span>
            <span className={styles.rankLabel}>Dünya Sıralaması</span>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className={styles.grid}>

        {/* Oyuncu Kartları */}
        <section className={styles.card} style={{ gridColumn: "span 2" }}>
          <h2 className={styles.cardTitle} style={{ color: gameColor }}>Oyuncular</h2>
          <div className={styles.playerList}>
            {t.players.map((p) => (
              <div key={p.nick} className={styles.playerRow} style={{ "--gc": gameColor }}>
                <div className={styles.playerAvatar} style={{ background: gameColor + "15", color: gameColor }}>
                  {p.nick[0]}
                </div>
                <div className={styles.playerInfo}>
                  <span className={styles.playerNick}>{p.nick}</span>
                  <span className={styles.playerMeta}>{p.country} · {p.role} · {p.age} yaş</span>
                </div>
                <div className={styles.playerRating} style={{ color: gameColor }}>
                  <span className={styles.ratingVal}>{p.rating}</span>
                  <span className={styles.ratingLbl}>Rating</span>
                </div>
                <div className={styles.playerValue}>{p.value}</div>
                <span className={styles.arrow} style={{ color: gameColor }}>→</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mini İstatistik */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle} style={{ color: gameColor }}>Mini İstatistik</h2>
          <div className={styles.statsGrid}>
            {[
              { label: "Galibiyet",   val: t.stats.winRate },
              { label: "Maç",         val: t.stats.mapsPlayed },
              { label: "Ort. Rating", val: t.stats.avgRating },
              { label: "Pistol Win",  val: t.stats.pistolWin },
              { label: "CT Tarafı",   val: t.stats.ctWin },
              { label: "T Tarafı",    val: t.stats.tWin },
            ].map((s) => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statVal} style={{ color: gameColor }}>{s.val}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Son Maçlar */}
        <section className={styles.card} style={{ gridColumn: "span 2" }}>
          <h2 className={styles.cardTitle} style={{ color: gameColor }}>Oynanan Son Maçlar</h2>
          <div className={styles.matchList}>
            {t.recentMatches.map((m, i) => (
              <div key={i} className={styles.matchRow}>
                <WinBadge result={m.result} />
                <span className={styles.matchOpp}>{m.opponent}</span>
                <span className={styles.matchScore} style={{ color: gameColor }}>{m.score}</span>
                <span className={styles.matchEvent}>{m.event}</span>
                <span className={styles.matchDate}>{m.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Kadro Değişimi */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle} style={{ color: gameColor }}>Kadro Değişimi</h2>
          <div className={styles.transferList}>
            {t.transfers.map((tr, i) => (
              <div key={i} className={styles.transferRow}>
                <span
                  className={styles.transferBadge}
                  style={{
                    background: tr.type === "in" ? "#22c55e18" : "#ef444418",
                    color: tr.type === "in" ? "#22c55e" : "#ef4444",
                  }}
                >
                  {tr.type === "in" ? "GİRİŞ" : "ÇIKIŞ"}
                </span>
                <div className={styles.transferInfo}>
                  <span className={styles.transferNick}>{tr.nick}</span>
                  <span className={styles.transferDetail}>
                    {tr.type === "in" ? `← ${tr.from}` : `→ ${tr.to}`}
                  </span>
                </div>
                <span className={styles.transferDate}>{tr.date}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}