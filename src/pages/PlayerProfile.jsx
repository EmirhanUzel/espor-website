import { useState } from "react";
import styles from "./PlayerProfile.module.css";

function TransferChart({ data, color }) {
  const w = 420, h = 100, pad = 12;
  const max = Math.max(...data.map(d => d.val));
  const min = Math.min(...data.map(d => d.val));
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.val - min) / range) * (h - pad * 2);
    return { x, y, ...d };
  });
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `${pad},${h} ${pts.map(p => `${p.x},${p.y}`).join(" ")} ${w - pad},${h}`;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h + 28}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="tgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#tgrad)" />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke={color} strokeWidth="2" />
            <text x={p.x} y={h + 20} textAnchor="middle" fontSize="10" fill="#aaa">{p.year}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const PLAYER = {
  nickname: "s1mple",
  fullName: "Oleksandr Kostyliev",
  photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/S1mple_at_IEM_Katowice_2020.jpg/440px-S1mple_at_IEM_Katowice_2020.jpg",
  country: "🇺🇦", countryName: "Ukrayna",
  age: 26, position: "AWPer",
  team: "NAVI", marketValue: "€2.4M",
  stats: { rating: 1.27, kd: 1.58, adr: 84.2, hs: "42%", maps: 312 },
  transferHistory: [
    { year: "2013", val: 0.05, label: "€50K", team: "HellRaisers" },
    { year: "2015", val: 0.2,  label: "€200K", team: "Flipsid3" },
    { year: "2016", val: 0.6,  label: "€600K", team: "NAVI" },
    { year: "2019", val: 1.2,  label: "€1.2M", team: "NAVI" },
    { year: "2021", val: 2.0,  label: "€2.0M", team: "NAVI" },
    { year: "2023", val: 2.4,  label: "€2.4M", team: "NAVI" },
  ],
  career: [
    { year: "2013", team: "HellRaisers", note: "Profesyonel başlangıç" },
    { year: "2015", team: "Flipsid3",    note: "İlk büyük turnuvalar" },
    { year: "2016", team: "NAVI",        note: "Kariyer dönüm noktası" },
    { year: "2019", team: "NAVI",        note: "Major finali" },
    { year: "2021", team: "NAVI",        note: "Major & #1 şampiyonluğu" },
    { year: "2023", team: "NAVI",        note: "Kaptan rolü" },
  ],
  awards: [
    { year: 2021, title: "HLTV #1 Oyuncu",      icon: "🏆" },
    { year: 2021, title: "PGL Major Şampiyonu",  icon: "🥇" },
    { year: 2020, title: "ESL One Cologne MVP",  icon: "⭐" },
    { year: 2019, title: "ECS Sezon 7 MVP",      icon: "⭐" },
    { year: 2018, title: "FACEIT Major MVP",      icon: "🥇" },
  ],
  socials: {
    twitter:   { url: "https://twitter.com/s1mpleO",       label: "@s1mpleO" },
    twitch:    { url: "https://twitch.tv/s1mple",          label: "s1mple" },
    instagram: { url: "https://instagram.com/s1mple",      label: "@s1mple" },
  },
  relatedPlayers: [
    { nick: "NiKo",   team: "G2",       pos: "Rifler" },
    { nick: "ZywOo",  team: "Vitality", pos: "AWPer" },
    { nick: "device", team: "NIP",      pos: "AWPer" },
  ],
};

function IconTwitter() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}
function IconTwitch() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>;
}
function IconInstagram() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
}

const SOCIAL_ICONS = { twitter: <IconTwitter />, twitch: <IconTwitch />, instagram: <IconInstagram /> };
const SOCIAL_NAMES = { twitter: "Twitter / X", twitch: "Twitch", instagram: "Instagram" };

