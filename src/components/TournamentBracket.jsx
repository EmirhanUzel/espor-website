import { useNavigate } from "react-router-dom";
import styles from "./TournamentBracket.module.css";

// Aynı priority = aynı sütun (örn. Upper Final + Lower Final birlikte)
const ROUND_PRIORITY = {
  "play-in": 1, "qualifier": 1,
  "round of 16": 2,
  "quarterfinal": 3, "quarter-final": 3,
  "upper quarter-final": 3, "lower quarter-final": 3,
  "semi-final": 4, "upper semi-final": 4, "lower semi-final": 4,
  "upper final": 5, "lower final": 5,
  "grand final": 6, "final": 6,
};

function getRoundPriority(header) {
  return ROUND_PRIORITY[header?.toLowerCase()] ?? 3;
}

function BracketCard({ match }) {
  const navigate = useNavigate();
  const [t1, t2] = match.match2opponents || [];
  const done = match.finished === 1;
  const w = match.winner;

  const goMatch = () => navigate(`/match/${match.id}`);
  const goTeam = (e, name) => {
    if (!name || name === "TBD") return;
    e.stopPropagation();
    navigate(`/team/${encodeURIComponent(name)}`);
  };

  const teamLabel = (t, side) => {
    const isTbd = !t?.name;
    const className = `${styles.teamName} ${!isTbd ? styles.teamNameLink : ""}`;
    return (
      <span
        className={className}
        onClick={isTbd ? undefined : (e) => goTeam(e, t.name)}
        role={isTbd ? undefined : "link"}
        tabIndex={isTbd ? undefined : 0}
        onKeyDown={isTbd ? undefined : (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goTeam(e, t.name);
          }
        }}
        title={isTbd ? undefined : `View ${t.name}`}
      >
        {t?.name || "TBD"}
      </span>
    );
  };

  return (
    <div
      className={styles.card}
      onClick={goMatch}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") goMatch(); }}
      title="View match"
    >
      <div className={`${styles.teamRow} ${done ? (w === "1" ? styles.win : styles.lose) : ""}`}>
        {teamLabel(t1, 1)}
        {done && <span className={styles.teamScore}>{t1?.score ?? "—"}</span>}
      </div>
      <div className={`${styles.teamRow} ${done ? (w === "2" ? styles.win : styles.lose) : ""}`}>
        {teamLabel(t2, 2)}
        {done && <span className={styles.teamScore}>{t2?.score ?? "—"}</span>}
      </div>
    </div>
  );
}

export default function TournamentBracket({ matches }) {
  if (!matches?.length) return null;

  // Group by priority (same priority = same column)
  const priorityMap = new Map();
  for (const m of matches) {
    const header = m.match2bracketdata?.header || "Match";
    const p = getRoundPriority(header);
    if (!priorityMap.has(p)) priorityMap.set(p, { headers: new Set(), matches: [] });
    const g = priorityMap.get(p);
    g.headers.add(header);
    g.matches.push(m);
  }

  // Sort ascending → left=early, right=final
  const columns = [...priorityMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, g]) => ({
      label: [...g.headers].join(" · "),
      matches: g.matches,
    }));

  if (columns.length < 1) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.bracket}>
        {columns.map((col, colIdx) => {
          const isLast  = colIdx === columns.length - 1;
          const isFirst = colIdx === 0;

          // Her 2 maçı bir pair'a grupla (vertical connector için)
          const pairs = [];
          for (let i = 0; i < col.matches.length; i += 2) {
            pairs.push(col.matches.slice(i, i + 2));
          }

          return (
            <div key={colIdx} className={`${styles.column} ${isLast ? styles.columnLast : ""}`}>
              <div className={styles.roundLabel}>{col.label}</div>
              <div className={styles.columnBody}>
                {pairs.map((pair, pi) => (
                  <div
                    key={pi}
                    className={`${styles.pair} ${!isLast && pair.length === 2 ? styles.pairConn : ""}`}
                  >
                    {pair.map((match) => (
                      <div
                        key={match.id}
                        className={`${styles.matchWrap} ${!isFirst ? styles.connLeft : ""} ${!isLast ? styles.connRight : ""}`}
                      >
                        <BracketCard match={match} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
