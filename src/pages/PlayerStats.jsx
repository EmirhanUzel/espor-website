import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlayer, formatDate } from "../services/api";
import { getPlayerStats } from "../services/playerStats";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "./PlayerStats.module.css";

function StatCell({ value, highlight, bad }) {
  return (
    <td className={`${styles.td} ${highlight ? styles.tdHighlight : ""} ${bad ? styles.tdBad : ""}`}>
      {value}
    </td>
  );
}

function ValorantTable({ maps }) {
  const { t } = useLanguage();
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {[t("stats.map"),t("stats.agent"),t("stats.score"),"ACS","K","D","A","HS%","KAST","ADR","FK","FD"].map(h => (
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
  const { t } = useLanguage();
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {[t("stats.map"),t("stats.score"),"Rating","K","D","A","HS%","KAST","ADR","Util Dmg","FK","FD"].map(h => (
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
  const { t, lang } = useLanguage();
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {["",t("stats.champion"),t("stats.duration"),"K/D/A","CS","CS/min",t("stats.damage"),"Vision"].map(h => (
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
              <td className={styles.td}>{mp.stats.dmg?.toLocaleString(lang === "tr" ? "tr-TR" : "en-US")}</td>
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
  const { t } = useLanguage();
  const player = getPlayer(id);
  const statsData = getPlayerStats(id);
  const [expanded, setExpanded] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  if (!player || !statsData) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>{t("stats.notFound")}: {id}</h2>
        <Link to={`/player/${id}`} style={{ color: "var(--text-1)", fontWeight: 700 }}>← {t("stats.backToProfile")}</Link>
      </div>
    );
  }

  const isValorant = player.wiki === "valorant";
  const isCS       = player.wiki === "counterstrike";
  const isLoL      = player.wiki === "leagueoflegends";
  const filterKey   = isLoL ? "champ" : isValorant ? "agent" : "map";
  const filterLabel = isLoL ? t("stats.filterByChampion") : isValorant ? t("stats.filterByAgent") : t("stats.filterByMap");

  // Unique filter options across all matches
  const filterOptions = useMemo(() => {
    return [...new Set(statsData.matches.flatMap(m => m.maps.map(mp => mp[filterKey])))].sort();
  }, [statsData, filterKey]);

  const visibleOptions = useMemo(() => {
    if (!search.trim()) return filterOptions;
    return filterOptions.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  }, [filterOptions, search]);

  const filteredMatches = useMemo(() => {
    const byFilter = filter === "all" ? statsData.matches : statsData.matches.filter(m => m.maps.some(mp => mp[filterKey] === filter));
    if (!search.trim() || filter !== "all") return byFilter;
    return byFilter.filter(m => m.maps.some(mp => mp[filterKey]?.toLowerCase().includes(search.toLowerCase())));
  }, [statsData, filter, filterKey, search]);

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
          <h1 className={styles.title}>{t("stats.title")}</h1>
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
          <div className={styles.filterTop}>
            <span className={styles.filterLabel}>{filterLabel}:</span>
            {(isLoL || isValorant) && (
              <input
                className={styles.filterSearch}
                type="text"
                placeholder={isLoL ? t("stats.searchChampion") : t("stats.searchAgent")}
                value={search}
                onChange={e => { setSearch(e.target.value); setFilter("all"); }}
              />
            )}
          </div>
          <div className={styles.filterBar}>
            <button
              className={`${styles.chip} ${filter === "all" ? styles.chipActive : ""}`}
              onClick={() => { setFilter("all"); setSearch(""); }}
            >
              {t("stats.all")}
            </button>
            {visibleOptions.map(opt => (
              <button
                key={opt}
                className={`${styles.chip} ${filter === opt ? styles.chipActive : ""}`}
                onClick={() => { setFilter(opt); setSearch(""); }}
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
