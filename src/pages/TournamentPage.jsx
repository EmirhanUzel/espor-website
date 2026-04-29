import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getTournament, getMatches, getStandings, getPrizeResults,
  formatDate, formatPrize, tierLabel,
} from "../services/api";
import MatchCard from "../components/MatchCard";
import GroupStandings from "../components/GroupStandings";
import TournamentBracket from "../components/TournamentBracket";
import styles from "./TournamentPage.module.css";

const COUNTRY_FLAG = { fr:"🇫🇷", de:"🇩🇪", us:"🇺🇸", kr:"🇰🇷", cn:"🇨🇳", mt:"🇲🇹", gb:"🇬🇧", sg:"🇸🇬" };

export default function TournamentPage({ wiki }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const tournament = getTournament(id);
  const allMatches = getMatches(wiki);
  const standings = getStandings(wiki);
  const prizeResults = getPrizeResults(wiki);

  if (!tournament) {
    return (
      <div className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <h2 style={{ color: "var(--text-3)" }}>Tournament not found: {id}</h2>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: "var(--text-1)", fontWeight: 700 }}>← Home</Link>
      </div>
    );
  }

  const tournamentMatches = allMatches.filter(m => m.tournament === tournament.name);
  const bracketMatches = tournamentMatches.filter(m => m.match2bracketdata?.type === "bracket");
  const groupMatches = tournamentMatches.filter(m => m.match2bracketdata?.type === "league");
  const locFlag = COUNTRY_FLAG[tournament.locations?.country?.toLowerCase()] || "🌐";

  return (
    <main>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroTop}>
            <span className={`${styles.tierBadge} ${tournament.liquipediatier === "1" ? styles.tierS : tournament.liquipediatier === "2" ? styles.tierA : styles.tierB}`}>
              {tierLabel(tournament.liquipediatier)}{tournament.liquipediatiertype ? ` · ${tournament.liquipediatiertype}` : ""}
            </span>
            {tournament.seriespage && (
              <span className={styles.seriesLabel}>{tournament.seriespage.replace(/_/g, " ")}</span>
            )}
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroLeft}>
              {tournament.iconurl && (
                <img src={tournament.iconurl} alt={tournament.name} className={styles.heroIcon} />
              )}
              <div>
                <h1 className={styles.heroTitle}>{tournament.name}</h1>
                <div className={styles.heroMeta}>
                  <span>{locFlag} {tournament.locations?.city}, {tournament.locations?.venue}</span>
                  <span>·</span>
                  <span>{formatDate(tournament.startdate)} – {formatDate(tournament.enddate)}</span>
                  {tournament.patch && <><span>·</span><span>Patch {tournament.patch}</span></>}
                </div>
              </div>
            </div>

            <div className={styles.heroStats}>
              {[
                [formatPrize(tournament.prizepool), "Prize Pool"],
                [tournament.participantsnumber, "Teams"],
                [tournament.format, "Format"],
              ].map(([val, label]) => (
                <div key={label} className={styles.heroStat}>
                  <span className={styles.heroStatVal}>{val}</span>
                  <span className={styles.heroStatLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">

        {bracketMatches.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Bracket</h2>
            <TournamentBracket matches={bracketMatches} />
          </section>
        )}

        {(groupMatches.length > 0 || standings.length > 0) && (
          <div className={styles.twoCol}>
            {groupMatches.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Group Stage Matches</h2>
                <div className={styles.matchList}>
                  {groupMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {standings.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Group Standings</h2>
                <GroupStandings groups={standings} />
              </section>
            )}
          </div>
        )}

        {prizeResults.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Prize Distribution</h2>
            <div className={styles.prizeTable}>
              <div className={styles.prizeHeader}>
                <span>#</span>
                <span>Team</span>
                <span>Qualifier</span>
                <span>Defeated</span>
                <span>Prize</span>
              </div>
              {prizeResults.map((r, i) => (
                <div key={i}
                  className={`${styles.prizeRow} ${r.placement === "1" ? styles.prizeRowGold : ""}`}
                  onClick={() => navigate(`/team/${encodeURIComponent(r.opponentname)}`)}
                >
                  <span className={styles.prizeColSmall}><span className={styles.placement}>{r.placement}</span></span>
                  <span className={styles.prizeColTeam}>
                    <span className={styles.prizeTeam}>{r.opponentname}</span>
                    <span className={styles.prizeOpponentType}>{r.opponenttype}</span>
                  </span>
                  <span className={styles.prizeColMeta}><span className={styles.prizeMeta}>{r.qualifier}</span></span>
                  <span className={styles.prizeColMeta}>
                    {r.lastvsdata && (
                      <span className={styles.prizeMeta}>def. {r.lastvsdata.opponentname} ({r.lastvsdata.score})</span>
                    )}
                  </span>
                  <span className={styles.prizeColAmt}><span className={styles.prizeAmt}>{formatPrize(r.prizemoney)}</span></span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tournament Details</h2>
          <div className={styles.detailGrid}>
            <div className={styles.detailCard}>
              <h3 className={styles.detailCardTitle}>General</h3>
              <div className={styles.detailList}>
                {[
                  ["Name", tournament.name],
                  ["Series", tournament.seriespage?.replace(/_/g, " ")],
                  ["Start", formatDate(tournament.startdate)],
                  ["End", formatDate(tournament.enddate)],
                  ["Format", tournament.format],
                  ["Teams", `${tournament.participantsnumber} Teams`],
                  tournament.patch && ["Patch", `Patch ${tournament.patch}`],
                  ["Game", tournament.wiki],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} className={styles.detailRow}>
                    <span className={styles.detailKey}>{k}</span>
                    <span className={styles.detailVal}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.detailCard}>
              <h3 className={styles.detailCardTitle}>Location & Prize</h3>
              <div className={styles.detailList}>
                {[
                  ["City", tournament.locations?.city],
                  ["Venue", tournament.locations?.venue],
                  ["Region", tournament.locations?.region],
                  ["Country", tournament.locations?.country?.toUpperCase()],
                  ["Prize Pool", formatPrize(tournament.prizepool)],
                  tournament.locations?.venuelink && ["Venue Site", "→ Visit"],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className={styles.detailRow}>
                    <span className={styles.detailKey}>{k}</span>
                    {k === "Venue Site" ? (
                      <a href={tournament.locations?.venuelink} target="_blank" rel="noreferrer" className={styles.detailLink}>{v}</a>
                    ) : (
                      <span className={styles.detailVal}>{v}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
