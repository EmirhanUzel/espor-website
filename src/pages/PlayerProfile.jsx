import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlayer, getTeam, formatDate, formatPrize, getFlag, getMatches, getPrizeResults, getInterviews, TOURNAMENTS } from "../services/api";
import {
  getCS2PlayerProfile, getCS2PlayerCareer, getCS2PlayerAllPlacements, getCS2TeamRecentMatches, getCS2TeamUpcomingMatches, getCS2TeamLogos, getCS2PlayerImage, getCS2PlayerMatchStats,
  getLoLPlayerProfile, getLoLPlayerCareer, getLoLPlayerAllPlacements, getLoLTeamRecentMatches, getLoLTeamUpcomingMatches, getLoLTeamLogos, getLoLPlayerImage,
} from "../services/liquipediaApi";
import styles from "./PlayerProfile.module.css";
import { useLanguage } from "../contexts/LanguageContext";
import { getFaceitPlayerStats } from "../services/faceitApi";
import { calcPlayerValue } from "../services/playerValuation";

// ── Market Value Line Chart ────────────────────────────────────────────────────
function MarketValueChart({ history, current }) {
  const { t } = useLanguage();
  if (!history?.length) return null;
  const W = 560, H = 130, padX = 16, padY = 20;

  const all = [...history.map(h => h.value), current].filter(Boolean);
  const max = Math.max(...all) * 1.1;
  const min = Math.min(...all) * 0.9;
  const range = max - min || 1;

  const pts = history.map((h, i) => ({
    x: padX + (i / Math.max(history.length - 1, 1)) * (W - padX * 2),
    y: padY + H - ((h.value - min) / range) * H,
    value: h.value,
    date: h.date,
  }));

  const linePath = pts.reduce((d, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = pts[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${d} C ${cpX},${prev.y} ${cpX},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const areaPath = `${linePath} L ${lastPt.x},${padY + H} L ${firstPt.x},${padY + H} Z`;

  const fmt = v => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`;

  return (
    <div className={styles.mvChartWrap}>
      <svg viewBox={`0 0 ${W} ${H + padY + 32}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="mvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--text-1)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--text-1)" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#mvGrad)" />
        <path d={linePath} fill="none" stroke="var(--text-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={i === pts.length - 1 ? 6 : 4}
              fill={i === pts.length - 1 ? "var(--text-1)" : "var(--bg)"}
              stroke="var(--text-1)" strokeWidth="2" />
            <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="10" fill="var(--text-3)" fontFamily="var(--font-body)">
              {fmt(pt.value)}
            </text>
            <text x={pt.x} y={H + padY + 22} textAnchor="middle" fontSize="10" fill="var(--text-4)" fontFamily="var(--font-body)">
              {pt.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Earnings Bar Chart ─────────────────────────────────────────────────────────
function EarningsChart({ data }) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(...entries.map(([, v]) => v));
  const barW = 28, gap = 14, padY = 12, H = 100;
  const contentW = entries.length * (barW + gap) - gap;
  const viewBoxW = Math.max(contentW + 32, 320);
  const startX = (viewBoxW - contentW) / 2;
  const fmt = v => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`;

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${viewBoxW} ${H + 44}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        {entries.map(([year, val], i) => {
          const barH = max > 0 ? Math.max((val / max) * H, 4) : 4;
          const x = startX + i * (barW + gap);
          const y = padY + H - barH;
          return (
            <g key={year}>
              <rect x={x} y={y} width={barW} height={barH} fill="var(--text-1)" rx="3" />
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="var(--font-body)">{fmt(val)}</text>
              <text x={x + barW / 2} y={H + padY + 20} textAnchor="middle" fontSize="10" fill="var(--text-4)" fontFamily="var(--font-body)">{year}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const ALLOWED_SOCIALS = ["twitter", "x", "instagram", "steam", "twitch"];

function SocialIcon({ platform }) {
  const icons = {
    twitter:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    x:         <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    instagram: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
    twitch:    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>,
    steam:     <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.718L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.497 1.009 2.453-.397.957-1.497 1.41-2.454 1.014H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/></svg>,
    youtube:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
    tiktok:    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/></svg>,
  };
  return icons[platform] || null;
}

function RecentStats({ stats }) {
  if (!stats) return null;
  return (
    <div className={styles.recentWrap}>
      <div className={styles.recentGrid}>
        {stats.stats.map(s => (
          <div key={s.label} className={styles.recentItem}>
            <span className={styles.recentVal}>{s.value}</span>
            <span className={styles.recentLabel}>{s.label}</span>
          </div>
        ))}
        {stats.highlight && (
          <div className={`${styles.recentItem} ${styles.recentHighlight}`}>
            <span className={styles.recentVal}>{stats.highlight.value}</span>
            <span className={styles.recentLabel}>{stats.highlight.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CareerTimeline({ career }) {
  if (!career?.length) return null;
  return (
    <div style={{ overflowX: "auto", paddingBottom: 8, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "inline-flex", gap: 0, minWidth: "max-content", position: "relative", paddingLeft: 4, paddingRight: 4 }}>
        <div style={{
          position: "absolute", top: 18, left: 24, right: 24, height: 2,
          background: "var(--border)", zIndex: 0,
        }} />
        {career.map((c, i) => {
          const isLast = i === career.length - 1;
          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              minWidth: 140, padding: "0 8px", position: "relative", zIndex: 1,
            }}>
              <div style={{
                width: isLast ? 16 : 12, height: isLast ? 16 : 12,
                borderRadius: "50%",
                background: isLast ? "var(--text-1)" : "var(--bg)",
                border: `2px solid var(--text-1)`,
                marginBottom: 12, flexShrink: 0,
              }} />
              <span style={{
                fontSize: 13, fontWeight: 800, color: "var(--text-1)",
                fontFamily: "var(--font-display)", marginBottom: 4,
              }}>{c.year}</span>
              <Link
                to={`/team/${encodeURIComponent(c.team)}`}
                style={{
                  fontSize: 12, fontWeight: 700, color: "var(--text-2)",
                  textAlign: "center", marginBottom: 4, lineHeight: 1.2,
                  textDecoration: "none", transition: "color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-2)"}
              >{c.team}</Link>
              {c.note && (
                <span style={{
                  fontSize: 10, color: "var(--text-4)", textAlign: "center",
                  lineHeight: 1.4, maxWidth: 120,
                }}>{c.note}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function calcAge(birthdate) {
  if (!birthdate || birthdate.startsWith("0000")) return null;
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

// Shows a player photo from a known URL, or a styled letter avatar as fallback.
function PlayerAvatar({ id, staticUrl, letterClass, imgClass }) {
  const [failed, setFailed] = useState(false);
  if (staticUrl && !failed) {
    return (
      <img
        src={staticUrl}
        alt={id}
        className={imgClass}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }
  return <span className={letterClass}>{(id || "?")[0].toUpperCase()}</span>;
}

// ── CS2 API player profile ─────────────────────────────────────────────────────
function useCS2Player(id) {
  const [player,       setPlayer]       = useState(null);
  const [career,       setCareer]       = useState(null);
  const [matches,      setMatches]      = useState(null);
  const [upcoming,     setUpcoming]     = useState(null);
  const [placements,   setPlacements]   = useState(null);
  const [teamLogoUrl,  setTeamLogoUrl]  = useState("");
  const [playerImgUrl, setPlayerImgUrl] = useState("");
  const [matchStats,   setMatchStats]   = useState(null);
  const [matchLogos,   setMatchLogos]   = useState({});
  const [faceitStats,  setFaceitStats]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPlayer(null); setCareer(null); setMatches(null); setUpcoming(null); setPlacements(null); setTeamLogoUrl(""); setPlayerImgUrl(""); setMatchStats(null); setMatchLogos({}); setFaceitStats(null);

    getCS2PlayerProfile(id).then(p => {
      if (cancelled) return;
      setPlayer(p);
      setLoading(false);
      if (!p) return;

      getCS2PlayerImage(p.pagename).then(url => { if (!cancelled) setPlayerImgUrl(url); });
      getFaceitPlayerStats(id, p.faceitId || null).then(s => { if (!cancelled) setFaceitStats(s); }).catch(() => {});

      if (p.team) {
        getCS2TeamRecentMatches(p.team, 20).then(m => {
          if (cancelled) return;
          setMatches(m);
          const oppNames = [...new Set(
            m.flatMap(match => match.match2opponents.map(o => o.name)).filter(n => n && n !== p.team)
          )];
          if (oppNames.length) {
            getCS2TeamLogos(oppNames).then(logoMap => { if (!cancelled) setMatchLogos(prev => ({ ...prev, ...logoMap })); });
          }
        });
        getCS2TeamUpcomingMatches(p.team, 5).then(u => {
          if (cancelled) return;
          setUpcoming(u);
          const oppNames = [...new Set(
            u.flatMap(m => m.match2opponents.map(o => o.name)).filter(n => n && n !== p.team)
          )];
          if (oppNames.length) {
            getCS2TeamLogos(oppNames).then(logoMap => { if (!cancelled) setMatchLogos(prev => ({ ...prev, ...logoMap })); });
          }
        });
        getCS2TeamLogos([p.team]).then(logoMap => {
          if (!cancelled) setTeamLogoUrl(logoMap[p.team] || "");
        });
        getCS2PlayerMatchStats(p.pagename, p.team).then(s => { if (!cancelled) setMatchStats(s); });
      }

      getCS2PlayerCareer(p.pagename).then(c => {
        if (cancelled) return;
        setCareer(c);
        const allTeams = [...new Set([p.team, ...c.map(e => e.team)].filter(Boolean))];
        getCS2PlayerAllPlacements(allTeams).then(pl => { if (!cancelled) setPlacements(pl); });
      });
    }).catch(() => { if (!cancelled) { setPlayer(null); setLoading(false); } });

    return () => { cancelled = true; };
  }, [id]);

  return { player, career, matches, upcoming, placements, teamLogoUrl, playerImgUrl, matchStats, matchLogos, faceitStats, loading };
}

// ── LoL API player profile ────────────────────────────────────────────────────
function calcLoLFormStats(matches, teamName) {
  if (!matches?.length) return null;
  const teamLow = teamName.toLowerCase();
  const finished = matches.filter(m => m.finished === 1);
  if (!finished.length) return null;

  const wins = finished.filter(m => {
    const idx = m.match2opponents.findIndex(o => o.name.toLowerCase() === teamLow);
    return idx !== -1 && m.winner === String(idx + 1);
  }).length;

  const totalGames = finished.reduce((s, m) =>
    s + (m.match2games?.filter(g => g.winner === '1' || g.winner === '2').length || 0), 0
  );
  const gameWins = finished.reduce((s, m) => {
    const idx = m.match2opponents.findIndex(o => o.name.toLowerCase() === teamLow);
    return s + (m.match2games?.filter(g => g.winner === String(idx + 1)).length || 0);
  }, 0);

  return {
    wins,
    losses: finished.length - wins,
    total: finished.length,
    winRate: Math.round((wins / finished.length) * 100),
    gameWinRate: totalGames > 0 ? Math.round((gameWins / totalGames) * 100) : null,
  };
}

function useLoLPlayer(id) {
  const [player,       setPlayer]       = useState(null);
  const [career,       setCareer]       = useState(null);
  const [matches,      setMatches]      = useState(null);
  const [upcoming,     setUpcoming]     = useState(null);
  const [placements,   setPlacements]   = useState(null);
  const [teamLogoUrl,  setTeamLogoUrl]  = useState("");
  const [playerImgUrl, setPlayerImgUrl] = useState("");
  const [matchLogos,   setMatchLogos]   = useState({});
  const [matchStats,   setMatchStats]   = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setPlayer(null); setCareer(null); setMatches(null); setUpcoming(null); setPlacements(null); setTeamLogoUrl(""); setPlayerImgUrl(""); setMatchLogos({}); setMatchStats(null);

    getLoLPlayerProfile(id).then(p => {
      if (cancelled) return;
      setPlayer(p);
      setLoading(false);
      if (!p) return;

      getLoLPlayerImage(p.pagename).then(url => { if (!cancelled) setPlayerImgUrl(url); });

      if (p.team) {
        getLoLTeamRecentMatches(p.team, 20).then(m => {
          if (cancelled) return;
          setMatches(m);
          setMatchStats(calcLoLFormStats(m, p.team));
          const oppNames = [...new Set(
            m.flatMap(match => match.match2opponents.map(o => o.name)).filter(n => n && n !== p.team)
          )];
          if (oppNames.length) {
            getLoLTeamLogos(oppNames).then(logoMap => { if (!cancelled) setMatchLogos(prev => ({ ...prev, ...logoMap })); });
          }
        });
        getLoLTeamUpcomingMatches(p.team, 5).then(u => {
          if (cancelled) return;
          setUpcoming(u);
          const oppNames = [...new Set(
            u.flatMap(m => m.match2opponents.map(o => o.name)).filter(n => n && n !== p.team)
          )];
          if (oppNames.length) {
            getLoLTeamLogos(oppNames).then(logoMap => { if (!cancelled) setMatchLogos(prev => ({ ...prev, ...logoMap })); });
          }
        });
        getLoLTeamLogos([p.team]).then(logoMap => {
          if (!cancelled) setTeamLogoUrl(logoMap[p.team] || "");
        });
      }

      getLoLPlayerCareer(p.pagename).then(c => {
        if (cancelled) return;
        setCareer(c);
        const allTeams = [...new Set([p.team, ...c.map(e => e.team)].filter(Boolean))];
        getLoLPlayerAllPlacements(allTeams).then(pl => { if (!cancelled) setPlacements(pl); });
      });
    }).catch(() => { if (!cancelled) { setPlayer(null); setLoading(false); } });

    return () => { cancelled = true; };
  }, [id]);

  return { player, career, matches, upcoming, placements, teamLogoUrl, playerImgUrl, matchStats, matchLogos, loading };
}

// Oyuncunun career (transfer geçmişi) verisiyle placements'ı filtreler.
// Her placement için oyuncunun o takımda o tarihte aktif olup olmadığını kontrol eder.
// ── Aurora player mock bonservis history (per-player, keyed by lowercase pagename) ──
// Değerler HLTV sıralama, turnuva performansı ve kariyer olaylarına göre
// ── Player mock news (keyed by lowercase pagename) ───────────────────────────
const PLAYER_MOCK_NEWS = {
  'xantares': [
    { type: 'Interview', publisher: 'HLTV.org',    date: '2025-04-18 00:00:00', title: 'xantares: "Aurora is the most motivated roster I have ever been part of"', link: '#' },
    { type: 'Article',   publisher: 'HLTV.org',    date: '2025-03-09 00:00:00', title: 'xantares ranked #14 in HLTV Top 20 players of 2024', link: '#' },
    { type: 'Article',   publisher: 'Esports.gg',  date: '2024-11-22 00:00:00', title: 'xantares hits 1.25 rating at IEM Cologne as Aurora reach playoffs', link: '#' },
    { type: 'Interview', publisher: 'Dust2.dk',    date: '2024-08-05 00:00:00', title: 'xantares on longevity: "Age is just a number when you keep grinding"', link: '#' },
    { type: 'Article',   publisher: 'HLTV.org',    date: '2024-03-14 00:00:00', title: 'Aurora sign xantares on long-term deal ahead of spring season', link: '#' },
  ],
  'woxic': [
    { type: 'Article',   publisher: 'HLTV.org',    date: '2025-05-02 00:00:00', title: 'woxic named best AWPer of ESL Pro League Season 21 group stage', link: '#' },
    { type: 'Interview', publisher: 'HLTV.org',    date: '2025-02-17 00:00:00', title: 'woxic: "The break was necessary — I came back stronger and hungrier"', link: '#' },
    { type: 'Article',   publisher: 'Esports.gg',  date: '2024-10-30 00:00:00', title: 'woxic posts 82.3 ADR at BLAST Premier Fall as Aurora upset NaVi', link: '#' },
    { type: 'Article',   publisher: 'HLTV.org',    date: '2024-06-11 00:00:00', title: 'woxic: From Cloud9 struggles to Aurora revival — a career retrospective', link: '#' },
    { type: 'Interview', publisher: 'Dust2.global', date: '2023-09-24 00:00:00', title: 'woxic on joining Aurora: "This team has the right structure to go deep"', link: '#' },
  ],
  'maj3r': [
    { type: 'Interview', publisher: 'HLTV.org',    date: '2025-04-30 00:00:00', title: 'maj3r: "I stepped away from CS because I needed to rediscover my love for the game"', link: '#' },
    { type: 'Article',   publisher: 'Esports.gg',  date: '2025-01-15 00:00:00', title: 'maj3r voted best IGL of 2024 by HLTV community poll', link: '#' },
    { type: 'Article',   publisher: 'HLTV.org',    date: '2024-09-03 00:00:00', title: 'Aurora\'s tactical dominance at IEM Sydney traced back to maj3r\'s calling', link: '#' },
    { type: 'Interview', publisher: 'Dust2.dk',    date: '2024-04-19 00:00:00', title: 'maj3r on his comeback: "I trained harder than ever during my time away"', link: '#' },
    { type: 'Article',   publisher: 'HLTV.org',    date: '2023-11-08 00:00:00', title: 'maj3r officially returns to professional CS2 scene with Aurora', link: '#' },
  ],
  'wicadia': [
    { type: 'Article',   publisher: 'HLTV.org',    date: '2025-05-08 00:00:00', title: 'wicadia breaks onto AWP scene with 1.31 rating at BLAST Spring', link: '#' },
    { type: 'Interview', publisher: 'Esports.gg',  date: '2025-03-21 00:00:00', title: 'wicadia: "xantares and woxic push me to get better every single day"', link: '#' },
    { type: 'Article',   publisher: 'HLTV.org',    date: '2024-12-04 00:00:00', title: 'Aurora sign wicadia as rising AWP talent for 2025 season', link: '#' },
    { type: 'Article',   publisher: 'Dust2.dk',    date: '2024-08-17 00:00:00', title: 'wicadia shines at regional qualifier: "The sky is the limit for this kid"', link: '#' },
  ],
  'soulfly': [
    { type: 'Article',   publisher: 'HLTV.org',    date: '2025-04-25 00:00:00', title: 'soulfly posts career-high 1.28 rating as Aurora top group at ESL Pro League', link: '#' },
    { type: 'Interview', publisher: 'Esports.gg',  date: '2025-02-10 00:00:00', title: 'soulfly: "Playing alongside this roster has elevated my entire game"', link: '#' },
    { type: 'Article',   publisher: 'HLTV.org',    date: '2024-11-19 00:00:00', title: 'soulfly named Aurora\'s most consistent fragger through fall season', link: '#' },
    { type: 'Article',   publisher: 'Dust2.global', date: '2024-07-02 00:00:00', title: 'Aurora complete roster with soulfly signing ahead of second half of 2024', link: '#' },
  ],
};

const AURORA_PLAYER_MV_DATA = {
  // xantares — BIG dönemi uzun kariyer, 2023+ Aurora ile top 20'ye geri dönüş
  'xantares': { '2018': 450_000, '2019': 750_000, '2020': 880_000, '2021': 700_000, '2022': 620_000, '2023': 920_000, '2024': 1_120_000, '2025': 1_200_000 },
  // woxic — mousesports'ta dünya #10 (2020), Cloud9 sonrası uzun ara, Aurora comeback
  'woxic':    { '2019': 820_000, '2020': 1_650_000, '2021': 1_080_000, '2022': 480_000, '2023': 720_000, '2024': 980_000, '2025': 1_060_000 },
  // maj3r — erken dönem düşük değer, 2021 oyunu bırakma dönemi, Aurora ile büyük sıçrama
  'maj3r':    { '2019': 175_000, '2020': 290_000, '2021': 110_000, '2022': 220_000, '2023': 510_000, '2024': 780_000, '2025': 940_000 },
  // Calyx — tutarlı büyüme, güvenilir rifler
  'calyx':    { '2020': 270_000, '2021': 410_000, '2022': 530_000, '2023': 670_000, '2024': 790_000, '2025': 860_000 },
  // foreseT — Czech rifler, istikrarlı
  'foreset':  { '2020': 340_000, '2021': 510_000, '2022': 610_000, '2023': 710_000, '2024': 830_000, '2025': 900_000 },
  // XELLOW — genç Türk oyuncu, hızlı yükseliş
  'xellow':   { '2023': 195_000, '2024': 390_000, '2025': 490_000 },
  // ngiN — yükselen değer
  'ngin':     { '2022': 170_000, '2023': 310_000, '2024': 470_000, '2025': 530_000 },
  // wicadia — genç AWPer, Aurora'da çabuk yükseliş
  'wicadia':  { '2023': 160_000, '2024': 340_000, '2025': 520_000 },
  // soulfly — Aurora'da form yakalayan rifler
  'soulfly':  { '2023': 140_000, '2024': 310_000, '2025': 480_000 },
};

function fmtMV(val) {
  if (!val) return '$0';
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `$${Math.round(val / 1_000)}K`;
  return `$${val}`;
}

function AuroraPlayerMVLine({ data }) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length < 2) return null;
  const vals  = entries.map(([, v]) => v);
  const max   = Math.max(...vals);
  const min   = Math.min(...vals);
  const range = max - min || 1;
  const W = 400, H = 140;
  const PAD = { t: 14, r: 16, b: 32, l: 58 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;
  const pts = entries.map(([yr, v], i) => ({
    x: PAD.l + (i / (entries.length - 1)) * iW,
    y: PAD.t + iH - ((v - min) / range) * iH,
    v, yr,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${PAD.t + iH} L${pts[0].x},${PAD.t + iH} Z`;
  const yLevels  = [min, (min + max) / 2, max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.mvLineSvg}>
      <defs>
        <linearGradient id="playerMvGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--text-1)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--text-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yLevels.map((v, i) => {
        const y = (PAD.t + iH - ((v - min) / range) * iH).toFixed(1);
        return <line key={i} x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="var(--border)" strokeDasharray="3,3" />;
      })}
      <path d={areaPath} fill="url(#playerMvGrad)" />
      <path d={linePath} fill="none" stroke="var(--text-1)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" fill="var(--text-1)" stroke="var(--bg)" strokeWidth="2" />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x.toFixed(1)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--text-4)">{p.yr}</text>
      ))}
      {yLevels.map((v, i) => {
        const y = (PAD.t + iH - ((v - min) / range) * iH + 4).toFixed(1);
        return (
          <text key={i} x={PAD.l - 6} y={y} textAnchor="end" fontSize="10" fill="var(--text-4)">
            {fmtMV(v)}
          </text>
        );
      })}
    </svg>
  );
}

