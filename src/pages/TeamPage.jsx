import { useParams, Link, useNavigate } from "react-router-dom";
import { getTeam, getMatches, formatDate, formatPrize, getFlag } from "../services/api";
import styles from "./TeamPage.module.css";

function EarningsBar({ data }) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <div className={styles.earningsBar}>
      {entries.map(([year, val]) => (
        <div key={year} className={styles.earningsCol}>
          <div className={styles.earningsBarOuter}>
            <div className={styles.earningsBarInner} style={{ height: `${max > 0 ? (val / max) * 100 : 0}%` }} />
          </div>
          <span className={styles.earningsYear}>{year.slice(2)}</span>
          <span className={styles.earningsVal}>
            {val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `$${Math.round(val / 1000)}K` : `$${val}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TeamPage({ wiki }) {
  const { name } = useParams();
  const navigate = useNavigate();
  const team = getTeam(name);
  const allMatches = getMatches(wiki);

  if (!team) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>Team not found: {decodeURIComponent(name)}</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>← Home</Link>
      </div>
    );
  }

  const teamMatches = allMatches.filter(m =>
    m.match2opponents?.some(o => o.name.toLowerCase() === team.name.toLowerCase())
  );
  const earningsYears = Object.entries(team.earningsbyyear).sort(([a], [b]) => a.localeCompare(b));
  const lastYear = earningsYears[earningsYears.length - 1];

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroInner}>
            <div className={styles.logoBox}>
              {team.textlesslogourl
                ? <img src={team.textlesslogourl} alt={team.name} className={styles.teamLogo} />
                : <span className={styles.logoFallback}>{team.name[0]}</span>
              }
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroMeta}>
                <span className={styles.heroBadge}>{team.region}</span>
                <span className={`${styles.heroBadge} ${team.status === "active" ? styles.badgeActive : styles.badgeInactive}`}>
                  {team.status === "active" ? "Active" : "Disbanded"}
                </span>
              </div>
              <h1 className={styles.teamName}>{team.name}</h1>
              <div className={styles.heroTags}>
                <span className={styles.tag}>Founded <strong>{formatDate(team.createdate)}</strong></span>
                {team.disbanddate && !team.disbanddate.startsWith("0000") && (
                  <span className={styles.tag}>Disbanded <strong>{formatDate(team.disbanddate)}</strong></span>
                )}
                <span className={styles.tag}>Region <strong>{team.region}</strong></span>
                <span className={styles.tag}>Game <strong>{team.wiki}</strong></span>
              </div>
            </div>

            <div className={styles.earningsBadge}>
              <span className={styles.earningsTotal}>{formatPrize(team.earnings)}</span>
              <span className={styles.earningsLabel}>Total Earnings</span>
              {lastYear && <span className={styles.earningsLast}>{lastYear[0]}: {formatPrize(lastYear[1])}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.grid}>

          {team.squad?.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>Current Roster</h2>
              <div className={styles.squadList}>
                {team.squad.map((member, i) => (
                  <div key={member.id} className={styles.squadRow} onClick={() => navigate(`/oyuncu/${member.id}`)}>
                    <span className={styles.squadIdx}>{i + 1}</span>
                    <div className={styles.squadAvatar}>{member.id[0]}</div>
                    <div className={styles.squadInfo}>
                      <span className={styles.squadNick}>{member.id}</span>
                    </div>
                    <span className={styles.squadRole}>{member.role}</span>
                    <span className={styles.squadArrow}>→</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={`${styles.card} ${styles.cardWide}`}>
            <h2 className={styles.cardTitle}>Annual Earnings</h2>
            <EarningsBar data={team.earningsbyyear} />
            <div className={styles.earningsTable}>
              {earningsYears.map(([year, val]) => (
                <div key={year} className={styles.earningsRow}>
                  <span className={styles.earningsRowYear}>{year}</span>
                  <div className={styles.earningsRowBar}>
                    <div className={styles.earningsRowFill}
                      style={{ width: `${(val / Math.max(...earningsYears.map(([, v]) => v))) * 100}%` }} />
                  </div>
                  <span className={styles.earningsRowAmt}>{formatPrize(val)}</span>
                </div>
              ))}
            </div>
          </section>

          {teamMatches.length > 0 && (
            <section className={`${styles.card} ${styles.cardWide}`}>
              <h2 className={styles.cardTitle}>Matches</h2>
              <div className={styles.matchList}>
                {teamMatches.map(match => {
                  const [opp1, opp2] = match.match2opponents;
                  const isOpp1 = opp1?.name.toLowerCase() === team.name.toLowerCase();
                  const myScore = isOpp1 ? opp1?.score : opp2?.score;
                  const theirScore = isOpp1 ? opp2?.score : opp1?.score;
                  const opponent = isOpp1 ? opp2?.name : opp1?.name;
                  const won = (isOpp1 && match.winner === "1") || (!isOpp1 && match.winner === "2");
                  return (
                    <div key={match.id} className={styles.matchRow} onClick={() => navigate(`/mac/${match.id}`)}>
                      <span className={won ? styles.matchW : styles.matchL}>{won ? "W" : "L"}</span>
                      <span className={styles.matchOpp}>{opponent}</span>
                      <span className={styles.matchScore}>{myScore} – {theirScore}</span>
                      <span className={styles.matchHeader}>{match.match2bracketdata?.header}</span>
                      <span className={styles.matchDate}>{formatDate(match.date)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Social Media</h2>
            <div className={styles.socialList}>
              {Object.entries(team.links).map(([k, url]) => (
                <a key={k} href={url} target="_blank" rel="noreferrer" className={styles.socialItem}>
                  <span className={styles.socialPlatform}>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                  <span className={styles.socialUrl}>{url.replace(/https?:\/\/(www\.)?/, "").split("/")[0]}</span>
                  <span className={styles.socialArrow}>↗</span>
                </a>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Team Info</h2>
            <div className={styles.infoList}>
              {[
                ["Founded", formatDate(team.createdate)],
                ["Region", team.region],
                ["Status", team.status === "active" ? "Active" : "Disbanded"],
                ["Game", team.wiki],
                ["Total Earnings", formatPrize(team.earnings)],
              ].map(([k, v]) => (
                <div key={k} className={styles.infoRow}>
                  <span className={styles.infoLabel}>{k}</span>
                  <span className={`${styles.infoVal} ${k === "Status" && team.status === "active" ? styles.infoActive : k === "Total Earnings" ? styles.infoEarnings : ""}`}>{v}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
