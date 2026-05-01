import { useState } from "react";
import { Link } from "react-router-dom";
import { getTournaments, formatDate, formatPrize, tierLabel } from "../services/api";
import styles from "./TournamentsPage.module.css";
import { useLanguage } from "../contexts/LanguageContext";

const WIKIS = [
  { id: "valorant",       label: "VALORANT" },
  { id: "counterstrike",  label: "CS2" },
  { id: "leagueoflegends",label: "LoL" },
];

const TIER_COLORS = { "1": styles.tierS, "2": styles.tierA, "3": styles.tierB };

const COUNTRY_FLAG = {
  fr:"🇫🇷", de:"🇩🇪", us:"🇺🇸", kr:"🇰🇷", cn:"🇨🇳",
  mt:"🇲🇹", gb:"🇬🇧", sg:"🇸🇬", nl:"🇳🇱",
};

function TournamentRow({ tournament }) {
  const { t } = useLanguage();
  const flag = COUNTRY_FLAG[tournament.locations?.country?.toLowerCase()] || "🌐";
  const tierClass = TIER_COLORS[tournament.liquipediatier] || styles.tierB;
  const isUpcoming = new Date(tournament.startdate) > new Date();
  const isLive = !isUpcoming && new Date(tournament.enddate) >= new Date();

  return (
    <Link to={`/tournament/${tournament.id}`} className={styles.row}>
      <div className={styles.rowTier}>
        <span className={`${styles.tierBadge} ${tierClass}`}>
          {tierLabel(tournament.liquipediatier)}
        </span>
      </div>

      <div className={styles.rowMain}>
        {tournament.iconurl && (
          <img src={tournament.iconurl} alt="" className={styles.rowIcon} />
        )}
        <div className={styles.rowInfo}>
          <span className={styles.rowName}>{tournament.name}</span>
          {tournament.seriespage && (
            <span className={styles.rowSeries}>{tournament.seriespage.replace(/_/g, " ")}</span>
          )}
        </div>
      </div>

      <div className={styles.rowMeta}>
        <span>{flag} {tournament.locations?.city}</span>
        <span className={styles.rowDot}>·</span>
        <span>{formatDate(tournament.startdate)} – {formatDate(tournament.enddate)}</span>
      </div>

      <div className={styles.rowTeams}>
        <span>{tournament.participantsnumber}</span>
        <span className={styles.rowLabel}>{t("tournaments.teamsUnit")}</span>
      </div>

      <div className={styles.rowPrize}>
        {formatPrize(tournament.prizepool)}
      </div>

      <div className={styles.rowStatus}>
        {isLive
          ? <span className={styles.statusLive}>{t("tournaments.live")}</span>
          : isUpcoming
            ? <span className={styles.statusUpcoming}>{t("tournaments.upcoming")}</span>
            : <span className={styles.statusDone}>{t("tournaments.completed")}</span>
        }
      </div>

      <span className={styles.rowArrow}>→</span>
    </Link>
  );
}

export default function TournamentsPage() {
  const { t } = useLanguage();
  const [wiki, setWiki] = useState("valorant");
  const tournaments = getTournaments(wiki);

  return (
    <main>
      <div className={styles.pageHeader}>
        <div className="wrap">
          <h1 className={styles.pageTitle}>{t("tournaments.title")}</h1>
          <p className={styles.pageSubtitle}>
            {tournaments.length} {tournaments.length !== 1 ? t("tournaments.subtitle.other") : t("tournaments.subtitle.one")} · {WIKIS.find(w => w.id === wiki)?.label}
          </p>
        </div>
      </div>

      <div className="wrap">
        <div className={styles.controls}>
          <div className={styles.wikiTabs}>
            {WIKIS.map(w => (
              <button
                key={w.id}
                className={`${styles.wikiTab} ${wiki === w.id ? styles.wikiTabActive : ""}`}
                onClick={() => setWiki(w.id)}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {tournaments.length === 0 ? (
          <div className={styles.empty}>{t("tournaments.empty")}</div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>{t("tournaments.tier")}</span>
              <span>{t("tournaments.tournament")}</span>
              <span>{t("tournaments.locationDates")}</span>
              <span>{t("tournaments.teams")}</span>
              <span>{t("tournaments.prizePool")}</span>
              <span>{t("tournaments.status")}</span>
              <span />
            </div>
            <div className={styles.tableBody}>
              {tournaments.map(tr => (
                <TournamentRow key={tr.id} tournament={tr} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
