import { Link } from "react-router-dom";
import styles from "./GroupStandings.module.css";

function PlacementChange({ change }) {
  if (change > 0) return <span className={styles.up}>↑{change}</span>;
  if (change < 0) return <span className={styles.down}>↓{Math.abs(change)}</span>;
  return <span className={styles.same}>—</span>;
}

export default function GroupStandings({ groups }) {
  if (!groups?.length) return null;

  return (
    <div className={styles.root}>
      {groups.map(group => (
        <div key={group.title} className={styles.group}>
          <div className={styles.groupHeader}>
            <span className={styles.groupTitle}>{group.title}</span>
            <span className={styles.groupType}>{group.type === "league" ? "Round Robin" : "Bracket"}</span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thPos}>#</th>
                  <th className={styles.thTeam}>Team</th>
                  <th className={styles.thStat} title="Match Wins">MW</th>
                  <th className={styles.thStat} title="Match Losses">ML</th>
                  <th className={styles.thStat} title="Game Wins">GW</th>
                  <th className={styles.thStat} title="Game Losses">GL</th>
                  <th className={styles.thStat} title="Differential">±</th>
                  <th className={styles.thStat} title="Points">Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.entries.map((entry, i) => (
                  <tr key={entry.opponentname} className={i < 2 ? styles.rowAdvance : ""}>
                    <td className={styles.tdPos}>
                      <span className={styles.pos}>{entry.placement}</span>
                    </td>
                    <td className={styles.tdTeam}>
                      <Link to={`/takim/${encodeURIComponent(entry.opponentname)}`} className={styles.teamLink}>
                        <span className={styles.teamName}>{entry.opponentname}</span>
                        <PlacementChange change={entry.placementchange} />
                      </Link>
                    </td>
                    <td className={styles.tdStat}>{entry.scoreboard.match.w}</td>
                    <td className={styles.tdStat}>{entry.scoreboard.match.l}</td>
                    <td className={styles.tdStat}>{entry.scoreboard.game.w}</td>
                    <td className={styles.tdStat}>{entry.scoreboard.game.l}</td>
                    <td className={`${styles.tdStat} ${entry.scoreboard.diff > 0 ? styles.pos : entry.scoreboard.diff < 0 ? styles.neg : ""}`}>
                      {entry.scoreboard.diff > 0 ? "+" : ""}{entry.scoreboard.diff}
                    </td>
                    <td className={styles.tdPoints}>{entry.scoreboard.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {group.matches?.length > 0 && (
            <div className={styles.matchCount}>{group.matches.length} matches played</div>
          )}
        </div>
      ))}
    </div>
  );
}
