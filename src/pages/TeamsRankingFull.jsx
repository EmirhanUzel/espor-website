import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getTeams, getPrizeResults, getMatches, formatPrize } from "../services/api";
import { calcESM, getForm, OFFICIAL_LABEL, OFFICIAL_SHORT } from "./TeamsRanking";
import { getCS2TeamsForRanking, getLoLTeamsForRanking } from "../services/liquipediaApi";
import styles from "./TeamsRankingFull.module.css";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

function TeamLogoImg({ url, darkUrl, name, imgClass, fbClass }) {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false)
  const src = (theme === "dark" && darkUrl) ? darkUrl : url;
  if (!src || failed) return <div className={fbClass}>{name?.[0] ?? '?'}</div>
  return (
    <img
      key={src}
      src={src}
      alt={name}
      className={imgClass}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

function RankBadge({ rank }) {
  const color = rank === 1 ? "#d97706" : rank === 2 ? "#64748b" : rank === 3 ? "#b45309" : "var(--text-3)";
  return <span className={styles.rankBadge} style={{ color }}>#{rank}</span>;
}
function TeamCell({ team }) {
  return (
    <Link to={`/team/${encodeURIComponent(team.name)}`} className={styles.teamCell}>
      <TeamLogoImg url={team.textlesslogourl} darkUrl={team.textlesslogodarkurl} name={team.name} imgClass={styles.teamLogo} fbClass={styles.teamLogoFb} />
      <div className={styles.teamInfo}>
        <span className={styles.teamName}>{team.name}</span>
        <span className={styles.teamRegion}>{team.region}</span>
      </div>
    </Link>
  );
}
function FormDots({ form }) {
  if (!form?.length) return <span className={styles.formEmpty}>—</span>;
  return (
    <div className={styles.formDots}>
      {form.map((r, i) => (
        <span key={i} className={`${styles.formDot} ${r === "W" ? styles.dotW : styles.dotL}`}>{r}</span>
      ))}
    </div>
  );
}
function Trend({ change }) {
  if (change > 0) return <span className={`${styles.trend} ${styles.trendUp}`}>▲ {change}</span>;
  if (change < 0) return <span className={`${styles.trend} ${styles.trendDown}`}>▼ {Math.abs(change)}</span>;
  return <span className={`${styles.trend} ${styles.trendFlat}`}>—</span>;
}

export default function TeamsRankingFull({ type }) {
  const { t } = useLanguage();
  const location = useLocation();
  const wiki = new URLSearchParams(location.search).get("wiki") || "valorant";

  const prizes  = getPrizeResults(wiki);
  const matches = getMatches(wiki);

  const [apiTeams,   setApiTeams]   = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    const isApiWiki = wiki === "counterstrike" || wiki === "leagueoflegends";
    if (!isApiWiki) { setApiTeams(null); return; }
    setApiLoading(true);
    setApiTeams(null);
    const fetchFn = wiki === "counterstrike" ? getCS2TeamsForRanking : getLoLTeamsForRanking;
    fetchFn()
      .then(setApiTeams)
      .catch(() => setApiTeams([]))
      .finally(() => setApiLoading(false));
  }, [wiki]);

  const isApiWiki = wiki === "counterstrike" || wiki === "leagueoflegends";
  const mockTeams = getTeams(wiki);
  const teams = isApiWiki ? (apiTeams ?? []) : mockTeams;

  const enriched = useMemo(() =>
    teams.map(t => ({
      ...t,
      esm:  isApiWiki ? (t.esm  ?? 0)  : calcESM(t, prizes, matches),
      form: isApiWiki ? (t.form ?? []) : getForm(t, matches),
    })),
    [teams, prizes, matches, wiki, isApiWiki]
  );

  const isOfficial = type === "official";

  const sorted = useMemo(() =>
    [...enriched]
      .sort((a, b) => isOfficial
        ? (b.rankpoints || 0) - (a.rankpoints || 0)
        : b.esm - a.esm
      )
      .slice(0, 100),
    [enriched, isOfficial]
  );

  const maxEsm = sorted[0]?.esm || 100;
  const officialLabel = OFFICIAL_LABEL[wiki] || "Official Points";
  const officialShort = OFFICIAL_SHORT[wiki]  || "Pts";

  const title    = isOfficial ? "Official Standings" : "eSPORMAX Rankings";
  const subtitle = isOfficial ? officialLabel : "Earnings · Roster MV · Tournaments · Recent Form";

  if (apiLoading) {
    return (
      <main>
        <div className={styles.hero}><div className="wrap">
          <Link to="/teams" className={styles.back}>← Team Rankings</Link>
          <h1 className={styles.heroTitle}>{title}</h1>
        </div></div>
        <div className="wrap" style={{ padding: "4rem 0", textAlign: "center", color: "var(--text-2)" }}>
          {t("common.loading")}
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <Link to="/teams" className={styles.back}>← Team Rankings</Link>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroSub}>{subtitle}</p>
          <p className={styles.heroCount}>{sorted.length} teams</p>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Team</th>
                {isOfficial
                  ? <th className={styles.th}>{officialShort}</th>
                  : <th className={`${styles.th} ${styles.thEsm}`}>eSPORMAX Score</th>
                }
                <th className={styles.th}>Earnings</th>
                <th className={styles.th}>Form</th>
                <th className={styles.th}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((team, i) => (
                <tr key={team.name + team.wiki} className={`${styles.row} ${i < 3 ? styles[`top${i+1}`] : ""}`}>
                  <td className={styles.td}><RankBadge rank={i + 1} /></td>
                  <td className={styles.td}><TeamCell team={team} /></td>
                  {isOfficial
                    ? <td className={styles.td}>
                        <span className={styles.officialPts}>{(team.rankpoints || 0).toLocaleString()}</span>
                      </td>
                    : <td className={styles.td}>
                        <div className={styles.esmWrap}>
                          <div className={styles.esmBar}>
                            <div className={styles.esmFill} style={{ width: `${(team.esm / maxEsm) * 100}%` }} />
                          </div>
                          <span className={styles.esmNum}>{team.esm}<span className={styles.esmMax}>/100</span></span>
                        </div>
                      </td>
                  }
                  <td className={styles.td}><span className={styles.earnings}>{formatPrize(team.earnings)}</span></td>
                  <td className={styles.td}><FormDots form={team.form} /></td>
                  <td className={styles.td}><Trend change={team.rankchange || 0} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
