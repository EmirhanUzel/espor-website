import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTeam, getPlayer, getMatches, formatDate, formatPrize, getFlag, INTERVIEWS, TRANSFERS } from "../services/api";
import { getTopics } from "../services/forum";
import { useLanguage } from "../contexts/LanguageContext";
import { getCS2TeamByName, getCS2TeamSquad, getCS2TeamTransfersAPI, getCS2TeamRecentMatches, getCS2PlayerImage, getCS2TeamLogos } from "../services/liquipediaApi";
import styles from "./TeamPage.module.css";

const SOCIAL_ICONS = {
  twitter:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  x:         <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
  facebook:  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  twitch:    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>,
  youtube:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/></svg>,
  discord:   <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>,
};

function SocialIcon({ platform }) {
  const key = platform.toLowerCase();
  return SOCIAL_ICONS[key] || (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10a15.3 15.3 0 0 1-4 10a15.3 15.3 0 0 1-4-10a15.3 15.3 0 0 1 4-10z"/></svg>
  );
}

function EarningsBar({ data }) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <div className={styles.earningsBar}>
      {entries.map(([year, val]) => (
        <div key={year} className={styles.earningsCol}>
          <div className={styles.earningsBarOuter}>
            <div className={styles.earningsBarInner} style={{ height: `${max > 0 ? (val / max) * 100 : 0}%` }} />
          </div>
          <span className={styles.earningsYear}>{year.slice(2)}</span>
          <span className={styles.earningsVal}>
            {val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `$${Math.round(val / 1000)}K` : `$${val}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TeamPage({ wiki }) {
  const { name } = useParams();
  const navigate  = useNavigate();
  const { t }    = useLanguage();

  const decodedName = decodeURIComponent(name);
  const mockTeam    = getTeam(decodedName);
  // CS2 API: wiki prop is "counterstrike" OR mock team is explicitly CS2.
  // wiki prop wins — avoids LoL/VALORANT mock teams with same name (e.g. "Team Vitality" is in LoL mock data).
  const isCS2 = wiki === "counterstrike" || mockTeam?.wiki === "counterstrike";

  // ── CS2: API state ──────────────────────────────────────────────────────────
  const [apiTeam,      setApiTeam]      = useState(null);
  const [apiSquad,     setApiSquad]     = useState(null);
  const [apiMatches,   setApiMatches]   = useState(null);
  const [apiTransfers, setApiTransfers] = useState(null);
  const [squadImages,  setSquadImages]  = useState({});
  const [matchLogos,   setMatchLogos]   = useState({});
  const [cs2Loading,   setCS2Loading]   = useState(isCS2);

  useEffect(() => {
    if (!isCS2) return;
    setCS2Loading(true);
    setApiTeam(null); setApiSquad(null); setApiMatches(null); setApiTransfers(null);

    getCS2TeamByName(decodedName).then(team => {
      if (!team) { setCS2Loading(false); return; }
      setApiTeam(team);
      setCS2Loading(false);
      // Secondary fetches
      getCS2TeamSquad(team.pagename).then(squad => {
        setApiSquad(squad);
        // Fetch player images in parallel (MediaWiki API, no rate-limit queue)
        squad.forEach(p => {
          getCS2PlayerImage(p.pagename || p.id).then(url => {
            if (url) setSquadImages(prev => ({ ...prev, [p.id]: url }));
          });
        });
      });
      getCS2TeamRecentMatches(team.name, 10).then(matches => {
        setApiMatches(matches);
        // Fetch opponent logos
        const oppNames = [...new Set(
          matches.flatMap(m => m.match2opponents.map(o => o.name)).filter(n => n && n !== team.name)
        )];
        if (oppNames.length) {
          getCS2TeamLogos(oppNames).then(logoMap => {
            if (!cancelled) setMatchLogos(logoMap);
          });
        }
      });
      getCS2TeamTransfersAPI(team.name, 15).then(setApiTransfers);
    }).catch(() => setCS2Loading(false));
  }, [decodedName, isCS2]);

  // ── Unified data ────────────────────────────────────────────────────────────
  const team = isCS2 ? apiTeam : mockTeam;

  // Loading
  if (cs2Loading) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center", color: "var(--text-2)" }}>
        Loading…
      </div>
    );
  }

  if (!team) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>Team not found: {decodedName}</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>← Home</Link>
      </div>
    );
  }

  // ── Mock-data derived values (non-CS2) ──────────────────────────────────────
  const allMatches = isCS2 ? [] : getMatches(wiki);
  const teamMatches = isCS2
    ? (apiMatches || [])
    : allMatches.filter(m => m.match2opponents?.some(o => o.name.toLowerCase() === team.name.toLowerCase()));

  const earningsYears = Object.entries(team.earningsbyyear || {}).sort(([a], [b]) => a.localeCompare(b));
  const lastYear = earningsYears[earningsYears.length - 1];

  // Squad: CS2 from API, others from mock
  const squad = isCS2
    ? (apiSquad || []).map(p => ({ id: p.id, pagename: p.pagename, name: p.name, nationality: p.nationality, role: p.roles?.[0] || '', earnings: p.earnings }))
    : (mockTeam?.squad || []).map(m => {
        const p = getPlayer(m.id);
        return { id: m.id, name: p?.name || '', nationality: p?.nationality || '', role: m.role, earnings: p?.earnings || 0 };
      });

  const totalMarketValue = isCS2 ? 0 : (mockTeam?.squad || []).reduce((sum, member) => {
    const p = getPlayer(member.id);
    return sum + (p?.marketvalue || 0);
  }, 0);

  const formatMV = (val) => {
    if (!val) return null;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${Math.round(val / 1_000)}K`;
    return `$${val}`;
  };

  // Transfers
  const rawTransfers = isCS2 ? (apiTransfers || []) : TRANSFERS.filter(tr =>
    tr.fromteam?.toLowerCase() === team.name.toLowerCase() ||
    tr.toteam?.toLowerCase()   === team.name.toLowerCase()
  );

  // News (mock only)
  const squadIds = new Set(squad.map(m => (m.id || '').toLowerCase()));
  const teamNews = isCS2 ? [] : INTERVIEWS.filter(item =>
    item.pagename.toLowerCase() === team.name.toLowerCase() ||
    squadIds.has(item.pagename.toLowerCase())
  );

  const WIKI_TO_CATEGORY = { valorant: "VALORANT", counterstrike: "CS2", leagueoflegends: "LoL" };
  const forumCategory = WIKI_TO_CATEGORY[team.wiki] || "General";
  const forumTopics = getTopics({ category: forumCategory }).slice(0, 4);

  const ALLOWED_SOCIALS = new Set(["instagram", "x", "twitter", "youtube", "twitch"]);
  const socialEntries = Object.entries(team.links || {}).filter(([k]) => ALLOWED_SOCIALS.has(k.toLowerCase()));

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroInner}>
            <div className={styles.logoBox}>
              {team.textlesslogourl
                ? <img src={team.textlesslogourl} alt={team.name} className={styles.teamLogo} />
                : <span className={styles.logoFallback}>{team.name[0]}</span>
              }
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroMeta}>
                <span className={styles.heroBadge}>{team.region}</span>
                <span className={`${styles.heroBadge} ${team.status === "active" ? styles.badgeActive : styles.badgeInactive}`}>
                  {team.status === "active" ? "Active" : "Disbanded"}
                </span>
              </div>
              <h1 className={styles.teamName}>{team.name}</h1>
              <div className={styles.heroTags}>
                <span className={styles.tag}>Founded <strong>{formatDate(team.createdate)}</strong></span>
                {team.disbanddate && !team.disbanddate.startsWith("0000") && (
                  <span className={styles.tag}>Disbanded <strong>{formatDate(team.disbanddate)}</strong></span>
                )}
                <span className={styles.tag}>Region <strong>{team.region}</strong></span>
              </div>
              {socialEntries.length > 0 && (
                <div className={styles.heroSocial}>
                  {socialEntries.map(([k, url]) => (
                    <a key={k} href={url} target="_blank" rel="noreferrer" className={styles.heroSocialLink} title={k.charAt(0).toUpperCase() + k.slice(1)}>
                      <SocialIcon platform={k} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.heroBadges}>
              <div className={styles.earningsBadge}>
                <span className={styles.earningsTotal}>{formatPrize(team.earnings)}</span>
                <span className={styles.earningsLabel}>Total Earnings</span>
                {lastYear && <span className={styles.earningsLast}>{lastYear[0]}: {formatPrize(lastYear[1])}</span>}
              </div>
              {totalMarketValue > 0 && (
                <div className={styles.earningsBadge}>
                  <span className={styles.earningsTotal}>{formatMV(totalMarketValue)}</span>
                  <span className={styles.earningsLabel}>Squad Value</span>
                  <span className={styles.earningsLast}>{(team.squad || []).length} players</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.grid}>

          {squad.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>Current Roster</h2>
              <div className={styles.rosterGrid}>
                {squad.map((member) => {
                  const mockPlayer = !isCS2 ? getPlayer(member.id) : null;
                  const mv = mockPlayer?.marketvalue;
                  const mvFmt = mv
                    ? mv >= 1_000_000 ? `$${(mv / 1_000_000).toFixed(1)}M`
                    : mv >= 1_000 ? `$${Math.round(mv / 1_000)}K`
                    : `$${mv}`
                    : null;
                  const allStats = mockPlayer?.recentstats?.stats || [];
                  const cardStats = mockPlayer?.wiki === "counterstrike"
                    ? allStats.filter(s => ["K/D", "KAST", "HS %"].includes(s.label))
                    : mockPlayer?.wiki === "leagueoflegends"
                    ? allStats.filter(s => ["KDA", "Win Rate", "CS/min"].includes(s.label))
                    : allStats.filter(s => ["ACS", "K/D", "KAST"].includes(s.label));
                  const flag    = member.nationality ? getFlag(member.nationality) : (mockPlayer ? getFlag(mockPlayer.nationality) : "🌍");
                  const initial = (member.id || "?")[0].toUpperCase();
                  const imgUrl  = isCS2 ? (squadImages[member.id] || '') : (mockPlayer?.imageurl || '');
                  return (
                    <div key={member.id} className={styles.playerCard} onClick={() => navigate(`/player/${member.id}`)}>
                      <div className={styles.playerCardTop}>
                        <span className={styles.playerCardFlag}>{flag}</span>
                        {imgUrl
                          ? <img src={imgUrl} alt={member.id} className={styles.playerCardImg} referrerPolicy="no-referrer"
                              onError={e => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
                          : null}
                        <div className={styles.playerCardInitial} style={imgUrl ? { display: "none" } : {}}>{initial}</div>
                      </div>
                      <div className={styles.playerCardBody}>
                        <span className={styles.playerCardNick}>{member.id}</span>
                        {member.name && <span className={styles.playerCardName}>{member.name}</span>}
                      </div>
                      {cardStats.length > 0 && (
                        <div className={styles.playerCardStats}>
                          {cardStats.map(s => (
                            <div key={s.label} className={styles.playerCardStat}>
                              <span className={styles.playerCardStatVal}>{s.value}</span>
                              <span className={styles.playerCardStatLabel}>{s.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className={styles.playerCardFooter}>
                        <span className={styles.playerCardRole}>{member.role}</span>
                        {mvFmt && <span className={styles.playerCardMV}>{mvFmt}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {teamMatches.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>Matches</h2>
              <div className={styles.matchList}>
                {teamMatches.map(match => {
                  const [opp1, opp2] = match.match2opponents;
                  const isOpp1 = opp1?.name.toLowerCase() === team.name.toLowerCase();
                  const myScore    = isOpp1 ? opp1?.score : opp2?.score;
                  const theirScore = isOpp1 ? opp2?.score : opp1?.score;
                  const opponent   = isOpp1 ? opp2?.name  : opp1?.name;
                  const won = (isOpp1 && match.winner === "1") || (!isOpp1 && match.winner === "2");
                  return (
                    <div key={match.id} className={styles.matchRow} onClick={() => navigate(`/match/${match.id}`)}>
                      <span className={won ? styles.matchW : styles.matchL}>{won ? "W" : "L"}</span>
                      <span className={styles.matchOpp}>{opponent}</span>
                      <span className={styles.matchScore}>{myScore} – {theirScore}</span>
                      <span className={styles.matchDate}>{formatDate(match.date)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {earningsYears.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>Annual Earnings</h2>
              <EarningsBar data={team.earningsbyyear} />
              <div className={styles.earningsTable}>
                {earningsYears.map(([year, val]) => (
                  <div key={year} className={styles.earningsRow}>
                    <span className={styles.earningsRowYear}>{year}</span>
                    <div className={styles.earningsRowBar}>
                      <div className={styles.earningsRowFill}
                        style={{ width: `${(val / Math.max(...earningsYears.map(([, v]) => v))) * 100}%` }} />
                    </div>
                    <span className={styles.earningsRowAmt}>{formatPrize(val)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── News + Forum ── */}
          <div className={`${styles.newsForumRow} ${styles.cardSpanWide}`}>
            {(teamNews.length > 0) && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>News & Interviews</h2>
                <div className={styles.newsList}>
                  {teamNews.map((item, i) => (
                    <a key={i} href={item.link} target="_blank" rel="noreferrer" className={styles.newsItem}>
                      <div className={styles.newsItemTop}>
                        <span className={`${styles.newsBadge} ${item.type === "Interview" ? styles.newsBadgeInterview : styles.newsBadgeArticle}`}>
                          {item.type}
                        </span>
                        <span className={styles.newsPublisher}>{item.publisher}</span>
                        <span className={styles.newsDate}>{formatDate(item.date)}</span>
                      </div>
                      <p className={styles.newsTitle}>"{item.title}"</p>
                      <span className={styles.newsSubject}>{item.pagename}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {forumTopics.length > 0 && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Forum — {forumCategory}</h2>
                <div className={styles.forumList}>
                  {forumTopics.map(topic => (
                    <Link key={topic.id} to={`/forum/${topic.id}`} className={styles.forumItem}>
                      <div className={styles.forumItemBody}>
                        <span className={styles.forumCategory}>{topic.category}</span>
                        <span className={styles.forumTitle}>{topic.title}</span>
                      </div>
                      <div className={styles.forumMeta}>
                        <span className={styles.forumComments}>💬 {topic.commentCount}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Rumors (only for non-CS2) ── */}
          {!isCS2 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>{t("team.rumors")}</h2>
              <div className={styles.rumorList}>
                {[
                  { id: 1, text: `${team.name} is reportedly in talks with a top-tier IGL.`, source: "insider_anon", date: "2025-10-15", reliability: "low" },
                  { id: 2, text: `Roster shuffle expected at ${team.name} after disappointing playoff run.`, source: "esports_wire", date: "2025-10-10", reliability: "medium" },
                ].map(r => (
                  <div key={r.id} className={styles.rumorRow}>
                    <span className={`${styles.rumorBadge} ${r.reliability === "medium" ? styles.rumorMedium : styles.rumorLow}`}>
                      {r.reliability === "medium" ? t("team.rumorMedium") : t("team.rumorLow")}
                    </span>
                    <span className={styles.rumorText}>{r.text}</span>
                    <div className={styles.rumorMeta}>
                      <span className={styles.rumorSource}>@{r.source}</span>
                      <span className={styles.rumorDate}>{formatDate(r.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Transfers ── */}
          {rawTransfers.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>Transfers</h2>
              <div className={styles.transferList}>
                {rawTransfers.map((tr, i) => {
                  const playerName = tr.player || tr.displayname || tr.extradata?.displayname || '';
                  const fromTeam   = tr.fromteam || '';
                  const toTeam     = tr.toteam   || '';
                  const isIn = toTeam.toLowerCase() === team.name.toLowerCase();
                  return (
                    <div key={i} className={styles.transferRow}>
                      <span className={`${styles.transferDir} ${isIn ? styles.transferIn : styles.transferOut}`}>
                        {isIn ? "IN" : "OUT"}
                      </span>
                      <Link to={`/player/${encodeURIComponent(playerName)}`} className={styles.transferPlayer} onClick={e => e.stopPropagation()}>
                        {playerName}
                      </Link>
                      <div className={styles.transferTeams}>
                        {fromTeam && <Link to={`/team/${encodeURIComponent(fromTeam)}`} className={styles.transferFrom} onClick={e => e.stopPropagation()}>{fromTeam}</Link>}
                        {fromTeam && toTeam && <span className={styles.transferArrow}>→</span>}
                        {toTeam  && <Link to={`/team/${encodeURIComponent(toTeam)}`}   className={styles.transferTo}   onClick={e => e.stopPropagation()}>{toTeam}</Link>}
                      </div>
                      <span className={styles.transferDate}>{formatDate(tr.date)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>
    </main>
  );
}
