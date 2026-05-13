import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTournaments, getTeams, getLiveMatches, formatDate, formatPrize, tierLabel } from "../services/api";
import { getCS2TournamentsByStatus } from "../services/liquipediaApi";
import TournamentCard from "../components/TournamentCard";
import styles from "./TournamentsPage.module.css";
import { useLanguage } from "../contexts/LanguageContext";

const TIER_COLORS = { "1": styles.tierS, "2": styles.tierA, "3": styles.tierB };

const COUNTRY_FLAG = {
  fr:"🇫🇷", de:"🇩🇪", us:"🇺🇸", kr:"🇰🇷", cn:"🇨🇳",
  mt:"🇲🇹", gb:"🇬🇧", sg:"🇸🇬", nl:"🇳🇱", kz:"🇰🇿",
  hu:"🇭🇺", ro:"🇷🇴", ar:"🇦🇷", qa:"🇶🇦",
};

function TournamentRow({ tournament }) {
  const { t } = useLanguage();
  const flag = COUNTRY_FLAG[tournament.locations?.country?.toLowerCase()] || "🌐";
  const tierClass = TIER_COLORS[tournament.liquipediatier] || styles.tierB;
  const today = new Date().toISOString().slice(0, 10);
  const isUpcoming = tournament.startdate > today;
  const isLive = !isUpcoming && tournament.enddate >= today;

  return (
    <Link to={`/tournament/${tournament.id}`} className={styles.row}>
      <div className={styles.rowTier}>
        <span className={`${styles.tierBadge} ${tierClass}`}>
          {tierLabel(tournament.liquipediatier)}
        </span>
      </div>

      <div className={styles.rowMain}>
        {tournament.iconurl && (
          <img src={tournament.iconurl} alt="" className={styles.rowIcon} referrerPolicy="no-referrer" onError={e => { e.target.style.display = "none"; }} />
        )}
        <div className={styles.rowInfo}>
          <span className={styles.rowName}>{tournament.name}</span>
          {tournament.liquipediatiertype && (
            <span className={styles.rowSeries}>{tournament.liquipediatiertype}</span>
          )}
        </div>
      </div>

      <div className={styles.rowMeta}>
        <span>{flag} {tournament.locations?.city || "—"}</span>
        <span className={styles.rowDot}>·</span>
        <span>{formatDate(tournament.startdate)} – {formatDate(tournament.enddate)}</span>
      </div>

      <div className={styles.rowTeams}>
        <span>{tournament.participantsnumber > 0 ? tournament.participantsnumber : "—"}</span>
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

const TABS = [
  { id: "ongoing",   key: "tournaments.ongoing" },
  { id: "upcoming",  key: "tournaments.upcoming" },
  { id: "completed", key: "tournaments.completed" },
];

function CS2TournamentsView() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("ongoing");
  const [tabData, setTabData]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [apiError, setApiError]   = useState(false);
  const [ongoingData, setOngoingData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setApiError(false);
    getCS2TournamentsByStatus(activeTab)
      .then(data => {
        if (cancelled) return;
        setTabData(data);
        if (activeTab === "ongoing") setOngoingData(data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) { setApiError(true); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [activeTab]);

  const totalPrize = ongoingData.reduce((s, t) => s + (t.prizepool || 0), 0);
  const totalTeams = ongoingData.reduce((s, t) => s + Math.max(0, t.participantsnumber || 0), 0);
  const liveCount  = ongoingData.length;

  return (
    <>
      <div className={`${styles.statsBar} ${styles.statsBar3}`}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{totalPrize ? formatPrize(totalPrize) : "—"}</span>
          <span className={styles.statLabel}>{t("home.totalPrize")}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{totalTeams || "—"}</span>
          <span className={styles.statLabel}>{t("home.activeTeams")}</span>
        </div>
        <div className={styles.statItem}>
          <span className={`${styles.statValue} ${liveCount > 0 ? styles.statLive : ""}`}>
            {liveCount || "—"}
          </span>
          <span className={styles.statLabel}>{t("home.liveNow")}</span>
        </div>
      </div>

      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {t(tab.key)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingState}>Yükleniyor…</div>
      ) : apiError ? (
        <div className={styles.empty} style={{ color: "var(--text-3)", fontSize: 13 }}>
          API şu an yanıt vermiyor, lütfen biraz bekleyin.
        </div>
      ) : tabData.length === 0 ? (
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
            {tabData.map(tr => <TournamentRow key={tr.id} tournament={tr} />)}
          </div>
        </div>
      )}
    </>
  );
}

export default function TournamentsPage({ wiki = "valorant" }) {
  const { t } = useLanguage();
  const isCS2 = wiki === "counterstrike";

  const tournaments = isCS2 ? [] : getTournaments(wiki);
  const teams       = getTeams(wiki);
  const liveCount   = getLiveMatches().length;
  const totalPrize  = tournaments.reduce((s, tr) => s + (tr.prizepool || 0), 0);

  return (
    <main>
      <div className={styles.pageHeader}>
        <div className="wrap">
          <h1 className={styles.pageTitle}>{t("tournaments.title")}</h1>
          <p className={styles.pageSubtitle}>
            {isCS2
              ? "CS2 — Tier 1 Tournaments"
              : `${tournaments.length} ${tournaments.length !== 1 ? t("tournaments.subtitle.other") : t("tournaments.subtitle.one")}`}
          </p>
        </div>
      </div>

      <div className="wrap">
        {isCS2 ? (
          <CS2TournamentsView />
        ) : (
          <>
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{formatPrize(totalPrize)}</span>
                <span className={styles.statLabel}>{t("home.totalPrize")}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{tournaments.length}</span>
                <span className={styles.statLabel}>{t("home.tournamentsLabel")}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{teams.length}</span>
                <span className={styles.statLabel}>{t("home.activeTeams")}</span>
              </div>
              <div className={styles.statItem}>
                <span className={`${styles.statValue} ${liveCount > 0 ? styles.statLive : ""}`}>
                  {liveCount || "—"}
                </span>
                <span className={styles.statLabel}>{t("home.liveNow")}</span>
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
                  {tournaments.map(tr => <TournamentRow key={tr.id} tournament={tr} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