function filterPlacementsByCareer(placements, career) {
  if (!career?.length) return placements;
  // career: [{ team, date }] asc sıralı — her entry o takıma katıldığı tarihi gösterir
  const periods = career.map((entry, i) => ({
    team: (entry.team || '').toLowerCase(),
    from: (entry.date || '').slice(0, 10) || '0000-01-01',
    to:   (career[i + 1]?.date || '').slice(0, 10) || '9999-12-31',
  }));
  return placements.filter(p => {
    const pDate = (p.date || p.startdate || '').slice(0, 10);
    const pTeam = (p.opponentname || '').toLowerCase();
    if (!pDate || !pTeam) return true;
    return periods.some(period =>
      period.team === pTeam && pDate >= period.from && pDate < period.to
    );
  });
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PlayerProfile({ wiki }) {
  const { t } = useLanguage();
  const { id } = useParams();

  const mockPlayer = getPlayer(id);
  // wiki prop (from App.jsx active game) takes priority over mock player wiki
  const effectiveWiki = wiki || mockPlayer?.wiki || "counterstrike";
  const isLoL = effectiveWiki === "leagueoflegends";
  const isCS2 = !isLoL && effectiveWiki === "counterstrike";

  // Hooks must always be called — pass null to disable the inactive one
  const cs2 = useCS2Player(isCS2 ? id : null);
  const lol = useLoLPlayer(isLoL ? id : null);

  const active = isLoL ? lol : cs2;

  // Resolved data: API for CS2/LoL, mock for VALORANT etc.
  const player       = (isCS2 || isLoL) ? active.player       : mockPlayer;
  const career       = (isCS2 || isLoL) ? active.career        : mockPlayer?.career;
  const teamLogoUrl  = (isCS2 || isLoL) ? active.teamLogoUrl   : null;
  const playerImgUrl = (isCS2 || isLoL) ? active.playerImgUrl  : (mockPlayer?.imageurl || "");
  const matchLogos      = (isCS2 || isLoL) ? (active.matchLogos  || {}) : {};
  const upcomingMatches = (isCS2 || isLoL) ? (active.upcoming   || []) : [];
  const matchStats      = (isCS2 || isLoL) ? (active.matchStats  || null) : null;
  const faceitStats     = isCS2            ? (active.faceitStats || null) : null;

  // Must be before any conditional return — Rules of Hooks
  const [trophyPage,      setTrophyPage]      = useState(0);
  const [showAllMatches,  setShowAllMatches]  = useState(false);
  const [matchPage,       setMatchPage]       = useState(0);
  const [earningsOffset,  setEarningsOffset]  = useState(0);
  const MATCHES_PER_PAGE = 10;

  // Loading state (CS2 and LoL)
  if ((isCS2 || isLoL) && active.loading) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center", color: "var(--text-2)" }}>
        {t("common.loading") || "Loading…"}
      </div>
    );
  }

  if (!player) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>{t("player.notFound")}: {id}</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>{t("player.homeLink")}</Link>
      </div>
    );
  }

  const isApiWiki = isCS2 || isLoL;

  // For non-API wikis: use mock data
  const mockTeam = !isApiWiki ? getTeam(player.teampagename) : null;

  const age = calcAge(player.birthdate);
  const earningsYears = Object.entries(player.earningsbyyear || {}).sort(([a], [b]) => a.localeCompare(b));
  const latestYear = earningsYears[earningsYears.length - 1];

  // Matches & achievements: API for CS2/LoL, mock for others
  const recentMatches = isApiWiki
    ? (active.matches || [])
    : getMatches(player.wiki)
        .filter(m => m.match2opponents.some(o => o.name === player.teampagename))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

  // API: already filtered to placement=1; mock: filter client-side
  const teamPrizes = isApiWiki
    ? filterPlacementsByCareer(active.placements || [], active.career)
        .map(p => ({
        placement:    p.placement    || "1",
        qualifier:    p.tournament   || "",
        date:         p.date || p.startdate || "",
        prizemoney:   p.prizemoney   || 0,
        opponentname: p.opponentname || "",
        iconurl:      p.iconurl      || "",
        icondarkurl:  p.icondarkurl  || p.iconurl || "",
      }))
    : getPrizeResults(player.wiki)
        .filter(p => p.opponentname === player.teampagename && p.placement === "1")
        .sort((a, b) => new Date(b.date) - new Date(a.date));

  // ESM Player Value — CS2 oyuncuları için (FACEIT olmadan da hesaplanır)
  const esmValuation = isCS2
    ? calcPlayerValue({ player, faceitStats, placements: teamPrizes })
    : null;

  // Hesaplanan değeri cache'e yaz — takım sayfası buradan okur
  if (esmValuation && player?.id) {
    try {
      localStorage.setItem(
        `esm_val_${player.id}`,
        JSON.stringify({ usd: esmValuation.usd, value: esmValuation.value, ts: Date.now() })
      );
    } catch {}
  }

  const playerInterviews = (() => {
    const pagename = (player.pagename || player.id || '').toLowerCase();
    const mock = PLAYER_MOCK_NEWS[pagename] || [];
    const api  = isApiWiki
      ? []
      : getInterviews(player.wiki).filter(i => i.pagename === player.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    return [...mock, ...api].sort((a, b) => new Date(b.date) - new Date(a.date));
  })();

  // Team display for hero
  const teamName    = player.teampagename || player.team || "";
  const teamDisplay = isApiWiki
    ? { name: teamName, textlesslogourl: teamLogoUrl }
    : mockTeam;

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroInner}>
            {teamDisplay?.name && (
              <Link to={`/team/${encodeURIComponent(teamDisplay.name)}`} className={styles.teamLogoBox}>
                {teamDisplay.textlesslogourl
                  ? <img src={teamDisplay.textlesslogourl} alt={teamDisplay.name} className={styles.teamLogoImg} referrerPolicy="no-referrer" />
                  : <span className={styles.teamLogoFallback}>{teamDisplay.name[0]}</span>
                }
              </Link>
            )}

            <div className={styles.avatar}>
              <PlayerAvatar
                id={player.id}
                staticUrl={playerImgUrl || player.imageurl || ""}
                letterClass={styles.avatarLetter}
                imgClass={styles.avatarImg}
              />
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroMeta}>
                {player.nationality && <span className={styles.flag}>{getFlag(player.nationality)} {player.nationality}</span>}
                {player.region && <span className={styles.region}>{player.region}</span>}
                <span className={`${styles.statusBadge} ${player.status === "Active" ? styles.statusActive : styles.statusInactive}`}>
                  {player.status}
                </span>
              </div>
              <h1 className={styles.nickname}>{player.id}</h1>
              <p className={styles.fullName}>
                {player.name}
                {player.roles?.length > 0 && (
                  <span className={styles.roleBadges}>
                    {player.roles.map(r => <span key={r} className={styles.roleBadge}>{r}</span>)}
                  </span>
                )}
              </p>
              <div className={styles.heroTags}>
                {age && <span className={styles.tag}>{t("player.age")} <strong>{age}</strong></span>}
                {teamName && (
                  <Link to={`/team/${encodeURIComponent(teamName)}`} className={styles.tag} style={{ textDecoration: "none" }}>
                    {t("player.team")} <strong>{teamName}</strong>
                  </Link>
                )}
                {player.birthdate && !player.birthdate.startsWith("0000") && (
                  <span className={styles.tag}>{t("player.born")} <strong>{formatDate(player.birthdate)}</strong></span>
                )}
                {ALLOWED_SOCIALS.map(platform => {
                  const url = (player.links || {})[platform];
                  if (!url) return null;
                  return (
                    <a key={platform} href={url} target="_blank" rel="noreferrer"
                      className={styles.heroSocialLink}
                      title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                      <SocialIcon platform={platform} />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className={styles.valueBlock}>
              {esmValuation && (
                <div className={styles.marketValueBadge}>
                  <span className={styles.mvVal}>{esmValuation.value}</span>
                  <span className={styles.mvLabel}>ESM Bonservis</span>
                  <span className={styles.earningsLatest}>Skor: {esmValuation.score}/100</span>
                </div>
              )}
              {player.marketvalue && (
                <div className={styles.marketValueBadge}>
                  <span className={styles.mvVal}>{formatPrize(player.marketvalue)}</span>
                  <span className={styles.mvLabel}>{t("player.marketValue")}</span>
                </div>
              )}
              {player.earnings > 0 && (
                <div className={styles.earningsBadge}>
                  <span className={styles.earningsNum}>{formatPrize(player.earnings)}</span>
                  <span className={styles.earningsLabel}>{t("player.totalEarnings")}</span>
                  {latestYear && (
                    <span className={styles.earningsLatest}>{latestYear[0]}: {formatPrize(latestYear[1])}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.grid}>

          {teamPrizes.length > 0 && (() => {
            const PAGE = 10;
            const totalPages = Math.ceil(teamPrizes.length / PAGE);
            const visible = teamPrizes.slice(trophyPage * PAGE, (trophyPage + 1) * PAGE);
            return (
              <section className={`${styles.card} ${styles.cardWide}`}>
                <div className={styles.cardTitleRow}>
                  <h2 className={styles.cardTitle}>{t("player.achievements")} <span style={{ fontWeight: 400, fontSize: 13, color: "var(--text-3)" }}>({teamPrizes.length})</span></h2>
                  {totalPages > 1 && (
                    <div className={styles.trophyNav}>
                      <button className={styles.trophyNavBtn} disabled={trophyPage === 0} onClick={() => setTrophyPage(p => p - 1)}>‹</button>
                      <span className={styles.trophyNavLabel}>{trophyPage + 1} / {totalPages}</span>
                      <button className={styles.trophyNavBtn} disabled={trophyPage >= totalPages - 1} onClick={() => setTrophyPage(p => p + 1)}>›</button>
                    </div>
                  )}
                </div>
                <div className={styles.trophyGrid}>
                  {visible.map((p, i) => {
                    const icon = isApiWiki
                      ? p.iconurl
                      : TOURNAMENTS.find(tr =>
                          tr.name.toLowerCase().includes(p.qualifier?.split(" (#")[0]?.toLowerCase() || "___")
                        )?.iconurl;
                    return (
                      <div key={trophyPage * PAGE + i} className={styles.trophyCard}>
                        <div className={styles.trophyIconWrap}>
                          {icon
                            ? <img src={icon} alt={p.qualifier} className={styles.trophyIcon} referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = "none"; }} />
                            : <span className={styles.trophyFallback}>🏆</span>
                          }
                        </div>
                        <div className={styles.trophyInfo}>
                          <span className={styles.trophyName}>{p.qualifier || "Tournament"}</span>
                          <span className={styles.trophyDate}>{p.opponentname && <span style={{ color: "var(--text-3)" }}>{p.opponentname} · </span>}{formatDate(p.date)}</span>
                          {p.prizemoney > 0 && <span className={styles.trophyPrize}>{formatPrize(p.prizemoney)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}

          {/* Mock players: full recentstats; API players: match-based form */}
          {!isApiWiki && player.recentstats && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>{t("player.recentForm")}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={styles.recentPeriodBadge}>
                    {player.recentstats.period} · {player.recentstats.games} {player.recentstats.gamesLabel}
                  </span>
                  <Link to={`/player/${player.id}/stats`} className={styles.detailLink}>
                    {t("player.viewDetails")}
                  </Link>
                </div>
              </div>
              <RecentStats stats={player.recentstats} />
            </section>
          )}
          {isCS2 && faceitStats && (() => {
            const roles = player.roles || [];
            const isAWP     = roles.some(r => r === "AWPer");
            const isUtility = roles.some(r => r === "IGL" || r === "Support");
            const roleStat  = isAWP
              ? { label: "Sniper/Round", value: faceitStats.sniperKillRate   != null ? faceitStats.sniperKillRate.toFixed(2)           : "—" }
              : isUtility
              ? { label: "Utility %",   value: faceitStats.utilitySuccess    != null ? `${Math.round(faceitStats.utilitySuccess * 100)}%` : "—" }
              : { label: "Entry %",     value: faceitStats.entrySuccessRate  != null ? `${Math.round(faceitStats.entrySuccessRate * 100)}%` : "—" };
            return (
              <section className={`${styles.card} ${styles.cardWide}`}>
                <div className={styles.cardTitleRow}>
                  <h2 className={styles.cardTitle}>{t("player.recentForm")}</h2>
                  <span className={styles.recentPeriodBadge}>
                    FACEIT{faceitStats.matches != null ? ` · ${faceitStats.matches} Maç` : ""}
                    {faceitStats.level != null ? ` · Lvl ${faceitStats.level}` : ""}
                  </span>
                </div>
                <RecentStats stats={{
                  period: "", games: null, gamesLabel: "",
                  stats: [
                    { label: "K/D",  value: faceitStats.kd  != null ? faceitStats.kd.toFixed(2)      : "—" },
                    { label: "HS %", value: faceitStats.hs  != null ? `${faceitStats.hs.toFixed(1)}%` : "—" },
                    { label: "ADR",  value: faceitStats.adr != null ? faceitStats.adr.toFixed(1)      : "—" },
                    roleStat,
                  ],
                  highlight: null,
                }} />
              </section>
            );
          })()}
          {isLoL && matchStats && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>{t("player.recentForm")}</h2>
                <span className={styles.recentPeriodBadge}>Son {matchStats.total} Maç</span>
              </div>
              <RecentStats stats={{
                period: "", games: null, gamesLabel: "",
                stats: [
                  { label: "Win Rate",  value: `${matchStats.winRate}%` },
                  { label: "W – L",     value: `${matchStats.wins} – ${matchStats.losses}` },
                  { label: "Seriler",   value: String(matchStats.total) },
                  ...(matchStats.gameWinRate != null
                    ? [{ label: "Game Win%", value: `${matchStats.gameWinRate}%` }]
                    : []),
                ],
                highlight: null,
              }} />
            </section>
          )}

          {player.marketvaluehistory?.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>{t("player.mvHistory")}</h2>
                <span className={styles.currentMV}>{formatPrize(player.marketvalue)}</span>
              </div>
              <MarketValueChart history={player.marketvaluehistory} current={player.marketvalue} />
            </section>
          )}

          {earningsYears.length > 0 && (() => {
            const EY_PAGE = 5;
            const windowEnd = earningsYears.length - earningsOffset;
            const visibleEarnings = earningsYears.slice(Math.max(0, windowEnd - EY_PAGE), windowEnd);
            const visMax = Math.max(...visibleEarnings.map(([, v]) => v));
            const canGoOlder = windowEnd - EY_PAGE > 0;
            const canGoNewer = earningsOffset > 0;
            return (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <div className={styles.earningsSplit}>
                <div className={styles.earningsHalf}>
                  <div className={styles.cardTitleRow}>
                    <h2 className={styles.cardTitle}>{t("player.annualEarnings")}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {earningsYears.length > EY_PAGE && (
                        <div className={styles.trophyNav}>
                          <button className={styles.trophyNavBtn} disabled={!canGoOlder} onClick={() => setEarningsOffset(o => o + EY_PAGE)}>‹</button>
                          <button className={styles.trophyNavBtn} disabled={!canGoNewer} onClick={() => setEarningsOffset(o => Math.max(0, o - EY_PAGE))}>›</button>
                        </div>
                      )}
                      <span className={styles.currentMV}>{formatPrize(player.earnings)}</span>
                    </div>
                  </div>
                  <EarningsChart data={Object.fromEntries(visibleEarnings)} />
                  <div className={styles.earningsTable}>
                    {visibleEarnings.map(([year, amount]) => (
                      <div key={year} className={styles.earningsRow}>
                        <span className={styles.earningsYear}>{year}</span>
                        <div className={styles.earningsBar}>
                          <div className={styles.earningsBarFill}
                            style={{ width: `${(amount / visMax) * 100}%` }} />
                        </div>
                        <span className={styles.earningsAmount}>{formatPrize(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {(() => {
                  const pagename = (player.pagename || player.id || '').toLowerCase();
                  let mvData = isCS2 && player.team?.toLowerCase().includes('aurora')
                    ? AURORA_PLAYER_MV_DATA[pagename] || null
                    : null;
                  if (mvData && esmValuation?.usd >= 100_000) {
                    const lastYear = Object.keys(mvData).sort().at(-1);
                    mvData = { ...mvData, [lastYear]: esmValuation.usd };
                  }
                  return mvData ? (
                    <>
                      <div className={styles.earningsDivider} />
                      <div className={styles.earningsHalf}>
                        <h2 className={styles.cardTitle}>Bonservis Değişimi</h2>
                        <AuroraPlayerMVLine data={mvData} />
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            </section>
            );
          })()}

          {career?.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>{t("player.careerTimeline")}</h2>
              <CareerTimeline career={career} />
            </section>
          )}

          {(upcomingMatches.length > 0 || recentMatches.length > 0) && (() => {
            const renderMatchRow = (match, isModal) => {
              const pIdx     = match.match2opponents.findIndex(o => o.name === teamName);
              const oIdx     = pIdx === 0 ? 1 : 0;
              const isWin    = match.winner === String(pIdx + 1);
              const opp      = match.match2opponents[oIdx];
              const myScore  = match.match2opponents[pIdx]?.score ?? 0;
              const oppScore = opp?.score ?? 0;
              const logoUrl  = matchLogos[opp?.name] || null;
              return (
                <Link key={match.id} to={`/match/${match.id}`} className={styles.matchRow}
                  onClick={() => isModal && setShowAllMatches(false)}>
                  <span className={isWin ? styles.matchW : styles.matchL}>{isWin ? "W" : "L"}</span>
                  <Link to={`/team/${encodeURIComponent(opp?.name ?? '')}`} className={styles.matchOppWrap} onClick={e => e.stopPropagation()}>
                    {logoUrl
                      ? <img src={logoUrl} alt={opp?.name} className={styles.matchOppLogo} referrerPolicy="no-referrer" />
                      : <div className={styles.matchOppLogoFb}>{opp?.name?.[0] ?? '?'}</div>
                    }
                    <span className={styles.matchOpp}>{opp?.name}</span>
                  </Link>
                  <span className={styles.matchScore}>{myScore} – {oppScore}</span>
                  <div className={styles.matchRight}>
                    {match.tournament && <span className={styles.matchTournament}>{match.tournament}</span>}
                    <span className={styles.matchDate}>{formatDate(match.date)}</span>
                  </div>
                </Link>
              );
            };
            const totalPages = Math.ceil(recentMatches.length / MATCHES_PER_PAGE);
            return (
              <section className={`${styles.card} ${styles.cardWide}`}>
                <div className={styles.matchCardHeader}>
                  <h2 className={styles.matchCardTitle}>{t("player.recentMatches")}</h2>
                  {recentMatches.length > 5 && (
                    <button className={styles.seeMoreBtn} onClick={() => { setMatchPage(0); setShowAllMatches(true); }}>
                      See all {recentMatches.length} →
                    </button>
                  )}
                </div>

                <div className={styles.matchList}>
                  {upcomingMatches.slice(0, 1).map(match => {
                    const opp = match.match2opponents.find(o => o.name.toLowerCase() !== teamName.toLowerCase());
                    const logoUrl = matchLogos[opp?.name] || null;
                    return (
                      <div key={match.id} className={styles.upcomingRow}>
                        <span className={styles.upcomingBadge}>NEXT</span>
                        <Link to={`/team/${encodeURIComponent(opp?.name ?? '')}`} className={styles.matchOppWrap} onClick={e => e.stopPropagation()}>
                          {logoUrl
                            ? <img src={logoUrl} alt={opp?.name} className={styles.matchOppLogo} referrerPolicy="no-referrer" />
                            : <div className={styles.matchOppLogoFb}>{opp?.name?.[0] ?? '?'}</div>
                          }
                          <span className={styles.matchOpp}>{opp?.name}</span>
                        </Link>
                        <div className={styles.matchRight}>
                          {match.tournament && <span className={styles.matchTournament}>{match.tournament}</span>}
                          <span className={styles.matchDate}>{formatDate(match.date)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {(upcomingMatches.length > 0 && recentMatches.length > 0) && (
                    <div className={styles.matchDivider} />
                  )}
                  {recentMatches.slice(0, 5).map(m => renderMatchRow(m, false))}
                </div>

                {showAllMatches && (
                  <div className={styles.modalOverlay} onClick={() => setShowAllMatches(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                      <div className={styles.modalHeader}>
                        <span className={styles.modalTitle}>Matches — {teamName}</span>
                        <button className={styles.modalClose} onClick={() => setShowAllMatches(false)}>✕</button>
                      </div>
                      <div className={styles.modalBody}>
                        {recentMatches.slice(matchPage * MATCHES_PER_PAGE, (matchPage + 1) * MATCHES_PER_PAGE).map(m => renderMatchRow(m, true))}
                      </div>
                      {totalPages > 1 && (
                        <div className={styles.modalPager}>
                          <button className={styles.pagerBtn} disabled={matchPage === 0} onClick={() => setMatchPage(p => p - 1)}>← Prev</button>
                          <span className={styles.pagerInfo}>{matchPage + 1} / {totalPages}</span>
                          <button className={styles.pagerBtn} disabled={matchPage === totalPages - 1} onClick={() => setMatchPage(p => p + 1)}>Next →</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            );
          })()}

          {playerInterviews.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 16 }}>{t("player.interviewsNews")}</h2>
              <div className={styles.interviewList}>
                {playerInterviews.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer" className={styles.interviewRow}>
                    <div className={styles.interviewInfo}>
                      <span className={styles.interviewTitle}>{item.title}</span>
                      <div className={styles.interviewMeta}>
                        <span className={styles.interviewPublisher}>{item.publisher}</span>
                        <span className={styles.interviewDot}>·</span>
                        <span className={styles.interviewDate}>{formatDate(item.date)}</span>
                        <span className={styles.interviewType}>{item.type}</span>
                      </div>
                    </div>
                    <span className={styles.interviewArrow}>↗</span>
                  </a>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </main>
  );
}
