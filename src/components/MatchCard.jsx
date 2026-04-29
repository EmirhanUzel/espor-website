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

// LoL'de map her zaman "Summoner's Rift" — farklı oyun sonuçları için sadece numara + kazanan yeterli
const LOL_MAPS = ["summoner's rift", "summoner's rift"];
function isLoLMatch(match) {
  return match.wiki === "leagueoflegends";
}

export default function MatchCard({ match }) {
  const navigate  = useNavigate();
  const [opp1, opp2] = match.match2opponents;
  const winnerIdx    = parseInt(match.winner, 10) - 1;
  const isLoL        = isLoLMatch(match);

  return (
    <div className={styles.card} onClick={() => navigate(`/match/${match.id}`)}>

      {/* Üst bar */}
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

      {/* Skor */}
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

      {/* Oyunlar — dikey satır listesi */}
      {match.match2games?.length > 0 && (
        <div className={styles.games}>
          {match.match2games.map((g, i) => {
            const w1 = g.winner === "1";
            const w2 = g.winner === "2";

            if (isLoL) {
              // LoL: G numarası + kazanan takım adı
              return (
                <div key={i} className={`${styles.gameRow} ${w1 ? styles.gameRowWin1 : w2 ? styles.gameRowWin2 : ""}`}>
                  <span className={styles.gameNum}>G{i + 1}</span>
                  <span className={`${styles.gameLoLWinner} ${w1 ? styles.gameLoLWin : w2 ? styles.gameLoLLose : ""}`}>
                    {w1 ? opp1?.name : w2 ? opp2?.name : "—"}
                  </span>
                </div>
              );
            }

            // CS2 / VALORANT: G numarası | map adı | skor | süre | kazanan
            return (
              <div key={i} className={`${styles.gameRow} ${w1 ? styles.gameRowWin1 : w2 ? styles.gameRowWin2 : ""}`}>
                <span className={styles.gameNum}>G{i + 1}</span>
                <span className={styles.mapName}>{g.map}</span>
                <span className={styles.mapScore}>{g.scores[0]}–{g.scores[1]}</span>
                {g.length && <span className={styles.mapLen}>{g.length}</span>}
                <span className={styles.gameWinner}>{w1 ? opp1?.name : w2 ? opp2?.name : ""}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Alt bar */}
      <div className={styles.foot}>
        <span className={styles.tournament}>{match.tournament}</span>
        <span className={styles.date}>{formatDate(match.date)}</span>
      </div>
    </div>
  );
}
