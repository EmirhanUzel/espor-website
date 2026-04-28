import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

const FEATURED_PLAYERS = [
  { nick: "s1mple",  team: "NAVI",     pos: "AWPer",   value: "€2.4M", country: "🇺🇦" },
  { nick: "NiKo",    team: "G2",       pos: "Rifler",  value: "€2.1M", country: "🇧🇦" },
  { nick: "ZywOo",   team: "Vitality", pos: "AWPer",   value: "€1.9M", country: "🇫🇷" },
  { nick: "device",  team: "NIP",      pos: "AWPer",   value: "€1.7M", country: "🇩🇰" },
  { nick: "sh1ro",   team: "Cloud9",   pos: "AWPer",   value: "€1.5M", country: "🇷🇺" },
  { nick: "broky",   team: "FaZe",     pos: "AWPer",   value: "€1.4M", country: "🇵🇹" },
];

export default function Home({ gameColor, activeGame }) {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero} style={{ borderColor: gameColor + "33" }}>
        <div className={styles.heroLabel} style={{ color: gameColor }}>
          {activeGame.toUpperCase()} · ESPORTSı TAKİP ET
        </div>
        <h1 className={styles.heroTitle}>
          En İyi Oyuncuları<br />
          <span style={{ color: gameColor }}>Keşfet & Takip Et</span>
        </h1>
        <p className={styles.heroSub}>
          Turnuvalar, canlı maçlar ve oyuncu istatistikleri tek platformda.
        </p>
      </div>

      {/* Oyuncu Kartları */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Öne Çıkan Oyuncular</h2>
          <span className={styles.sectionSub} style={{ color: gameColor }}>
            {activeGame.toUpperCase()}
          </span>
        </div>

        <div className={styles.playerGrid}>
          {FEATURED_PLAYERS.map((p) => (
            <div
              key={p.nick}
              className={styles.playerCard}
              style={{ "--gc": gameColor }}
              onClick={() => navigate(`/oyuncu/${p.nick.toLowerCase()}`)}
            >
              <div className={styles.cardAvatar} style={{ background: gameColor + "18", color: gameColor }}>
                {p.country}
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardNick}>{p.nick}</div>
                <div className={styles.cardMeta}>{p.team} · {p.pos}</div>
              </div>
              <div className={styles.cardValue} style={{ color: gameColor }}>{p.value}</div>
              <div className={styles.cardArrow} style={{ color: gameColor }}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}