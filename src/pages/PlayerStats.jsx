import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlayer, formatDate } from "../services/api";
import { getPlayerStats } from "../services/playerStats";
import styles from "./PlayerStats.module.css";

function StatCell({ value, highlight, bad }) {
  return (
    <td className={`${styles.td} ${highlight ? styles.tdHighlight : ""} ${bad ? styles.tdBad : ""}`}>
      {value}
    </td>
  );
}

function ValorantTable({ maps }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {["Harita","Ajan","Skor","ACS","K","D","A","HS%","KAST","ADR","FK","FD"].map(h => (
              <th key={h} className={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {maps.map((mp, i) => (
            <tr key={i} className={mp.result === "W" ? styles.rowWin : styles.rowLoss}>
              <td className={`${styles.td} ${styles.tdMap}`}>{mp.map}</td>
              <td className={`${styles.td} ${styles.tdAgent}`}>{mp.agent}</td>
              <td className={`${styles.td} ${mp.result === "W" ? styles.scoreWin : styles.scoreLoss}`}>{mp.score}</td>
              <StatCell value={mp.stats.acs} highlight />
              <td className={styles.td}>{mp.stats.k}</td>
              <StatCell value={mp.stats.d} bad />
              <td className={styles.td}>{mp.stats.a}</td>
              <td className={styles.td}>{mp.stats.hs}%</td>
              <td className={styles.td}>{mp.stats.kast}%</td>
              <td className={styles.td}>{mp.stats.adr}</td>
              <StatCell value={mp.stats.fk} highlight={mp.stats.fk > mp.stats.fd} />
              <StatCell value={mp.stats.fd} bad={mp.stats.fd > mp.stats.fk} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CS2Table({ maps }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {["Harita","Skor","Rating","K","D","A","HS%","KAST","ADR","Util Dmg","FK","FD"].map(h => (
              <th key={h} className={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {maps.map((mp, i) => (
            <tr key={i} className={mp.result === "W" ? styles.rowWin : styles.rowLoss}>
              <td className={`${styles.td} ${styles.tdMap}`}>{mp.map}</td>
              <td className={`${styles.td} ${mp.result === "W" ? styles.scoreWin : styles.scoreLoss}`}>{mp.score}</td>
              <StatCell value={mp.stats.rating} highlight={mp.stats.rating >= 1.2} />
              <td className={styles.td}>{mp.stats.k}</td>
              <StatCell value={mp.stats.d} bad />
              <td className={styles.td}>{mp.stats.a}</td>
              <td className={styles.td}>{mp.stats.hs}%</td>
              <td className={styles.td}>{mp.stats.kast}%</td>
              <td className={styles.td}>{mp.stats.adr}</td>
              <td className={styles.td}>{mp.stats.util}</td>
              <StatCell value={mp.stats.fk} highlight={mp.stats.fk > mp.stats.fd} />
              <StatCell value={mp.stats.fd} bad={mp.stats.fd > mp.stats.fk} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoLTable({ maps }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {["","Şampiyon","Süre","K/D/A","CS","CS/dk","Hasar","Vision"].map(h => (
              <th key={h} className={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {maps.map((mp, i) => (
            <tr key={i} className={mp.result === "W" ? styles.rowWin : styles.rowLoss}>
              <td className={`${styles.td} ${mp.result === "W" ? styles.scoreWin : styles.scoreLoss}`} style={{ fontWeight: 800 }}>{mp.result}</td>
              <td className={`${styles.td} ${styles.tdAgent}`}>{mp.champ}</td>
              <td className={styles.td}>{mp.stats.duration}</td>
              <StatCell value={mp.stats.kda} highlight />
              <td className={styles.td}>{mp.stats.cs}</td>
              <td className={styles.td}>{mp.stats.csmin}</td>
              <td className={styles.td}>{mp.stats.dmg?.toLocaleString("tr-TR")}</td>
              <td className={styles.td}>{mp.stats.vision}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function matchAvg(match, wiki) {
  if (wiki === "valorant") {
    const avg = Math.round(match.maps.reduce((s, m) => s + m.stats.acs, 0) / match.maps.length);
    const kd = (match.maps.reduce((s, m) => s + m.stats.k, 0) / match.maps.reduce((s, m) => s + m.stats.d, 0)).toFixed(2);
    return `ACS ${avg} · K/D ${kd}`;
  }
  if (wiki === "counterstrike") {
    const avg = (match.maps.reduce((s, m) => s + m.stats.rating, 0) / match.maps.length).toFixed(2);
    const kd = (match.maps.reduce((s, m) => s + m.stats.k, 0) / match.maps.reduce((s, m) => s + m.stats.d, 0)).toFixed(2);
    return `Rating ${avg} · K/D ${kd}`;
  }
  if (wiki === "leagueoflegends") {
    const totK = match.maps.reduce((s, m) => s + parseInt(m.stats.kda.split("/")[0]), 0);
    const totD = match.maps.reduce((s, m) => s + parseInt(m.stats.kda.split("/")[1]), 0);
    const totA = match.maps.reduce((s, m) => s + parseInt(m.stats.kda.split("/")[2]), 0);
    const kda = totD === 0 ? "Perfect" : ((totK + totA) / totD).toFixed(1);
    return `KDA ${kda} (${totK}/${totD}/${totA})`;
  }
  return "";
}

export default function PlayerStats() {
  const { id } = useParams();
  const player = getPlayer(id);
  const statsData = getPlayerStats(id);
  const [expanded, setExpanded] = useState(new Set());
  const [filter, setFilter] = useState("all");

  if (!player || !statsData) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>İstatistik bulunamadı: {id}</h2>
        <Link to={`/player/${id}`} style={{ color: "var(--text-1)", fontWeight: 700 }}>← Profile dön</Link>
      </div>
    );
  }

  const isValorant = player.wiki === "valorant";
  const isCS       = player.wiki === "counterstrike";
  const isLoL      = player.wiki === "leagueoflegends";
  const filterKey   = isLoL ? "champ" : isValorant ? "agent" : "map";
  const filterLabel = isLoL ? "Şampiyona göre" : isValorant ? "Ajana göre" : "Haritaya göre";

  // Unique filter options across all matches
  const filterOptions = useMemo(() => {
    return [...new Set(statsData.matches.flatMap(m => m.maps.map(mp => mp[filterKey])))].sort();
  }, [statsData, filterKey]);

  const filteredMatches = useMemo(() => {
    if (filter === "all") return statsData.matches;
    return statsData.matches.filter(m => m.maps.some(mp => mp[filterKey] === filter));
  }, [statsData, filter, filterKey]);

  const toggle = (i) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const isOpen = (i) => expanded.has(i) || filter !== "all";

  return (
    <main>
      {/* Hero header */}
      <div className={styles.hero}>
        <div className="wrap">
          <Link to={`/player/${id}`} className={styles.back}>← {player.id}</Link>
          <h1 className={styles.title}>İstatistikler</h1>
          {player.recentstats && (
            <p className={styles.period}>
              {player.recentstats.period} · {player.recentstats.games} {player.recentstats.gamesLabel}
            </p>
          )}
        </div>
      </div>

      <div className="wrap">

        {/* Summary tiles */}
        {player.recentstats && (
          <div className={styles.summary}>
            {player.recentstats.stats.map(s => (
              <div key={s.label} className={styles.summaryItem}>
                <span className={styles.summaryVal}>{s.value}</span>
                <span className={styles.summaryLabel}>{s.label}</span>
              </div>
            ))}
            {player.recentstats.highlight && (
              <div className={`${styles.summaryItem} ${styles.summaryAccent}`}>
                <span className={styles.summaryVal}>{player.recentstats.highlight.value}</span>
                <span className={styles.summaryLabel}>{player.recentstats.highlight.label}</span>
              </div>
            )}
          </div>
        )}

        {/* Filter bar */}
        <div className={styles.filterWrap}>
          <span className={styles.filterLabel}>{filterLabel}:</span>
          <div className={styles.filterBar}>
            <button
              className={`${styles.chip} ${filter === "all" ? styles.chipActive : ""}`}
              onClick={() => setFilter("all")}
            >
              Tümü
            </button>
            {filterOptions.map(opt => (
              <button
                key={opt}
                className={`${styles.chip} ${filter === opt ? styles.chipActive : ""}`}
                onClick={() => setFilter(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Match list */}
        <div className={styles.matchList}>
          {filteredMatches.map((match, i) => {
            const open = isOpen(i);
            const visibleMaps = filter === "all"
              ? match.maps
              : match.maps.filter(mp => mp[filterKey] === filter);

            return (
              <div key={i} className={styles.matchCard}>

                {/* Match row */}
                <div className={styles.matchRow} onClick={() => toggle(i)}>
                  <span className={`${styles.badge} ${match.result === "W" ? styles.win : styles.loss}`}>
                    {match.result}
                  </span>
                  <div className={styles.matchInfo}>
                    <span className={styles.opponent}>vs {match.opponent}</span>
                    <span className={styles.meta}>{formatDate(match.date)} · {match.tournament}</span>
                  </div>
                  <span className={styles.score}>{match.score}</span>
                  <span className={styles.avg}>{matchAvg(match, player.wiki)}</span>
                  <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>

                {/* Expanded map table */}
                {open && (
                  <div className={styles.mapSection}>
                    {isValorant && <ValorantTable maps={visibleMaps} />}
                    {isCS       && <CS2Table      maps={visibleMaps} />}
                    {isLoL      && <LoLTable      maps={visibleMaps} />}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
