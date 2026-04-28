import { useNavigate } from "react-router-dom";
import { formatDate, tierLabel } from "../services/api";
import styles from "./MatchCard.module.css";

function TierBadge({ tier, tiertype }) {
  return (
    <span className={`${styles.tier} ${tier === "1" ? styles.tierS : tier === "2" ? styles.tierA : styles.tierB}`}>
      {tierLabel(tier)}{tiertype ? `-${tiertype.slice(0, 3).toUpperCase()}` : ""}
    </span>
  );
}

function StatusBadge({ finished }) {
  if (finished === 1) return <span className={styles.badgeFinished}>Finished</span>;
  if (finished === 0) return <span className={styles.badgeLive}>● LIVE</span>;
  return <span className={styles.badgeUpcoming}>Upcoming</span>;
}

export default function MatchCard({ match }) {
  const navigate = useNavigate();
  const [opp1, opp2] = match.match2opponents;
  const winnerIdx = parseInt(match.winner, 10) - 1;

  return (
    <div className={styles.card} onClick={() => navigate(`/mac/${match.id}`)}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <TierBadge tier={match.liquipediatier} tiertype={match.liquipediatiertype} />
          <span className={styles.header}>{match.match2bracketdata?.header || match.tournament}</span>
          <span className={styles.bestof}>BO{match.bestof}</span>
        </div>
        <div className={styles.headRight}>
          <StatusBadge finished={match.finished} />
          {match.stream?.twitch_en_1 && (
            <a href={match.stream.twitch_en_1} target="_blank" rel="noreferrer"
              className={styles.streamLink} onClick={e => e.stopPropagation()}>
              ▶ Watch
            </a>
          )}
        </div>
      </div>

      <div className={styles.matchup}>
        <div className={`${styles.team} ${winnerIdx === 0 ? styles.winner : ""}`}>
          <span className={styles.teamName}>{opp1?.name}</span>
          <span className={styles.score}>{opp1?.score ?? "—"}</span>
        </div>
        <div className={styles.vs}>VS</div>
        <div className={`${styles.team} ${styles.teamRight} ${winnerIdx === 1 ? styles.winner : ""}`}>
          <span className={styles.score}>{opp2?.score ?? "—"}</span>
          <span className={styles.teamName}>{opp2?.name}</span>
        </div>
      </div>

      {match.match2games?.length > 0 && (
        <div className={styles.games}>
          {match.match2games.map((g, i) => (
            <div key={i} className={`${styles.game} ${g.winner === "1" ? styles.gameWin1 : g.winner === "2" ? styles.gameWin2 : ""}`}>
              <span className={styles.mapName}>{g.map}</span>
              <span className={styles.mapScore}>{g.scores[0]}–{g.scores[1]}</span>
              <span className={styles.mapLen}>{g.length}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.foot}>
        <span className={styles.tournament}>{match.tournament}</span>
        <span className={styles.date}>{formatDate(match.date)}</span>
      </div>
    </div>
  );
}
