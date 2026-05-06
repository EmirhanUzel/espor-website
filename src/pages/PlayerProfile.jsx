import { useParams, Link } from "react-router-dom";
import { getPlayer, getTeam, formatDate, formatPrize, getFlag, getMatches, getPrizeResults, getInterviews, TOURNAMENTS } from "../services/api";
import styles from "./PlayerProfile.module.css";
import { useLanguage } from "../contexts/LanguageContext";

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

function SocialIcon({ platform }) {
  const icons = {
    twitter:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    instagram: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
    twitch:    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>,
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
      <div style={{ display: "flex", gap: 0, minWidth: "max-content", position: "relative" }}>
        <div style={{
          position: "absolute", top: 18, left: 20, right: 20, height: 2,
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
              <span style={{
                fontSize: 10, color: "var(--text-4)", textAlign: "center",
                lineHeight: 1.4, maxWidth: 120,
              }}>{c.note}</span>
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

export default function PlayerProfile() {
  const { t } = useLanguage();
  const { id } = useParams();
  const player = getPlayer(id);

  if (!player) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>{t("player.notFound")}: {id}</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>{t("player.homeLink")}</Link>
      </div>
    );
  }

  const team = getTeam(player.teampagename);
  const age = calcAge(player.birthdate);
  const earningsYears = Object.entries(player.earningsbyyear).sort(([a], [b]) => a.localeCompare(b));
  const latestYear = earningsYears[earningsYears.length - 1];

  const recentMatches = getMatches(player.wiki)
    .filter(m => m.match2opponents.some(o => o.name === player.teampagename))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const teamPrizes = getPrizeResults(player.wiki)
    .filter(p => p.opponentname === player.teampagename)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const playerInterviews = getInterviews(player.wiki)
    .filter(i => i.pagename === player.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroInner}>
            {team && (
              <Link to={`/team/${encodeURIComponent(team.name)}`} className={styles.teamLogoBox}>
                {team.textlesslogourl
                  ? <img src={team.textlesslogourl} alt={team.name} className={styles.teamLogoImg} />
                  : <span className={styles.teamLogoFallback}>{team.name[0]}</span>
                }
              </Link>
            )}

            <div className={styles.avatar}>
              <span className={styles.avatarLetter}>{player.id[0].toUpperCase()}</span>
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroMeta}>
                <span className={styles.flag}>{getFlag(player.nationality)} {player.nationality}</span>
                <span className={styles.region}>{player.region}</span>
                <span className={`${styles.statusBadge} ${player.status === "Active" ? styles.statusActive : styles.statusInactive}`}>
                  {player.status}
                </span>
              </div>
              <h1 className={styles.nickname}>{player.id}</h1>
              <p className={styles.fullName}>{player.name}</p>
              <div className={styles.heroTags}>
                {age && <span className={styles.tag}>{t("player.age")} <strong>{age}</strong></span>}
                <Link to={`/team/${encodeURIComponent(player.teampagename)}`} className={styles.tag} style={{ textDecoration: "none" }}>
                  {t("player.team")} <strong>{player.teampagename}</strong>
                </Link>
                <span className={styles.tag}>{t("player.born")} <strong>{formatDate(player.birthdate)}</strong></span>
                <span className={styles.tag}>{t("player.game")} <strong>{player.wiki}</strong></span>
                {Object.entries(player.links).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noreferrer"
                    className={styles.heroSocialLink}
                    title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                    <SocialIcon platform={platform} />
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.valueBlock}>
              {player.marketvalue && (
                <div className={styles.marketValueBadge}>
                  <span className={styles.mvVal}>{formatPrize(player.marketvalue)}</span>
                  <span className={styles.mvLabel}>{t("player.marketValue")}</span>
                </div>
              )}
              <div className={styles.earningsBadge}>
                <span className={styles.earningsNum}>{formatPrize(player.earnings)}</span>
                <span className={styles.earningsLabel}>{t("player.totalEarnings")}</span>
                {latestYear && (
                  <span className={styles.earningsLatest}>{latestYear[0]}: {formatPrize(latestYear[1])}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.grid}>

          {teamPrizes.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 16 }}>{t("player.achievements")}</h2>
              <div className={styles.prizeList}>
                {teamPrizes.map((p, i) => {
                  const place = p.placement;
                  const cls = place === "1" ? styles.prizeGold : place === "2" ? styles.prizeSilver : place === "3-4" ? styles.prizeBronze : styles.prizeOther;
                  const tournamentIcon = TOURNAMENTS.find(tr =>
                    tr.name.toLowerCase().includes(p.qualifier?.split(" (#")[0]?.toLowerCase() || "___")
                  )?.iconurl;
                  return (
                    <div key={i} className={styles.prizeRow}>
                      <div className={`${styles.prizePlacement} ${cls}`}>
                        {tournamentIcon
                          ? <img src={tournamentIcon} alt={p.qualifier} className={styles.prizeTournamentIcon} onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "inline"; }} />
                          : null}
                        <span style={{ display: tournamentIcon ? "none" : "inline" }}>#{place}</span>
                      </div>
                      <div className={styles.prizeTournament}>
                        <span className={styles.prizeName}>{p.qualifier || "Tournament"}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span className={styles.prizeDate}>{formatDate(p.date)}</span>
                          {p.opponentname && (
                            <Link to={`/team/${encodeURIComponent(p.opponentname)}`} className={styles.prizeOpponent}>
                              vs {p.opponentname}
                            </Link>
                          )}
                        </div>
                      </div>
                      <span className={`${styles.prizePlacementBadge} ${cls}`}>#{place}</span>
                      <span className={styles.prizeMoney}>{formatPrize(p.prizemoney)}</span>
                    </div>
                  );
                })}
              </div>
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

          <section className={`${styles.card} ${styles.cardWide}`}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle}>{t("player.annualEarnings")}</h2>
              <span className={styles.currentMV}>{formatPrize(player.earnings)}</span>
            </div>
            <EarningsChart data={player.earningsbyyear} />
            <div className={styles.earningsTable}>
              {earningsYears.map(([year, amount]) => (
                <div key={year} className={styles.earningsRow}>
                  <span className={styles.earningsYear}>{year}</span>
                  <div className={styles.earningsBar}>
                    <div className={styles.earningsBarFill}
                      style={{ width: `${(amount / Math.max(...earningsYears.map(([, v]) => v))) * 100}%` }} />
                  </div>
                  <span className={styles.earningsAmount}>{formatPrize(amount)}</span>
                </div>
              ))}
            </div>
          </section>

          {player.career?.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>{t("player.careerTimeline")}</h2>
              <CareerTimeline career={player.career} />
            </section>
          )}

          {player.recentstats && (
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

          {recentMatches.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle} style={{ marginBottom: 16 }}>{t("player.recentMatches")}</h2>
              <div className={styles.matchList}>
                {recentMatches.map(match => {
                  const pIdx = match.match2opponents.findIndex(o => o.name === player.teampagename);
                  const oIdx = pIdx === 0 ? 1 : 0;
                  const isWin = match.winner === String(pIdx + 1);
                  const opp = match.match2opponents[oIdx];
                  const myScore = match.match2opponents[pIdx]?.score ?? 0;
                  const oppScore = opp?.score ?? 0;
                  return (
                    <Link key={match.id} to={`/match/${match.id}`} className={styles.matchRow}>
                      <span className={`${styles.matchResult} ${isWin ? styles.matchWin : styles.matchLoss}`}>
                        {isWin ? "W" : "L"}
                      </span>
                      <div className={styles.matchOppInfo}>
                        <span className={styles.matchOpp}>vs {opp?.name}</span>
                        <span className={styles.matchTournament}>{match.match2bracketdata?.header} · {match.tournament}</span>
                      </div>
                      <span className={styles.matchScore}>{myScore}–{oppScore}</span>
                      <span className={styles.matchDate}>{formatDate(match.date)}</span>
                      <span className={styles.matchArrow}>→</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* achievements moved below — rendered first in JSX order */}

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
