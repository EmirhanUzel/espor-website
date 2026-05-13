import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTeams, getPrizeResults, getMatches, formatPrize } from "../services/api";
import { PLAYERS } from "../services/api";
import { getCS2TeamLogos } from "../services/liquipediaApi";
import styles from "./TeamsRanking.module.css";
import { useLanguage } from "../contexts/LanguageContext";

// ── Algorithm ─────────────────────────────────────────────────────────────────
export function calcESM(team, allPrizes, allMatches) {
  const earningsScore = Math.min(Math.log10(Math.max(team.earnings, 1)) * 6, 40);
  const rosterMV = (team.squad || []).reduce((sum, m) => {
    const p = PLAYERS.find(pl => pl.id === m.id && pl.wiki === team.wiki);
    return sum + (p?.marketvalue || 0);
  }, 0);
  const rosterScore = rosterMV > 0 ? Math.min(Math.log10(rosterMV) * 5, 30) : 0;
  const ptsMap = { "1": 10, "2": 6, "3-4": 3, "5-8": 1.5 };
  const tournScore = Math.min(
    allPrizes.filter(p => p.opponentname === team.name)
      .reduce((s, p) => s + (ptsMap[p.placement] || 0), 0), 20
  );
  const recent = allMatches
    .filter(m => m.match2opponents?.some(o => o.name === team.name))
    .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const wins = recent.filter(m => {
    const idx = m.match2opponents.findIndex(o => o.name === team.name);
    return idx !== -1 && m.winner === String(idx + 1);
  }).length;
  const formScore = recent.length > 0 ? (wins / recent.length) * 10 : 5;
  return Math.min(Math.round(earningsScore + rosterScore + tournScore + formScore), 100);
}

export function getForm(team, allMatches) {
  return allMatches
    .filter(m => m.match2opponents?.some(o => o.name === team.name))
    .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    .map(m => {
      const idx = m.match2opponents.findIndex(o => o.name === team.name);
      return idx !== -1 && m.winner === String(idx + 1) ? "W" : "L";
    });
}

export const OFFICIAL_LABEL = {
  valorant:        "VCT Circuit Points",
  counterstrike:   "Valve Regional Standings (VRS)",
  leagueoflegends: "Regional Qualification Points",
};
export const OFFICIAL_SHORT = {
  valorant: "VCT Pts", counterstrike: "VRS Pts", leagueoflegends: "Reg. Pts",
};

