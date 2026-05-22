import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  getTournament, getMatches, getStandings, getPrizeResults,
  formatDate, formatPrize,
} from "../services/api";
import {
  getCS2TournamentByPagename, getCS2TournamentMatches, getCS2GroupStageMatches, getCS2TournamentWinner, getCS2TournamentPrizes, getCS2PlayerImage, getCS2TeamLogos,
  getLoLTournamentByPagename, getLoLTournamentMatches, getLoLTournamentStreams, getLoLTournamentWinner, getLoLTournamentPrizes, getLoLTournamentMVP, getLoLGroupStageMatches, getLoLTeamLogos, getLoLBroadcasters,
} from "../services/liquipediaApi";
import MatchCard from "../components/MatchCard";
import GroupStandings from "../components/GroupStandings";
import TournamentBracket from "../components/TournamentBracket";
import styles from "./TournamentPage.module.css";
import { useLanguage } from "../contexts/LanguageContext";

const COUNTRY_FLAG = { fr:"🇫🇷", de:"🇩🇪", us:"🇺🇸", kr:"🇰🇷", cn:"🇨🇳", mt:"🇲🇹", gb:"🇬🇧", sg:"🇸🇬" };


export default function TournamentPage({ wiki }) {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isCS2 = wiki === "counterstrike";
  const isLoL = wiki === "leagueoflegends";
  const isApiWiki = isCS2 || isLoL;

  // Tournament passed via router state (from TournamentsPage / TournamentCard clicks)
  const passedTournament = location.state?.tournament || null;

  // Mock data (Valorant + fallback)
  const mockTournament = getTournament(id);
  const mockMatches    = getMatches(wiki);
  const mockStandings  = getStandings(wiki);
  const mockPrizes     = getPrizeResults(wiki);

  // API state — skip tournament fetch if already passed via state
  const [apiTournament, setApiTournament] = useState(passedTournament);
  const [apiMatches,    setApiMatches]    = useState(null);
  const [apiLoading,    setApiLoading]    = useState(isApiWiki && !passedTournament);
  const [apiError,      setApiError]      = useState(false);
  const [winner,        setWinner]        = useState(null);
  const [prizes,        setPrizes]        = useState([]);
  const [mvpImgUrl,     setMvpImgUrl]     = useState("");
  const [bracketLogos,  setBracketLogos]  = useState({});
  const [groupStage,    setGroupStage]    = useState([]);
  const [, setLolStreams] = useState([]);
  const [broadcasters,   setBroadcasters]  = useState([]);

  useEffect(() => {
    if (!isApiWiki) return;
    let cancelled = false;

    const getMatchesFn = isCS2 ? getCS2TournamentMatches : getLoLTournamentMatches;

    const runFetch = async (t) => {
      const tournamentName = t?.name || id.replace(/_/g, ' ');
      const today = new Date().toISOString().slice(0, 10);
      const isFinished = t?.enddate && t.enddate < today;

      const winnerFn = isCS2 && isFinished ? getCS2TournamentWinner(tournamentName).catch(() => null)
                     : isLoL && isFinished ? getLoLTournamentWinner(tournamentName).catch(() => null)
                     : Promise.resolve(null);
      const prizesFn = isCS2 ? getCS2TournamentPrizes(tournamentName).catch(() => [])
                     : isLoL ? getLoLTournamentPrizes(tournamentName).catch(() => [])
                     : Promise.resolve([]);
      const [matches, w, prizeRows] = await Promise.all([
        getMatchesFn(tournamentName).catch(() => []),
        winnerFn,
        prizesFn,
      ]);
      if (!cancelled) {
        setApiMatches(matches);
        if (w) setWinner(w);
        if (prizeRows.length) setPrizes(prizeRows);
        if (t?.mvp && isCS2) getCS2PlayerImage(t.mvp).then(url => { if (!cancelled) setMvpImgUrl(url); });
        // Group Stage
        if (isCS2 && isFinished) {
          getCS2GroupStageMatches(tournamentName, t?.pagename).then(gm => { if (!cancelled && gm.length) setGroupStage(gm); });
        }
        if (isLoL) {
          getLoLTournamentStreams(tournamentName).then(s => { if (!cancelled) setLolStreams(s); }).catch(() => {});
          getLoLBroadcasters(tournamentName).then(bc => { if (!cancelled && bc.length) setBroadcasters(bc); }).catch(() => {});
          if (isFinished) {
            getLoLGroupStageMatches(tournamentName, t?.pagename).then(gm => { if (!cancelled && gm.length) setGroupStage(gm); }).catch(() => {});
            getLoLTournamentMVP(tournamentName).then(mvpName => {
              if (!cancelled && mvpName && !t?.mvp) setApiTournament(prev => prev ? { ...prev, mvp: mvpName } : prev);
            }).catch(() => {});
          }
        }

        // Bracket logoları
        const logoFn = isCS2 ? getCS2TeamLogos : isLoL ? getLoLTeamLogos : null;
        if (logoFn && matches.length) {
          const names = [...new Set(
            matches.flatMap(m => (m.match2opponents || []).map(o => o.name).filter(Boolean))
          )];
          if (names.length) logoFn(names).then(map => { if (!cancelled) setBracketLogos(map); });
        }
      }
    };

    if (passedTournament) {
      // Tournament data already available — only fetch matches
      runFetch(passedTournament).finally(() => { if (!cancelled) setApiLoading(false); });
      return () => { cancelled = true; };
    }

    // Direct URL access — need to fetch tournament too
    const getTournamentFn = isCS2 ? getCS2TournamentByPagename : getLoLTournamentByPagename;
    setApiLoading(true);
    setApiError(false);

    getTournamentFn(id)
      .then(async t => {
        if (cancelled) return;
        setApiTournament(t);
        await runFetch(t);
      })
      .catch(() => { if (!cancelled) setApiError(true); })
      .finally(() => { if (!cancelled) setApiLoading(false); });

    return () => { cancelled = true; };
  }, [id, isCS2, isLoL, isApiWiki]);

  // Resolved data
  const tournament = isApiWiki ? apiTournament : mockTournament;
  const allMatches  = isApiWiki ? (apiMatches || []) : mockMatches;
  const standings   = isApiWiki ? [] : mockStandings;
  const prizeResults = isApiWiki ? [] : mockPrizes;

  if (apiLoading) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center", color: "var(--text-2)" }}>
        {t("common.loading")}
      </div>
    );
  }

  if (apiError || (!tournament && !apiLoading)) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>Tournament not found: {id}</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>← Home</Link>
      </div>
    );
  }

  const tournamentMatches = isApiWiki
    ? allMatches
    : allMatches.filter(m => m.tournament === tournament.name);

  const bracketMatches = tournamentMatches.filter(m => m.match2bracketdata?.type === "bracket");
  const groupMatches   = tournamentMatches.filter(m => m.match2bracketdata?.type === "league");

  // For API wikis: show finished matches as results, unfinished as upcoming
  const finishedMatches  = isApiWiki ? tournamentMatches.filter(m => m.finished === 1) : [];
  const upcomingMatches  = isApiWiki ? tournamentMatches.filter(m => m.finished !== 1 && m.match2opponents?.[0]?.name && m.match2opponents?.[1]?.name) : [];

  const locFlag = COUNTRY_FLAG[tournament.locations?.country?.toLowerCase()] || "🌐";

  return (
    <main>
      <div className={styles.hero}>
        {tournament.iconurl && (
          <img src={tournament.iconurl} alt="" className={styles.heroBgImg} referrerPolicy="no-referrer" />
        )}
        <div className={styles.heroOverlay} />
        <div className="wrap">
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <div className={styles.heroLeft}>
                {tournament.iconurl && (
                  <img src={tournament.iconurl} alt={tournament.name} className={styles.heroIcon} referrerPolicy="no-referrer" />
                )}
                <div>
                  <h1 className={styles.heroTitle}>{tournament.name}</h1>
                  <div className={styles.heroMeta}>
                    <span>{locFlag} {tournament.locations?.city}, {tournament.locations?.venue}</span>
                    <span>·</span>
                    <span>{formatDate(tournament.startdate)} – {formatDate(tournament.enddate)}</span>
                    {tournament.patch && <><span>·</span><span>{t("common.patch").replace("{version}", tournament.patch)}</span></>}
                  </div>
                </div>
              </div>

              <div className={styles.heroStats}>
                {winner && (
                  <div className={styles.championBlock}>
                    <div className={styles.championTeam}>
                      {winner.logoUrl && (
                        <img src={winner.logoUrl} alt={winner.name} className={styles.championLogo} referrerPolicy="no-referrer" />
                      )}
                      <span className={styles.championName}>{winner.name}</span>
                    </div>
                    <span className={styles.championLabel}>Champion</span>
                  </div>
                )}
                {[
                  [formatPrize(tournament.prizepool), "Prize Pool"],
                  [tournament.participantsnumber, "Teams"],
                ].filter(([val]) => val).map(([val, label]) => (
                  <div key={label} className={styles.heroStat}>
                    <span className={styles.heroStatVal}>{val}</span>
                    <span className={styles.heroStatLabel}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">

        {/* Prize Distribution */}
        {isApiWiki && prizes.length > 0 && (() => {
          const rankNum = s => parseInt(String(s).split(/[-–]/)[0]) || 99;
          const MEDAL = { 1: "#f0b429", 2: "#a8b5c0", 3: "#b07040" };

          // Tier'a göre satırlar: rank=1 → satır0, rank 2-4 → satır1, rank 5+ → satır2+
          const tierRows = [];
          prizes.forEach(row => {
            const r = rankNum(row.placement);
            const tierIdx = r === 1 ? 0 : r <= 4 ? 1 : Math.floor((r - 1) / 4) + 1;
            if (!tierRows[tierIdx]) tierRows[tierIdx] = [];
            tierRows[tierIdx].push(row);
          });

          return (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Prize Distribution</h2>
              <div className={styles.pyramid}>
                {tierRows.filter(Boolean).map((rowTeams, ri) => (
                  <div key={ri} className={styles.pyramidRow}>
                    {rowTeams.map(row => (
                      <Link key={row.team} to={`/team/${encodeURIComponent(row.team)}`} className={`${styles.pyramidCard} ${ri === 0 ? styles.pyramidCardFirst : ""}`}>
                        <div className={styles.pyramidLogo}>
                          {row.logoUrl
                            ? <img src={row.logoUrl} alt={row.team} referrerPolicy="no-referrer" onError={e => e.currentTarget.style.display='none'} />
                            : <span>{row.team[0]}</span>}
                        </div>
                        <span className={styles.pyramidTeam}>{row.team}</span>
                        <span className={styles.pyramidPrize} style={MEDAL[rankNum(row.placement)] ? { color: MEDAL[rankNum(row.placement)] } : {}}>
                          {row.prize > 0 ? formatPrize(row.prize) : "—"}
                        </span>
                        <span className={styles.pyramidPlacement}>{row.placement}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* MVP Player */}
        {isApiWiki && tournament.mvp && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>MVP Player</h2>
            <Link to={`/player/${encodeURIComponent(tournament.mvp)}`} className={styles.mvpCard}>
              <div className={styles.mvpPhoto}>
                {mvpImgUrl
                  ? <img src={mvpImgUrl} alt={tournament.mvp} referrerPolicy="no-referrer" onError={e => e.currentTarget.style.display='none'} />
                  : <span>{tournament.mvp[0]?.toUpperCase()}</span>}
              </div>
              <div className={styles.mvpInfo}>
                <span className={styles.mvpName}>{tournament.mvp}</span>
                <span className={styles.mvpLabel}>Tournament MVP</span>
              </div>
            </Link>
          </section>
        )}

        {/* Broadcast Team */}
        {isLoL && broadcasters.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Broadcast Team</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 8 }}>
              {broadcasters.map((b, i) => (
                <a key={i} href={b.link || undefined} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", minWidth: 160, textDecoration: "none", color: "inherit" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "var(--text-1)" }}>
                    {b.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)" }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{b.role} · {b.language}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Group Stage — sub-event maçları */}
        {isApiWiki && groupStage.length > 0 && (() => {
          // Stage'e göre grupla (Challengers/Legends)
          const stages = {};
          for (const m of groupStage) {
            const s = m.stageLabel || 'Group Stage';
            if (!stages[s]) stages[s] = [];
            stages[s].push(m);
          }
          return Object.entries(stages).map(([stageName, stageMatches]) => {
            // Aynı gün = aynı round
            const dateMap = new Map();
            for (const m of stageMatches) {
              const day = (m.date || '').slice(0, 10) || 'z';
              if (!dateMap.has(day)) dateMap.set(day, []);
              dateMap.get(day).push(m);
            }
            const rounds = [...dateMap.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([,ms],i) => ({ label: `Round ${i+1}`, matches: ms }));
            return (
              <section key={stageName} className={styles.section}>
                <h2 className={styles.sectionTitle}>{stageName}</h2>
                <div className={styles.groupRounds}>
                  {rounds.map((r, ri) => (
                    <div key={ri} className={styles.groupRound}>
                      <div className={styles.groupRoundLabel}>{r.label}</div>
                      <div className={styles.groupRoundMatches}>
                        {r.matches.map(m => {
                          const [t1,t2] = m.match2opponents || [];
                          const done = m.finished === 1;
                          const w1 = done && m.winner === '1';
                          const w2 = done && m.winner === '2';
                          return (
                            <Link key={m.id} to={`/match/${m.id}`} className={styles.groupCard}>
                              <div className={`${styles.groupTeam} ${w1?styles.groupWin:done?styles.groupLose:''}`}>
                                {bracketLogos[t1?.name] && <img src={bracketLogos[t1.name]} alt="" className={styles.groupLogo} referrerPolicy="no-referrer" />}
                                <span>{t1?.name||'TBD'}</span>
                                {done && <span className={styles.groupScore}>{t1?.score??0}</span>}
                              </div>
                              <div className={`${styles.groupTeam} ${w2?styles.groupWin:done?styles.groupLose:''}`}>
                                {bracketLogos[t2?.name] && <img src={bracketLogos[t2.name]} alt="" className={styles.groupLogo} referrerPolicy="no-referrer" />}
                                <span>{t2?.name||'TBD'}</span>
                                {done && <span className={styles.groupScore}>{t2?.score??0}</span>}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          });
        })()}

        {/* Bracket */}
        {(bracketMatches.length > 0 || groupMatches.length > 0) && (
          <section className={styles.section}>
            <TournamentBracket
              matches={bracketMatches}
              groupMatches={groupMatches}
              logos={bracketLogos}
            />
          </section>
        )}

        {/* Bracket yoksa düz liste */}
        {bracketMatches.length === 0 && groupMatches.length === 0 && isApiWiki && finishedMatches.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Son Maçlar</h2>
            <div className={styles.matchList}>
              {finishedMatches.slice(0, 10).map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {isApiWiki && upcomingMatches.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Yaklaşan Maçlar</h2>
            <div className={styles.matchList}>
              {upcomingMatches.slice(0, 10).map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        {!isApiWiki && (groupMatches.length > 0 || standings.length > 0) && (
          <div className={styles.twoCol}>
            {groupMatches.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Group Stage Matches</h2>
                <div className={styles.matchList}>
                  {groupMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {standings.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Group Standings</h2>
                <GroupStandings groups={standings} />
              </section>
            )}
          </div>
        )}

        {prizeResults.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Prize Distribution</h2>
            <div className={styles.prizeTable}>
              <div className={styles.prizeHeader}>
                <span>#</span>
                <span>Team</span>
                <span>Qualifier</span>
                <span>Defeated</span>
                <span>Prize</span>
              </div>
              {prizeResults.map((r, i) => (
                <div key={i}
                  className={`${styles.prizeRow} ${r.placement === "1" ? styles.prizeRowGold : ""}`}
                  onClick={() => navigate(`/team/${encodeURIComponent(r.opponentname)}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/team/${encodeURIComponent(r.opponentname)}`); } }}
                >
                  <span className={styles.prizeColSmall}><span className={styles.placement}>{r.placement}</span></span>
                  <span className={styles.prizeColTeam}>
                    <span className={styles.prizeTeam}>{r.opponentname}</span>
                    <span className={styles.prizeOpponentType}>{r.opponenttype}</span>
                  </span>
                  <span className={styles.prizeColMeta}><span className={styles.prizeMeta}>{r.qualifier}</span></span>
                  <span className={styles.prizeColMeta}>
                    {r.lastvsdata && (
                      <span className={styles.prizeMeta}>def. {r.lastvsdata.opponentname} ({r.lastvsdata.score})</span>
                    )}
                  </span>
                  <span className={styles.prizeColAmt}><span className={styles.prizeAmt}>{formatPrize(r.prizemoney)}</span></span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tournament Details</h2>
          <div className={styles.detailGrid}>
            <div className={styles.detailCard}>
              <h3 className={styles.detailCardTitle}>General</h3>
              <div className={styles.detailList}>
                {[
                  ["Name", tournament.name],
                  ["Series", tournament.seriespage?.replace(/_/g, " ")],
                  ["Start", formatDate(tournament.startdate)],
                  ["End", formatDate(tournament.enddate)],
                  ["Format", tournament.format],
                  ["Teams", `${tournament.participantsnumber} Teams`],
                  tournament.patch && ["Patch", t("common.patch").replace("{version}", tournament.patch)],
                  ["Game", tournament.wiki],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} className={styles.detailRow}>
                    <span className={styles.detailKey}>{k}</span>
                    <span className={styles.detailVal}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.detailCard}>
              <h3 className={styles.detailCardTitle}>Location & Prize</h3>
              <div className={styles.detailList}>
                {[
                  ["City", tournament.locations?.city],
                  ["Venue", tournament.locations?.venue],
                  ["Region", tournament.locations?.region],
                  ["Country", tournament.locations?.country?.toUpperCase()],
                  ["Prize Pool", formatPrize(tournament.prizepool)],
                  tournament.locations?.venuelink ? ["Venue Site", "→ Visit"] : null,
                ].filter(item => Array.isArray(item) && item[1]).map(([k, v]) => (
                  <div key={k} className={styles.detailRow}>
                    <span className={styles.detailKey}>{k}</span>
                    {k === "Venue Site" ? (
                      <a href={tournament.locations?.venuelink} target="_blank" rel="noreferrer" className={styles.detailLink}>{v}</a>
                    ) : (
                      <span className={styles.detailVal}>{v}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
