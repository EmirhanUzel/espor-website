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

function MapResult({ game, gameIndex, opp1Name, opp2Name }) {
  const isWin1 = game.winner === "1";
  const isWin2 = game.winner === "2";
  return (
    <div className={styles.mapCard}>
      <div className={styles.mapHead}>
        <span className={styles.mapIndex}>Map {gameIndex + 1}</span>
        <span className={styles.mapName}>{game.map}</span>
        <div className={styles.mapMeta}>
          {game.length && <span className={styles.mapLen}>{game.length}</span>}
          {game.vod && (
            <a href={game.vod} target="_blank" rel="noreferrer" className={styles.mapVod}>▶ VOD</a>
          )}
        </div>
      </div>
      <div className={styles.mapScores}>
        <div className={`${styles.mapTeam} ${isWin1 ? styles.mapWinner : styles.mapLoser}`}>
          <span className={styles.mapTeamName}>{opp1Name}</span>
          <span className={styles.mapScore}>{game.scores[0]}</span>
        </div>
        <span className={styles.mapDash}>–</span>
        <div className={`${styles.mapTeam} ${styles.mapTeamRight} ${isWin2 ? styles.mapWinner : styles.mapLoser}`}>
          <span className={styles.mapScore}>{game.scores[1]}</span>
          <span className={styles.mapTeamName}>{opp2Name}</span>
        </div>
      </div>
      <div className={styles.mapFooter}>
        <span className={`${styles.mapWinnerLabel} ${isWin1 ? styles.mapWinnerLeft : styles.mapWinnerRight}`}>
          ✓ {isWin1 ? opp1Name : opp2Name}
        </span>
        <span className={styles.mapDate}>{formatDate(game.date)}</span>
      </div>
    </div>
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
  const winnerIdx = parseInt(match.winner, 10) - 1;
  const isFinished = match.finished === 1;
  const isLive = match.finished === 0;
  const streams = Object.entries(match.stream || {});

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroBreadcrumb}>
            <Link to="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>›</span>
            <Link to={`/turnuva/${match.tournament.replace(/ /g, "_")}`} className={styles.breadLink}>
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
          </div>

          <div className={styles.heroMatchup}>
            <div
              className={`${styles.heroTeam} ${winnerIdx === 0 ? styles.heroWinner : styles.heroLoser}`}
              onClick={() => navigate(`/takim/${encodeURIComponent(opp1?.name)}`)}
            >
              <div className={styles.heroTeamAvatar}>{opp1?.name?.[0] || "?"}</div>
              <span className={styles.heroTeamName}>{opp1?.name}</span>
            </div>

            <div className={styles.heroScoreBlock}>
              <div className={styles.heroScores}>
                <span className={`${styles.heroScore} ${winnerIdx === 0 ? styles.heroScoreWin : ""}`}>
                  {opp1?.score ?? "—"}
                </span>
                <span className={styles.heroColon}>:</span>
                <span className={`${styles.heroScore} ${winnerIdx === 1 ? styles.heroScoreWin : ""}`}>
                  {opp2?.score ?? "—"}
                </span>
              </div>
              <span className={styles.heroDate}>{formatDate(match.date)}</span>
              <span className={styles.heroTournament}>{match.tournament}</span>
            </div>

            <div
              className={`${styles.heroTeam} ${styles.heroTeamRight} ${winnerIdx === 1 ? styles.heroWinner : styles.heroLoser}`}
              onClick={() => navigate(`/takim/${encodeURIComponent(opp2?.name)}`)}
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
        {match.match2games?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Map Results</h2>
            <div className={styles.mapGrid}>
              {match.match2games.map((game, i) => (
                <MapResult key={i} game={game} gameIndex={i} opp1Name={opp1?.name} opp2Name={opp2?.name} />
              ))}
            </div>

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
                  ["Status", isFinished ? "Finished" : isLive ? "Live" : "Upcoming"],
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
                  onClick={() => navigate(`/takim/${encodeURIComponent(opp?.name)}`)}>
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
