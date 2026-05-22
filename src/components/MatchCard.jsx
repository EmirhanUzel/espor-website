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

function isLoLMatch(match) {
  return match.wiki === "leagueoflegends";
}

// Returns "HH:MM UTC" from "YYYY-MM-DD HH:MM:SS", null if midnight/unavailable
function matchTime(dateStr) {
  if (!dateStr || dateStr.startsWith("0000")) return null;
  const t = dateStr.slice(11, 16);
  return t && t !== "00:00" ? `${t} UTC` : null;
}

// Liquipedia internal bracket codes start with "!" — fall back to tournament name
function displayHeader(match) {
  const h = match.match2bracketdata?.header;
  if (!h || h.startsWith("!")) return match.tournament;
  const label = h.includes(",") ? h.split(",")[0].trim() : h;
  return label.replace(/<[^>]+>/g, "").trim() || match.tournament;
}

export default function MatchCard({ match }) {
  const navigate  = useNavigate();
  const opp1      = match.match2opponents?.[0];
  const opp2      = match.match2opponents?.[1];
  if (!opp1 || !opp2 || (!opp1.name && !opp2.name)) return null;
  const winnerIdx    = parseInt(match.winner, 10) - 1;
  const isLoL        = isLoLMatch(match);

  return (
    <div className={styles.card} onClick={() => navigate(`/match/${match.id}`)}>

      {/* Üst bar */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <TierBadge tier={match.liquipediatier} tiertype={match.liquipediatiertype} />
          <span className={styles.header}>{displayHeader(match)}</span>
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
        <span className={`${styles.teamName} ${winnerIdx === 0 ? styles.winnerName : ""}`}>{opp1?.name}</span>
        <div className={styles.scoreBlock}>
          <span className={`${styles.score} ${winnerIdx === 0 ? styles.winnerScore : ""}`}>{opp1?.score < 0 ? 0 : (opp1?.score ?? "—")}</span>
          <span className={styles.scoreDash}>-</span>
          <span className={`${styles.score} ${winnerIdx === 1 ? styles.winnerScore : ""}`}>{opp2?.score < 0 ? 0 : (opp2?.score ?? "—")}</span>
        </div>
        <span className={`${styles.teamName} ${styles.teamNameRight} ${winnerIdx === 1 ? styles.winnerName : ""}`}>{opp2?.name}</span>
      </div>

      {/* Oyunlar — dikey satır listesi */}
      {match.match2games?.length > 0 && (
        <div className={styles.games}>
          {match.match2games.filter(g => g.winner === "1" || g.winner === "2").map((g, i) => {
            const w1 = g.winner === "1";
            const w2 = g.winner === "2";

            if (isLoL) {
              return (
                <div key={i} className={`${styles.gameRow} ${w1 ? styles.gameRowWin1 : w2 ? styles.gameRowWin2 : ""}`}>
                  <span className={styles.gameNum}>G{i + 1}</span>
                  <span className={`${styles.gameLoLWinner} ${w1 ? styles.gameLoLWin : w2 ? styles.gameLoLLose : ""}`}>
                    {w1 ? opp1?.name : w2 ? opp2?.name : "—"}
                  </span>
                  {g.length && <span className={styles.mapLen}>{g.length}</span>}
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
        <span className={styles.date}>
          {formatDate(match.date)}
          {match.finished !== 1 && matchTime(match.date) && ` · ${matchTime(match.date)}`}
        </span>
      </div>
    </div>
  );
}