export default function PlayerProfile({ gameColor = "#f0a500" }) {
  const p = PLAYER;

  return (
    <div className={styles.page}>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.avatarWrapper}>
            <img src={p.photo} alt={p.nickname} className={styles.avatar} />
            <div className={styles.avatarRing} style={{ borderColor: gameColor }} />
          </div>

          <div className={styles.heroInfo}>
            <div className={styles.heroMeta}>
              <span className={styles.flag}>{p.country} {p.countryName}</span>
              <span className={styles.pos} style={{ color: gameColor, background: gameColor + "15" }}>
                {p.position}
              </span>
            </div>
            <h1 className={styles.nickname}>{p.nickname}</h1>
            <p className={styles.fullName}>{p.fullName}</p>
            <div className={styles.heroTags}>
              <span className={styles.tag}>Yaş: <b>{p.age}</b></span>
              <span className={styles.tag}>Takım: <b style={{ color: gameColor }}>{p.team}</b></span>
              <span className={styles.tag}>Piyasa Değeri: <b style={{ color: gameColor }}>{p.marketValue}</b></span>
            </div>
          </div>

          <div className={styles.ratingBadge} style={{ borderColor: gameColor + "60" }}>
            <span className={styles.ratingNum} style={{ color: gameColor }}>{p.stats.rating}</span>
            <span className={styles.ratingLabel}>Rating</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>

        {/* Stats */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle} style={{ color: gameColor }}>İstatistikler</h2>
          <div className={styles.statsGrid}>
            {[
              { label: "Rating", val: p.stats.rating },
              { label: "K/D",    val: p.stats.kd },
              { label: "ADR",    val: p.stats.adr },
              { label: "HS%",    val: p.stats.hs },
              { label: "Maç",    val: p.stats.maps },
            ].map((s) => (
              <div className={styles.statItem} key={s.label} style={{ "--gc": gameColor }}>
                <span className={styles.statVal} style={{ color: gameColor }}>{s.val}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bonservis Grafiği */}
        <section className={styles.card} style={{ gridColumn: "span 2" }}>
          <div className={styles.chartHeader}>
            <h2 className={styles.cardTitle} style={{ color: gameColor }}>Bonservis Bedeli Geçmişi</h2>
            <span className={styles.currentVal} style={{ color: gameColor }}>{p.marketValue}</span>
          </div>
          <TransferChart data={p.transferHistory} color={gameColor} />
          <div className={styles.transferList}>
            {p.transferHistory.map((t, i) => (
              <div key={i} className={styles.transferRow}>
                <span className={styles.transferYear} style={{ color: gameColor }}>{t.year}</span>
                <span className={styles.transferTeam}>{t.team}</span>
                <span className={styles.transferVal} style={{ color: gameColor }}>{t.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Kariyer */}
        <section className={styles.card} style={{ gridColumn: "span 2" }}>
          <h2 className={styles.cardTitle} style={{ color: gameColor }}>Kariyer Zaman Akışı</h2>
          <div className={styles.timeline}>
            {p.career.map((c, i) => (
              <div className={styles.timelineItem} key={i}>
                <div className={styles.timelineDot} style={{ background: gameColor }} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineYear} style={{ color: gameColor }}>{c.year}</span>
                  <span className={styles.timelineTeam}>{c.team}</span>
                  <span className={styles.timelineNote}>{c.note}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ödüller */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle} style={{ color: gameColor }}>Ödüller</h2>
          <ul className={styles.awardList}>
            {p.awards.map((a, i) => (
              <li className={styles.awardItem} key={i}>
                <span className={styles.awardIcon}>{a.icon}</span>
                <div>
                  <div className={styles.awardTitle}>{a.title}</div>
                  <div className={styles.awardYear}>{a.year}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Sosyal + İlgili */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle} style={{ color: gameColor }}>Sosyal Medya</h2>
          <div className={styles.socials}>
            {Object.entries(p.socials).map(([key, val]) => (
              <a key={key} href={val.url} className={styles.socialBtn} style={{ "--gc": gameColor }} target="_blank" rel="noreferrer">
                <span className={styles.socialIcon} style={{ color: gameColor }}>{SOCIAL_ICONS[key]}</span>
                <div className={styles.socialTexts}>
                  <span className={styles.socialPlatform}>{SOCIAL_NAMES[key]}</span>
                  <span className={styles.socialHandle}>{val.label}</span>
                </div>
              </a>
            ))}
          </div>

          <h2 className={styles.cardTitle} style={{ color: gameColor, marginTop: "28px" }}>İlgili Oyuncular</h2>
          <div className={styles.relatedList}>
            {p.relatedPlayers.map((rp) => (
              <div className={styles.relatedItem} key={rp.nick} style={{ "--gc": gameColor }}>
                <div className={styles.relatedAvatar} style={{ background: gameColor + "18", color: gameColor }}>
                  {rp.nick[0]}
                </div>
                <div>
                  <div className={styles.relatedNick}>{rp.nick}</div>
                  <div className={styles.relatedMeta}>{rp.team} · {rp.pos}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}