// ── Shared atoms ──────────────────────────────────────────────────────────────
function Trend({ change }) {
  if (change > 0) return <span className={`${styles.trend} ${styles.trendUp}`}>▲ {change}</span>;
  if (change < 0) return <span className={`${styles.trend} ${styles.trendDown}`}>▼ {Math.abs(change)}</span>;
  return <span className={`${styles.trend} ${styles.trendFlat}`}>—</span>;
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

function TeamCell({ team }) {
  return (
    <Link to={`/team/${encodeURIComponent(team.name)}`} className={styles.teamCell}>
      {team.textlesslogourl
        ? <img src={team.textlesslogourl} alt={team.name} className={styles.teamLogo} referrerPolicy="no-referrer" onError={e => { e.target.style.display="none"; }} />
        : <div className={styles.teamLogoFb}>{team.name[0]}</div>}
      <div className={styles.teamInfo}>
        <span className={styles.teamName}>{team.name}</span>
        <span className={styles.teamRegion}>{team.region}</span>
      </div>
    </Link>
  );
}

function RankBadge({ rank }) {
  const cls = rank === 1 ? styles.badge1 : rank === 2 ? styles.badge2 : rank === 3 ? styles.badge3 : "";
  return <span className={`${styles.rankBadge} ${cls}`}>#{rank}</span>;
}

// ── Compact tables ────────────────────────────────────────────────────────────
function CompactOfficialTable({ teams, shortLabel }) {
  const { t } = useLanguage();
  const sorted = [...teams].sort((a, b) => (b.rankpoints || 0) - (a.rankpoints || 0)).slice(0, 10);
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>#</th>
            <th className={styles.th}>{t("teams.team")}</th>
            <th className={styles.th}>{shortLabel}</th>
            <th className={styles.th}>{t("teams.form")}</th>
            <th className={styles.th}>{t("teams.trend")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => (
            <tr key={team.name} className={`${styles.row} ${i < 3 ? styles[`top${i+1}`] : ""}`}>
              <td className={styles.td}><RankBadge rank={i + 1} /></td>
              <td className={styles.td}><TeamCell team={team} /></td>
              <td className={styles.td}><span className={styles.officialPts}>{(team.rankpoints||0).toLocaleString()}</span></td>
              <td className={styles.td}><FormDots form={team.form} /></td>
              <td className={styles.td}><Trend change={team.rankchange||0} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompactESMTable({ teams }) {
  const { t } = useLanguage();
  const sorted = [...teams].sort((a, b) => b.esm - a.esm).slice(0, 10);
  const maxEsm = sorted[0]?.esm || 100;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>#</th>
            <th className={styles.th}>{t("teams.team")}</th>
            <th className={`${styles.th} ${styles.thEsm}`}>{t("teams.esmScore")}</th>
            <th className={styles.th}>{t("teams.form")}</th>
            <th className={styles.th}>{t("teams.trend")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => (
            <tr key={team.name} className={`${styles.row} ${i < 3 ? styles[`top${i+1}`] : ""}`}>
              <td className={styles.td}><RankBadge rank={i + 1} /></td>
              <td className={styles.td}><TeamCell team={team} /></td>
              <td className={styles.td}>
                <div className={styles.esmWrap}>
                  <div className={styles.esmBar}>
                    <div className={styles.esmFill} style={{ width: `${(team.esm / maxEsm) * 100}%` }} />
                  </div>
                  <span className={styles.esmNum}>{team.esm}<span className={styles.esmMax}>/100</span></span>
                </div>
              </td>
              <td className={styles.td}><FormDots form={team.form} /></td>
              <td className={styles.td}><Trend change={team.rankchange||0} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Form section ──────────────────────────────────────────────────────────────
function FormSection({ teams }) {
  const { t } = useLanguage();
  const withForm = teams
    .map(team => {
      const wins = team.form.filter(r => r === "W").length;
      const total = team.form.length;
      return { ...team, wins, total, winRate: total > 0 ? wins / total : -1 };
    })
    .filter(team => team.total > 0)
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
    .slice(0, 5);

  if (!withForm.length) return null;

  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>{t("teams.inForm")}</h2>
          <p className={styles.sectionSub}>{t("teams.formSub")}</p>
        </div>
      </div>
      <div className={styles.formCards}>
        {withForm.map((team, i) => (
          <Link key={team.name} to={`/team/${encodeURIComponent(team.name)}`} className={styles.formCard}>
            <div className={styles.formCardRank}>#{i + 1}</div>
            <div className={styles.formCardTeam}>
              {team.textlesslogourl
                ? <img src={team.textlesslogourl} alt={team.name} className={styles.formCardLogo} referrerPolicy="no-referrer" onError={e => { e.target.style.display="none"; }} />
                : <div className={styles.formCardLogoFb}>{team.name[0]}</div>}
              <div>
                <div className={styles.formCardName}>{team.name}</div>
                <div className={styles.formCardRegion}>{team.region}</div>
              </div>
            </div>
            <FormDots form={team.form} />
            <div className={styles.formCardRate}>
              <span className={styles.formCardRateNum}>{team.wins}W – {team.total - team.wins}L</span>
              <span className={styles.formCardRatePct}>{Math.round(team.winRate * 100)}%</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeamsRanking({ wiki }) {
  const { t } = useLanguage();
  const teams   = getTeams(wiki);
  const prizes  = getPrizeResults(wiki);
  const matches = getMatches(wiki);

  const [logoMap, setLogoMap] = useState({});

  useEffect(() => {
    if (wiki !== "counterstrike") { setLogoMap({}); return; }
    const names = teams.map(t => t.name);
    getCS2TeamLogos(names).then(setLogoMap).catch(() => {});
  }, [wiki, teams]);

  const enriched = useMemo(() =>
    teams.map(team => ({
      ...team,
      textlesslogourl: logoMap[team.name] || team.textlesslogourl || "",
      esm: calcESM(team, prizes, matches),
      form: getForm(team, matches),
    })),
    [teams, prizes, matches, logoMap]
  );

  const officialLabel = OFFICIAL_LABEL[wiki] || "Official Points";
  const officialShort = OFFICIAL_SHORT[wiki]  || "Pts";

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <p className={styles.heroEyebrow}>eSPORMAX</p>
          <h1 className={styles.heroTitle}>{t("teams.title")}</h1>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.twoCol}>
          <section className={styles.colSection}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>{t("teams.officialStandings")}</h2>
                <p className={styles.sectionSub}>{officialLabel}</p>
              </div>
              <Link to={`/teams/official?wiki=${wiki}`} className={styles.inceleBtn}>{t("teams.viewAll")}</Link>
            </div>
            <CompactOfficialTable teams={enriched} shortLabel={officialShort} />
          </section>

          <section className={styles.colSection}>
            <div className={styles.sectionHead}>
              <div>
                <h2 className={styles.sectionTitle}>{t("teams.esmRankings")}</h2>
                <p className={styles.sectionSub}>Earnings · Roster MV · Tournaments · Form</p>
              </div>
              <Link to={`/teams/espormax?wiki=${wiki}`} className={styles.inceleBtn}>{t("teams.viewAll")}</Link>
            </div>
            <CompactESMTable teams={enriched} />
          </section>
        </div>

        <FormSection teams={enriched} />
      </div>
    </main>
  );
}
