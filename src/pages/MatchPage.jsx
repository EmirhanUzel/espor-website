import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMatch, formatDate, tierLabel } from "../services/api";
import { getLoLMatchById, getCS2MatchById } from "../services/liquipediaApi";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "./MatchPage.module.css";

function cleanHeader(h) {
  if (!h || h.startsWith("!")) return "";
  const label = h.includes(",") ? h.split(",")[0].trim() : h;
  return label.replace(/<[^>]+>/g, "").trim();
}

function TierBadge({ tier, tiertype }) {
  return (
    <span className={`${styles.tier} ${tier === "1" ? styles.tierS : tier === "2" ? styles.tierA : styles.tierB}`}>
      {tierLabel(tier)}{tiertype ? `-${tiertype.slice(0, 3).toUpperCase()}` : ""}
    </span>
  );
}

function VetoBoard({ veto, opp1Name, opp2Name }) {
  const teamLabel = (t) => t === "1" ? opp1Name : t === "2" ? opp2Name : null;
  return (
    <div className={styles.vetoCard}>
      <h3 className={styles.vetoTitle}>Map Veto</h3>
      <div className={styles.vetoList}>
        {veto.map((v, i) => {
          const cls = v.type === "ban" ? styles.vetoBan : v.type === "pick" ? styles.vetoPick : styles.vetoDecider;
          const tagCls = v.type === "ban" ? styles.vetoTagBan : v.type === "pick" ? styles.vetoTagPick : styles.vetoTagDecider;
          const team = teamLabel(v.team);
          return (
            <div key={i} className={`${styles.vetoItem} ${cls}`}>
              <span className={`${styles.vetoTag} ${tagCls}`}>{v.type}</span>
              {team && <span className={styles.vetoTeamLabel}>{team}</span>}
              <span>{v.map}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SwingCell({ value }) {
  if (value > 0) return <span className={styles.csSwingPos}>+{value}</span>;
  if (value < 0) return <span className={styles.csSwingNeg}>{value}</span>;
  return <span className={styles.csSwingZero}>0</span>;
}

function PlayerStatTable({ players, totalRounds }) {
  return (
    <table className={styles.csStatTable}>
      <thead>
        <tr>
          <th>Player</th>
          <th>K</th>
          <th>D</th>
          <th>K/D</th>
          <th>ADR</th>
          <th>Damage</th>
          <th>Round Swing</th>
        </tr>
      </thead>
      <tbody>
        {players.map(p => (
          <tr key={p.name}>
            <td>{p.name}</td>
            <td>{p.kills}</td>
            <td>{p.deaths}</td>
            <td>{p.kd.toFixed(2)}</td>
            <td>{p.adr.toFixed(1)}</td>
            <td>{Math.round(p.adr * totalRounds)}</td>
            <td><SwingCell value={p.swing} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CsMapPanel({ game, opp1Name, opp2Name }) {
  if (!game?.playerStats) {
    return <div style={{ padding: 24, textAlign: "center", color: "var(--text-4)", fontSize: 13 }}>No player stats available for this map.</div>;
  }
  const isWin1 = game.winner === "1";
  const isWin2 = game.winner === "2";
  const totalRounds = (game.scores?.[0] ?? 0) + (game.scores?.[1] ?? 0);
  return (
    <div className={styles.csPanel}>
      <div className={styles.csPanelHead}>
        <span className={styles.csPanelMap}>{game.map}</span>
        <span className={styles.csPanelScore}>{game.scores[0]} : {game.scores[1]}</span>
        <span className={styles.csPanelLen}>{game.length || ""}</span>
      </div>

      <div className={styles.csTeamBlock}>
        <div className={styles.csTeamHead}>
          <span className={styles.csTeamName}>{opp1Name}</span>
          {isWin1 && <span className={styles.csTeamWin}>Winner</span>}
        </div>
        <PlayerStatTable players={game.playerStats.team1} totalRounds={totalRounds} />
      </div>

      <div className={styles.csTeamBlock}>
        <div className={styles.csTeamHead}>
          <span className={styles.csTeamName}>{opp2Name}</span>
          {isWin2 && <span className={styles.csTeamWin}>Winner</span>}
        </div>
        <PlayerStatTable players={game.playerStats.team2} totalRounds={totalRounds} />
      </div>

      <div className={styles.csDetailRow}>
        <button
          type="button"
          className={styles.csDetailBtn}
          onClick={() => {}}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

function LolStatTable({ players }) {
  return (
    <table className={styles.csStatTable}>
      <thead>
        <tr>
          <th>Player</th>
          <th>Champion</th>
          <th>K</th>
          <th>D</th>
          <th>A</th>
          <th>KDA</th>
          <th>CS</th>
          <th>Gold</th>
          <th>Damage</th>
          <th>Vision</th>
        </tr>
      </thead>
      <tbody>
        {players.map((p, i) => {
          const hasData = p.kills > 0 || p.deaths > 0 || p.assists > 0;
          const kda = !hasData ? "—"
            : p.deaths === 0 ? "Perfect"
            : ((p.kills + p.assists) / p.deaths).toFixed(2);
          return (
            <tr key={p.name || i}>
              <td>{p.name || "—"}</td>
              <td>{p.champion || "—"}</td>
              <td>{hasData ? p.kills : "—"}</td>
              <td>{hasData ? p.deaths : "—"}</td>
              <td>{hasData ? p.assists : "—"}</td>
              <td>{kda}</td>
              <td>{p.cs > 0 ? p.cs : "—"}</td>
              <td>{p.gold > 0 ? `${(p.gold / 1000).toFixed(1)}k` : "—"}</td>
              <td>{p.damage > 0 ? `${(p.damage / 1000).toFixed(1)}k` : "—"}</td>
              <td>{p.visionScore > 0 ? p.visionScore : "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function LolMatchDetails({ match, opp1Name, opp2Name }) {
  const games = match.match2games || [];
  const [activeIdx, setActiveIdx] = useState(0);
  if (!games.length) return null;
  const activeGame = games[activeIdx];
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Match Statistics</h2>

      {/* Game-by-game winner summary */}
      <div className={styles.lolGameSummary}>
        {games.map((g, i) => {
          const winner = g.winner === "1" ? opp1Name : g.winner === "2" ? opp2Name : null;
          return (
            <div
              key={i}
              className={`${styles.lolGameRow} ${i === activeIdx ? styles.lolGameRowActive : ""}`}
              onClick={() => setActiveIdx(i)}
            >
              <span className={styles.lolGameNum}>Game {i + 1}</span>
              <span className={styles.lolGameWinner}>{winner ?? "—"}</span>
              {g.length && <span className={styles.lolGameLen}>{g.length}</span>}
            </div>
          );
        })}
      </div>

      {games.length > 1 && (
        <div className={styles.csTabs}>
          {games.map((g, i) => (
            <button
              key={i}
              className={`${styles.csTabBtn} ${i === activeIdx ? styles.csTabActive : ""}`}
              onClick={() => setActiveIdx(i)}
            >
              Game {i + 1} · {g.length}
            </button>
          ))}
        </div>
      )}
      {activeGame?.playerStats && (activeGame.playerStats.team1.length > 0 || activeGame.playerStats.team2.length > 0) ? (() => {
        // Eğer team1 boş ama team2 dolu ise takımlar ters atanmış demek — swap et
        const ps = activeGame.playerStats;
        const t1 = ps.team1.length > 0 ? ps.team1 : ps.team2;
        const t2 = ps.team1.length > 0 ? ps.team2 : ps.team1;
        return (
          <div className={styles.csPanel}>
            <div className={styles.csTeamBlock}>
              <div className={styles.csTeamHead}>
                <span className={styles.csTeamName}>{opp1Name}</span>
                {activeGame.winner === "1" && <span className={styles.csTeamWin}>Winner</span>}
              </div>
              {t1.length > 0 ? <LolStatTable players={t1} /> : <div style={{ padding: 12, fontSize: 12, color: "var(--text-4)" }}>—</div>}
            </div>
            <div className={styles.csTeamBlock}>
              <div className={styles.csTeamHead}>
                <span className={styles.csTeamName}>{opp2Name}</span>
                {activeGame.winner === "2" && <span className={styles.csTeamWin}>Winner</span>}
              </div>
              {t2.length > 0 ? <LolStatTable players={t2} /> : <div style={{ padding: 12, fontSize: 12, color: "var(--text-4)" }}>—</div>}
            </div>
          </div>
        );
      })() : (
        <div style={{ padding: 24, textAlign: "center", color: "var(--text-4)", fontSize: 13 }}>
          No player stats available for this game.
        </div>
      )}

      {(activeGame?.picks || activeGame?.bans) && (
        <div style={{ marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
          {activeGame.picks && (
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: 1, marginBottom: 6 }}>PICKS</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{opp1Name}</span>
                  {activeGame.picks.team1.map((c, i) => <span key={i} style={{ fontSize: 13, color: "var(--text-1)", background: "var(--surface)", borderRadius: 4, padding: "2px 8px" }}>{c}</span>)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{opp2Name}</span>
                  {activeGame.picks.team2.map((c, i) => <span key={i} style={{ fontSize: 13, color: "var(--text-1)", background: "var(--surface)", borderRadius: 4, padding: "2px 8px" }}>{c}</span>)}
                </div>
              </div>
            </div>
          )}
          {activeGame.bans && (
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: 1, marginBottom: 6 }}>BANS</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{opp1Name}</span>
                  {activeGame.bans.team1.map((c, i) => <span key={i} style={{ fontSize: 13, color: "var(--text-3)", background: "var(--surface)", borderRadius: 4, padding: "2px 8px", textDecoration: "line-through" }}>{c}</span>)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{opp2Name}</span>
                  {activeGame.bans.team2.map((c, i) => <span key={i} style={{ fontSize: 13, color: "var(--text-3)", background: "var(--surface)", borderRadius: 4, padding: "2px 8px", textDecoration: "line-through" }}>{c}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function CsMatchDetails({ match, opp1Name, opp2Name }) {
  const games = match.match2games || [];
  const [activeIdx, setActiveIdx] = useState(0);
  if (games.length === 0 && !match.veto) return null;
  const activeGame = games[activeIdx];
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Match Details</h2>
      {match.veto && <VetoBoard veto={match.veto} opp1Name={opp1Name} opp2Name={opp2Name} />}
      {games.length > 0 && (
        <>
          <div className={styles.csTabs}>
            {games.map((g, i) => (
              <button
                key={i}
                className={`${styles.csTabBtn} ${i === activeIdx ? styles.csTabActive : ""}`}
                onClick={() => setActiveIdx(i)}
              >
                <span>Map {i + 1} · {g.map}</span>
                <span className={styles.csTabScore}>{g.scores[0]}–{g.scores[1]}</span>
              </button>
            ))}
          </div>
          <CsMapPanel game={activeGame} opp1Name={opp1Name} opp2Name={opp2Name} />
        </>
      )}
    </section>
  );
}

export default function MatchPage({ wiki }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [apiMatch, setApiMatch]   = useState(null);
  const [loading,  setLoading]    = useState(false);
  const mockMatch = getMatch(id);

  useEffect(() => {
    if (mockMatch || !id) return;
    if (id.startsWith('ps_')) return; // PandaScore maçları şimdilik detay yok
    let cancelled = false;
    setLoading(true);
    const isLoL = wiki === 'leagueoflegends';
    const isCS2 = wiki === 'counterstrike';
    const fetcher = isLoL ? getLoLMatchById : isCS2 ? getCS2MatchById : null;
    if (!fetcher) { setLoading(false); return; }
    fetcher(id)
      .then(m => { if (!cancelled) { setApiMatch(m); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, wiki, mockMatch]);

  if (loading) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center", color: "var(--text-2)" }}>
        {t("common.loading")}
      </div>
    );
  }

  const match = mockMatch || apiMatch;

  if (!match) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>Match not found: {id}</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>← Home</Link>
      </div>
    );
  }

  const [opp1, opp2] = match.match2opponents;
  const isFinished = match.finished === 1;
  const isLive = match.finished === 0;
  const isUpcoming = !isFinished && !isLive;
  const winnerIdx = match.winner != null ? parseInt(match.winner, 10) - 1 : -1;
  const streams = Object.entries(match.stream || {});

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroBreadcrumb}>
            <Link to="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>›</span>
            <Link to={`/tournament/${match.tournament.replace(/ /g, "_")}`} className={styles.breadLink}>
              {match.tournament}
            </Link>
            <span className={styles.breadSep}>›</span>
            <span>{cleanHeader(match.match2bracketdata?.header) || "Match"}</span>
          </div>

          <div className={styles.heroTop}>
            <TierBadge tier={match.liquipediatier} tiertype={match.liquipediatiertype} />
            {match.match2bracketdata?.type && (
              <span className={styles.bracketType}>
                {match.match2bracketdata.type === "bracket" ? "Elimination" : "Group Stage"}
              </span>
            )}
            {match.match2bracketdata?.header && (
              <span className={styles.bracketHeader}>{cleanHeader(match.match2bracketdata.header)}</span>
            )}
            <span className={styles.bestofBadge}>BO{match.bestof}</span>
            {isLive && <span className={styles.liveBadge}>● LIVE</span>}
            {isFinished && <span className={styles.finishedBadge}>Finished</span>}
            {isUpcoming && <span className={styles.upcomingBadge}>Upcoming</span>}
          </div>

          <div className={styles.heroMatchup}>
            <div
              className={`${styles.heroTeam} ${winnerIdx === 0 ? styles.heroWinner : winnerIdx !== -1 ? styles.heroLoser : ""}`}
              onClick={() => navigate(`/team/${encodeURIComponent(opp1?.name)}`)}
            >
              {opp1?.iconurl
                ? <img src={opp1.iconurl} alt={opp1.name} className={styles.heroTeamAvatar}
                    style={{ objectFit: "contain", background: "transparent" }}
                    referrerPolicy="no-referrer"
                    onError={e => { e.target.style.display = "none"; e.target.nextSibling?.style && (e.target.nextSibling.style.display = "flex"); }}
                  />
                : null}
              <div className={styles.heroTeamAvatar} style={{ display: opp1?.iconurl ? "none" : "flex" }}>{opp1?.name?.[0] || "?"}</div>
              <span className={styles.heroTeamName}>{opp1?.name}</span>
            </div>

            <div className={styles.heroScoreBlock}>
              <div className={styles.heroScores}>
                <span className={`${styles.heroScore} ${winnerIdx === 0 ? styles.heroScoreWin : ""}`}>
                  {isUpcoming ? "—" : (opp1?.score ?? "—")}
                </span>
                <span className={styles.heroColon}>:</span>
                <span className={`${styles.heroScore} ${winnerIdx === 1 ? styles.heroScoreWin : ""}`}>
                  {isUpcoming ? "—" : (opp2?.score ?? "—")}
                </span>
              </div>
              <span className={styles.heroDate}>{formatDate(match.date)}</span>
              <span className={styles.heroTournament}>{match.tournament}</span>
            </div>

            <div
              className={`${styles.heroTeam} ${styles.heroTeamRight} ${winnerIdx === 1 ? styles.heroWinner : winnerIdx !== -1 ? styles.heroLoser : ""}`}
              onClick={() => navigate(`/team/${encodeURIComponent(opp2?.name)}`)}
            >
              {opp2?.iconurl
                ? <img src={opp2.iconurl} alt={opp2.name} className={styles.heroTeamAvatar}
                    style={{ objectFit: "contain", background: "transparent" }}
                    referrerPolicy="no-referrer"
                    onError={e => { e.target.style.display = "none"; e.target.nextSibling?.style && (e.target.nextSibling.style.display = "flex"); }}
                  />
                : null}
              <div className={styles.heroTeamAvatar} style={{ display: opp2?.iconurl ? "none" : "flex" }}>{opp2?.name?.[0] || "?"}</div>
              <span className={styles.heroTeamName}>{opp2?.name}</span>
            </div>
          </div>

          {streams.length > 0 && (
            <div className={styles.heroStreams}>
              {streams.map(([key, url]) => {
                const lang = key.match(/_([a-z]{2})_/)?.[1]?.toUpperCase() || "EN";
                return (
                  <a key={key} href={url} target="_blank" rel="noreferrer" className={styles.streamBtn}>
                    ▶ Watch {lang} Stream
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="wrap">
        {match.wiki === "counterstrike" && (
          <CsMatchDetails match={match} opp1Name={opp1?.name} opp2Name={opp2?.name} />
        )}

        {match.wiki === "leagueoflegends" && (
          <LolMatchDetails match={match} opp1Name={opp1?.name} opp2Name={opp2?.name} />
        )}

        {match.wiki !== "leagueoflegends" && match.match2games?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Map Results</h2>
            <div className={styles.mapSummary}>
              <div className={styles.mapSummaryHead}>
                <span className={styles.mapSummaryTeam}>{opp1?.name}</span>
                <span className={styles.mapSummaryLabel}>Map Summary</span>
                <span className={styles.mapSummaryTeam}>{opp2?.name}</span>
              </div>
              {match.match2games.map((g, i) => (
                <div key={i} className={styles.mapSummaryRow}>
                  <span className={`${styles.summaryScore} ${g.winner === "1" ? styles.summaryWin : styles.summaryLoss}`}>
                    {g.scores[0]}
                  </span>
                  <div className={styles.summaryMapInfo}>
                    <span className={styles.summaryMapName}>{g.map}</span>
                    {g.length && <span className={styles.summaryLen}>{g.length}</span>}
                    {g.vod && <a href={g.vod} target="_blank" rel="noreferrer" className={styles.summaryVod}>VOD ↗</a>}
                  </div>
                  <span className={`${styles.summaryScore} ${g.winner === "2" ? styles.summaryWin : styles.summaryLoss}`}>
                    {g.scores[1]}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
