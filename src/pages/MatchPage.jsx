import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMatch, formatDate, tierLabel } from "../services/api";
import styles from "./MatchPage.module.css";

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

export default function MatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const match = getMatch(id);

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
            <span>{match.match2bracketdata?.header || "Match"}</span>
          </div>

          <div className={styles.heroTop}>
            <TierBadge tier={match.liquipediatier} tiertype={match.liquipediatiertype} />
            {match.match2bracketdata?.type && (
              <span className={styles.bracketType}>
                {match.match2bracketdata.type === "bracket" ? "Elimination" : "Group Stage"}
              </span>
            )}
            {match.match2bracketdata?.header && (
              <span className={styles.bracketHeader}>{match.match2bracketdata.header}</span>
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
              <div className={styles.heroTeamAvatar}>{opp1?.name?.[0] || "?"}</div>
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
              <div className={styles.heroTeamAvatar}>{opp2?.name?.[0] || "?"}</div>
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

        {match.match2games?.length > 0 && (
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

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Match Info</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoList}>
                {[
                  ["Tournament", match.tournament],
                  ["Round", match.match2bracketdata?.header || "—"],
                  ["Format", `Best of ${match.bestof}`],
                  ["Type", match.match2bracketdata?.type === "bracket" ? "Elimination" : "Group Stage"],
                  ["Date", formatDate(match.date)],
                  ["Status", isFinished ? "Finished" : isLive ? "● Live" : "Upcoming"],
                  ["Game", match.wiki],
                ].map(([k, v]) => (
                  <div key={k} className={styles.infoRow}>
                    <span className={styles.infoKey}>{k}</span>
                    <span className={styles.infoVal}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>Teams</h3>
              {[opp1, opp2].map((opp, idx) => (
                <div key={opp?.name}
                  className={`${styles.oppRow} ${winnerIdx === idx ? styles.oppWinner : ""}`}
                  onClick={() => navigate(`/team/${encodeURIComponent(opp?.name)}`)}>
                  <div className={styles.oppAvatar}>{opp?.name?.[0]}</div>
                  <span className={styles.oppName}>{opp?.name}</span>
                  <span className={styles.oppType}>{opp?.type}</span>
                  <span className={styles.oppScore}>{opp?.score ?? "—"}</span>
                  {winnerIdx === idx && <span className={styles.oppWinBadge}>Winner</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
